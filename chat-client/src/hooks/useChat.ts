"use client";

import { useInfiniteQuery, useQueryClient, useQuery } from "@tanstack/react-query";
import { chatApi, ChatMessageDto, SpringPage } from "@/lib/api/chat";

interface UseChatMessagesResult {
  pages: Array<SpringPage<ChatMessageDto>> | undefined;
  isLoading: boolean;
  error: unknown;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  sendMessage: (params: { threadId: number; content: string; senderType?: "USER" | "ADMIN"; senderName?: string; messageType?: string; fileName?: string; fileUrl?: string; attachments?: any[]; uuid?: string }) => Promise<ChatMessageDto>;
  updateMessage: (params: { messageId: number; content: string }) => Promise<void>;
  deleteMessage: (params: { messageId: number }) => Promise<void>;
}

export const useChatMessages = (threadId?: number): UseChatMessagesResult => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<SpringPage<ChatMessageDto>>({
    queryKey: ["chat", "messages", threadId ?? 0],
    queryFn: async ({ pageParam = "LAST" }) => {
      console.log("🔍 [useChat] queryFn called - threadId:", threadId, "pageParam:", pageParam);
      if (!threadId) return { content: [], first: true, last: true, number: 0, totalPages: 0 } as SpringPage<ChatMessageDto>;
      if (pageParam === "LAST") {
        // 총 페이지 파악 후 마지막 페이지 로드
        console.log("🔍 [useChat] Loading LAST page for threadId:", threadId);
        const first = await chatApi.getMessages(threadId, 0, 30);
        console.log("🔍 [useChat] First page response:", first);
        const totalPages = first.totalPages ?? 1;
        const lastIdx = Math.max(0, totalPages - 1);
        console.log("🔍 [useChat] totalPages:", totalPages, "lastIdx:", lastIdx);
        if (lastIdx === 0) return first;
        const lastPage = await chatApi.getMessages(threadId, lastIdx, 30);
        console.log("🔍 [useChat] Last page response:", lastPage);
        return lastPage;
      }
      console.log("🔍 [useChat] Loading page:", pageParam, "for threadId:", threadId);
      const result = await chatApi.getMessages(threadId, pageParam as number, 30);
      console.log("🔍 [useChat] Page result:", result);
      return result;
    },
    initialPageParam: "LAST" as any,
    // 위로 스크롤 시 더 과거 페이지(번호 - 1)를 불러옴
    getNextPageParam: (lastPage) => {
      const nextParam = lastPage.number > 0 ? lastPage.number - 1 : undefined;
      console.log("🔍 [useChat] getNextPageParam - lastPage.number:", lastPage.number, "nextParam:", nextParam);
      return nextParam;
    },
  });

  const sendMessage = async (params: { threadId: number; content: string; senderType?: "USER" | "ADMIN"; senderName?: string; messageType?: string; fileName?: string; fileUrl?: string; attachments?: any[]; uuid?: string }): Promise<ChatMessageDto> => {
    // HTTP 전송 경로 사용
    const saved = await chatApi.sendMessage(params.threadId, {
      senderType: (params.senderType as any) ?? "ADMIN",
      content: params.content,
      actor: "system",
    });
    // 최신 페이지에 낙관적 반영
    queryClient.setQueryData(["chat", "messages", params.threadId], (old: any) => {
      if (!old?.pages) return old;
      const maxPage = old.pages.reduce((acc: number, p: any) => (p.number > acc ? p.number : acc), old.pages[0]?.number ?? 0);
      const newPages = old.pages.map((p: any) => (p.number === maxPage ? { ...p, content: [...(p.content || []), saved] } : p));
      return { ...old, pages: newPages };
    });
    return saved;
  };

  const updateMessage = async (params: { messageId: number; content: string }) => {
    const saved = await chatApi.updateMessage(params.messageId, { content: params.content, actor: "admin" });
    // 캐시 업데이트: 해당 메시지 id를 가진 항목 교체
    queryClient.setQueryData(["chat", "messages", saved.threadId], (old: any) => {
      if (!old?.pages) return old;
      const newPages = old.pages.map((p: any) => ({
        ...p,
        content: (p.content || []).map((m: any) => (m.id === saved.id ? { ...m, content: saved.content } : m)),
      }));
      return { ...old, pages: newPages };
    });
  };

  const deleteMessage = async (_params: { messageId: number }) => {
    await chatApi.deleteMessage(_params.messageId, { actor: "admin" });
    // 캐시에서 제거
    queryClient.setQueryData(["chat", "messages", threadId ?? 0], (old: any) => {
      if (!old?.pages) return old;
      const newPages = old.pages.map((p: any) => ({
        ...p,
        content: (p.content || []).filter((m: any) => m.id !== _params.messageId),
      }));
      return { ...old, pages: newPages };
    });
  };

  return {
    pages: data?.pages,
    isLoading,
    error,
    fetchNextPage: () => fetchNextPage(),
    hasNextPage: !!hasNextPage,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};

// 채널 목록을 가져오는 hook
export const useChatChannels = () => {
  return useQuery({
    queryKey: ["chat", "channels"],
    queryFn: async () => {
      try {
        const channels = await chatApi.getChannels();
        return channels || [];
      } catch (error) {
        console.error("Failed to fetch channels:", error);
        return [];
      }
    },
    staleTime: 30000, // 30초간 캐시
    refetchInterval: 60000, // 1분마다 자동 새로고침
  });
};

// 특정 채널의 스레드 목록을 가져오는 hook
export const useChatThreads = (channelId?: number) => {
  return useQuery({
    queryKey: ["chat", "threads", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      try {
        const threads = await chatApi.getThreadsByChannel(channelId);
        return threads || [];
      } catch (error) {
        console.error("Failed to fetch threads:", error);
        return [];
      }
    },
    enabled: !!channelId, // channelId가 있을 때만 실행
    staleTime: 30000, // 30초간 캐시
    refetchInterval: 60000, // 1분마다 자동 새로고침
  });
};

export default useChatMessages;
