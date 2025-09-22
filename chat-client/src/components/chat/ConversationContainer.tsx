"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Conversation } from "./Conversation";
import { AttachmentList } from "./AttachmentList";
import { ChatStompClient } from "@/lib/ws/chatSocket";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationContainerProps {
  selectedThreadId: number | null;
  compact?: boolean;
  uuid?: string | null;
}

export const ConversationContainer = ({
  selectedThreadId,
  compact,
  uuid,
}: ConversationContainerProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "attachments">("chat");
  const [newMsgCount, setNewMsgCount] = useState<number>(0);
  const stompRef = useRef<ChatStompClient | null>(null);
  const queryClient = useQueryClient();

  // While on attachments tab, keep a lightweight WS subscription to bump the badge
  useEffect(() => {
    const tid = selectedThreadId || undefined;
    if (activeTab !== "attachments" || !tid) {
      try { stompRef.current?.disconnect(); } catch {}
      stompRef.current = null;
      return;
    }
    const c = new ChatStompClient();
    try {
      c.connect(tid, (payload: any) => {
        try {
          if (payload && typeof payload === "object" && "type" in payload) {
            // ignore typed events for badge; only count actual new messages
            if (payload.type === "message.updated" || payload.type === "message.deleted") return;
          }
          setNewMsgCount(v => v + 1);
        } catch {}
      });
      stompRef.current = c;
    } catch {
      // ignore connect failure
    }
    return () => { try { c.disconnect(); } catch {}; };
  }, [activeTab, selectedThreadId]);

  // When switching back to chat, refresh data if there are unseen messages and reset badge
  useEffect(() => {
    if (activeTab === "chat" && newMsgCount > 0 && selectedThreadId) {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", selectedThreadId] });
      setNewMsgCount(0);
    }
  }, [activeTab, newMsgCount, selectedThreadId, queryClient]);

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
          <Flex align="center" gap={2}>
            대화
            {newMsgCount > 0 && activeTab !== "chat" && (
              <Box bg="red.500" color="white" borderRadius="full" px={2} py={0.5} fontSize="10px" minW="18px" textAlign="center">
                {newMsgCount}
              </Box>
            )}
          </Flex>
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
          <Conversation selectedThreadId={selectedThreadId} compact={compact} uuid={uuid} />
        ) : (
          <AttachmentList selectedThreadId={selectedThreadId} />
        )}
      </Box>
    </Box>
  );
};

export default ConversationContainer;
