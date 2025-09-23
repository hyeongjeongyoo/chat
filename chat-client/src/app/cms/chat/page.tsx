"use client";

import React from "react";
import { Box, Flex, Heading, Badge, Text, VStack, HStack, Button, Input, IconButton, Image, Drawer, Portal } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { LuPencil, LuTrash2, LuCheck, LuUndo2, LuPaperclip, LuFile, LuX, LuDownload, LuImage, LuChevronRight } from "react-icons/lu";
import { chatApi, SpringPage } from "@/lib/api/chat";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fileApi, type UploadedFileDto } from "@/lib/api/file";
import { ChatStompClient } from "@/lib/ws/chatSocket";
import { useSearchParams, useRouter } from "next/navigation";
import { useChatNotification } from "@/contexts/ChatNotificationContext";

export default function ChatAdminPage() {
  const colors = useColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateTotalUnreadCount, resetTotalUnreadCount } = useChatNotification();
  // 페이지 루트에서는 별도 동작 없음. threadId 파라미터 처리는 MessagesPanel 내부에서 수행
  
  // 채팅관리 페이지 진입 시 전체 뱃지 초기화
  React.useEffect(() => {
    resetTotalUnreadCount();
  }, [resetTotalUnreadCount]);

  const [selectedChannelId, setSelectedChannelId] = React.useState<number>(1);
  const [selectedThreadId, setSelectedThreadId] = React.useState<number>(0);
  const channelsPanelRef = React.useRef<{ refreshChannels: () => void }>(null);
  
  // URL 파라미터에서 채널 ID 읽기
  React.useEffect(() => {
    const channelIdParam = searchParams.get("channelId");
    if (channelIdParam) {
      const channelId = Number(channelIdParam);
      if (!isNaN(channelId)) {
        setSelectedChannelId(channelId);
      }
    }
  }, [searchParams]);
  
  // 현재 대화 상태 추적
  const [currentChannelName, setCurrentChannelName] = React.useState<string>("");
  const [currentThreadName, setCurrentThreadName] = React.useState<string>("");
  const [threadsRefreshTrigger, setThreadsRefreshTrigger] = React.useState<number>(0);

  const layout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    // 3열 레이아웃: 3 / 3 / 6 (총 12)
    { id: "channels", x: 0, y: 1, w: 3, h: 11, title: "CMS Channels", subtitle: "업체 선택" },
    { id: "threads", x: 3, y: 1, w: 3, h: 11, title: "Customer Chats", subtitle: "상대 선택" },
    { id: "messages", x: 6, y: 1, w: 6, h: 11, title: "Conversation", subtitle: "대화 / 첨부파일" },
  ];

  // URL의 threadId는 테스트 용도로만 사용. 기본값/생성 로직은 제거

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
          ref={channelsPanelRef}
          colors={colors}
          selectedChannelId={selectedChannelId}
          onSelectChannel={async (id, channelName) => {
            // 채널만 변경. threadId는 ThreadsPanel에서 백엔드 목록 기준으로 결정
            setSelectedChannelId(id);
            setCurrentChannelName(channelName);
            
            // URL에 채널 ID 추가
            const current = new URLSearchParams(searchParams.toString());
            current.set("channelId", String(id));
            router.replace(`?${current.toString()}`);
            
            // 채널 선택 시 해당 채널의 뱃지 초기화
            try {
              // 해당 채널의 모든 스레드 조회
              const threads = await chatApi.getThreadsByChannel(id);
              if (threads && threads.length > 0) {
                // 각 스레드를 읽음 처리 (병렬 처리로 성능 개선)
                const markReadPromises = threads.map(thread => 
                  chatApi.markRead(thread.id, "admin").catch(() => {})
                );
                await Promise.all(markReadPromises);
              }
            } catch (error) {
              console.error("채널 뱃지 초기화 실패:", error);
            }
            
            // 채널 목록 새로고침하여 뱃지 업데이트
            channelsPanelRef.current?.refreshChannels();
            // 스레드 목록도 새로고침
            setThreadsRefreshTrigger(prev => prev + 1);
          }}
        />

        {/* Threads */}
        <ThreadsPanel
          colors={colors}
          selectedChannelId={selectedChannelId}
          selectedThreadId={selectedThreadId}
          onSelectThread={(id, threadName) => {
            setSelectedThreadId(id);
            setCurrentThreadName(threadName);
            // 스레드 선택 시 URL 동기화: channelId와 threadId 모두 유지
            const current = new URLSearchParams(searchParams.toString());
            current.set("threadId", String(id));
            router.replace(`?${current.toString()}`);
          }}
          onThreadRead={(threadId) => {
            // 스레드 읽음 처리 - 백엔드 API 호출
            chatApi.markRead(threadId, "admin").then(() => {
              // 읽음 처리 후 스레드 목록 새로고침
              setThreadsRefreshTrigger(prev => prev + 1);
            }).catch(() => {});
          }}
          refreshTrigger={threadsRefreshTrigger}
        />

        {/* Messages */}
        <MessagesPanel
          colors={colors}
          selectedThreadId={selectedThreadId}
          selectedChannelId={selectedChannelId}
          currentChannelName={currentChannelName}
          currentThreadName={currentThreadName}
          channelsPanelRef={channelsPanelRef}
          onThreadsRefresh={() => setThreadsRefreshTrigger(prev => prev + 1)}
          onTabChange={() => setThreadsRefreshTrigger(prev => prev + 1)}
        />

        {/* 상세/설정 섹션 제거됨 */}
      </GridSection>
    </Box>
  );
}

// ---------- Types ----------
type Colors = ReturnType<typeof useColors>;

type Message = {
  id: number;
  threadId: number;
  sender: "USER" | "ADMIN";
  content: string;
  createdAt: string;
  attachment?: { name: string; type?: string; size?: number; downloadUrl?: string; previewUrl?: string };
  // 낙관적 로컬 메시지 식별용(WS 수신 시 중복 제거)
  localDraft?: boolean;
  // 수정 여부 배지
  edited?: boolean;
};

type PanelProps = { colors: Colors };

type ChannelsPanelProps = PanelProps & {
  selectedChannelId: number;
  onSelectChannel: (id: number, channelName: string) => void;
};

const ChannelsPanel = React.forwardRef<{ refreshChannels: () => void }, ChannelsPanelProps>(({ colors, selectedChannelId, onSelectChannel }, ref) => {
  const [channels, setChannels] = React.useState<Array<{ id: number; cmsCode: string; cmsName?: string; unreadCount?: number }>>([]);
  const { updateTotalUnreadCount } = useChatNotification();

  const refreshChannels = React.useCallback(async () => {
    try {
      const list = await chatApi.getChannels();
      setChannels(list || []);
      
      // 전체 미읽은 메시지 수 계산
      const totalUnread = (list || []).reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);
      updateTotalUnreadCount(totalUnread);
    } catch {}
  }, [updateTotalUnreadCount]);

  // 주기적으로 뱃지 업데이트 (5초마다) - 적절한 반응성
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshChannels();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refreshChannels]);

  React.useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  // ref를 통해 refreshChannels 함수 노출
  React.useImperativeHandle(ref, () => ({
    refreshChannels
  }), [refreshChannels]);

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
          onClick={() => onSelectChannel(ch.id, ch.cmsName || ch.cmsCode)}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="bold">{ch.cmsName || ch.cmsCode}</Text>
              <Text fontSize="xs" color={colors.text.muted}>code: {ch.cmsCode}</Text>
            </VStack>
            {(ch.unreadCount ?? 0) > 0 && (
              <Badge
                bg="red.500"
                color="white"
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                minW="20px"
                textAlign="center"
              >
                {(ch.unreadCount ?? 0) > 99 ? "99+" : (ch.unreadCount ?? 0)}
              </Badge>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
});

type ThreadsPanelProps = PanelProps & {
  selectedChannelId: number;
  selectedThreadId: number;
  onSelectThread: (id: number, threadName: string) => void;
  onThreadRead: (threadId: number) => void;
  refreshTrigger?: number; // 뱃지 새로고침 트리거
};

function ThreadsPanel({ colors, selectedChannelId, selectedThreadId, onSelectThread, onThreadRead, refreshTrigger }: ThreadsPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = React.useState<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string; unreadCount?: number }>>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedChannelId) { setThreads([]); return; }
      try {
        const list = await chatApi.getThreadsByChannel(selectedChannelId);
        if (!mounted) return;
        setThreads(list || []);
        const urlThreadId = searchParams.get("threadId");
        const urlTid = urlThreadId ? Number(urlThreadId) : null;
        const ids = new Set((list || []).map(t => t.id));
        if (urlTid) {
          if (ids.has(urlTid)) {
            onSelectThread(urlTid, "");
          } else if ((list || []).length > 0) {
            // 현재 채널에 해당 threadId가 없으면 첫 스레드로 전환
            const first = list[0].id;
            onSelectThread(first, list[0].userName || list[0].userIdentifier);
            const params = new URLSearchParams(searchParams.toString());
            params.set("threadId", String(first));
            router.replace(`?${params.toString()}`);
          }
        } else if ((list || []).length > 0) {
          // URL에 threadId가 전혀 없을 때만 첫 스레드로 초기화
          const first = list[0].id;
          onSelectThread(first, list[0].userName || list[0].userIdentifier);
          const params = new URLSearchParams(searchParams.toString());
          params.set("threadId", String(first));
          router.replace(`?${params.toString()}`);
        }
      } catch {
        setThreads([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedChannelId, router, searchParams, onSelectThread]);

  // refreshTrigger가 변경될 때 스레드 목록 새로고침
  React.useEffect(() => {
    if (refreshTrigger && selectedChannelId) {
      (async () => {
        try {
          const list = await chatApi.getThreadsByChannel(selectedChannelId);
          setThreads(list || []);
        } catch {}
      })();
    }
  }, [refreshTrigger, selectedChannelId]);

  // 주기적으로 스레드 목록 새로고침 (5초마다) - 적절한 반응성
  React.useEffect(() => {
    if (!selectedChannelId) return;
    
    const interval = setInterval(async () => {
      try {
        const list = await chatApi.getThreadsByChannel(selectedChannelId);
        setThreads(list || []);
      } catch {}
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedChannelId]);

  return (
    <VStack align="stretch" gap={2} px={2}>
      {threads.length === 0 && (
        <Text color={colors.text.muted}>해당 채널의 대화가 없습니다.</Text>
      )}
      {threads.map(th => (
        <Box
          key={th.id}
          px={3}
          py={2}
          borderRadius="md"
          bg={selectedThreadId === th.id ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          cursor="pointer"
          onClick={() => {
            onSelectThread(th.id, th.userName || th.userIdentifier);
            // 스레드 선택 시 해당 스레드의 뱃지 즉시 초기화 (비동기로 처리)
            onThreadRead(th.id);
          }}
        >
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium">{th.userName || th.userIdentifier}</Text>
            {(th.unreadCount ?? 0) > 0 && (
              <Badge
                bg="red.500"
                color="white"
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                minW="20px"
                textAlign="center"
              >
                {(th.unreadCount ?? 0) > 99 ? "99+" : (th.unreadCount ?? 0)}
              </Badge>
            )}
          </HStack>
          {/* 최근 시간 표시: 추후 API 필드 연결 */}
          <Text fontSize="xs" color={colors.text.muted}></Text>
        </Box>
      ))}
    </VStack>
  );
}

type MessagesPanelProps = PanelProps & { 
  selectedThreadId: number;
  selectedChannelId: number;
  currentChannelName: string;
  currentThreadName: string;
  channelsPanelRef: React.RefObject<{ refreshChannels: () => void }>;
  onThreadsRefresh: () => void;
  onTabChange: () => void; // 탭 변경 시 뱃지 초기화를 위한 콜백
};

function MessagesPanel({ colors, selectedThreadId, selectedChannelId, currentChannelName, currentThreadName, channelsPanelRef, onThreadsRefresh, onTabChange }: MessagesPanelProps) {
  const { updateTotalUnreadCount, incrementTotalUnreadCount } = useChatNotification();
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("threadId");
  const explicitBackendThreadId = threadIdParam ? Number(threadIdParam) : null;
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [attached, setAttached] = React.useState<File[]>([]);
  const [activeTab, setActiveTab] = React.useState<"chat" | "files">("chat");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [optimistic, setOptimistic] = React.useState<Message[]>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [newMsgCount, setNewMsgCount] = React.useState<number>(0);
  const activeTabRef = React.useRef<"chat" | "files">("chat");
  const [bizOpen, setBizOpen] = React.useState<boolean | null>(null);
  const [bizMsg, setBizMsg] = React.useState<string>("");
  const userScrolledRef = React.useRef<boolean>(false);
  
  // 이미지 미리보기 상태
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<{ src: string; alt: string } | null>(null);
  // Drawer 마운트/오픈 상태로 슬라이드 애니메이션 유지
  const [isDrawerMounted, setIsDrawerMounted] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  // 스크롤 위치 저장용
  const savedScrollPositionRef = React.useRef<number>(0);

  // 컴포넌트 언마운트 시 스크롤 복원
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // ESC 키로 drawer 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
        setIsImageModalOpen(false);
        document.body.style.overflow = 'auto';
        window.scrollTo(0, savedScrollPositionRef.current);
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  // 외부 클릭으로 drawer 닫기
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDrawerOpen) {
        // drawer가 열려있을 때 외부 클릭 감지
        const target = e.target as Element;
        // drawer 내부가 아닌 곳을 클릭했을 때
        if (!target.closest('[data-drawer-container]')) {
          setIsDrawerOpen(false);
          setIsImageModalOpen(false);
          document.body.style.overflow = 'auto';
          window.scrollTo(0, savedScrollPositionRef.current);
        }
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen]);
  
  const autoScrollRef = React.useRef<boolean>(true);
  const didInitScrollRef = React.useRef<boolean>(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  // 로딩 전 하단으로부터의 오프셋(뷰포트 하단 기준)
  const pendingRestoreRef = React.useRef<number | null>(null);
  const isLoadingPrevRef = React.useRef<boolean>(false);
  const isProgrammaticScrollRef = React.useRef<boolean>(false);
  const [backendThreadId, setBackendThreadId] = React.useState<number | null>(null);
  const stompRef = React.useRef<ChatStompClient | null>(null);
  const channelStompRef = React.useRef<ChatStompClient | null>(null); // 채널 구독 전용
  const [imageLoadedMap, setImageLoadedMap] = React.useState<Record<number, boolean>>({});
  // 최근 업로드한 파일명 -> 다운로드 URL 매핑 (즉시 활성화용)
  const lastUploadedMapRef = React.useRef<Map<string, string>>(new Map());
  const [threadFiles, setThreadFiles] = React.useState<Array<{ fileId: string; originName: string; mimeType: string; createdDate?: string }>>([]);
  const lastSentRef = React.useRef<{ content: string; at: number } | null>(null);
  // 최근 수신 이벤트 키(중복 방지: 일시적 이중 브로드캐스트/이중 구독 대응)
  const recentEventKeysRef = React.useRef<Map<string, number>>(new Map());

  // 스레드 변경 시 새 메시지 알림 초기화
  React.useEffect(() => {
    setShowNewMessageAlert(false);
    setUnreadCount(0);
  }, [selectedThreadId]);

  // 스마트 스크롤 함수들
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

  // 사용자가 하단 근처에 있는지 확인
  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 100; // 하단 100px 이내
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    
    const nearBottom = isNearBottom();
    autoScrollRef.current = nearBottom;
    
    if (nearBottom && showNewMessageAlert) {
      setShowNewMessageAlert(false);
      setUnreadCount(0);
    }
  };

  // 서버 실제 ID 매핑 캐시 (mockThreadId -> backendThreadId)
  const backendThreadIdMapRef = React.useRef<Record<number, number>>({});
  const backendChannelIdMapRef = React.useRef<Record<string, number>>({});

  // 현재 선택된 mock thread 에 대한 정보 헬퍼
  const getMockThread = React.useCallback(() => null, []);

  // 채널/스레드 실제 ID 확보 유틸
  const ensureBackendIds = React.useCallback(async () => {
    if (explicitBackendThreadId) {
      return { threadId: explicitBackendThreadId };
    }
    const mock = getMockThread();
    if (!mock) {
      // selectedThreadId가 유효하지 않으면 null 반환
      if (!selectedThreadId || selectedThreadId <= 0) {
        throw new Error("Valid threadId required");
      }
      return { threadId: selectedThreadId };
    }

    // 스레드 ID 확보 (mock -> backend 매핑)
    return { threadId: explicitBackendThreadId ?? selectedThreadId };
  }, [getMockThread, selectedThreadId, explicitBackendThreadId]);

  // 선택된 mock thread에 대응하는 백엔드 threadId를 미리 확보해 둠
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { threadId } = await ensureBackendIds();
        if (mounted) setBackendThreadId(threadId);
        // STOMP 연결 (실시간 수신)
        try {
          stompRef.current?.disconnect();
          const c = new ChatStompClient();
          c.connect(threadId, (evt) => {
            // 서버에서 수신된 메시지를 즉시 리스트에 반영
            const m = evt && typeof evt === "object" ? evt : undefined;
            if (m) {
              // 삭제 이벤트: 해당 id 제거
              if ((m as any).type === "message.deleted") {
                const idToRemove = (m as any).id ?? (m as any).messageId;
                if (idToRemove != null) {
                  setMessages(prev => prev.filter(x => x.id !== idToRemove));
                }
                return;
              }
              // 수정 이벤트는 내용만 교체하고 edited 배지 표시
              if ((m as any).type === "message.updated") {
                const idToUpdate = (m as any).id ?? (m as any).messageId;
                const newContent = (m as any).content as string | undefined;
                if (idToUpdate != null && typeof newContent === "string") {
                  setMessages(prev => prev.map(x => x.id === idToUpdate ? { ...x, content: newContent, edited: true } : x));
                }
                return;
              }
              // 일부 WS 브로드캐스트는 threadId가 포함되지 않음 → 구독 경로가 스레드별이므로 허용
              const matches = (m as any).threadId ? ((m as any).threadId === threadId || (m as any).threadId === selectedThreadId) : true;
              if (!matches) return;
              
              // 메시지 발신자 확인
              const messageSender = (m as any).senderType === "ADMIN" ? "ADMIN" : "USER";
              
              // 실시간 수신으로 직접 반영하므로 여기서는 refetch하지 않음 (중복 방지)
              
              // 0) 중복 이벤트 드롭: 같은 payload가 짧은 시간(3초) 내에 반복되면 무시
              try {
                const k = [
                  String((m as any).id ?? ""),
                  String((m as any).senderType ?? ""),
                  String((m as any).messageType ?? ""),
                  String((m as any).content ?? ""),
                  String((m as any).fileUrl ?? ""),
                ].join("|");
                const now = Date.now();
                const last = recentEventKeysRef.current.get(k) || 0;
                // 3초 내 동일키 재수신시 무시
                if (now - last < 3000) return;
                recentEventKeysRef.current.set(k, now);
                // 누적 맵 청소(성장 방지)
                if (recentEventKeysRef.current.size > 200) {
                  recentEventKeysRef.current.forEach((v, key) => { if (now - v > 10000) recentEventKeysRef.current.delete(key); });
                }
              } catch {}
              const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
              const toAbs = (url?: string) => !url ? undefined : (String(url).startsWith("http") ? String(url) : `${apiOrigin}${url}`);
              const toView = (url?: string) => !url ? undefined : String(url).replace("/download/", "/view/");
              const fileUrl = (m as any).fileUrl as string | undefined;
              const fileName = (m as any).fileName as string | undefined;
              const messageType = (m as any).messageType as string | undefined;
              const isImage = (messageType && messageType.toUpperCase() === "IMAGE") || (fileUrl ? /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(fileUrl) : false);

              const newMsg: Message = {
                id: (m as any).id ?? Math.floor(Math.random() * 1_000_000),
                threadId: threadId,
                sender: (m as any).senderType === "ADMIN" ? "ADMIN" : "USER",
                content: String((m as any).content ?? ""),
                createdAt: (m as any).createdAt ?? new Date().toISOString(),
                edited: (m as any).edited || false, // 백엔드에서 받은 edited 상태 사용
              };
              // 방금 내가 보낸 메시지(STOMP 에코)면 중복 방지
              if ((m as any).senderType === "ADMIN" && lastSentRef.current && lastSentRef.current.content === newMsg.content && (Date.now() - lastSentRef.current.at) < 5000) {
                lastSentRef.current = null;
                return;
              }
              // 1) 서버가 준 fileUrl 사용
              if (fileUrl) {
                const abs = toAbs(fileUrl)!;
                newMsg.attachment = {
                  name: fileName || newMsg.content || "첨부파일",
                  downloadUrl: abs,
                  previewUrl: isImage ? toView(abs) : undefined,
                };
              } else if (fileName) {
                // 2) 서버에 fileUrl이 없으면, 최근 업로드 맵에서 보강
                const found = lastUploadedMapRef.current.get(fileName);
                if (found) {
                  const abs = toAbs(found)!;
                  newMsg.attachment = {
                    name: fileName,
                    downloadUrl: abs,
                    previewUrl: isImage ? toView(abs) : undefined,
                  };
                }
              }
              setMessages(prev => {
                // 1) 낙관적 초안 제거: 음수 ID 또는 localDraft=true 중 sender/content 일치 항목 제거
                const cleaned = prev.filter(m => {
                  const mid = m.id as any;
                  const isTempId = typeof mid === 'number' && mid < 0;
                  const isLocalDraft = !!m.localDraft;
                  if (isTempId || isLocalDraft) {
                    // 파일 메시지의 경우 파일명(content) 기준으로도 제거
                    const sameText = m.content === newMsg.content;
                    const sameAttachName = !!(m.attachment?.name) && (m.attachment?.name === (fileName || newMsg.content));
                    return !(m.sender === newMsg.sender && (sameText || sameAttachName));
                  }
                  return true;
                });
                // 2) 동일 id 중복 방지
                return cleaned.some(x => x.id === newMsg.id) ? cleaned : [...cleaned, newMsg];
              });
              // 스마트 스크롤로 처리되므로 강제 스크롤 제거
              
              // 알림 및 뱃지 로직 - USER 메시지만 처리 (ADMIN 메시지는 뱃지/토스트 없음)
              const messageThreadId = (m as any).threadId;
              const messageUserName = (m as any).userName || (m as any).userIdentifier || "알 수 없는 사용자";
              
              // ADMIN이 보낸 메시지는 뱃지나 토스트 표시하지 않음
              if (messageSender === "ADMIN") {
                return;
              }
              
              // USER 메시지에 대한 알림 및 뱃지 로직
                const isCurrentPage = window.location.pathname === "/cms/chat";
                const isCurrentThread = messageThreadId === threadId;
                const isChatTab = activeTabRef.current === "chat";
                
                      // 메시지가 온 스레드의 채널 ID 확인 (백엔드에서 channelId로 전송됨)
                      const messageChannelId = (m as any).channelId;
                      const isCurrentChannel = messageChannelId === selectedChannelId;
                      
                
                // 디버깅용 로그
                console.log("메시지 수신:", {
                  messageThreadId,
                  messageChannelId,
                  selectedChannelId,
                  selectedThreadId: threadId,
                  isCurrentPage,
                  isCurrentThread,
                  isCurrentChannel,
                  isChatTab,
                  messageSender,
                  messageUserName
                });
                
                // 현재 스레드에서 메시지 수신 시 읽음 처리 (채팅 탭에 있을 때만)
                if (isCurrentThread && isChatTab) {
                  // 즉시 읽음 처리
                  chatApi.markRead(messageThreadId, "admin").then(() => {
                    // 읽음 처리 후 뱃지 업데이트
                    if (channelsPanelRef.current) {
                      channelsPanelRef.current.refreshChannels();
                    }
                    onThreadsRefresh();
                  }).catch(() => {});
                }
                
                // 단순화: 모든 USER 메시지에 대해 토스트 표시
                // 뱃지 업데이트
                if (isCurrentPage) {
                  if (channelsPanelRef.current) {
                    channelsPanelRef.current.refreshChannels();
                  }
                  if (!isCurrentThread) {
                    onThreadsRefresh();
                  }
                  if (isCurrentThread && !isChatTab) {
                    setNewMsgCount((v) => v + 1);
                  }
                }
                incrementTotalUnreadCount();

              // refetch()는 중복 유발 가능성이 있어 실시간 수신시 생략
            }
          });
          stompRef.current = c;
          
          // 연결 직후 한 번 즉시 동기화해서, 구독 이전에 도착한 환영 메시지도 바로 반영
          try { refetch(); } catch {}
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, [ensureBackendIds]);

  // 채널 구독 전용 STOMP 클라이언트 초기화
  React.useEffect(() => {
    if (!channelStompRef.current) {
      try {
        const c = new ChatStompClient();
        // 임시 스레드 ID로 연결 (채널 구독만 사용)
        c.connect(1, () => {}, () => {
        });
        channelStompRef.current = c;
      } catch (error) {
        console.error("🔔 [채널구독] 채널 전용 STOMP 클라이언트 생성 실패:", error);
      }
    }

    return () => {
      if (channelStompRef.current) {
        channelStompRef.current.disconnect();
        channelStompRef.current = null;
      }
    };
  }, []);

  // 현재 채널만 구독 관리 (GlobalChatService가 전체 채널 담당)
  React.useEffect(() => {
    // 스레드 전용 또는 채널 전용 STOMP 클라이언트 사용
    const activeStompRef = stompRef.current || channelStompRef.current;
    
    if (!activeStompRef || !selectedChannelId) {
      return;
    }

    // 현재 선택된 채널만 구독
    const subscribeToCurrentChannel = async () => {
      try {
        const channels = await chatApi.getChannels();
        
        // 현재 선택된 채널만 찾아서 구독
        const currentChannel = channels.find(ch => ch.id === selectedChannelId);
        if (currentChannel) {
          subscribeToSingleChannel(activeStompRef, currentChannel.id, currentChannel.cmsName || currentChannel.cmsCode);
        }
      } catch (error) {
        
      }
    };

    // 개별 채널 구독 함수
    const subscribeToSingleChannel = (client: any, channelId: number, channelName: string) => {
      
      client.subscribeToChannel(channelId, (channelEvt: any) => {

        const channelMsg = channelEvt && typeof channelEvt === "object" ? channelEvt : undefined;
        if (channelMsg) {
          const messageSender = (channelMsg as any).senderType;
          const messageThreadId = (channelMsg as any).threadId;
          const messageUserName = (channelMsg as any).userName || (channelMsg as any).userIdentifier || "알 수 없는 사용자";
          const messageChannelId = (channelMsg as any).channelId || channelId;
          
          // ADMIN 메시지는 알림 없음
          if (messageSender === "ADMIN") {
            return;
          }
          
          // 현재 스레드와 다른 스레드에서 온 메시지만 알림 처리
          const currentThreadId = selectedThreadId;
          const isCurrentThread = messageThreadId === currentThreadId;
          const isCurrentPage = window.location.pathname === "/cms/chat";
          const isCurrentChannel = messageChannelId === selectedChannelId;
         
        
          // 뱃지 업데이트
          if (isCurrentPage) {
            if (channelsPanelRef.current) {
              channelsPanelRef.current.refreshChannels();
            }
            if (!isCurrentChannel) {
              onThreadsRefresh();
            }
          }
          incrementTotalUnreadCount();
          
          // 토스트는 GlobalChatService에서 전역 처리
        }
      });
    };

    // 연결 상태 확인을 위한 주기적 체크
    const checkAndSubscribe = () => {
      if (activeStompRef?.client?.connected) {
        
        // 기존 구독 해제
        activeStompRef.unsubscribeFromChannel();
        
        // 현재 채널 구독
        subscribeToCurrentChannel();
        
        return true; // 구독 성공
      } else {
        return false; // 구독 실패
      }
    };

    // 즉시 시도
    if (!checkAndSubscribe()) {
      // 연결이 안됐으면 1초 후 재시도
      const retryTimeout = setTimeout(() => {
        checkAndSubscribe();
      }, 1000);
      
      return () => {
        clearTimeout(retryTimeout);
      };
    }
  }, [selectedChannelId]); // 선택된 채널 변경 시 재구독

  // Files 탭 활성화 시 현재 스레드의 첨부 목록 로딩
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (activeTab !== "files") return;
      if (backendThreadId == null) return;
      try {
        const list = await fileApi.getList({ module: "CHAT", moduleId: backendThreadId });
        if (!mounted) return;
        const arr: any[] = Array.isArray(list) ? list : (list && Array.isArray((list as any).data) ? (list as any).data : []);
        const sorted = arr.sort((a: any, b: any) => {
          const at = new Date(a.createdDate || a.updatedDate || 0).getTime();
          const bt = new Date(b.createdDate || b.updatedDate || 0).getTime();
          return bt - at; // 최신 먼저
        });
        setThreadFiles(sorted.map((f: any) => ({ fileId: String(f.fileId), originName: f.originName, mimeType: f.mimeType, createdDate: f.createdDate })));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [activeTab, backendThreadId]);

  // Infinite query: page 0,1,2... older first (ascending), append
  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["chat-messages", selectedThreadId],
    queryFn: async ({ pageParam = "LAST" }) => {
      try {
        const { threadId } = await ensureBackendIds();
        if (pageParam === "LAST") {
          // 1회성으로 전체 페이지 수 파악 후 마지막 페이지 로드
          const first = await chatApi.getMessages(threadId, 0, 30);
          const totalPages = first.totalPages ?? 1;
          const lastIdx = Math.max(0, totalPages - 1);
          if (lastIdx === 0) return first;
          const last = await chatApi.getMessages(threadId, lastIdx, 30);
          return last;
        }
        const res = await chatApi.getMessages(threadId, pageParam as number, 30);
        return res;
      } catch (error) {
        console.error("메시지 로드 실패:", error);
        // 기본값 반환으로 에러 방지
        return { content: [], first: true, last: true, number: 0, totalPages: 0 } as SpringPage<Message>;
      }
    },
    initialPageParam: "LAST" as any,
    // 위로 스크롤시 더 과거 페이지(번호-1)를 불러옴
    getNextPageParam: (lastPage) => (lastPage.number > 0 ? lastPage.number - 1 : undefined),
    // 캐시 시간을 적절히 설정하여 새로운 메시지를 반영
    staleTime: 3000, // 3초간 fresh 상태 유지
    refetchInterval: 10000, // 10초마다 자동 새로고침 (적절한 반응성)
    refetchOnWindowFocus: true, // 창 포커스 시 새로고침
    refetchOnMount: true, // 컴포넌트 마운트 시 새로고침
    refetchIntervalInBackground: false, // 백그라운드에서는 새로고침 안함 (성능 최적화)
  });

  React.useEffect(() => {
    if (!pages) return;
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const toAbs = (url?: string) => !url ? undefined : (url.startsWith("http") ? url : `${apiOrigin}${url}`);
    const toView = (url?: string) => !url ? undefined : url.replace("/download/", "/view/");
    // ASC 정렬: 오래된 페이지가 먼저 오도록 역순으로 펼침 (가장 오래된 -> 최신)
    const flat: Message[] = pages.pages.slice().reverse().flatMap((p: any) => p.content).map((sm: any) => {
      const mt = (sm as any).messageType as string | undefined;
      const fileName = (sm as any).fileName as string | undefined;
      const fileUrl = (sm as any).fileUrl as string | undefined;
      const attachments = (sm as any).attachments as Array<any> | undefined;
      const isImage = (mt && mt.toUpperCase() === "IMAGE") || false;
      const base = {
        id: sm.id,
        threadId: sm.threadId,
        sender: sm.senderType === "ADMIN" ? "ADMIN" as const : "USER" as const,
        content: String(sm.content ?? ""),
        createdAt: sm.createdAt,
        edited: sm.edited || false, // 백엔드에서 받은 edited 상태 사용
      } as Message;
      if (attachments && attachments.length > 0) {
        const a0 = attachments[0];
        const dl = a0.downloadUrl ? toAbs(a0.downloadUrl) : undefined;
        const vv = a0.viewUrl ? toAbs(a0.viewUrl) : undefined;
        if (dl) {
          base.attachment = {
            name: a0.originName || fileName || base.content || "첨부파일",
            downloadUrl: dl,
            previewUrl: vv,
          };
        }
      } else if (fileUrl) {
        const abs = toAbs(fileUrl)!;
        base.attachment = {
          name: fileName || base.content || "첨부파일",
          downloadUrl: abs,
          previewUrl: isImage ? toView(abs) : undefined,
        };
      }
      return base;
    });
    const flatById = new Map(flat.map(m => [m.id, m]));
    setMessages(prev => {
      // 보존: 이전에 수신된(STOMP 등) 메시지 중 히스토리에 아직 없는 것 유지
      const preserved = prev.filter(m => !flatById.has(m.id) && (m.threadId === selectedThreadId || m.threadId === backendThreadId));
      // 보존: 낙관적 초안 중 히스토리에 아직 없는 것 유지
      const optimisticForThread = optimistic.filter(m => (m.threadId === selectedThreadId || m.threadId === backendThreadId) && !flatById.has(m.id));
      return [...flat, ...preserved, ...optimisticForThread];
    });
  }, [pages, optimistic, selectedThreadId, backendThreadId]);

  // 파일 목록을 조회하여 서버 응답에 fileUrl이 비어있는 메시지에 보충 주입 (비이미지 활성화/새로고침 유지용)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (backendThreadId == null) return;
        const list = await fileApi.getList({ module: "CHAT", moduleId: backendThreadId });
        if (!mounted) return;
        const baseApi = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
        const byName = new Map<string, string>();
        (list || []).forEach((fi: any) => {
          const url = `${baseApi}/cms/file/public/download/${fi.fileId}`;
          byName.set(fi.originName, url);
        });
        setMessages(prev => {
          let changed = false;
          const updated = prev.map(m => {
            if (!m.attachment) return m;
            if (m.attachment.downloadUrl) return m;
            const url = byName.get(m.attachment.name);
            if (!url) return m;
            changed = true;
            const isImage = !!m.attachment.type && m.attachment.type.startsWith("image/");
            return {
              ...m,
              attachment: {
                ...m.attachment,
                downloadUrl: url,
                previewUrl: isImage ? url : m.attachment.previewUrl,
              },
            };
          });
          return changed ? updated : prev;
        });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [backendThreadId, messages]);

  // 이전 페이지 로딩 시 위치 복원만 처리
  React.useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    // 이전 페이지 로딩 직후에는 위치 복원 우선
    if (isLoadingPrevRef.current && pendingRestoreRef.current != null) {
      const bottomOffset = pendingRestoreRef.current; // (scrollHeight - scrollTop - clientHeight)
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = el.scrollHeight - el.clientHeight - bottomOffset;
        requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
      });
      isLoadingPrevRef.current = false;
      pendingRestoreRef.current = null;
      return;
    }
  }, [messages.length, optimistic.length]);

  // 새 메시지 도착 시 처리 (chat-popup과 동일한 로직)
  React.useEffect(() => {
    const allMessages = [...messages, ...optimistic];
    const latestMessage = allMessages[allMessages.length - 1];
    if (!latestMessage) return;

    if (autoScrollRef.current) {
      // 하단 근처에 있으면 부드럽게 스크롤
      scrollToBottom("smooth");
    } else {
      // 위쪽에 있으면 새 메시지 알림 표시
      setShowNewMessageAlert(true);
      setUnreadCount(prev => prev + 1);
    }
  }, [messages[messages.length - 1]?.id, optimistic[optimistic.length - 1]?.id]);

  // 파일 탭에서 채팅 탭으로 전환 시, 최신 메시지로 스크롤 고정
  React.useEffect(() => {
    if (activeTab !== "chat") return;
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = true;
      el.scrollTop = el.scrollHeight;
      autoScrollRef.current = true;
      requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
    });
  }, [activeTab]);

  const effectiveThreadId = React.useMemo(() => {
    return backendThreadId ?? (explicitBackendThreadId ?? selectedThreadId);
  }, [backendThreadId, explicitBackendThreadId, selectedThreadId]);

  const currentMessages = React.useMemo(() => {
    const tid = effectiveThreadId;
    return messages.filter(m => m.threadId === tid);
  }, [messages, effectiveThreadId]);

  // 초기 로딩 시에만 하단으로 스크롤 (chat-popup과 동일한 로직)
  React.useLayoutEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    
    // 초기 로딩 시 마지막 페이지 하단으로 스냅
    if (!didInitScrollRef.current) {
      // 메시지가 하나라도 있으면 하단으로 이동
      if (messages.length > 0) {
        scrollToBottom("auto");
        didInitScrollRef.current = true;
      }
      return;
    }
    
    // 이전 페이지 로딩 직후 위치 복원만 처리
    if (isLoadingPrevRef.current && pendingRestoreRef.current != null) {
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
  }, [currentMessages.length]);
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
  React.useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const pickedFiles = Array.from(list);

    // 실제 백엔드 threadId 우선 확보
    const { threadId } = await ensureBackendIds();

    // 낙관적 UI: 임시 첨부 메시지 표시 (실제 threadId 사용)
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
    // 스마트 스크롤로 처리되므로 강제 스크롤 제거

    try {
      // 1) 업로드 (메시지 자동생성 비활성화: 서버 권한/필터 체인과 무관하게 동작 보장)
      const uploadRes = await fileApi.upload(pickedFiles, "CHAT", threadId, { autoMessage: false });
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
      // 2) 업로드된 각 파일에 대해 메시지 생성 후 파일 바인딩
      for (const fi of (uploadRes || []) as UploadedFileDto[]) {
        const originName = fi.originName;
        const downloadUrl = `${baseUrl}/cms/file/public/download/${fi.fileId}`;
        const isImage = (fi as any).mimeType?.toLowerCase()?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(originName);
        const messageType = isImage ? "IMAGE" : "FILE";
        // 2-1) 메시지 생성 (서버가 저장 및 STOMP 브로드캐스트)
        const saved = await chatApi.postFileMessage(threadId, {
          fileName: originName,
          fileUrl: downloadUrl,
          messageType,
          actor: "admin",
          senderType: "ADMIN",
        } as any);
        // 2-2) 업로드된 파일을 방금 생성된 메시지에 바인딩
        try { await fileApi.attachToMessage((saved as any).id, [fi.fileId]); } catch {}
        // 2-3) 낙관적 메시지 제거(파일명 매칭) → 서버 브로드캐스트 메시지로 대체되도록 함
        setOptimistic(prev => prev.filter(m => !(m.attachment && m.attachment.name === originName && tempIds.includes(m.id))));
      }
      // 3) 혹시 남은 임시 메시지 일괄 정리
      setOptimistic(prev => prev.filter(m => !tempIds.includes(m.id)));
    } catch (err) {
      // 실패: 임시 메시지는 남기고 사용자 재시도 유도
    } finally {
      // 파일 입력 초기화(같은 파일 재선택 가능)
      e.target.value = "";
    }
  };

  const removeFileAt = (idx: number) => {
    setAttached(prev => prev.filter((_, i) => i !== idx));
  };

  const startEdit = (m: Message) => {
    if (m.attachment) return; // 첨부 메시지는 편집 불가
    if (!m.id || m.id < 1) return; // 임시/낙관적 메시지 편집 금지 (서버 ID 필요)
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
    if (editingMessageId < 1) { cancelEdit(); return; }
    // 서버 업데이트 호출 및 성공 시 로컬 교체
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
      if (!id || id < 1) return; // 임시 메시지 무시
      await chatApi.deleteMessage(id, { actor: "admin" });
      // 서버 브로드캐스트를 기다리더라도, 로컬에서도 즉시 제거
      deleteMessage(id);
      try { toaster.create({ title: "삭제되었습니다.", type: "success" }); } catch {}
    } catch {}
  };

  const send = async () => {
    if (!input.trim()) return;
    try {
      // 실제 백엔드 threadId 우선 확보
      const { threadId } = await ensureBackendIds();
      // 낙관적 표시 (실제 threadId 사용)
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
      
      // 사용자가 메시지를 보낼 때는 항상 하단으로 스크롤
      setTimeout(() => scrollToBottom("smooth"), 50);
      setAttached([]);
      // 1) STOMP로 전송(서버가 저장 및 브로드캐스트)
      let sentByStomp = false;
      try {
        lastSentRef.current = { content: optimisticMsg.content, at: Date.now() };
        sentByStomp = !!stompRef.current?.sendText(threadId, "ADMIN", optimisticMsg.content, "admin");
      } catch {}
      // 2) STOMP 실패 시에만 REST 폴백
      let saved = undefined as any;
      if (!sentByStomp) {
        saved = await chatApi.sendMessage(threadId, {
          senderType: "ADMIN",
          content: optimisticMsg.content,
          actor: "admin",
        });
      }
      // 폴백 시에는 즉시 새로고침으로 동기화
      if (saved) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...optimisticMsg, id: saved.id, createdAt: saved.createdAt, localDraft: false } : m));
      }
    } catch {}
  };

  const resolveAndOpenAttachment = async (msg: Message) => {
    try {
      const current = msg;
      const existing = current.attachment?.downloadUrl || current.attachment?.previewUrl;
      if (existing) {
        window.open(existing as string, "_blank");
        return;
      }
      const fallbackUrl = lastUploadedMapRef.current.get(current.attachment?.name || current.content);
      if (fallbackUrl) {
        setMessages(prev => prev.map(m => m.id === current.id && m.attachment ? ({
          ...m,
          attachment: { ...m.attachment!, downloadUrl: fallbackUrl },
        }) : m));
        window.open(fallbackUrl, "_blank");
        return;
      }
      const { threadId } = await ensureBackendIds();
      const list = await fileApi.getList({ module: "CHAT", moduleId: threadId });
      const found = (list || []).find((f: any) => f.originName === (current.attachment?.name || current.content));
      if (found) {
        const baseApi = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
        const url = `${baseApi}/cms/file/public/download/${found.fileId}`;
        setMessages(prev => prev.map(m => m.id === current.id && m.attachment ? ({
          ...m,
          attachment: { ...m.attachment!, downloadUrl: url },
        }) : m));
        window.open(url, "_blank");
      }
    } catch {}
  };

  return (
    <>
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
            setNewMsgCount(0); // 대화 탭으로 전환 시 뱃지 초기화
            
            // 현재 스레드의 뱃지 초기화 (백엔드 API 호출)
            if (selectedThreadId) {
              try {
                await chatApi.markRead(selectedThreadId, "admin");
                // 뱃지 초기화 후 채널과 스레드 목록 새로고침
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
        <Box position="relative" flex={1} style={{ overflowX: 'hidden', ...(isImageModalOpen ? { overflowY: 'hidden' } : {}) }}>
          <VStack align="stretch" gap={0} flex={1} overflowY={isImageModalOpen ? "hidden" : "auto"} py={2} style={{ overflowX: 'hidden' }}>
            {threadFiles.length === 0 && (
              <Box px={2} py={6}><Text color={colors.text.muted}>표시할 파일이 없습니다.</Text></Box>
            )}
            {threadFiles.map(f => {
              const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
              const downloadUrl = `${api}/cms/file/public/download/${f.fileId}`;
              const viewUrl = `${api}/cms/file/public/view/${f.fileId}`;
              const isImage = (f.mimeType || "").startsWith("image/");
              const ext = String(f.originName || "").split('.').pop()?.toLowerCase();
              const iconStyle = (() => {
                if (!ext) return { bg: "gray.100", color: "gray.700", label: "FILE" } as const;
                if (ext === "pdf") return { bg: "red.50", color: "red.600", label: "PDF" } as const;
                if (["xls", "xlsx", "csv"].includes(ext)) return { bg: "green.50", color: "green.700", label: "XLS" } as const;
                if (["doc", "docx"].includes(ext)) return { bg: "blue.50", color: "blue.700", label: "DOC" } as const;
                if (["ppt", "pptx"].includes(ext)) return { bg: "orange.50", color: "orange.700", label: "PPT" } as const;
                if (["hwp"].includes(ext)) return { bg: "teal.50", color: "teal.700", label: "HWP" } as const;
                if (["html", "htm"].includes(ext)) return { bg: "cyan.50", color: "cyan.700", label: "HTML" } as const;
                if (["url"].includes(ext)) return { bg: "cyan.50", color: "cyan.700", label: "URL" } as const;
                if (["zip", "rar", "7z"].includes(ext)) return { bg: "purple.50", color: "purple.700", label: "ZIP" } as const;
                return { bg: "gray.100", color: "gray.700", label: (ext || "FILE").toUpperCase().slice(0,4) } as const;
              })();
              return (
                <HStack key={f.fileId} px={2} py={3} borderBottomWidth="1px" align="center">
                  <HStack 
                    flex={1} 
                    cursor={isImage ? "pointer" : "default"}
                    onClick={isImage ? () => {
                      setSelectedImage({
                        src: downloadUrl,
                        alt: f.originName
                      });
                      // 현재 스크롤 위치 저장
                      savedScrollPositionRef.current = window.scrollY;
                      // 마운트 후 오픈으로 전환하여 슬라이드 인 애니메이션 보장
                      setIsDrawerMounted(true);
                      requestAnimationFrame(() => setIsDrawerOpen(true));
                      setIsImageModalOpen(true);
                      // 미리보기 열릴 때 페이지 스크롤 전면 차단 (X/Y 모두)
                      document.body.style.overflow = 'hidden';
                    } : undefined}
                    _hover={isImage ? { bg: "gray.50" } : {}}
                    borderRadius="md"
                    px={2}
                    py={1}
                  >
                    {isImage ? (
                      <Box w="32px" h="32px" borderRadius="md" overflow="hidden" flexShrink={0} bg="gray.100">
                        <Image
                          src={viewUrl}
                          alt={f.originName}
                          width="32px"
                          height="32px"
                          style={{ display: 'block', objectFit: 'cover', width: '32px', height: '32px' }}
                        />
                      </Box>
                    ) : (
                      <Box w="32px" h="32px" borderRadius="md" flexShrink={0} bg={iconStyle.bg} display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="10px" fontWeight="bold" color={iconStyle.color as any}>
                          {iconStyle.label}
                        </Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontWeight="medium">{f.originName}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {f.createdDate ? new Date(f.createdDate).toLocaleString() : ""}
                      </Text>
                    </Box>
                  </HStack>
                  <Box w="40px" display="flex" justifyContent="center">
                    <a href={downloadUrl} target="_blank" rel="noreferrer">
                      <IconButton aria-label="다운로드" size="xs" variant="ghost">
                        <LuDownload size={16} />
                      </IconButton>
                    </a>
                  </Box>
                </HStack>
              );
            })}
          </VStack>
          
          {/* 첨부파일 탭 내에서만 나오는 이미지 미리보기 Drawer */}
          {isDrawerMounted && (
            <Box
              position="fixed"
              top={0}
              right={0}
              bottom={0}
              left={0}
              bg="gray.50"
              zIndex={1000}
              display="flex"
              flexDirection="column"
              transform={isDrawerOpen ? "translateX(0)" : "translateX(100%)"}
              transition="transform 0.3s ease-in-out"
              onTransitionEnd={() => { 
                if (!isDrawerOpen) { 
                  setIsDrawerMounted(false); 
                  setSelectedImage(null);
                  // 스크롤 위치 복원
                  window.scrollTo(0, savedScrollPositionRef.current);
                } 
              }}
              overflow="hidden"
              data-drawer-container
              // 미리보기 시 모든 스크롤 완전 차단
              onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onScroll={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{ 
                overscrollBehavior: 'none',
                overflowX: 'hidden',
                overflowY: 'hidden'
              } as React.CSSProperties}
            >
              {/* 배경 클릭으로 닫기 */}
              <Box
                position="absolute"
                top={0}
                right={0}
                bottom={0}
                left={0}
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsImageModalOpen(false);
                  document.body.style.overflow = 'auto';
                  window.scrollTo(0, savedScrollPositionRef.current);
                }}
                zIndex={-1}
              />
              {/* 헤더 */}
              <Box
                p={4}
                borderBottomWidth="1px"
                borderColor="gray.200"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                flexShrink={0}
                boxShadow="sm"
                zIndex={1}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 왼쪽 상단 닫기 버튼 */}
                <Button
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => { 
                    setIsDrawerOpen(false); 
                    setIsImageModalOpen(false);
                    // 미리보기 닫힐 때 페이지 스크롤 복원 및 위치 복원
                    document.body.style.overflow = 'auto';
                    window.scrollTo(0, savedScrollPositionRef.current);
                  }}
                  borderRadius="full"
                  w="32px"
                  h="32px"
                  p={0}
                  _hover={{ bg: "gray.200" }}
                >
                  <Image
                    src="/images/icons/arrow.png"
                    alt="닫기"
                    width="8"
                    height="8"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(100%) contrast(100%)",
                      transform: "rotate(180deg)"
                    }}
                  />
                </Button>
                
                {/* 중앙 타이틀 */}
                <Text
                  fontWeight="semibold"
                  fontSize="md"
                  color="gray.800"
                  textAlign="center"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  maxW="calc(100% - 80px)"
                >
                  {selectedImage?.alt}
                </Text>
              </Box>
              
              {/* 이미지 영역 - 전체 화면 중앙, 스크롤 없음 */}
              <Box 
                flex={1} 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                overflow="hidden"
                bg="transparent"
                p={0}
                position="relative"
                w="100%"
                h="100%"
                maxW="100%"
                maxH="100%"
                zIndex={1}
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsImageModalOpen(false);
                  document.body.style.overflow = 'auto';
                  window.scrollTo(0, savedScrollPositionRef.current);
                }}
                cursor="pointer"
                // 스크롤 완전 차단
                onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onScroll={(e) => { e.preventDefault(); e.stopPropagation(); }}
                style={{ 
                  overflowX: 'hidden',
                  overflowY: 'hidden',
                  maxWidth: '100%',
                  maxHeight: '100%'
                } as React.CSSProperties}
              >
                {selectedImage && (
                  <Box
                    w="100%"
                    h="100%"
                    maxW="100%"
                    maxH="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    overflow="hidden"
                    p={4}
                    style={{ 
                      overflowX: 'hidden',
                      overflowY: 'hidden',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Image
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      maxW="100%"
                      maxH="100%"
                      w="auto"
                      h="auto"
                      objectFit="contain"
                      draggable={false}
                      borderRadius="md"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      ) : (
      <VStack align="stretch" gap={3} flex={1} overflowY="auto" py={2} position="relative"
        ref={listRef}
        onWheel={() => { userScrolledRef.current = true; }}
        onTouchMove={() => { userScrolledRef.current = true; }}
        onMouseDown={() => { userScrolledRef.current = true; }}
        onScroll={(e) => {
          const el = e.currentTarget;
          userScrolledRef.current = true;
          const nearTop = el.scrollTop <= 80;
          const nearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) <= 80;
          // 하단 근처 여부로 자동 스크롤 모드 전환
          autoScrollRef.current = nearBottom;
          
          // 새 메시지 알림 관리
          if (!isProgrammaticScrollRef.current && nearBottom && showNewMessageAlert) {
            setShowNewMessageAlert(false);
            setUnreadCount(0);
          }
          // 위로 무한스크롤: 현재 바닥으로부터의 오프셋을 저장해 위치 복원
          if (isProgrammaticScrollRef.current) {
            return;
          }
          // 초기 강제 하단 스크롤이 안 끝났다면 무한 스크롤 트리거 제한
          if (!didInitScrollRef.current) return;
          if (nearTop && hasNextPage && !isFetchingNextPage && userScrolledRef.current) {
            console.log("🔍 [MessagesPanel] Triggering fetchNextPage - nearTop:", nearTop, "hasNextPage:", hasNextPage, "isFetchingNextPage:", isFetchingNextPage);
            pendingRestoreRef.current = el.scrollHeight - el.scrollTop - el.clientHeight; // bottom offset
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
        {currentMessages.map((m, idx) => {
          const prev = idx > 0 ? currentMessages[idx - 1] : undefined;
          const prevKey = prev?.createdAt ? new Date(prev.createdAt).toLocaleDateString() : null;
          const curKey = m?.createdAt ? new Date(m.createdAt).toLocaleDateString() : null;
          const showDate = !!curKey && curKey !== prevKey;
          const isMine = m.sender === "ADMIN";
          const canEdit = isMine && !m.attachment;
          const canDelete = isMine; // 본문/첨부 모두 삭제 허용
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
                  <Input value={editingText} onChange={e => setEditingText(e.target.value)} autoFocus />
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
                          style={{ maxWidth: "320px", width: "100%", borderRadius: "6px", display: imageLoadedMap[m.id] ? "block" : "none", cursor: "pointer" }}
                          onLoad={() => setImageLoadedMap(prev => ({ ...prev, [m.id]: true }))}
                          onError={() => setImageLoadedMap(prev => ({ ...prev, [m.id]: true }))}
                          onClick={() => {
                            setSelectedImage({
                              src: m.attachment?.previewUrl || m.attachment?.downloadUrl || "",
                              alt: m.attachment?.name || "image"
                            });
                            setIsImageModalOpen(true);
                          }}
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
              <Flex mt={1} align="center" justify={isMine ? "flex-end" : "flex-start"}>
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
                      { m.attachment && (() => {
                        const fallbackUrl = lastUploadedMapRef.current.get(m.attachment.name || m.content);
                        const effectiveUrl = (m.attachment.downloadUrl || m.attachment.previewUrl || fallbackUrl) as string | undefined;
                        return effectiveUrl ? (
                          <a href={effectiveUrl} target="_blank" rel="noreferrer">
                            <IconButton aria-label="다운로드" size="xs" variant="subtle" colorPalette="gray">
                              <LuDownload size={14} />
                            </IconButton>
                          </a>
                        ) : (
                          <IconButton aria-label="다운로드" size="xs" variant="subtle" colorPalette="gray" onClick={() => resolveAndOpenAttachment(m)}>
                            <LuDownload size={14} />
                          </IconButton>
                        );
                      })()}
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
              </Flex>
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
      )}
      {confirmDeleteId !== null && (
        <Box position="fixed" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg={colors.cardBg} borderColor={colors.border} borderWidth="1px" borderRadius="md" p={4} w="320px">
            <Text fontWeight="bold" mb={2}>메시지를 삭제할까요?</Text>
            <Text fontSize="sm" color={colors.text.muted}>삭제 후 복구할 수 없습니다.</Text>
            <HStack mt={4} justify="flex-end">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>취소</Button>
              <Button colorPalette="red" onClick={async () => { await deleteMessageServer(confirmDeleteId); setConfirmDeleteId(null); }}>삭제</Button>
            </HStack>
          </Box>
        </Box>
      )}
      {activeTab === "chat" && (
        <>
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
        </>
      )}
    </Flex>
    </>
  );
}