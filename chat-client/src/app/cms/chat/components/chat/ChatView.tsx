"use client";

import React from "react";
import { Box, VStack, HStack, Text, IconButton, Badge, Input, Button } from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuCheck, LuUndo2, LuFile, LuDownload } from "react-icons/lu";
import { chatApi } from "@/lib/api/chat";
import { toaster } from "@/components/ui/toaster";
import { type Colors, type Message } from "../../types";

type ChatViewProps = {
  colors: Colors;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  bizOpen: boolean | null;
  bizMsg: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onMessagesUpdate: (messages: Message[]) => void;
};

export function ChatView({
  colors,
  messages,
  setMessages,
  bizOpen,
  bizMsg,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: ChatViewProps) {
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [showNewMessageAlert, setShowNewMessageAlert] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [imageLoadedMap, setImageLoadedMap] = React.useState<Record<number, boolean>>({});
  
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const autoScrollRef = React.useRef<boolean>(true);
  const didInitScrollRef = React.useRef<boolean>(false);
  const userScrolledRef = React.useRef<boolean>(false);
  const isProgrammaticScrollRef = React.useRef<boolean>(false);
  const pendingRestoreRef = React.useRef<number | null>(null);
  const isLoadingPrevRef = React.useRef<boolean>(false);

  // 스크롤 관련 함수들
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = listRef.current;
    if (!el) return;
    isProgrammaticScrollRef.current = true;
    el.scrollTo({
      top: el.scrollHeight,
      behavior
    });
    setTimeout(() => { 
      isProgrammaticScrollRef.current = false; 
      setShowNewMessageAlert(false);
      setUnreadCount(0);
    }, 100);
  };

  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 100;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // 메시지 편집 함수들
  const startEdit = (m: Message) => {
    if (m.attachment) return;
    if (!m.id || m.id < 1) return;
    if (m.sender !== "ADMIN") return;
    setEditingMessageId(m.id);
    setEditingText(m.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEdit = () => {
    if (editingMessageId == null) return;
    if (editingMessageId < 1) { 
      cancelEdit(); 
      return; 
    }
    
    (async () => {
      try {
        await chatApi.updateMessage(editingMessageId, { content: editingText, actor: "admin" });
        setMessages(prev => prev.map(m => (
          m.id === editingMessageId ? { ...m, content: editingText, edited: true } : m
        )));
      } catch {}
    })();
    cancelEdit();
  };

  const deleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (editingMessageId === id) cancelEdit();
  };

  const deleteMessageServer = async (id: number) => {
    try {
      if (!id || id < 1) return;
      await chatApi.deleteMessage(id, { actor: "admin" });
      deleteMessage(id);
      try { 
        toaster.create({ title: "삭제되었습니다.", type: "success" }); 
      } catch {}
    } catch {}
  };

  // 초기 스크롤 설정
  React.useLayoutEffect(() => {
    if (!listRef.current) return;
    
    if (!didInitScrollRef.current) {
      if (messages.length > 0) {
        scrollToBottom("auto");
        didInitScrollRef.current = true;
      }
      return;
    }
    
    if (isLoadingPrevRef.current && pendingRestoreRef.current != null) {
      const el = listRef.current;
      const bottomOffset = pendingRestoreRef.current;
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = el.scrollHeight - el.clientHeight - bottomOffset;
        requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
      });
      isLoadingPrevRef.current = false;
      pendingRestoreRef.current = null;
      return;
    }
  }, [messages.length]);

  // 새 메시지 도착 시 처리
  React.useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    if (autoScrollRef.current) {
      scrollToBottom("smooth");
    } else {
      setShowNewMessageAlert(true);
      setUnreadCount(prev => prev + 1);
    }
  }, [messages[messages.length - 1]?.id]);

  return (
    <>
      <VStack 
        align="stretch" 
        gap={3} 
        flex={1} 
        overflowY="auto" 
        py={2} 
        position="relative"
        ref={listRef}
        onWheel={() => { userScrolledRef.current = true; }}
        onTouchMove={() => { userScrolledRef.current = true; }}
        onMouseDown={() => { userScrolledRef.current = true; }}
        onScroll={(e) => {
          const el = e.currentTarget;
          userScrolledRef.current = true;
          const nearTop = el.scrollTop <= 80;
          const nearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) <= 80;
          
          autoScrollRef.current = nearBottom;
          
          if (!isProgrammaticScrollRef.current && nearBottom && showNewMessageAlert) {
            setShowNewMessageAlert(false);
            setUnreadCount(0);
          }
          
          if (isProgrammaticScrollRef.current) return;
          if (!didInitScrollRef.current) return;
          
          if (nearTop && hasNextPage && !isFetchingNextPage && userScrolledRef.current) {
            pendingRestoreRef.current = el.scrollHeight - el.scrollTop - el.clientHeight;
            isLoadingPrevRef.current = true;
            fetchNextPage();
          }
        }}
      >
        {bizOpen === false && (
          <Box px={2}>
            <Box bg="yellow.50" borderWidth="1px" borderColor="yellow.200" color="yellow.900" p={2} rounded="md">
              {bizMsg || "현재 운영시간이 아닙니다. 접수되며, 운영시간에 답변드립니다."}
            </Box>
          </Box>
        )}
        
        {messages.map((m, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : undefined;
          const prevKey = prev?.createdAt ? new Date(prev.createdAt).toLocaleDateString() : null;
          const curKey = m?.createdAt ? new Date(m.createdAt).toLocaleDateString() : null;
          const showDate = !!curKey && curKey !== prevKey;
          const isMine = m.sender === "ADMIN";
          const canEdit = isMine && !m.attachment;
          const canDelete = isMine;
          const isEditing = editingMessageId === m.id;
          
          return (
            <React.Fragment key={`msg-${m.id}-${idx}`}>
              {showDate && (
                <HStack key={`sep-${curKey}-${idx}`} justify="center" my={2} w="100%">
                  <Box px={3} py={1} bg="gray.100" color="gray.600" borderRadius="full" fontSize="xs">
                    {curKey}
                  </Box>
                </HStack>
              )}
              
              <Box key={m.id} alignSelf={isMine ? "flex-end" : "flex-start"} maxW="70%">
                <Box
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={isMine ? "blue.500" : "gray.100"}
                  color={isMine ? "white" : "black"}
                >
                  {isEditing ? (
                    <Input 
                      value={editingText} 
                      onChange={e => setEditingText(e.target.value)} 
                      autoFocus 
                    />
                  ) : m.attachment ? (
                    m.attachment.previewUrl ? (
                      <Box>
                        <Box position="relative" width="320px" maxW="100%">
                          {!imageLoadedMap[m.id] && (
                            <Box width="100%" height="180px" bg="gray.200" borderRadius="6px" />
                          )}
                          <img
                            src={m.attachment.previewUrl}
                            alt={m.attachment.name}
                            style={{ 
                              maxWidth: "320px", 
                              width: "100%", 
                              borderRadius: "6px", 
                              display: imageLoadedMap[m.id] ? "block" : "none", 
                              cursor: "pointer" 
                            }}
                            onLoad={() => setImageLoadedMap(prev => ({ ...prev, [m.id]: true }))}
                            onError={() => setImageLoadedMap(prev => ({ ...prev, [m.id]: true }))}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <HStack>
                        <LuFile size={16} />
                        <Text whiteSpace="pre-wrap">{m.attachment.name}</Text>
                      </HStack>
                    )
                  ) : (
                    <Text whiteSpace="pre-wrap">{m.content}</Text>
                  )}
                  
                  <HStack mt={1} justify={isMine ? "flex-end" : "flex-start"} gap={2}>
                    <Text fontSize="xs" color={isMine ? "whiteAlpha.800" : "gray.500"}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </Text>
                    {m.edited && (
                      <Badge size="xs" variant={isMine ? "subtle" : "solid"} colorScheme={isMine ? "whiteAlpha" : "gray"} opacity={0.85}>
                        수정됨
                      </Badge>
                    )}
                  </HStack>
                </Box>
                
                <HStack mt={1} justify={isMine ? "flex-end" : "flex-start"} gap={1.5}>
                  {isEditing ? (
                    <>
                      <IconButton
                        aria-label="저장"
                        size="xs"
                        variant="subtle"
                        colorPalette="blue"
                        onClick={saveEdit}
                      >
                        <LuCheck size={14} />
                      </IconButton>
                      <IconButton
                        aria-label="취소"
                        size="xs"
                        variant="subtle"
                        colorPalette="gray"
                        onClick={cancelEdit}
                      >
                        <LuUndo2 size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {m.attachment && m.attachment.downloadUrl && (
                        <a href={m.attachment.downloadUrl} target="_blank" rel="noreferrer">
                          <IconButton aria-label="다운로드" size="xs" variant="subtle" colorPalette="gray">
                            <LuDownload size={14} />
                          </IconButton>
                        </a>
                      )}
                      {canEdit && (
                        <IconButton aria-label="편집" size="xs" variant="subtle" colorPalette="gray" onClick={() => startEdit(m)}>
                          <LuPencil size={14} />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton aria-label="삭제" size="xs" variant="subtle" colorPalette="gray" onClick={() => setConfirmDeleteId(m.id)}>
                          <LuTrash2 size={14} />
                        </IconButton>
                      )}
                    </>
                  )}
                </HStack>
              </Box>
            </React.Fragment>
          );
        })}
        
        {/* 새 메시지 알림 */}
        {showNewMessageAlert && (
          <Box
            position="fixed"
            bottom="100px"
            left="50%"
            transform="translateX(-50%)"
            bg="gray.300"
            color="white"
            px={10}
            py={2}
            borderRadius="full"
            boxShadow="lg"
            cursor="pointer"
            onClick={() => scrollToBottom("smooth")}
            zIndex="10"
            display="flex"
            alignItems="center"
            gap={2}
            fontSize="sm"
            fontWeight="medium"
            transition="all 0.2s"
            _hover={{ bg: "gray.400", transform: "translateX(-50%) scale(1.05)" }}
          >
            {unreadCount > 0 && (
              <Box
                bg="red.500"
                color="white"
                borderRadius="full"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight="bold"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Box>
            )}
            새 메시지 ↓
          </Box>
        )}
      </VStack>
      
      {/* 삭제 확인 모달 */}
      {confirmDeleteId !== null && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={4} w="320px">
            <Text fontWeight="bold" mb={2}>메시지를 삭제할까요?</Text>
            <Text fontSize="sm" color={colors.text.muted}>삭제 후 복구할 수 없습니다.</Text>
            <HStack mt={4} justify="flex-end">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>취소</Button>
              <Button colorPalette="red" onClick={async () => { 
                await deleteMessageServer(confirmDeleteId); 
                setConfirmDeleteId(null); 
              }}>삭제</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </>
  );
}
