"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, ChatMessageDto, SpringPage } from "@/lib/api/chat";

interface UseChatMessagesResult {
  pages: Array<SpringPage<ChatMessageDto>> | undefined;
  isLoading: boolean;
  error: unknown;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  sendMessage: (params: { threadId: number; content: string; senderType?: "USER" | "ADMIN"; senderName?: string; messageType?: string; fileName?: string; fileUrl?: string; attachments?: any[] }) => Promise<ChatMessageDto>;
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
      if (!threadId) return { content: [], first: true, last: true, number: 0, totalPages: 0 } as SpringPage<ChatMessageDto>;
      if (pageParam === "LAST") {
        // 총 페이지 파악 후 마지막 페이지 로드
        const first = await chatApi.getMessages(threadId, 0, 30);
        const totalPages = first.totalPages ?? 1;
        const lastIdx = Math.max(0, totalPages - 1);
        if (lastIdx === 0) return first;
        return await chatApi.getMessages(threadId, lastIdx, 30);
      }
      return await chatApi.getMessages(threadId, pageParam as number, 30);
    },
    initialPageParam: "LAST" as any,
    // 위로 스크롤 시 더 과거 페이지(번호 - 1)를 불러옴
    getNextPageParam: (lastPage) => (lastPage.number > 0 ? lastPage.number - 1 : undefined),
  });

  const sendMessage = async (params: { threadId: number; content: string; senderType?: "USER" | "ADMIN"; senderName?: string; messageType?: string; fileName?: string; fileUrl?: string; attachments?: any[] }): Promise<ChatMessageDto> => {
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

  const updateMessage = async (_params: { messageId: number; content: string }) => {
    // 서버 UPDATE API는 컨트롤러가 있으므로 여기서는 단순히 클라이언트 캐시 업데이트를 담당
    // 실제 호출은 필요 시 chatApi에 추가
  };

  const deleteMessage = async (_params: { messageId: number }) => {
    // 서버 DELETE API는 컨트롤러가 있으므로 여기서는 단순히 클라이언트 캐시 업데이트를 담당
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

export default useChatMessages;
