"use client";

import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { Box, Flex, Text, Icon, Input, Button, Badge, IconButton, Image, Link } from "@chakra-ui/react";
import { LuSend, LuPaperclip, LuPencil, LuTrash2, LuCheck, LuRotateCcw, LuDownload, LuFile } from "react-icons/lu";
import { useChatMessages } from "../../hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { ChatMessageDto } from "@/lib/api/chat";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";
import { fileApi, type UploadedFileDto } from "@/lib/api/file";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ConversationProps {
  selectedThreadId: number | null;
  compact?: boolean;
}

const REST_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const Conversation = ({ selectedThreadId, compact }: ConversationProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [editText, setEditText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didInitScrollRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const pendingRestoreRef = useRef<number | null>(null);
  const autoScrollRef = useRef(true);
  const queryClient = useQueryClient();

  // 파일 선택
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { pages, isLoading, error, fetchNextPage, hasNextPage, sendMessage, updateMessage, deleteMessage } = useChatMessages(
    selectedThreadId || undefined
  );

  const messages = useMemo(() => {
    const flat: Record<number, ChatMessageDto> = {};
    const arr = (pages as any[])?.flatMap((p: any) => p.content as ChatMessageDto[]) ?? [];
    for (const m of arr) {
      if (!m) continue;
      if (m.id != null) {
        flat[m.id] = m; // ID 기준 병합/교체
      } else {
        // id가 없으면 content+createdAt 키로 임시 보존
        const key = (m.content || "") + (m.createdAt || "");
        // @ts-ignore
        flat[key as any] = m;
      }
    }
    return Object.values(flat);
  }, [pages]);
  const pageCount = Array.isArray(pages) ? (pages as any[]).length : 0;

  const { connected, sendMessage: sendWebSocketMessage } = useWebSocket({
    threadId: selectedThreadId || undefined,
    onMessageReceived: (payload) => {
      try {
        const m: any = payload as any;
        // 이벤트 타입 처리
        if (m && typeof m === "object" && "type" in m) {
          if (m.type === "message.deleted") {
            const idToRemove = m.id ?? m.messageId;
            const tid = m.threadId ?? selectedThreadId ?? 0;
            queryClient.setQueryData(
              ["chat", "messages", tid],
              (old: any) => {
                if (!old?.pages) return old;
                const newPages = old.pages.map((p: any) => ({
                  ...p,
                  content: (p.content || []).filter((x: ChatMessageDto) => x.id !== idToRemove),
                }));
                return { ...old, pages: newPages };
              }
            );
            return;
          }
            if (m.type === "message.updated") {
              const idToUpdate = m.id ?? m.messageId;
              const tid = m.threadId ?? selectedThreadId ?? 0;
              const newContent: string | undefined = m.content;
              if (idToUpdate != null && newContent != null) {
                queryClient.setQueryData(
                  ["chat", "messages", tid],
                  (old: any) => {
                    if (!old?.pages) return old;
                    const newPages = old.pages.map((p: any) => ({
                      ...p,
                      content: (p.content || []).map((x: any) => (x.id === idToUpdate ? { ...x, content: newContent, edited: true } : x)),
                    }));
                    return { ...old, pages: newPages };
                  }
                );
              }
              return;
            }
          // file.created 등은 메시지 목록에 직접 추가하지 않음(별도 처리 대상)
          if (m.type && m.type !== "message.updated") {
            return;
          }
        }

        const msg = payload as ChatMessageDto;
        const tid = msg.threadId;
        queryClient.setQueryData(
          ["chat", "messages", tid],
          (old: any) => {
            // 캐시가 아직 없을 때도 실시간으로 보이도록 스켈레톤 페이지 생성
            if (!old?.pages) {
              return {
                pages: [{ number: 0, content: [msg] }],
                pageParams: [0],
              };
            }
            // 현재 로드된 페이지 중 가장 최신 페이지 번호(가장 큰 number 값)를 찾음
            const maxPage = old.pages.reduce((acc: number, p: any) => (p.number > acc ? p.number : acc), old.pages[0]?.number ?? 0);
            const newPages = old.pages.map((p: any) => {
              if (p.number !== maxPage) return p;
              let list: ChatMessageDto[] = p.content || [];
              // 중복 방지: 임시(음수 id) 메시지와 동일 콘텐츠는 제거 후 서버 메시지 추가
              list = list.filter((x: any) => {
                const xid = (x?.id as any);
                if (typeof xid === "number" && xid < 0) {
                  const sameContent = (x as any).content === (msg as any).content;
                  const sameSender = (x as any).senderType === (msg as any).senderType;
                  return !(sameContent && sameSender);
                }
                return true;
              });
              const idx = list.findIndex((x) => x.id === msg.id);
              if (idx >= 0) {
                // 수정: 교체
                const replaced = list.map((x) => (x.id === msg.id ? msg : x));
                return { ...p, content: replaced };
              }
              // 추가: 마지막에 붙임(서버 정렬이 ASC이므로 최신이 뒤에 위치)
              return { ...p, content: [...list, msg] };
            });
            return { ...old, pages: newPages };
          }
        );
      } catch (e) {
        console.error("onMessageReceived handling failed", e);
      }
    },
  });

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = listRef.current;
    if (!el) return;
    isProgrammaticScrollRef.current = true;
    el.scrollTop = el.scrollHeight;
    // allow event to settle
    setTimeout(() => { isProgrammaticScrollRef.current = false; }, 0);
  };

  // 초기 로딩 시 마지막 페이지 하단으로 스냅
  useEffect(() => {
    if (isLoading) return;
    if (!didInitScrollRef.current) {
      // 메시지가 하나라도 있으면 하단으로 이동
      if (messages.length > 0) {
        scrollToBottom("auto");
        didInitScrollRef.current = true;
      }
    }
  }, [isLoading, messages.length]);

  // 새 메시지 도착 시 하단 근처이면 자동 하단 고정
  useEffect(() => {
    if (autoScrollRef.current) {
      scrollToBottom("auto");
    }
  }, [messages[messages.length - 1]?.id]);

  const sendViaPreferredChannel = async (message: ChatMessageDto) => {
    if (connected) {
      // 낙관적 추가: 임시 음수 ID로 최신 페이지에 추가
      try {
        const tempId = -Math.floor(Math.random() * 1_000_000) - 1;
        const tid = message.threadId as any;
        const nowIso = new Date().toISOString();
        const tempMsg: any = { ...message, id: tempId, createdAt: nowIso };
        queryClient.setQueryData(["chat", "messages", tid], (old: any) => {
          if (!old?.pages) {
            // 초기 캐시가 없으면 스켈레톤 페이지를 만들어 낙관적 메시지 반영
            return {
              pages: [{ number: 0, content: [tempMsg] }],
              pageParams: [0],
            };
          }
          const maxPage = old.pages.reduce((acc: number, p: any) => (p.number > acc ? p.number : acc), old.pages[0]?.number ?? 0);
          const newPages = old.pages.map((p: any) => {
            if (p.number !== maxPage) return p;
            const list: ChatMessageDto[] = p.content || [];
            return { ...p, content: [...list, tempMsg] };
          });
          return { ...old, pages: newPages };
        });
      } catch {}
      const ok = sendWebSocketMessage(message);
      if (ok) return true;
    }
    try {
      await sendMessage({
        threadId: message.threadId,
        content: message.content,
        senderType: message.senderType,
      });
      return true;
    } catch (e) {
      console.error("메시지 전송 실패", e);
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId) return;
    const message: any = {
      threadId: selectedThreadId,
      content: messageInput,
      senderType: "USER",
      senderName: "상담원",
      messageType: "TEXT",
    };
    await sendViaPreferredChannel(message);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const isImageByName = (name: string) => {
    const lower = name.toLowerCase();
    return (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.svg')
    );
  };

  const isImageByUrl = (url: string) => {
    try {
      const pathname = new URL(url, REST_BASE).pathname.toLowerCase();
      return isImageByName(pathname);
    } catch {
      return isImageByName(url);
    }
  };

  // 스크롤 핸들러(상단 근처에서 과거 페이지 프리팬드)
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (isProgrammaticScrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    autoScrollRef.current = distanceFromBottom < 120;

    if (!didInitScrollRef.current) return; // 초기 강제 스크롤 중 무한 스크롤 금지

    if (scrollTop <= 80 && hasNextPage) {
      // 현재 바닥으로부터의 오프셋 저장
      pendingRestoreRef.current = scrollHeight - scrollTop;
      fetchNextPage();
    }
  };

  // 페이지 프리팬드 후 위치 복원
  useLayoutEffect(() => {
    if (pendingRestoreRef.current != null) {
      const el = listRef.current;
      if (el) {
        isProgrammaticScrollRef.current = true;
        el.scrollTop = Math.max(0, el.scrollHeight - pendingRestoreRef.current);
        setTimeout(() => { isProgrammaticScrollRef.current = false; }, 0);
      }
      pendingRestoreRef.current = null;
    }
  }, [pageCount]);

  // 컨테이너에 스크롤이 생기지 않을 경우 자동으로 과거 페이지를 더 불러옴
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (!didInitScrollRef.current) return; // 초기 강제 스크롤 완료 후에만
    if (!hasNextPage) return;
    const needsMore = el.scrollHeight <= el.clientHeight + 10; // 스크롤이 거의 없는 상태
    if (needsMore) {
      pendingRestoreRef.current = el.scrollHeight - el.scrollTop;
      fetchNextPage();
    }
  }, [pageCount, hasNextPage]);


  const startEdit = (message: ChatMessageDto) => {
    // 서버에 아직 저장되지 않은 임시 메시지(음수/무효 ID)는 수정 불가
    if (!message?.id || (typeof message.id === "number" && message.id < 1)) return;
    setEditingMessageId(message.id || null);
    setEditText(message.content || "");
  };

  const applyEdit = async () => {
    if (!selectedThreadId || !editingMessageId || editingMessageId < 1) return;
    await updateMessage({ messageId: editingMessageId, content: editText });
    setEditingMessageId(null);
    setEditText("");
  };

  const confirmDelete = (message: ChatMessageDto) => {
    setDeletingMessageId(message.id || null);
    setIsDeleteOpen(true);
  };

  const applyDelete = async () => {
    if (!selectedThreadId || !deletingMessageId) return;
    await deleteMessage({ messageId: deletingMessageId });
    setDeletingMessageId(null);
    setIsDeleteOpen(false);
    toaster.create({ title: "삭제되었습니다.", type: "success" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file || !selectedThreadId) return;

    try {
      // 1) 낙관적 메시지: 파일명만 표시(임시 음수 ID)
      const tempId = -Math.floor(Math.random() * 1_000_000) - 1;
      const tempMsg: any = {
        id: tempId,
        threadId: selectedThreadId,
        senderType: 'USER',
        senderName: '상담원',
        messageType: 'FILE',
        content: file.name,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        attachments: [
          {
            originName: file.name,
            downloadUrl: URL.createObjectURL(file),
            viewUrl: URL.createObjectURL(file),
          },
        ],
        createdAt: new Date().toISOString(),
      } as ChatMessageDto;
      queryClient.setQueryData(["chat", "messages", selectedThreadId], (old: any) => {
        if (!old?.pages) {
          return { pages: [{ number: 0, content: [tempMsg] }], pageParams: [0] };
        }
        const maxPage = old.pages.reduce((acc: number, p: any) => (p.number > acc ? p.number : acc), old.pages[0]?.number ?? 0);
        const newPages = old.pages.map((p: any) => {
          if (p.number !== maxPage) return p;
          const list: ChatMessageDto[] = p.content || [];
          return { ...p, content: [...list, tempMsg] };
        });
        return { ...old, pages: newPages };
      });
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;

      // 2) 서버 업로드(메시지 자동생성 사용 안 함: autoMessage=false)
      const uploadRes = await fileApi.upload(file, "CHAT", selectedThreadId, { autoMessage: false });
      const uploaded = Array.isArray(uploadRes) && uploadRes.length > 0 ? uploadRes[0] as UploadedFileDto : undefined;
      const originName = uploaded?.originName || file.name;
      const baseApi = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/api/v1";
      const downloadUrl = uploaded ? `${baseApi}/cms/file/public/download/${uploaded.fileId}` : undefined;
      const isImage = (uploaded?.mimeType || "").toLowerCase().startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(originName);
      const messageType = isImage ? "IMAGE" : "FILE";
      // 3) 메시지 생성(REST) 및 파일-메시지 바인딩
      const saved = await chatApi.postFileMessage(selectedThreadId, {
        fileName: originName,
        fileUrl: downloadUrl || "",
        messageType,
        actor: "admin",
        senderType: "USER",
      } as any);
      if (uploaded) {
        try { await fileApi.attachToMessage((saved as any).id, [uploaded.fileId]); } catch {}
      }
      const viewUrl = isImage && downloadUrl ? downloadUrl.replace("/download/", "/view/") : undefined;
      queryClient.setQueryData(["chat", "messages", selectedThreadId], (old: any) => {
        if (!old?.pages) return old;
        const maxPage = old.pages.reduce((acc: number, p: any) => (p.number > acc ? p.number : acc), old.pages[0]?.number ?? 0);
        const newPages = old.pages.map((p: any) => {
          if (p.number !== maxPage) return p;
          let list: any[] = p.content || [];
          // 이미 서버에서 동일 메시지(id) 수신되어 추가된 경우, 임시 메시지만 제거
          if (list.some((x) => x?.id === (saved as any).id)) {
            return { ...p, content: list.filter((x) => x?.id !== tempId) };
          }
          // 그렇지 않으면 임시 메시지를 서버 메시지로 교체
          return {
            ...p,
            content: list.map((m) => (m.id === tempId ? ({
              ...(saved as any),
              id: (saved as any).id,
              threadId: selectedThreadId,
              senderType: 'USER',
              messageType,
              fileName: originName,
              fileUrl: downloadUrl,
              attachments: [{ originName, downloadUrl, viewUrl }],
            } as any) : m)),
          };
        });
        return { ...old, pages: newPages };
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error('파일 업로드 실패', err);
      toaster.create({ title: '파일 업로드 실패', type: 'error' });
    }
  };

  return (
    <Flex direction="column" height="100%" minH={0} suppressHydrationWarning>
      {!compact && (
        <Box p={2} borderBottomWidth="1px" bg="gray.50">
          <Badge colorScheme={connected ? "green" : "red"}>
            {connected ? "연결됨" : "연결 중..."}
          </Badge>
        </Box>
      )}

      <Flex ref={listRef} onScroll={onScroll} direction="column" flex="1" minH={0} p={compact ? 2 : 4} overflowY="auto" gap={compact ? 1 : 4}>
        {hasNextPage && (
          <Flex justify="center">
            <Button size="xs" variant="outline" onClick={() => {
              const el = listRef.current;
              if (el) pendingRestoreRef.current = el.scrollHeight - el.scrollTop;
              fetchNextPage();
            }}>
              이전 대화 불러오기
            </Button>
          </Flex>
        )}
        {isLoading ? (
          <Text textAlign="center">메시지를 불러오는 중...</Text>
        ) : error ? (
          <Text textAlign="center" color="red.500">메시지를 불러오는데 실패했습니다.</Text>
        ) : !messages?.length ? (
          <Text textAlign="center" color="gray.500">아직 메시지가 없습니다.</Text>
        ) : (
          messages.filter(Boolean).map((message, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : undefined;
            const prevKey = prev?.createdAt ? new Date(prev.createdAt).toLocaleDateString() : null;
            const curKey = message?.createdAt ? new Date(message.createdAt as any).toLocaleDateString() : null;
            const showDate = !!curKey && curKey !== prevKey;
            const safeSender = (message as any)?.senderType || "ADMIN";
            const isUser = safeSender === "USER";
            const contentStr = typeof message.content === "string" ? message.content : "";
            const mt = ((message as any)?.messageType || "").toString().toUpperCase();

            const makeAbsolute = (url?: string) => {
              if (!url) return undefined;
              if (/^(https?:|blob:|data:)/i.test(url)) return url;
              return `${REST_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
            };

            const rawAtts = (message as any).attachments as any[] | undefined;
            const atts = Array.isArray(rawAtts) && rawAtts.length > 0 ? rawAtts : undefined;
            let isImage = false;
            let imageSrc: string | null = null;
            let downloadHref: string | undefined;

            if (atts) {
              const first = atts[0] as any;
              const origin = (first?.originName as string) || ((message as any).fileName as string) || '';
              // 이미지일 때는 viewUrl을 우선 사용, 아니면 downloadUrl
              const preferred = (first?.viewUrl as string) || (first?.downloadUrl as string);
              const url = makeAbsolute(preferred);
              isImage = (mt === 'IMAGE') || (origin && isImageByName(origin)) || (!!url && isImageByUrl(url));
              if (isImage && url) imageSrc = url;
              downloadHref = url || undefined;
            } else if ((message as any).fileUrl) {
              // 메시지 타입이 IMAGE면 viewUrl 경로로 치환
              const raw = (message as any).fileUrl as string;
              const preferred = mt === 'IMAGE' && typeof raw === 'string' ? raw.replace('/download/', '/view/') : raw;
              const url = makeAbsolute(preferred);
              if (url) {
                const fileName = (message as any).fileName as string | undefined;
                isImage = (mt === 'IMAGE') || (fileName && isImageByName(fileName)) || isImageByUrl(url);
                if (isImage) imageSrc = url;
                downloadHref = url;
              }
            } else if (contentStr.startsWith("data:image")) {
              // data:image 프리픽스만 허용
              imageSrc = contentStr;
              isImage = true;
            }

            const hasAttachment = !!(atts && atts.length > 0) || !!downloadHref || !!(message as any).fileUrl || isImage;

            const isEditing = editingMessageId === message.id && !isImage;
            return (
              <>
                {showDate && (
                  <Flex key={`sep-${curKey}-${idx}`} justify="center" my={2}>
                    <Box px={3} py={1} bg="gray.100" color="gray.600" borderRadius="full" fontSize="xs">
                      {curKey}
                    </Box>
                  </Flex>
                )}
                <Flex key={message.id} direction="column" align={isUser ? "flex-end" : "flex-start"}>
                <Box
                  maxW="70%"
                  bg={isUser ? "blue.500" : "gray.100"}
                  color={isUser ? "white" : "black"}
                  px={3}
                  py={3}
                  borderRadius="lg"
                >
                  {isImage ? (
                    <Image
                      src={String(imageSrc || '')}
                      alt={String((message as any).fileName || "image")}
                      maxW="220px"
                      maxH="220px"
                      objectFit="contain"
                      rounded="md"
                      borderWidth="0"
                      display="block"
                    />
                  ) : atts ? (
                    <Flex direction="column" gap={2}>
                      {atts.map((att: any, idx: any) => {
                        const name = att?.originName || (message as any).fileName || '첨부파일';
                        return (
                          <Flex key={idx} align="center" gap={2}>
                            <Icon as={LuFile} />
                            <Text>{name}</Text>
                          </Flex>
                        );
                      })}
                    </Flex>
                  ) : downloadHref ? (
                    <Flex align="center" gap={2}>
                      <Icon as={LuFile} />
                      <Text>{(message as any).fileName || '첨부파일'}</Text>
                    </Flex>
                  ) : isEditing ? (
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      size="sm"
                      bg={isUser ? "whiteAlpha.200" : "white"}
                      color={isUser ? "white" : "black"}
                      borderColor={isUser ? "whiteAlpha.700" : "gray.300"}
                      _placeholder={{ color: isUser ? "whiteAlpha.700" : "gray.400" }}
                    />
                  ) : (
                    <Text>{contentStr}</Text>
                  )}
                  <Flex mt={2} align="center" justify={isUser ? "flex-end" : "flex-start"} gap={2}>
                    <Text
                      fontSize="xs"
                      color={isUser ? "whiteAlpha.700" : "gray.500"}
                      suppressHydrationWarning
                    >
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </Text>
                    {(message as any).edited && (
                      <Badge size="xs" colorScheme={isUser ? "whiteAlpha" : "gray"} variant={isUser ? "subtle" : "solid"} opacity={0.8}>
                        수정됨
                      </Badge>
                    )}
                  </Flex>
            </Box>
                {isUser && message.id && (
                  <Flex gap={1} mt={2} justify={isUser ? "flex-end" : "flex-start"}>
                    {(() => {
                      if (hasAttachment) {
                        return (
                          <>
                            {downloadHref ? (
                              <Link href={downloadHref} download _hover={{ textDecoration: 'none' }}>
                                <IconButton aria-label="다운로드" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none">
                                  <Icon as={LuDownload} />
                                </IconButton>
                              </Link>
                            ) : (
                              <Tooltip content="다운로드 링크 없음" showArrow>
                                <IconButton aria-label="다운로드" size="xs" rounded="md" bg="gray.50" color="gray.400" boxShadow="none" disabled>
                                  <Icon as={LuDownload} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip content="삭제" showArrow>
                              <IconButton aria-label="삭제" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none" onClick={() => confirmDelete(message)}>
                                <Icon as={LuTrash2} />
                              </IconButton>
                            </Tooltip>
                          </>
                        );
                      }
                      // 텍스트 메시지: 수정/삭제
                      return (
                        <>
                          {isEditing ? (
                            <>
                              <Tooltip content="저장" showArrow>
                                <IconButton aria-label="저장" size="xs" rounded="md" bg="blue.50" color="blue.600" _hover={{ bg: "blue.100" }} _active={{ bg: "blue.200" }} boxShadow="none" onClick={applyEdit}>
                                  <Icon as={LuCheck} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="취소" showArrow>
                                <IconButton aria-label="취소" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none" onClick={() => { setEditingMessageId(null); setEditText(""); }}>
                                  <Icon as={LuRotateCcw} />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip content="수정" showArrow>
                                <IconButton aria-label="수정" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none" onClick={() => startEdit(message)}>
                                  <Icon as={LuPencil} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="삭제" showArrow>
                                <IconButton aria-label="삭제" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none" onClick={() => confirmDelete(message)}>
                                  <Icon as={LuTrash2} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </Flex>
                )}

                {!isUser && message.id && hasAttachment && (
                  <Flex gap={1} mt={2} justify="flex-start">
                    {downloadHref ? (
                      <Link href={downloadHref} download _hover={{ textDecoration: 'none' }}>
                        <IconButton aria-label="다운로드" size="xs" rounded="md" bg="gray.50" color="gray.700" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.200" }} boxShadow="none">
                          <Icon as={LuDownload} />
                        </IconButton>
                      </Link>
                    ) : (
                      <Tooltip content="다운로드 링크 없음" showArrow>
                        <IconButton aria-label="다운로드" size="xs" rounded="md" bg="gray.50" color="gray.400" boxShadow="none" disabled>
                          <Icon as={LuDownload} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Flex>
                )}
              </Flex>
              </>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Flex>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Box p={compact ? 2 : 4} borderTopWidth="1px">
        <Flex gap={2} align="center">
          <Tooltip content="파일 첨부" showArrow>
            <IconButton
              aria-label="파일 첨부"
              variant="outline"
              colorScheme="gray"
              color="gray.800"
              borderColor="gray.200"
              borderWidth="1px"
              bg="white"
              rounded="md"
              _hover={{ bg: "gray.50"}}
              _active={{ bg: "gray.100" }}
              _disabled={{ opacity: 1, color: "gray.400", borderColor: "gray.200", cursor: "not-allowed" }}
              disabled={!connected}
              onClick={openFileDialog}
            >
              <Icon as={LuPaperclip} boxSize={5} />
            </IconButton>
          </Tooltip>
          <Input
            placeholder="메시지를 입력하세요..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!connected}
          />
        <Button
          colorScheme="blue"
            px={6}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !connected}
        >
            <Icon as={LuSend} />
        </Button>
      </Flex>
      </Box>

      {/* 삭제 확인 다이얼로그 (포스트박스 스타일) */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={applyDelete}
        title="메시지를 삭제할까요?"
        description="삭제 후 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
      />
    </Flex>
  );
};

export default Conversation;
