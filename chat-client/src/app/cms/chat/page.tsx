"use client";

import React from "react";
import { Box, Flex, Heading, Badge, Text, VStack, HStack, Button, Input, IconButton } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { LuPencil, LuTrash2, LuCheck, LuUndo2, LuPaperclip, LuFile, LuX, LuDownload, LuImage } from "react-icons/lu";
import { chatApi } from "@/lib/api/chat";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fileApi, type UploadedFileDto } from "@/lib/api/file";
import { ChatStompClient } from "@/lib/ws/chatSocket";
import { useSearchParams, useRouter } from "next/navigation";

export default function ChatAdminPage() {
  const colors = useColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  // 페이지 루트에서는 별도 동작 없음. threadId 파라미터 처리는 MessagesPanel 내부에서 수행

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
          colors={colors}
          selectedChannelId={selectedChannelId}
          onSelectChannel={(id) => {
            // 채널만 변경. threadId는 ThreadsPanel에서 백엔드 목록 기준으로 결정
            setSelectedChannelId(id);
          }}
        />

        {/* Threads */}
        <ThreadsPanel
          colors={colors}
          selectedChannelId={selectedChannelId}
          selectedThreadId={selectedThreadId}
          onSelectThread={(id) => {
            setSelectedThreadId(id);
            // 스레드 선택만 URL 동기화: threadId 단일 소스
            const current = new URLSearchParams();
            current.set("threadId", String(id));
            router.replace(`?${current.toString()}`);
          }}
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
  attachment?: { name: string; type?: string; size?: number; downloadUrl?: string; previewUrl?: string };
  // 낙관적 로컬 메시지 식별용(WS 수신 시 중복 제거)
  localDraft?: boolean;
  // 수정 여부 배지
  edited?: boolean;
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
  const [channels, setChannels] = React.useState<Array<{ id: number; cmsCode: string; cmsName?: string }>>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await chatApi.getChannels();
        if (!mounted) return;
        setChannels(list || []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

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
          <Text fontWeight="bold">{ch.cmsName || ch.cmsCode}</Text>
          <Text fontSize="xs" color={colors.text.muted}>code: {ch.cmsCode}</Text>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = React.useState<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }>>([]);

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
            onSelectThread(urlTid);
          } else if ((list || []).length > 0) {
            // 현재 채널에 해당 threadId가 없으면 첫 스레드로 전환
            const first = list[0].id;
            onSelectThread(first);
            const params = new URLSearchParams();
            params.set("threadId", String(first));
            router.replace(`?${params.toString()}`);
          }
        } else if ((list || []).length > 0) {
          // URL에 threadId가 전혀 없을 때만 첫 스레드로 초기화
          const first = list[0].id;
          onSelectThread(first);
          const params = new URLSearchParams();
          params.set("threadId", String(first));
          router.replace(`?${params.toString()}`);
        }
      } catch {
        setThreads([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedChannelId, router, searchParams, onSelectThread]);

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
          onClick={() => onSelectThread(th.id)}
        >
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium">{th.userName || th.userIdentifier}</Text>
            {/* unread 카운트는 추후 API 연결 */}
            {false && (
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
                0
              </Box>
            )}
          </HStack>
          {/* 최근 시간 표시: 추후 API 필드 연결 */}
          <Text fontSize="xs" color={colors.text.muted}></Text>
        </Box>
      ))}
    </VStack>
  );
}

type MessagesPanelProps = PanelProps & { selectedThreadId: number };

function MessagesPanel({ colors, selectedThreadId }: MessagesPanelProps) {
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("threadId");
  const explicitBackendThreadId = threadIdParam ? Number(threadIdParam) : null;
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [input, setInput] = React.useState("");
  const [attached, setAttached] = React.useState<File[]>([]);
  const [activeTab, setActiveTab] = React.useState<"chat" | "files">("chat");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [optimistic, setOptimistic] = React.useState<Message[]>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const userScrolledRef = React.useRef<boolean>(false);
  const autoScrollRef = React.useRef<boolean>(true);
  const didInitScrollRef = React.useRef<boolean>(false);
  // 로딩 전 하단으로부터의 오프셋(뷰포트 하단 기준)
  const pendingRestoreRef = React.useRef<number | null>(null);
  const isLoadingPrevRef = React.useRef<boolean>(false);
  const isProgrammaticScrollRef = React.useRef<boolean>(false);
  const [backendThreadId, setBackendThreadId] = React.useState<number | null>(null);
  const stompRef = React.useRef<ChatStompClient | null>(null);
  const [imageLoadedMap, setImageLoadedMap] = React.useState<Record<number, boolean>>({});
  // 최근 업로드한 파일명 -> 다운로드 URL 매핑 (즉시 활성화용)
  const lastUploadedMapRef = React.useRef<Map<string, string>>(new Map());
  const [threadFiles, setThreadFiles] = React.useState<Array<{ fileId: number; originName: string; mimeType: string; createdDate?: string }>>([]);
  const lastSentRef = React.useRef<{ content: string; at: number } | null>(null);
  // 최근 수신 이벤트 키(중복 방지: 일시적 이중 브로드캐스트/이중 구독 대응)
  const recentEventKeysRef = React.useRef<Map<string, number>>(new Map());

  // 서버 실제 ID 매핑 캐시 (mockThreadId -> backendThreadId)
  const backendThreadIdMapRef = React.useRef<Record<number, number>>({});
  const backendChannelIdMapRef = React.useRef<Record<string, number>>({});

  // 현재 선택된 mock thread 에 대한 정보 헬퍼
  const getMockThread = React.useCallback(() => mockThreads.find(t => t.id === selectedThreadId) || null, [selectedThreadId]);

  // 채널/스레드 실제 ID 확보 유틸
  const ensureBackendIds = React.useCallback(async () => {
    if (explicitBackendThreadId) {
      return { threadId: explicitBackendThreadId };
    }
    const mock = getMockThread();
    if (!mock) return { threadId: selectedThreadId };
    // 채널 코드/이름 확보
    const channel = mockChannels.find(c => c.id === mock.channelId) || mockChannels[0];
    // 채널 ID 확보
    let backendChannelId = backendChannelIdMapRef.current[channel.code as string];
    if (!backendChannelId) {
      const ch = await chatApi.createOrGetChannel({ cmsCode: channel.code, cmsName: channel.name, actor: "admin" });
      backendChannelId = ch.id;
      backendChannelIdMapRef.current[channel.code as string] = ch.id;
    }
    // 스레드 ID 확보 (mock -> backend 매핑)
    let backendThreadId = backendThreadIdMapRef.current[mock.id];
    if (!backendThreadId) {
      const th = await chatApi.createOrGetThread({ channelId: backendChannelId, userIdentifier: mock.userIdentifier, userName: mock.userName, actor: "admin" });
      backendThreadId = th.id;
      backendThreadIdMapRef.current[mock.id] = th.id;
    }
    return { threadId: backendThreadId };
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
              if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
              }
              // refetch()는 중복 유발 가능성이 있어 실시간 수신시 생략
            }
          });
          stompRef.current = c;
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, [ensureBackendIds]);

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
        setThreadFiles(arr.map((f: any) => ({ fileId: f.fileId, originName: f.originName, mimeType: f.mimeType, createdDate: f.createdDate })));
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
    },
    initialPageParam: "LAST" as any,
    // 위로 스크롤시 더 과거 페이지(번호-1)를 불러옴
    getNextPageParam: (lastPage) => (lastPage.number > 0 ? lastPage.number - 1 : undefined),
  });

  React.useEffect(() => {
    if (!pages) return;
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const toAbs = (url?: string) => !url ? undefined : (url.startsWith("http") ? url : `${apiOrigin}${url}`);
    const toView = (url?: string) => !url ? undefined : url.replace("/download/", "/view/");
    // ASC 정렬: 오래된 페이지가 먼저 오도록 역순으로 펼침 (가장 오래된 -> 최신)
    const flat = pages.pages.slice().reverse().flatMap(p => p.content).map((sm) => {
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

  // 선택 스레드 변경 시 하단으로 스크롤
  React.useEffect(() => {
    if (listRef.current) {
      const el = listRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [selectedThreadId]);

  // 새 메시지/낙관적 메시지 변화 시 하단으로 자동 스크롤
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
    // 하단 근처에 있을 때만 자동 스크롤 유지
    if (autoScrollRef.current) {
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = el.scrollHeight;
        requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
      });
    }
  }, [messages.length, optimistic.length]);

  const effectiveThreadId = React.useMemo(() => {
    return backendThreadId ?? (explicitBackendThreadId ?? selectedThreadId);
  }, [backendThreadId, explicitBackendThreadId, selectedThreadId]);

  const currentMessages = React.useMemo(() => {
    const tid = effectiveThreadId;
    return messages.filter(m => m.threadId === tid);
  }, [messages, effectiveThreadId]);

  // 첫 렌더/새로고침 시에도 마지막으로 스크롤
  React.useLayoutEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    // 초기 1회만 강제 하단 이동
    if (!didInitScrollRef.current) {
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = el.scrollHeight;
        didInitScrollRef.current = true;
        requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
      });
      return;
    }
    // 이전 페이지 로딩 직후 위치 복원
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
    // 하단 근처 유지 모드일 때만 하단 고정
    if (autoScrollRef.current) {
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = el.scrollHeight;
        requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
      });
    }
  }, [currentMessages.length]);

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
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }

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
          m.id === editingMessageId ? { ...m, content: editingText } : m
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
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
      setInput("");
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
    <Flex direction="column" h="full" px={2}>
      {/* 탭 */}
      <HStack gap={6} mb={2} borderBottomWidth="1px" borderColor="gray.200" px={2}>
        <Box
          pb={2}
          borderBottomWidth={activeTab === "chat" ? "2px" : "0"}
          borderColor={activeTab === "chat" ? "blue.500" : "transparent"}
          color={activeTab === "chat" ? "blue.600" : "gray.600"}
          cursor="pointer"
          onClick={() => setActiveTab("chat")}
        >
          <Text fontWeight={activeTab === "chat" ? "bold" : "normal"}>대화</Text>
        </Box>
        <Box
          pb={2}
          borderBottomWidth={activeTab === "files" ? "2px" : "0"}
          borderColor={activeTab === "files" ? "blue.500" : "transparent"}
          color={activeTab === "files" ? "blue.600" : "gray.600"}
          cursor="pointer"
          onClick={() => setActiveTab("files")}
        >
          <Text fontWeight={activeTab === "files" ? "bold" : "normal"}>첨부파일</Text>
        </Box>
      </HStack>

      {activeTab === "files" ? (
        <VStack align="stretch" gap={0} flex={1} overflowY="auto" py={2}>
          {threadFiles.length === 0 && (
            <Box px={2} py={6}><Text color={colors.text.muted}>표시할 파일이 없습니다.</Text></Box>
          )}
          {threadFiles.map(f => {
            const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
            const downloadUrl = `${api}/cms/file/public/download/${f.fileId}`;
            const isImage = (f.mimeType || "").startsWith("image/");
            return (
              <HStack key={f.fileId} px={2} py={3} borderBottomWidth="1px" align="center">
                <HStack flex={1}>
                  {isImage ? <LuImage size={18} /> : <LuFile size={18} />}
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
      ) : (
      <VStack align="stretch" gap={3} flex={1} overflowY="auto" py={2}
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
          // 위로 무한스크롤: 현재 바닥으로부터의 오프셋을 저장해 위치 복원
          if (isProgrammaticScrollRef.current) {
            return;
          }
          // 초기 강제 하단 스크롤이 안 끝났다면 무한 스크롤 트리거 제한
          if (!didInitScrollRef.current) return;
          if (nearTop && hasNextPage && !isFetchingNextPage && userScrolledRef.current) {
            pendingRestoreRef.current = el.scrollHeight - el.scrollTop - el.clientHeight; // bottom offset
            isLoadingPrevRef.current = true;
            fetchNextPage();
          }
        }}
      >
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
            <>
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
                          style={{ maxWidth: "320px", width: "100%", borderRadius: "6px", display: imageLoadedMap[m.id] ? "block" : "none" }}
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
            </>
          );
        })}
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