"use client";

import { useState, useEffect } from "react";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { getToken, isAuthenticated } from "@/lib/auth-utils";
import { usePathname } from "next/navigation";

interface ChatWindowProps {
  threadId?: number;
}

export const ChatWindow = ({ threadId = 1 }: ChatWindowProps) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("안녕하세요, 핸디입니다.");
  const pathname = usePathname();
  const authed = isAuthenticated();

  useEffect(() => {
    const messages = [
      "안녕하세요, 핸디입니다.",
      "무엇을 도와드릴까요?"
    ];
    
    let messageIndex = 0;
    
    const showTooltipCycle = () => {
      setTooltipText(messages[messageIndex]);
      setShowTooltip(true);
      
      setTimeout(() => {
        setShowTooltip(false);
        messageIndex = (messageIndex + 1) % messages.length;
        
        setTimeout(() => {
          showTooltipCycle();
        }, 1500);
      }, 3000);
    };

    const initialTimer = setTimeout(() => {
      showTooltipCycle();
    }, 2000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

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
      {/* 말풍선 */}
      <Box
        position="absolute"
        bottom="60px"
        right="0"
        bg="white"
        color="black"
        px={3}
        py={2}
        borderRadius="lg"
        boxShadow="md"
        maxW="200px"
        opacity={showTooltip ? 1 : 0}
        transform={showTooltip ? "translateY(0)" : "translateY(10px)"}
        transition="all 0.3s ease-in-out"
        pointerEvents="none"
        _before={{
          content: '""',
          position: "absolute",
          bottom: "-6px",
          right: "20px",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid white",
        }}
      >
        <Text fontSize="sm" textAlign="center" whiteSpace="nowrap">
          {tooltipText}
        </Text>
      </Box>

      {/* 채팅 버튼 */}
      <Button
        onClick={openChatWindow}
        variant="ghost"
        bg="transparent"
        width="50px"
        height="50px"
        p={0}
        minW="auto"
        _hover={{ transform: "scale(1.05)" }}
        transition="all 0.2s"
        style={{
          animation: "float 3s ease-in-out infinite"
        }}
      >
        <Image src="/images/icons/chat.png" alt="채팅" width="50px" height="50px" />
      </Button>

      {/* 떠다니는 애니메이션 CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </Box>
  );
};

export default ChatWindow;
