"use client";

import {
  Flex,
  IconButton,
  Menu,
  Portal,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { Grid3x3, Search, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";
import { SearchDialog } from "@/components/common/SearchDialog";
import { Menu as MenuType } from "@/types/api";

interface UtilityIconsProps {
  iconColor: string;
  onSitemapOpen: () => void;
  menus?: MenuType[];
}

export const UtilityIcons = ({
  iconColor,
  onSitemapOpen,
  menus,
}: UtilityIconsProps) => {
  const router = useRouter();
  const { isAuthenticated } = useRecoilValue(authState);
  const { logout } = useAuthActions();
  const {
    open: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure();

  const handleLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleSignup = useCallback(() => {
    router.push("/signup"); // Assuming /signup is your registration page
  }, [router]);

  const handleMypage = useCallback(() => {
    router.push("/mypage");
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      // logout() already handles error cases and cleans up local state
    }
  }, [logout]);

  return (
    <Flex
      alignItems="center"
      gap={{ base: 2, md: 3 }}
      display="flex"
      zIndex={1001}
    >
      <Box display={{ base: "none", sm: "block" }}>
        <Image
          src="/images/logo/부산도시공사_logo.png"
          width={120}
          height={40}
          alt="부산도시공사 로고"
          style={{ cursor: "pointer" }}
          onClick={() => window.open("https://www.bmc.busan.kr/", "_blank")}
        />
      </Box>

      {/* User Menu */}
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="User Menu"
            variant="ghost"
            color={iconColor}
            size="sm"
            borderRadius="full"
            display={{ base: "none", sm: "flex" }}
          >
            <User2Icon />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {isAuthenticated ? (
                <>
                  <Menu.Item
                    value="mypage"
                    onClick={handleMypage}
                    alignItems="center"
                    justifyContent="center"
                  >
                    마이페이지
                  </Menu.Item>
                  <Menu.Item
                    value="logout"
                    onClick={handleLogout}
                    alignItems="center"
                    justifyContent="center"
                  >
                    로그아웃
                  </Menu.Item>
                </>
              ) : (
                <>
                  <Menu.Item
                    value="login"
                    onClick={handleLogin}
                    alignItems="center"
                    justifyContent="center"
                  >
                    로그인
                  </Menu.Item>
                  <Menu.Item
                    value="signup"
                    onClick={handleSignup}
                    alignItems="center"
                    justifyContent="center"
                  >
                    회원가입
                  </Menu.Item>
                </>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <IconButton
        aria-label="Search"
        variant="ghost"
        color={iconColor}
        size="sm"
        borderRadius="full"
        display={{ base: "none", sm: "flex" }}
        onClick={onSearchOpen}
      >
        <Search />
      </IconButton>
      <IconButton
        aria-label="Sitemap"
        variant="ghost"
        color={iconColor}
        size="sm"
        borderRadius="full"
        onClick={onSitemapOpen}
      >
        <Grid3x3 />
      </IconButton>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={onSearchClose}
        menus={menus}
      />
    </Flex>
  );
};
