"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Conversation } from "./Conversation";
import { AttachmentList } from "./AttachmentList";

interface ConversationContainerProps {
  selectedThreadId: number | null;
  compact?: boolean;
}

export const ConversationContainer = ({
  selectedThreadId,
  compact,
}: ConversationContainerProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "attachments">("chat");

  return (
    <Box h="100%" display="flex" flexDirection="column" minH={0}>
      <Flex borderBottomWidth="1px" px={compact ? 1 : 4} py={compact ? 0 : 0}>
        <Box
          px={compact ? 1 : 4}
          py={compact ? 1 : 2}
          cursor="pointer"
          borderBottomWidth="2px"
          borderBottomColor={activeTab === "chat" ? "blue.500" : "transparent"}
          color={activeTab === "chat" ? "blue.500" : "gray.600"}
          onClick={() => setActiveTab("chat")}
        >
          대화
        </Box>
        <Box
          px={compact ? 2 : 4}
          py={compact ? 1 : 2}
          cursor="pointer"
          borderBottomWidth="2px"
          borderBottomColor={
            activeTab === "attachments" ? "blue.500" : "transparent"
          }
          color={activeTab === "attachments" ? "blue.500" : "gray.600"}
          onClick={() => setActiveTab("attachments")}
        >
          첨부파일
        </Box>
      </Flex>
      <Box flex="1" overflow="hidden" minH={0}>
        {activeTab === "chat" ? (
          <Conversation selectedThreadId={selectedThreadId} compact={compact} />
        ) : (
          <AttachmentList selectedThreadId={selectedThreadId} />
        )}
      </Box>
    </Box>
  );
};

export default ConversationContainer;
