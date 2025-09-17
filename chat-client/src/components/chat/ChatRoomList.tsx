"use client";

import { Box, Text, Flex, Badge, Stack } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { useChatThreads } from "@/hooks/useChat";
import { ChatThreadDto } from "@/types/api/chat";

interface ChatRoomListProps {
  selectedChannelId: number | null;
  selectedThreadId: number | null;
  onSelectThread: (threadId: number) => void;
}

export const ChatRoomList = ({
  selectedChannelId,
  selectedThreadId,
  onSelectThread,
}: ChatRoomListProps) => {
  const {
    data: threads,
    isLoading,
    error,
  } = useChatThreads(selectedChannelId || undefined) as {
    data: ChatThreadDto[] | undefined;
    isLoading: boolean;
    error: unknown;
  };

  if (!selectedChannelId) {
    return (
      <Box p={4}>
        <Text>채널을 선택해주세요.</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>채팅방 목록을 불러오는 중...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text>채팅방 목록을 불러오는데 실패했습니다.</Text>
      </Box>
    );
  }

  if (!threads?.length) {
    return (
      <Box p={4}>
        <Text>채팅방이 없습니다.</Text>
      </Box>
    );
  }

  return (
    <Stack direction="column" p={2}>
      {threads.map((thread) => (
        <Box
          key={thread.threadId}
          onClick={() => onSelectThread(thread.threadId)}
          cursor="pointer"
          p={3}
          borderRadius="md"
          bg={selectedThreadId === thread.threadId ? "blue.50" : "transparent"}
          _hover={{ bg: "gray.50" }}
          transition="all 0.2s"
        >
          <Flex gap={3}>
            <Avatar
              size="sm"
              name={thread.userName}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${thread.userName}`}
            />
            <Box flex={1}>
              <Flex justify="space-between" align="baseline">
                <Text fontWeight="medium">{thread.userName}</Text>
                <Text fontSize="xs" color="gray.500">
                  {thread.lastMessageTimestamp
                    ? new Date(thread.lastMessageTimestamp).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : ""}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={1}>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  maxW="70%"
                >
                  {thread.lastMessage}
                </Text>
                {thread.unreadCount > 0 && (
                  <Badge colorScheme="red" borderRadius="full" ml={2}>
                    {thread.unreadCount}
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>
      ))}
    </Stack>
  );
};

export default ChatRoomList;
