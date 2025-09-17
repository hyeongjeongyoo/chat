"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { setToken } from "@/lib/auth-utils";
import ConversationContainer from "@/components/chat/ConversationContainer";
import { chatApi } from "@/lib/api/chat";

export default function ChatPopupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { threadId, token } = useMemo(() => {
    const tidStr = searchParams.get("threadId");
    const tokenStr = searchParams.get("token");
    const tid = tidStr ? Number(tidStr) : null;
    return { threadId: Number.isFinite(tid as number) ? (tid as number) : null, token: tokenStr };
  }, [searchParams]);

  useEffect(() => {
    if (token && typeof window !== "undefined") {
      try {
        setToken(token);
      } catch {
        // ignore
      }
    }
  }, [token]);

  // 타이틀을 threadId에 맞게 동기화 (token은 표시하지 않음)
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.title = threadId ? `채팅 - Thread #${threadId}` : "채팅";
      }
    } catch {
      // ignore
    }
  }, [threadId]);

  // 스레드 유효성 보장: 전달된 threadId가 없거나 존재하지 않으면 기본 채널/스레드를 생성 후 교체
  useEffect(() => {
    (async () => {
      try {
        if (!threadId) return;
        // 존재 확인 시도 (페이지 0, size 1)
        try {
          await chatApi.getMessages(threadId, 0, 1);
          return; // OK
        } catch (e) {
          // 존재하지 않거나 권한 문제 → 생성 플로우로 이동
        }
        // 기본 채널/스레드 생성
        const channel = await chatApi.createOrGetChannel({ cmsCode: "DEFAULT", cmsName: "Default", actor: "admin" });
        const thread = await chatApi.createOrGetThread({ channelId: channel.id, userIdentifier: "popup-user", userName: "POPUP", actor: "admin" });
        const q = new URLSearchParams(searchParams.toString());
        q.set("threadId", String(thread.id));
        router.replace(`?${q.toString()}`);
      } catch {
        // 실패 시 무시 (입력 비활성 상태로 머무름)
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  return (
    <Box p={0} m={0} w="100vw" h="100vh" overflow="hidden">
      <ConversationContainer selectedThreadId={threadId} compact />
    </Box>
  );
}