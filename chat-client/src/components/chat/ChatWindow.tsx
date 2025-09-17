"use client";

import { useState } from "react";
import { Box, Button, Icon } from "@chakra-ui/react";
import { LuMessageCircle } from "react-icons/lu";
import { getToken, isAuthenticated } from "@/lib/auth-utils";
import { usePathname } from "next/navigation";

interface ChatWindowProps {
  threadId?: number;
}

export const ChatWindow = ({ threadId = 1 }: ChatWindowProps) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const pathname = usePathname();
  const authed = isAuthenticated();

  // 챗 팝업 화면에서는 전역 아이콘 숨김
  if (pathname?.startsWith("/cms/chat-popup")) {
    return null;
  }
  // 로그인 페이지에서는 숨김, 로그인 후에만 표시
  if (!authed || pathname === "/cms/login") {
    return null;
  }

  const openChatWindow = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width - width - 20;
    const top = window.screen.height - height - 100;

    const token = getToken();
    const query = new URLSearchParams({ threadId: String(threadId) });
    if (token) {
      query.set("token", encodeURIComponent(token));
    }

    window.open(
      `/cms/chat-popup?${query.toString()}`,
      `chatWindow_${threadId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,menubar=no`
    );
  };

  return (
    <Box position="fixed" bottom="20" right="20" zIndex="overlay">
      <Button
        onClick={openChatWindow}
        size="lg"
        colorScheme="blue"
        rounded="full"
        width="50px"
        height="50px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        shadow="lg"
        _hover={{ transform: "scale(1.05)" }}
        transition="all 0.2s"
      >
        <Icon as={LuMessageCircle} boxSize="24px" />
      </Button>
    </Box>
  );
};

export default ChatWindow;
