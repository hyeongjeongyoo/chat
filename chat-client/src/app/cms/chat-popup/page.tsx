"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
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

  const [channels, setChannels] = useState<Array<{ id: number; cmsCode: string; cmsName?: string }>>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | "">("");
  const [threads, setThreads] = useState<Array<{ id: number; channelId: number; userIdentifier: string; userName?: string }>>([]);
  const [selectedThread, setSelectedThread] = useState<number | "">("");

  useEffect(() => {
    if (threadId) return;
    (async () => {
      try {
        const list = await chatApi.getChannels();
        setChannels(list || []);
      } catch {}
    })();
  }, [threadId]);

  useEffect(() => {
    if (!selectedChannelId) { setThreads([]); setSelectedThread(""); return; }
    (async () => {
      try {
        const list = await chatApi.getThreadsByChannel(Number(selectedChannelId));
        setThreads(list || []);
      } catch {
        setThreads([]);
      }
    })();
  }, [selectedChannelId]);

  if (!threadId) {
    return (
      <Flex p={4} m={0} w="100vw" h="100vh" overflow="hidden" direction="column" align="center" justify="center" gap={4}>
        <Text fontSize="lg" fontWeight="bold">대화 스레드를 선택하세요</Text>
        <Flex direction="column" gap={3} minW="320px">
          <Box>
            <Text fontSize="sm" mb={1}>채널</Text>
            <Box as="select" onChange={(e: any) => setSelectedChannelId(e.target.value ? Number(e.target.value) : "")}
              borderWidth="1px" borderColor="gray.200" rounded="md" px={3} py={2} w="100%" data-value={selectedChannelId as any}>
              <option value="">채널 선택</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.cmsName || ch.cmsCode}</option>
              ))}
            </Box>
          </Box>
          <Box>
            <Text fontSize="sm" mb={1}>스레드</Text>
            <Box as="select" onChange={(e: any) => setSelectedThread(e.target.value ? Number(e.target.value) : "")}
              borderWidth="1px" borderColor="gray.200" rounded="md" px={3} py={2} w="100%" data-value={selectedThread as any}
              opacity={!selectedChannelId ? 0.6 : 1} pointerEvents={!selectedChannelId ? "none" : "auto"}>
              <option value="">스레드 선택</option>
              {threads.map((th) => (
                <option key={th.id} value={th.id}>{th.userName || th.userIdentifier} (#{th.id})</option>
              ))}
            </Box>
          </Box>
          <Button colorScheme="blue" disabled={!selectedThread} onClick={() => {
            if (!selectedThread) return;
            const q = new URLSearchParams(searchParams.toString());
            q.set("threadId", String(selectedThread));
            router.replace(`?${q.toString()}`);
          }}>대화 열기</Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Box p={0} m={0} w="100vw" h="100vh" overflow="hidden">
      <ConversationContainer selectedThreadId={threadId} compact />
    </Box>
  );
}