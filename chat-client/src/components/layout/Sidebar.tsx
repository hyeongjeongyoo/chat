"use client";

import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Avatar } from "@/components/layout/Avatar";
import { usePathname } from "next/navigation";
import { MenuItems } from "./MenuItems";
import { useColors } from "@/styles/theme";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarToggle } from "./sidebar/SidebarToggle";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";

interface SidebarProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isSidebarOpen, onToggle }: SidebarProps) {
  const currentPath = usePathname();
  const [activePath, setActivePath] = useState("");
  const colors = useColors();

  // 홈페이지 스타일에 맞는 색상 적용
  const sidebarBg = useColorModeValue("white", "rgba(15, 23, 42, 0.95)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  useEffect(() => {
    setActivePath(currentPath || "");
  }, [currentPath]);

  return (
    <Box
      as="aside"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w={isSidebarOpen ? "36" : "16"}
      borderRightWidth="1px"
      borderColor={borderColor}
      bg={sidebarBg}
      py="4"
      pl="5"
      display={{ base: "none", md: "block" }}
      transition="all 0.2s ease-in-out"
      overflow="hidden"
      backdropFilter="blur(8px)"
      boxShadow={colors.shadow.sm}
      zIndex="1000"
    >
      <SidebarHeader isSidebarOpen={isSidebarOpen} />
      <SidebarToggle isSidebarOpen={isSidebarOpen} onToggle={onToggle} />

      <Box>
        <Box mt="16">
          {MenuItems.map((item, index) => (
            <SidebarMenuItem
              key={index}
              isSidebarOpen={isSidebarOpen}
              item={item}
              activePath={activePath}
            />
          ))}
        </Box>

        <Box position="absolute" bottom="8" left="2" right="0" px="3">
          <Flex
            align="center"
            justify={isSidebarOpen ? "space-between" : "center"}
            width="full"
          >
            <Avatar isSidebarOpen={isSidebarOpen} gradientBorder={true} />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
