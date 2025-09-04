"use client";

import { Box, useBreakpointValue } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { getScrollbarStyle } from "@/styles/scrollbar";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bottombar } from "@/components/layout/Bottombar";
import { Topbar } from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";
import { useColors } from "@/styles/theme";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const colors = useColors();
  const { isAuthenticated } = useRecoilValue(authState);
  const pathname = usePathname();

  // 홈페이지 스타일에 맞는 색상 적용
  const mainBg = useColorModeValue(colors.bg, colors.darkBg);
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);

  const isLargerThanLg = useBreakpointValue({ base: false, lg: true });
  const isRootPath = pathname === "/";
  const isCMSPath = pathname?.startsWith("/cms");
  const isLoginPage = pathname === "/cms/login";
  const isTestPage = pathname === "/cms/test" || pathname === "/cms/test2";

  useEffect(() => {
    setIsSidebarOpen(!!isLargerThanLg);
  }, [isLargerThanLg]);

  const shouldShowCMSLayout =
    isCMSPath && !isRootPath && isAuthenticated && !isLoginPage && !isTestPage;

  return (
    <Box bg={mainBg} margin={0} padding={0} minHeight="100vh" width="100vw">
      <Global styles={[getScrollbarStyle(isDark)]} />
      <Box
        color={textColor}
        bg={mainBg}
        transition="all 0.2s ease-in-out"
        w="100%"
        h="100vh"
        position="relative"
      >
        {shouldShowCMSLayout && (
          <>
            <Topbar isSidebarOpen={isSidebarOpen} />
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen((prev) => !prev)}
            />
            <Bottombar />
          </>
        )}
        <Box
          pl="0"
          pr="0"
          minHeight={{ base: "calc(100vh - 56px)", md: "100vh" }}
          py={{ base: "56px", md: "0" }}
          bg={mainBg}
          transition="all 0.2s ease-in-out"
          position="relative"
          ml={
            shouldShowCMSLayout
              ? { base: 0, md: isSidebarOpen ? "36" : "16" }
              : 0
          }
        >
          {children}
        </Box>
        {/* CMS 화면에서만 컬러 모드 토글 버튼 표시 */}
        {/* {shouldShowCMSLayout && (
          <Flex
            position="fixed"
            bottom="4"
            right="4"
            zIndex="1001"
            display={{ base: "none", md: "flex" }}
          >
            <ColorModeToggle size="md" variant="icon" />
          </Flex>
        )} */}
      </Box>
    </Box>
  );
}

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
