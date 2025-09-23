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
  const [autoThreadId, setAutoThreadId] = useState<number | null>(null);

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
          console.log("UUID 검증 성공:", validation);
        } else {
          setUuidValidation({ valid: false, loading: false });
          setUuidError("유효하지 않은 채널 UUID입니다. 삭제되었거나 존재하지 않는 채널일 수 있습니다.");
          console.log("UUID 검증 실패:", validation);
        }
      } catch (error: any) {
        setUuidValidation({ valid: false, loading: false });
        console.error("UUID 검증 중 오류 발생:", error);
        
        // 500 에러인 경우 더 구체적인 메시지
        if (error.response?.status === 500) {
          setUuidError("서버 오류가 발생했습니다. 관리자에게 문의하세요.");
        } else if (error.response?.status === 404) {
          setUuidError("채널을 찾을 수 없습니다.");
        } else {
          setUuidError("UUID 검증 중 오류가 발생했습니다.");
        }
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
    
    // UUID가 유효한 경우 자동으로 새 스레드 생성하고 대화 시작
    if (uuid && uuidValidation.valid && uuidValidation.config?.channelId) {
      (async () => {
        try {
          // 사용자 식별자를 UUID로 사용하여 새 스레드 생성 또는 기존 스레드 가져오기
          const thread = await chatApi.createOrGetThread({
            channelId: uuidValidation.config.channelId,
            userIdentifier: uuid,
            userName: "사용자",
            actor: "user"
          });
          
          if (thread?.id) {
            // 세션 스토리지에 저장하고 state로 스레드 ID 설정
            sessionStorage.setItem('popup_threadId', thread.id.toString());
            setAutoThreadId(thread.id);
          }
        } catch (error) {
          console.error("스레드 생성 실패:", error);
          setUuidError("대화방 생성에 실패했습니다.");
        }
      })();
      return;
    }
    
    // UUID가 없거나 유효하지 않은 경우의 기존 로직 (관리자용)
    (async () => {
      try {
        const list = await chatApi.getThreadsByChannel(Number(selectedChannelId));
        setThreads(list || []);
      } catch {
        setThreads([]);
      }
    })();
  }, [selectedChannelId, uuid, uuidValidation.valid, uuidValidation.config]);

  // autoThreadId가 설정된 경우 이를 사용
  const finalThreadId = autoThreadId || threadId;

  if (!finalThreadId) {
    // UUID가 없는 경우 접근 차단
    if (!uuid) {
      return (
        <Flex p={4} m={0} w="100vw" h="100vh" overflow="hidden" direction="column" align="center" justify="center" gap={4}>
          <Text fontSize="lg" fontWeight="bold" color="red.500">접근이 제한되었습니다</Text>
          <Text fontSize="md" color="gray.600">유효한 채널 UUID가 필요합니다.</Text>
        </Flex>
      );
    }

    // UUID 검증 중이거나 유효하지 않은 경우
    if (uuidValidation.loading) {
      return (
        <Flex p={4} m={0} w="100vw" h="100vh" overflow="hidden" direction="column" align="center" justify="center" gap={4}>
          <Text fontSize="lg" fontWeight="bold">연결 중...</Text>
          <Box p={3} borderWidth="1px" borderRadius="md" minW="320px" bg="blue.50">
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              채널 UUID: {uuid.substring(0, 8)}...
            </Text>
            <Text fontSize="xs" color="blue.600">UUID 검증 중...</Text>
          </Box>
        </Flex>
      );
    }

    if (!uuidValidation.valid) {
      return (
        <Flex p={4} m={0} w="100vw" h="100vh" overflow="hidden" direction="column" align="center" justify="center" gap={4}>
          <Text fontSize="lg" fontWeight="bold" color="red.500">접근이 제한되었습니다</Text>
          <Box p={3} borderWidth="1px" borderRadius="md" minW="320px" bg="red.50">
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              채널 UUID: {uuid.substring(0, 8)}...
            </Text>
            <Text fontSize="xs" color="red.600">✗ {uuidError || "유효하지 않은 채널 UUID입니다."}</Text>
          </Box>
        </Flex>
      );
    }

    // UUID가 유효한 경우 - 스레드 생성 중
    return (
      <Flex p={4} m={0} w="100vw" h="100vh" overflow="hidden" direction="column" align="center" justify="center" gap={4}>
        <Text fontSize="lg" fontWeight="bold">대화방 준비 중...</Text>
        <Box p={3} borderWidth="1px" borderRadius="md" minW="320px" bg="green.50">
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            채널: {uuidValidation.config?.cmsName || uuidValidation.config?.cmsCode}
          </Text>
          <Text fontSize="xs" color="green.600">✓ 연결됨</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Box p={0} m={0} w="100vw" h="100vh" overflow="hidden">
      <ConversationContainer selectedThreadId={finalThreadId} compact uuid={uuid} />
    </Box>
  );
}