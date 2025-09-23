"use client";

import { Box, Stack, Text, Flex, Badge } from "@chakra-ui/react";
import { useChatChannels } from "@/hooks/useChat";

interface ChannelListProps {
  selectedChannelId: number | null;
  onSelectChannel: (channelId: number) => void;
}

export const ChannelList = ({
  selectedChannelId,
  onSelectChannel,
}: ChannelListProps) => {
  const {
    data: channels,
    isLoading,
    error,
  } = useChatChannels();

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>채널 목록을 불러오는 중...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text>채널 목록을 불러오는데 실패했습니다.</Text>
      </Box>
    );
  }

  if (!channels?.length) {
    return (
      <Box p={4}>
        <Text>등록된 채널이 없습니다.</Text>
      </Box>
    );
  }

  return (
    <Stack gap={1} p={2}>
      {channels.map((channel) => (
        <Box
          key={channel.id}
          onClick={() => onSelectChannel(channel.id)}
          cursor="pointer"
          p={3}
          borderRadius="md"
          bg={
            selectedChannelId === channel.id ? "blue.50" : "transparent"
          }
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="medium">{channel.cmsName}</Text>
              <Text fontSize="sm" color="gray.500">
                {channel.cmsCode}
              </Text>
            </Box>
            {(channel.unreadCount || 0) > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={2}>
                {channel.unreadCount}
              </Badge>
            )}
          </Flex>
        </Box>
      ))}
    </Stack>
  );
};

export default ChannelList;
