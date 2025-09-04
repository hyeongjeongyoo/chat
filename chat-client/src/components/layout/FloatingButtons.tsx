"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";
import { useColors } from "@/styles/theme";
import { useEffect, useState } from "react";
import { LanguageModeToggle } from "../common/LanguageModeToggle";

export const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const colors = useColors();
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      setShowScrollTop(scrollPosition > 300);
    };

    // 초기 상태 체크
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      position="fixed"
      bottom={{ base: 4, md: 8 }}
      right={{ base: 4, md: 8 }}
      zIndex={10}
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <IconButton
        aria-label="맨 위로 이동"
        onClick={scrollToTop}
        bg={colors.cardBg}
        color={colors.primary.default}
        borderWidth="1px"
        borderColor={colors.border}
        boxShadow={colors.shadow.lg}
        borderRadius="full"
        size="lg"
        transform={showScrollTop ? "translateX(0)" : "translateX(100px)"}
        opacity={showScrollTop ? 1 : 0}
        transition="all 0.3s ease-in-out"
        _hover={{
          bg: "rgba(99, 102, 241, 0.1)",
          color: colors.primary.hover,
          transform: showScrollTop ? "translateY(-4px)" : "translateX(100px)",
        }}
      >
        <LuArrowUp />
      </IconButton>
      {/* <ColorModeToggle size="lg" variant="icon" /> */}
      <LanguageModeToggle />
    </Box>
  );
};
