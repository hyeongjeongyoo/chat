"use client";

import React from "react";
import { Box, Flex, Heading, Badge, Text, VStack, HStack, Button, Input, IconButton } from "@chakra-ui/react";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { LuPencil, LuTrash2, LuCheck, LuUndo2, LuPaperclip, LuFile, LuX } from "react-icons/lu";

export default function ChatAdminPage() {
  const colors = useColors();

  const [selectedChannelId, setSelectedChannelId] = React.useState<number>(1);
  const [selectedThreadId, setSelectedThreadId] = React.useState<number>(() => {
    const first = mockThreads.find(t => t.channelId === (selectedChannelId || mockChannels[0].id));
    return first ? first.id : mockThreads[0].id;
  });

  React.useEffect(() => {
    const first = mockThreads.find(t => t.channelId === selectedChannelId);
    if (first) setSelectedThreadId(first.id);
  }, [selectedChannelId]);

  const layout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    { id: "channels", x: 0, y: 1, w: 3, h: 5, title: "채널", subtitle: "CMS 채널 목록" },
    { id: "threads", x: 0, y: 6, w: 3, h: 6, title: "대화 목록", subtitle: "사용자별 스레드" },
    { id: "messages", x: 3, y: 1, w: 9, h: 11, title: "메시지", subtitle: "대화 내용" },
  ];

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <GridSection initialLayout={layout}>
        {/* Header */}
        <Flex justify="space-between" align="center" h="36px">
          <Flex align="center" gap={2} px={2}>
            <Heading size="lg" color={colors.text.primary}>
              채팅 관리
            </Heading>
            <Badge
              bg={colors.secondary.light}
              color={colors.secondary.default}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
            >
              관리자
            </Badge>
          </Flex>
        </Flex>

        {/* Channels */}
        <ChannelsPanel
          colors={colors}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />

        {/* Threads */}
        <ThreadsPanel
          colors={colors}
          selectedChannelId={selectedChannelId}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />

        {/* Messages */}
        <MessagesPanel colors={colors} selectedThreadId={selectedThreadId} />

        {/* 상세/설정 섹션 제거됨 */}
      </GridSection>
    </Box>
  );
}

// ---------- 임시 상태/스토어 (동일 파일 내 간단 구현) ----------
type Colors = ReturnType<typeof useColors>;

type Channel = { id: number; code: string; name: string };
type Thread = { id: number; channelId: number; userIdentifier: string; userName: string; unread: number; lastAt: string };
type Message = {
  id: number;
  threadId: number;
  sender: "USER" | "ADMIN";
  content: string;
  createdAt: string;
  attachment?: { name: string; type?: string; size?: number };
};

const mockChannels: Channel[] = [
  { id: 1, code: "TEST", name: "Test CMS" },
  { id: 2, code: "BLOG", name: "Blog CMS" },
  { id: 3, code: "SHOP", name: "Shop CMS" },
];

const now = () => new Date().toISOString();

const mockThreads: Thread[] = [
  { id: 11, channelId: 1, userIdentifier: "visitor-001", userName: "방문자A", unread: 2, lastAt: now() },
  { id: 12, channelId: 1, userIdentifier: "visitor-002", userName: "방문자B", unread: 0, lastAt: now() },
  { id: 21, channelId: 2, userIdentifier: "guest-101", userName: "고객C", unread: 1, lastAt: now() },
];

const mockMessages: Message[] = [
  { id: 101, threadId: 11, sender: "USER", content: "안녕하세요! 문의드릴게 있어요.", createdAt: now() },
  { id: 102, threadId: 11, sender: "ADMIN", content: "안녕하세요! 무엇을 도와드릴까요?", createdAt: now() },
  { id: 103, threadId: 12, sender: "USER", content: "배송 문의드립니다.", createdAt: now() },
];

// 전역 선택 상태를 매우 간단히 보관하기 위해 파일-로컬 모듈 변수 사용
let selectedChannelIdGlobal = mockChannels[0].id;
let selectedThreadIdGlobal = mockThreads.find(t => t.channelId === selectedChannelIdGlobal)?.id ?? mockThreads[0].id;

type PanelProps = { colors: Colors };

type ChannelsPanelProps = PanelProps & {
  selectedChannelId: number;
  onSelectChannel: (id: number) => void;
};

function ChannelsPanel({ colors, selectedChannelId, onSelectChannel }: ChannelsPanelProps) {
  const [channels] = React.useState<Channel[]>(mockChannels);

  return (
    <VStack align="stretch" gap={2} px={2}>
      {channels.map(ch => (
        <Box
          key={ch.id}
          px={3}
          py={2}
          borderRadius="md"
          bg={selectedChannelId === ch.id ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          cursor="pointer"
          onClick={() => onSelectChannel(ch.id)}
        >
          <Text fontWeight="bold">{ch.name}</Text>
          <Text fontSize="xs" color={colors.text.muted}>code: {ch.code}</Text>
        </Box>
      ))}
    </VStack>
  );
}

type ThreadsPanelProps = PanelProps & {
  selectedChannelId: number;
  selectedThreadId: number;
  onSelectThread: (id: number) => void;
};

function ThreadsPanel({ colors, selectedChannelId, selectedThreadId, onSelectThread }: ThreadsPanelProps) {
  const [threads] = React.useState<Thread[]>(mockThreads);
  const filtered = React.useMemo(() => threads.filter(t => t.channelId === selectedChannelId), [threads, selectedChannelId]);

  return (
    <VStack align="stretch" gap={2} px={2}>
      {filtered.length === 0 && (
        <Text color={colors.text.muted}>해당 채널의 대화가 없습니다.</Text>
      )}
      {filtered.map(th => (
        <Box
          key={th.id}
          px={3}
          py={2}
          borderRadius="md"
          bg={selectedThreadId === th.id ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          cursor="pointer"
          onClick={() => onSelectThread(th.id)}
        >
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium">{th.userName}</Text>
            {th.unread > 0 && (
              <Box
                bg="blue.500"
                color="white"
                borderRadius="full"
                minW="25px"
                h="25px"
                fontSize="xs"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                p={1}
              >
                {th.unread}
              </Box>
            )}
          </HStack>
          <Text fontSize="xs" color={colors.text.muted}>{new Date(th.lastAt).toLocaleString()}</Text>
        </Box>
      ))}
    </VStack>
  );
}

type MessagesPanelProps = PanelProps & { selectedThreadId: number };

function MessagesPanel({ colors, selectedThreadId }: MessagesPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [input, setInput] = React.useState("");
  const [attached, setAttached] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);

  const currentMessages = React.useMemo(() => messages.filter(m => m.threadId === selectedThreadId), [messages, selectedThreadId]);

  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const next = Array.from(list);
    setAttached(prev => [...prev, ...next]);
    // 동일 파일 다시 선택 가능하도록 value 초기화
    e.target.value = "";
  };

  const removeFileAt = (idx: number) => {
    setAttached(prev => prev.filter((_, i) => i !== idx));
  };

  const startEdit = (m: Message) => {
    if (m.attachment) return; // 첨부 메시지는 편집 불가
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
    setMessages(prev => prev.map(m => (
      m.id === editingMessageId ? { ...m, content: editingText } : m
    )));
    cancelEdit();
  };

  const deleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (editingMessageId === id) cancelEdit();
  };

  const send = () => {
    if (!input.trim()) return;
    const next: Message = {
      id: Math.floor(Math.random() * 1_000_000),
      threadId: selectedThreadId,
      sender: "ADMIN",
      content: input,
      createdAt: new Date().toISOString(),
    };
    const fileMessages: Message[] = attached.map((f) => ({
      id: Math.floor(Math.random() * 1_000_000),
      threadId: selectedThreadId,
      sender: "ADMIN",
      content: f.name,
      createdAt: new Date().toISOString(),
      attachment: { name: f.name, type: f.type, size: f.size },
    }));
    setMessages(prev => [...prev, next, ...fileMessages]);
    setInput("");
    setAttached([]);
  };

  return (
    <Flex direction="column" h="full" px={2}>
      <VStack align="stretch" gap={3} flex={1} overflowY="auto" py={2}>
        {currentMessages.map(m => {
          const isMine = m.sender === "ADMIN";
          const canEdit = isMine && !m.attachment;
          const canDelete = isMine; // 본문/첨부 모두 삭제 허용
          const isEditing = editingMessageId === m.id;
          return (
            <Box key={m.id} alignSelf={isMine ? "flex-end" : "flex-start"} maxW="70%">
              <Box
                px={3}
                py={2}
                borderRadius="md"
                bg={isMine ? "blue.500" : "gray.100"}
                color={isMine ? "white" : "black"}
              >
                {isEditing ? (
                  <Input value={editingText} onChange={e => setEditingText(e.target.value)} autoFocus />
                ) : m.attachment ? (
                  <HStack>
                    <LuFile size={16} />
                    <Text whiteSpace="pre-wrap">{m.attachment.name}</Text>
                  </HStack>
                ) : (
                  <Text whiteSpace="pre-wrap">{m.content}</Text>
                )}
              </Box>
              <Flex mt={1} align="center" justify={isMine ? "space-between" : "space-between"}>
                <HStack gap={1.5} flexShrink={0}>
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
                      {canEdit && (
                        <IconButton
                          aria-label="편집"
                          size="xs"
                          variant="subtle"
                          colorPalette="gray"
                          onClick={() => startEdit(m)}
                        >
                          <LuPencil size={14} />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton
                          aria-label="삭제"
                          size="xs"
                          variant="subtle"
                          colorPalette="gray"
                          onClick={() => setConfirmDeleteId(m.id)}
                        >
                          <LuTrash2 size={14} />
                        </IconButton>
                      )}
                    </>
                  )}
                </HStack>
                <Flex flex={1} justify={isMine ? "flex-end" : "flex-start"}>
                  <Text fontSize="xs" color={colors.text.muted}>{new Date(m.createdAt).toLocaleTimeString()}</Text>
                </Flex>
              </Flex>
            </Box>
          );
        })}
      </VStack>
      {confirmDeleteId !== null && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={4} w="320px">
            <Text fontWeight="bold" mb={2}>메시지를 삭제할까요?</Text>
            <Text fontSize="sm" color={colors.text.muted}>삭제 후 복구할 수 없습니다.</Text>
            <HStack mt={4} justify="flex-end">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>취소</Button>
              <Button colorPalette="red" onClick={() => { deleteMessage(confirmDeleteId); setConfirmDeleteId(null); }}>삭제</Button>
            </HStack>
          </Box>
        </Box>
      )}
      {attached.length > 0 && (
        <VStack align="stretch" gap={2} mb={2}>
          <Text fontSize="sm" color={colors.text.muted}>첨부 {attached.length}개</Text>
          {attached.map((f, idx) => (
            <HStack key={`${f.name}-${idx}`} justify="space-between" px={3} py={2} borderRadius="md" bg={colors.cardBg}>
              <HStack>
                <LuFile size={16} />
                <Text fontSize="sm">{f.name}</Text>
              </HStack>
              <IconButton aria-label="첨부 삭제" size="xs" variant="ghost" onClick={() => removeFileAt(idx)}>
                <LuX size={14} />
              </IconButton>
            </HStack>
          ))}
        </VStack>
      )}
      <Box h="1px" bg={colors.border} my={2} />
      <HStack>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFilesPicked}
          accept="image/*,video/*,application/pdf,*/*"
          style={{ display: "none" }}
        />
        <IconButton aria-label="파일" variant="outline" onClick={openFilePicker}>
          <LuPaperclip size={16} />
        </IconButton>
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="메시지 입력" onKeyDown={e => { if (e.key === "Enter") send(); }} />
        <Button onClick={send} colorPalette="blue">전송</Button>
      </HStack>
    </Flex>
  );
}


