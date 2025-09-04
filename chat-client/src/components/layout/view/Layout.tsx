"use client";

import { Box } from "@chakra-ui/react";
import { Header } from "./Header/Header";
import { Footer } from "@/components/layout/view/Footer";
import { memo } from "react";
import { useColors } from "@/styles/theme";
import { Menu } from "@/types/api";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useColorMode } from "@/components/ui/color-mode";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  isPreview?: boolean;
  menus?: Menu[];
}

// Header를 메모이제이션하여 props가 변경되지 않으면 리렌더링되지 않도록 함
const MemoizedHeader = memo(Header);

// Footer를 메모이제이션
const MemoizedFooter = memo(Footer);

export default function Layout({
  children,
  currentPage = "홈",
  isPreview,
  menus,
}: LayoutProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box bg={colors.bg} minHeight="100vh" fontFamily="'Inter', sans-serif">
      <Global styles={[getScrollbarStyle(isDark)]} />
      <MemoizedHeader
        currentPage={currentPage}
        menus={menus}
        isPreview={isPreview}
      />
      <Box as="main" mx="auto" position="relative" w="full">
        {children}
      </Box>
      <MemoizedFooter />
    </Box>
  );
}
