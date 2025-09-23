"use client";

import React from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { chatApi } from "@/lib/api/chat";
import { useSearchParams, useRouter } from "next/navigation";
import { useChatNotification } from "@/contexts/ChatNotificationContext";
import { ChannelsPanel, ThreadsPanel, MessagesPanel } from "./components";

export default function ChatAdminPage() {
  const colors = useColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateTotalUnreadCount, resetTotalUnreadCount } = useChatNotification();
  // 페이지 루트에서는 별도 동작 없음. threadId 파라미터 처리는 MessagesPanel 내부에서 수행
  
  // 채팅관리 페이지 진입 시 전체 뱃지 초기화
  React.useEffect(() => {
    resetTotalUnreadCount();
  }, [resetTotalUnreadCount]);

  const [selectedChannelId, setSelectedChannelId] = React.useState<number>(1);
  const [selectedThreadId, setSelectedThreadId] = React.useState<number>(0);
  const channelsPanelRef = React.useRef<{ refreshChannels: () => void }>(null);
  
  // URL 파라미터에서 채널 ID 읽기
  React.useEffect(() => {
    const channelIdParam = searchParams.get("channelId");
    if (channelIdParam) {
      const channelId = Number(channelIdParam);
      if (!isNaN(channelId)) {
        setSelectedChannelId(channelId);
      }
    }
  }, [searchParams]);
  
  // 현재 대화 상태 추적
  const [currentChannelName, setCurrentChannelName] = React.useState<string>("");
  const [currentThreadName, setCurrentThreadName] = React.useState<string>("");
  const [threadsRefreshTrigger, setThreadsRefreshTrigger] = React.useState<number>(0);

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
          ref={channelsPanelRef}
          colors={colors}
          selectedChannelId={selectedChannelId}
          onSelectChannel={async (id, channelName) => {
            // 채널만 변경. threadId는 ThreadsPanel에서 백엔드 목록 기준으로 결정
            setSelectedChannelId(id);
            setCurrentChannelName(channelName);
            
            // URL에 채널 ID 추가
            const current = new URLSearchParams(searchParams.toString());
            current.set("channelId", String(id));
            router.replace(`?${current.toString()}`);
            
            // 채널 선택 시 해당 채널의 뱃지 초기화
            try {
              // 해당 채널의 모든 스레드 조회
              const threads = await chatApi.getThreadsByChannel(id);
              if (threads && threads.length > 0) {
                // 각 스레드를 읽음 처리 (병렬 처리로 성능 개선)
                const markReadPromises = threads.map(thread => 
                  chatApi.markRead(thread.id, "admin").catch(() => {})
                );
                await Promise.all(markReadPromises);
              }
            } catch (error) {
              console.error("채널 뱃지 초기화 실패:", error);
            }
            
            // 채널 목록 새로고침하여 뱃지 업데이트
            channelsPanelRef.current?.refreshChannels();
            // 스레드 목록도 새로고침
            setThreadsRefreshTrigger(prev => prev + 1);
          }}
        />

        {/* Threads */}
        <ThreadsPanel
          colors={colors}
          selectedChannelId={selectedChannelId}
          selectedThreadId={selectedThreadId}
          onSelectThread={(id, threadName) => {
            setSelectedThreadId(id);
            setCurrentThreadName(threadName);
            // 스레드 선택 시 URL 동기화: channelId와 threadId 모두 유지
            const current = new URLSearchParams(searchParams.toString());
            current.set("threadId", String(id));
            router.replace(`?${current.toString()}`);
          }}
          onThreadRead={(threadId) => {
            // 스레드 읽음 처리 - 백엔드 API 호출
            chatApi.markRead(threadId, "admin").then(() => {
              // 읽음 처리 후 스레드 목록 새로고침
              setThreadsRefreshTrigger(prev => prev + 1);
            }).catch(() => {});
          }}
          refreshTrigger={threadsRefreshTrigger}
        />

        {/* Messages */}
        <MessagesPanel
          colors={colors}
          selectedThreadId={selectedThreadId}
          selectedChannelId={selectedChannelId}
          currentChannelName={currentChannelName}
          currentThreadName={currentThreadName}
          channelsPanelRef={channelsPanelRef}
          onThreadsRefresh={() => setThreadsRefreshTrigger(prev => prev + 1)}
          onTabChange={() => setThreadsRefreshTrigger(prev => prev + 1)}
        />

        {/* 상세/설정 섹션 제거됨 */}
      </GridSection>
    </Box>
  );
}