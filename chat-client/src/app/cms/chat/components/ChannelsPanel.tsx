"use client";

import React from "react";
import { Box, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { chatApi } from "@/lib/api/chat";
import { useChatNotification } from "@/contexts/ChatNotificationContext";
import { type PanelProps, type Channel } from "../types";

type ChannelsPanelProps = PanelProps & {
  selectedChannelId: number;
  onSelectChannel: (id: number, channelName: string) => void;
};

export const ChannelsPanel = React.forwardRef<
  { refreshChannels: () => void }, 
  ChannelsPanelProps
>(({ colors, selectedChannelId, onSelectChannel }, ref) => {
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const { updateTotalUnreadCount } = useChatNotification();

  const refreshChannels = React.useCallback(async () => {
    try {
      const list = await chatApi.getChannels();
      setChannels(list || []);
      
      // 전체 미읽은 메시지 수 계산
      const totalUnread = (list || []).reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);
      updateTotalUnreadCount(totalUnread);
    } catch {}
  }, [updateTotalUnreadCount]);

  // 주기적으로 뱃지 업데이트 (5초마다) - 적절한 반응성
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshChannels();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refreshChannels]);

  React.useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  // ref를 통해 refreshChannels 함수 노출
  React.useImperativeHandle(ref, () => ({
    refreshChannels
  }), [refreshChannels]);

  return (
    <VStack align="stretch" gap={2} px={2}>
      {channels.map(ch => (
        <Box
          key={ch.id}
          px={3}
          py={2}
          borderRadius="md"
          bg={selectedChannelId === ch.id ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          cursor="pointer"
          onClick={() => onSelectChannel(ch.id, ch.cmsName || ch.cmsCode)}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="bold">{ch.cmsName || ch.cmsCode}</Text>
              <Text fontSize="xs" color={colors.text.muted}>code: {ch.cmsCode}</Text>
            </VStack>
            {(ch.unreadCount ?? 0) > 0 && (
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
                {(ch.unreadCount ?? 0) > 99 ? "99+" : (ch.unreadCount ?? 0)}
              </Badge>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
});
