"use client";

import React from "react";
import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { chatApi } from "@/lib/api/chat";
import { type PanelProps, type Thread } from "../types";

type ThreadsPanelProps = PanelProps & {
  selectedChannelId: number;
  selectedThreadId: number;
  onSelectThread: (id: number, threadName: string) => void;
  onThreadRead: (threadId: number) => void;
  refreshTrigger?: number; // 뱃지 새로고침 트리거
};

export function ThreadsPanel({ 
  colors, 
  selectedChannelId, 
  selectedThreadId, 
  onSelectThread, 
  onThreadRead, 
  refreshTrigger 
}: ThreadsPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads] = React.useState<Thread[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedChannelId) { 
        setThreads([]); 
        return; 
      }
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
