import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatApi, SpringPage } from "@/lib/api/chat";
import { type Message } from "../types";

export function useMessagesData(
  selectedThreadId: number,
  backendThreadId: number | null,
  explicitBackendThreadId: number | null,
  ensureBackendIds: () => Promise<{ threadId: number }>
) {
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

  const processedMessages = React.useMemo(() => {
    if (!pages) return [];
    
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
    
    return flat;
  }, [pages]);

  return {
    messages: processedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}
