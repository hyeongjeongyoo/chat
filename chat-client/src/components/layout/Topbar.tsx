"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

import { Avatar } from "@/components/layout/Avatar";
import { useColors } from "@/styles/theme";

export function Topbar({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const colors = useColors();

  // 홈페이지 스타일에 맞는 색상 적용
  const borderColor = useColorModeValue(colors.border, "whiteAlpha.200");
  const bg = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(15, 23, 42, 0.95)"
  );
  const textColor = useColorModeValue(colors.text.primary, "white");

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={bg}
      display={{ base: "block", md: "none" }}
      h="56px"
      w="100%"
      color={textColor}
      zIndex={1000}
      backdropFilter="blur(8px)"
      boxShadow={colors.shadow.sm}
    >
      <Flex justify="space-between" align="center" px={4} py={2}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          bgGradient={colors.gradient.primary}
          bgClip="text"
        >
          Handy
        </Text>
        <Flex gap={3} align="center">
          <Avatar isSidebarOpen={isSidebarOpen} />
        </Flex>
      </Flex>
    </Box>
  );
}
