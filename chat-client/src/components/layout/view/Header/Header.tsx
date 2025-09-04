"use client";

import {
  Box,
  Container,
  Flex,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";
import NextLink from "next/link";
import { Menu } from "@/types/api";
import { usePathname } from "next/navigation";
import DesktopNav from "../DesktopNav";
import { UtilityIcons } from "./UtilityIcons";
import SitemapDrawer from "./SitemapDrawer";

const buildVisibleMenuTree = (menus: Menu[]): Menu[] => {
  if (!menus) {
    return [];
  }

  const filterAndSortRecursive = (nodes: Menu[]): Menu[] => {
    return nodes
      .map((node) => {
        const newNode = { ...node };
        if (node.children && node.children.length > 0) {
          newNode.children = filterAndSortRecursive(node.children);
        } else {
          newNode.children = [];
        }
        return newNode;
      })
      .filter((node) => node.visible !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return filterAndSortRecursive(menus);
};

interface HeaderProps {
  currentPage: string;
  menus?: Menu[];
  isPreview?: boolean;
}

export const Header = memo(function Header({
  currentPage,
  menus = [],
  isPreview,
}: HeaderProps) {
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSitemapDrawerOpen, setIsSitemapDrawerOpen] = useState(false);
  const [lastHoveredMenuId, setLastHoveredMenuId] = useState<number | null>(
    null
  );

  const { colorMode } = useColorMode();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isDark = colorMode === "dark";
  const isMainPage = pathname === "/";

  const headerHeight = useBreakpointValue({
    base: "60px",
    lg: "70px",
  });

  const isMenuActive = (menuUrl: string | undefined) => {
    if (!menuUrl) return false;
    return pathname === menuUrl || pathname.startsWith(menuUrl + "/");
  };

  const visibleMenus = buildVisibleMenuTree(menus);
  const menusWithLastFlag = visibleMenus.map((menu, index) => ({
    ...menu,
    isLastMenuItem: index === visibleMenus.length - 1,
  }));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavHovered(false);
        setLastHoveredMenuId(null);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 외부 클릭 시 헤더 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNavHovered(false);
        setLastHoveredMenuId(null);
      }
    };

    if (isNavHovered) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavHovered]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleMenuHover = (menuId: number) => {
    // 이전 타이머가 있다면 클리어
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setLastHoveredMenuId(menuId);
    setIsNavHovered(true);
  };

  const handleMenuLeave = () => {
    // 메뉴 아이템에서 나갈 때 약간의 지연 후 닫기
    closeTimerRef.current = setTimeout(() => {
      setIsNavHovered(false);
      setLastHoveredMenuId(null);
      closeTimerRef.current = null;
    }, 150);
  };

  const logoWidth = useBreakpointValue({ base: 120, lg: 160 }) || 120;
  const logoHeight = useBreakpointValue({ base: 22, lg: 30 }) || 22;

  const iconColor = isNavHovered
    ? isDark
      ? "white"
      : "black"
    : isDark
    ? "white"
    : "#0D344E";

  return (
    <>
      <Box
        as="header"
        position="fixed"
        top={isPreview ? 50 : 0}
        left={0}
        right={0}
        zIndex={10}
        bg={
          isNavHovered
            ? isDark
              ? "rgba(26, 32, 44, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
            : isDark
            ? "gray.800"
            : "white"
        }
        backdropFilter={isNavHovered ? "blur(30px)" : "none"}
        transition="all 0.3s ease"
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        height={headerHeight}
        overflow="visible"
        opacity={1}
        pointerEvents={"auto"}
        boxShadow={isNavHovered ? "none" : "0 4px 20px rgba(0, 0, 0, 0.1)"}
        _after={{
          content: '""',
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          height: "1px",
          bg: isMainPage ? "#0D344E" : isDark ? "blue.200" : "black",
          transition: "all 0.3s ease",
          opacity: isNavHovered && lastHoveredMenuId ? "1" : "0",
          transform:
            isNavHovered && lastHoveredMenuId ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
        }}
      >
        <Container
          position="relative"
          p={0}
          transition="all 0.3s"
          m={0}
          w="100%"
          maxW={{ base: "90%", "2xl": "1600px" }}
          margin="0 auto"
          height="100%"
        >
          <Flex position="relative" direction="column" height="100%">
            <Flex
              position="relative"
              align="center"
              justify="space-between"
              minH={headerHeight}
            >
              <Flex zIndex={1000} align="center" h={headerHeight}>
                <Link
                  as={NextLink}
                  href="/"
                  _hover={{ textDecoration: "none", opacity: 0.8 }}
                  display="flex"
                  alignItems="center"
                  transition="opacity 0.2s"
                >
                  <Box>
                    <Image
                      src={
                        isNavHovered && isDark
                          ? "/images/logo/logo_w.png"
                          : "/images/logo/logo.png"
                      }
                      width={logoWidth}
                      height={logoHeight}
                      alt="logo"
                    />
                  </Box>
                </Link>
              </Flex>
              <DesktopNav
                menusWithLastFlag={menusWithLastFlag}
                isNavHovered={isNavHovered}
                isDark={isDark}
                currentPage={currentPage}
                isMainPage={isMainPage}
                lastHoveredMenuId={lastHoveredMenuId}
                onMenuHover={handleMenuHover}
                onMenuLeave={handleMenuLeave}
              />
              <UtilityIcons
                menus={menus}
                iconColor={iconColor}
                onSitemapOpen={() => setIsSitemapDrawerOpen(true)}
              />
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* 통합된 확장 영역 */}
      <Box
        position="fixed"
        top={(isPreview ? 50 : 0) + parseInt(headerHeight || "70")}
        left={0}
        right={0}
        zIndex={2}
        height="190px"
        transform={isNavHovered ? "translateY(0)" : "translateY(-20px)"}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        opacity={isNavHovered ? 1 : 0}
        visibility={isNavHovered ? "visible" : "hidden"}
        bg={isDark ? "rgba(26, 32, 44, 0.95)" : "rgba(255, 255, 255, 0.95)"}
        bgImage="url('/images/header/header_bg.png')"
        bgSize="cover"
        bgRepeat="no-repeat"
        backgroundPosition="center"
        backdropFilter="blur(30px)"
        pointerEvents={isNavHovered ? "auto" : "none"}
        overflow="hidden"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
      />
      <SitemapDrawer
        isOpen={isSitemapDrawerOpen}
        onClose={() => setIsSitemapDrawerOpen(false)}
        menusWithLastFlag={menusWithLastFlag}
        isMenuActive={isMenuActive}
        isDark={isDark}
        width={logoWidth}
        height={logoHeight}
      />
    </>
  );
});
