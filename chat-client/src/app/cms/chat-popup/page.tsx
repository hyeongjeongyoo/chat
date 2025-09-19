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

  const { threadId, token, uuid } = useMemo(() => {
    if (typeof window === "undefined") {
      return { threadId: null, token: null, uuid: null };
    }
    
    // URL 파라미터에서 값을 가져오기
    const tidStr = searchParams.get("threadId");
    const tokenStr = searchParams.get("token");
    const uuidStr = searchParams.get("uuid");
    
    // URL에 파라미터가 있으면 세션 스토리지에 저장하고 URL에서 제거
    if (tidStr || tokenStr || uuidStr) {
      if (tidStr) sessionStorage.setItem('popup_threadId', tidStr);
      if (tokenStr) sessionStorage.setItem('popup_token', tokenStr);
      if (uuidStr) sessionStorage.setItem('popup_uuid', uuidStr);
      
      // URL에서 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('threadId');
      url.searchParams.delete('token');
      url.searchParams.delete('uuid');
      window.history.replaceState({}, '', url.toString());
      
      const tid = tidStr ? Number(tidStr) : null;
      return { 
        threadId: Number.isFinite(tid as number) ? (tid as number) : null, 
        token: tokenStr,
        uuid: uuidStr
      };
    }
    
    // URL에 파라미터가 없으면 세션 스토리지에서 가져오기
    const storedThreadId = sessionStorage.getItem('popup_threadId');
    const storedToken = sessionStorage.getItem('popup_token');
    const storedUuid = sessionStorage.getItem('popup_uuid');
    
    const tid = storedThreadId ? Number(storedThreadId) : null;
    return { 
      threadId: Number.isFinite(tid as number) ? (tid as number) : null, 
      token: storedToken,
      uuid: storedUuid
    };
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
  const [uuidValidation, setUuidValidation] = useState<{ valid: boolean; config?: any; loading: boolean }>({ valid: false, loading: false });
  const [uuidError, setUuidError] = useState<string>("");

  // UUID 검증
  useEffect(() => {
    if (!uuid) {
      setUuidValidation({ valid: false, loading: false });
      setUuidError("");
      return;
    }

    setUuidValidation({ valid: false, loading: true });
    setUuidError("");

    (async () => {
      try {
        const validation = await chatApi.validateChannelUuid(uuid);
        if (validation.valid) {
          setUuidValidation({ valid: true, config: validation.config, loading: false });
          // UUID가 유효하면 해당 채널을 자동으로 선택
          if (validation.config?.channelId) {
            setSelectedChannelId(validation.config.channelId);
          }
        } else {
          setUuidValidation({ valid: false, loading: false });
          setUuidError("유효하지 않은 채널 UUID입니다.");
        }
      } catch (error) {
        setUuidValidation({ valid: false, loading: false });
        setUuidError("UUID 검증 중 오류가 발생했습니다.");
      }
    })();
  }, [uuid]);

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
        
        {/* UUID 검증 상태 표시 */}
        {uuid && (
          <Box p={3} borderWidth="1px" borderRadius="md" minW="320px" bg={uuidValidation.valid ? "green.50" : uuidValidation.loading ? "blue.50" : "red.50"}>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              채널 UUID: {uuid.substring(0, 8)}...
            </Text>
            {uuidValidation.loading && (
              <Text fontSize="xs" color="blue.600">UUID 검증 중...</Text>
            )}
            {uuidValidation.valid && uuidValidation.config && (
              <Text fontSize="xs" color="green.600">
                ✓ {uuidValidation.config.cmsName || uuidValidation.config.cmsCode} 채널에 연결됨
              </Text>
            )}
            {uuidError && (
              <Text fontSize="xs" color="red.600">✗ {uuidError}</Text>
            )}
          </Box>
        )}
        
        <Flex direction="column" gap={3} minW="320px">
          <Box>
            <Text fontSize="sm" mb={1}>채널</Text>
            <Box as="select" onChange={(e: any) => setSelectedChannelId(e.target.value ? Number(e.target.value) : "")}
              borderWidth="1px" borderColor="gray.200" rounded="md" px={3} py={2} w="100%" data-value={selectedChannelId as any}
              _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
              isDisabled={uuid && uuidValidation.valid}>
              <option value="">채널 선택</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.cmsName || ch.cmsCode}</option>
              ))}
            </Box>
            {uuid && uuidValidation.valid && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                UUID로 자동 선택됨
              </Text>
            )}
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