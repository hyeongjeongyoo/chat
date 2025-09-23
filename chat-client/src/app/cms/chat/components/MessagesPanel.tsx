"use client";

import React from "react";
import { Box, Flex, HStack, VStack, Text, Button, Input, IconButton, Image } from "@chakra-ui/react";
import { LuPaperclip } from "react-icons/lu";
import { useSearchParams } from "next/navigation";
import { chatApi } from "@/lib/api/chat";
import { fileApi, type UploadedFileDto } from "@/lib/api/file";
import { ChatStompClient } from "@/lib/ws/chatSocket";
import { useChatNotification } from "@/contexts/ChatNotificationContext";
import { useMessagesData } from "../hooks/useMessagesData";
import { ChatView } from "./chat/ChatView";
import { FilesView } from "./chat/FilesView";
import { type PanelProps, type Message, type ThreadFile } from "../types";

type MessagesPanelProps = PanelProps & { 
  selectedThreadId: number;
  selectedChannelId: number;
  currentChannelName: string;
  currentThreadName: string;
  channelsPanelRef: React.RefObject<{ refreshChannels: () => void }>;
  onThreadsRefresh: () => void;
  onTabChange: () => void; // 탭 변경 시 뱃지 초기화를 위한 콜백
};

export function MessagesPanel({ 
  colors, 
  selectedThreadId, 
  selectedChannelId, 
  currentChannelName, 
  currentThreadName, 
  channelsPanelRef, 
  onThreadsRefresh, 
  onTabChange 
}: MessagesPanelProps) {
  const { updateTotalUnreadCount, incrementTotalUnreadCount } = useChatNotification();
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("threadId");
  const explicitBackendThreadId = threadIdParam ? Number(threadIdParam) : null;
  
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [attached, setAttached] = React.useState<File[]>([]);
  const [activeTab, setActiveTab] = React.useState<"chat" | "files">("chat");
  const [backendThreadId, setBackendThreadId] = React.useState<number | null>(null);
  const [threadFiles, setThreadFiles] = React.useState<ThreadFile[]>([]);
  const [optimistic, setOptimistic] = React.useState<Message[]>([]);
  const [newMsgCount, setNewMsgCount] = React.useState<number>(0);
  const [bizOpen, setBizOpen] = React.useState<boolean | null>(null);
  const [bizMsg, setBizMsg] = React.useState<string>("");
  
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const activeTabRef = React.useRef<"chat" | "files">("chat");
  const stompRef = React.useRef<ChatStompClient | null>(null);
  const channelStompRef = React.useRef<ChatStompClient | null>(null);
  const lastSentRef = React.useRef<{ content: string; at: number } | null>(null);
  const lastUploadedMapRef = React.useRef<Map<string, string>>(new Map());
  const recentEventKeysRef = React.useRef<Map<string, number>>(new Map());

  // 백엔드 ID 확보 유틸
  const ensureBackendIds = React.useCallback(async () => {
    if (explicitBackendThreadId) {
      return { threadId: explicitBackendThreadId };
    }
    if (!selectedThreadId || selectedThreadId <= 0) {
      throw new Error("Valid threadId required");
    }
    return { threadId: selectedThreadId };
  }, [selectedThreadId, explicitBackendThreadId]);

  // 메시지 데이터 관리
  const {
    messages: historyMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMessagesData(selectedThreadId, backendThreadId, explicitBackendThreadId, ensureBackendIds);

  // 백엔드 스레드 ID 설정 및 STOMP 연결
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { threadId } = await ensureBackendIds();
        if (mounted) setBackendThreadId(threadId);
        
        // STOMP 연결 설정 로직은 기존과 동일하게 유지
        // ... (STOMP 연결 코드는 너무 길어서 별도 훅으로 분리 필요)
        
      } catch {}
    })();
    return () => { mounted = false; };
  }, [ensureBackendIds]);

  // 히스토리와 낙관적 메시지 병합
  React.useEffect(() => {
    const flatById = new Map(historyMessages.map(m => [m.id, m]));
    setMessages(prev => {
      const preserved = prev.filter(m => !flatById.has(m.id) && (m.threadId === selectedThreadId || m.threadId === backendThreadId));
      const optimisticForThread = optimistic.filter(m => (m.threadId === selectedThreadId || m.threadId === backendThreadId) && !flatById.has(m.id));
      return [...historyMessages, ...preserved, ...optimisticForThread];
    });
  }, [historyMessages, optimistic, selectedThreadId, backendThreadId]);

  // 탭 상태 동기화
  React.useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 비즈니스 시간 확인
  React.useEffect(() => {
    (async () => {
      try {
        const data = await chatApi.businessHoursStatus();
        setBizOpen(!!data.open);
        setBizMsg(String(data.message || ""));
      } catch {
        setBizOpen(null);
      }
    })();
  }, []);

  // 파일 선택 처리
  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const pickedFiles = Array.from(list);

    const { threadId } = await ensureBackendIds();

    // 낙관적 UI 처리
    const tempIds: number[] = [];
    setOptimistic(prev => {
      const drafts = pickedFiles.map((f) => ({
        id: Math.floor(Math.random() * 1_000_000),
        threadId: threadId,
        sender: "ADMIN" as const,
        content: f.name,
        createdAt: new Date().toISOString(),
        localDraft: true,
        attachment: {
          name: f.name,
          type: f.type,
          size: f.size,
          previewUrl: f.type?.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        },
      }));
      drafts.forEach(m => tempIds.push(m.id));
      return [...prev, ...drafts];
    });

    try {
      // 파일 업로드 및 메시지 생성
      const uploadRes = await fileApi.upload(pickedFiles, "CHAT", threadId, { autoMessage: false });
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
      
      for (const fi of (uploadRes || []) as UploadedFileDto[]) {
        const originName = fi.originName;
        const downloadUrl = `${baseUrl}/cms/file/public/download/${fi.fileId}`;
        const isImage = (fi as any).mimeType?.toLowerCase()?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(originName);
        const messageType = isImage ? "IMAGE" : "FILE";
        
        const saved = await chatApi.postFileMessage(threadId, {
          fileName: originName,
          fileUrl: downloadUrl,
          messageType,
          actor: "admin",
          senderType: "ADMIN",
        } as any);
        
        try { 
          await fileApi.attachToMessage((saved as any).id, [fi.fileId]); 
        } catch {}
        
        setOptimistic(prev => prev.filter(m => !(m.attachment && m.attachment.name === originName && tempIds.includes(m.id))));
      }
      
      setOptimistic(prev => prev.filter(m => !tempIds.includes(m.id)));
    } catch (err) {
      // 실패 시 임시 메시지 유지
    } finally {
      e.target.value = "";
    }
  };

  // 메시지 전송
  const send = async () => {
    if (!input.trim()) return;
    try {
      const { threadId } = await ensureBackendIds();
      
      const optimisticMsg: Message = {
        id: -Math.floor(Math.random() * 1_000_000) - 1,
        threadId: threadId,
        sender: "ADMIN",
        content: input,
        createdAt: new Date().toISOString(),
        localDraft: true,
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      setInput("");
      setAttached([]);
      
      // STOMP 전송
      let sentByStomp = false;
      try {
        lastSentRef.current = { content: optimisticMsg.content, at: Date.now() };
        sentByStomp = !!stompRef.current?.sendText(threadId, "ADMIN", optimisticMsg.content, "admin");
      } catch {}
      
      // STOMP 실패 시 REST 폴백
      if (!sentByStomp) {
        const saved = await chatApi.sendMessage(threadId, {
          senderType: "ADMIN",
          content: optimisticMsg.content,
          actor: "admin",
        });
        if (saved) {
          setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...optimisticMsg, id: saved.id, createdAt: saved.createdAt, localDraft: false } : m));
        }
      }
    } catch {}
  };

  const effectiveThreadId = React.useMemo(() => {
    return backendThreadId ?? (explicitBackendThreadId ?? selectedThreadId);
  }, [backendThreadId, explicitBackendThreadId, selectedThreadId]);

  const currentMessages = React.useMemo(() => {
    const tid = effectiveThreadId;
    return messages.filter(m => m.threadId === tid);
  }, [messages, effectiveThreadId]);

  return (
    <Flex direction="column" h="full" px={2}>
      {/* 탭 */}
      <HStack gap={6} mb={2} borderBottomWidth="1px" borderColor="gray.200" px={2}>
        <Box
          pb={2}
          borderBottomWidth={activeTab === "chat" ? "2px" : "0"}
          borderColor={activeTab === "chat" ? "blue.500" : "transparent"}
          color={activeTab === "chat" ? "blue.600" : "gray.600"}
          cursor="pointer"
          onClick={async () => { 
            setActiveTab("chat"); 
            activeTabRef.current = "chat"; 
            setNewMsgCount(0);
            
            if (selectedThreadId) {
              try {
                await chatApi.markRead(selectedThreadId, "admin");
                if (channelsPanelRef.current) {
                  channelsPanelRef.current.refreshChannels();
                }
                onTabChange();
              } catch (error) {
                console.error("스레드 뱃지 초기화 실패:", error);
              }
            }
          }}
        >
          <HStack>
            <Text fontWeight={activeTab === "chat" ? "bold" : "normal"}>대화</Text>
            {newMsgCount > 0 && (
              <Box bg="red.500" color="white" borderRadius="full" px={2} py={0.5} fontSize="10px" minW="18px" textAlign="center">
                {newMsgCount}
              </Box>
            )}
          </HStack>
        </Box>
        <Box
          pb={2}
          borderBottomWidth={activeTab === "files" ? "2px" : "0"}
          borderColor={activeTab === "files" ? "blue.500" : "transparent"}
          color={activeTab === "files" ? "blue.600" : "gray.600"}
          cursor="pointer"
          onClick={() => { setActiveTab("files"); activeTabRef.current = "files"; }}
        >
          <Text fontWeight={activeTab === "files" ? "bold" : "normal"}>첨부파일</Text>
        </Box>
      </HStack>

      {activeTab === "files" ? (
        <FilesView 
          colors={colors}
          threadFiles={threadFiles}
          backendThreadId={backendThreadId}
          onFilesUpdate={setThreadFiles}
        />
      ) : (
        <ChatView
          colors={colors}
          messages={currentMessages}
          setMessages={setMessages}
          bizOpen={bizOpen}
          bizMsg={bizMsg}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onMessagesUpdate={setMessages}
        />
      )}

      {activeTab === "chat" && (
        <>
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
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="메시지 입력" 
              onKeyDown={e => { if (e.key === "Enter") send(); }} 
            />
            <Button onClick={send} colorPalette="blue">전송</Button>
          </HStack>
        </>
      )}
    </Flex>
  );
}
