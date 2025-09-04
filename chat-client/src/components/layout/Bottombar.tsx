"use client";

import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItems } from "./MenuItems";
import { Tooltip } from "@/components/ui/tooltip";
import { useColors } from "@/styles/theme";

export function Bottombar() {
  const currentPath = usePathname();
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // 홈페이지 스타일에 맞는 색상 적용
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const bg = useColorModeValue("white", "rgba(15, 23, 42, 0.95)");

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      borderTop="1px solid"
      borderColor={borderColor}
      bg={bg}
      display={{ base: "block", md: "none" }}
      zIndex={1000}
      h="56px"
      backdropFilter="blur(8px)"
      boxShadow={colors.shadow.sm}
    >
      <Flex justify="space-around" py={1}>
        {MenuItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <Tooltip
              content={item.label}
              positioning={{ placement: "top" }}
              openDelay={50}
              closeDelay={200}
              contentProps={{
                css: {
                  width: "80px",
                  textAlign: "center",
                  height: "24px",
                  alignItems: "center",
                  lineHeight: "16px",
                  fontSize: "12px",
                  bg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                },
              }}
            >
              <IconButton
                variant="ghost"
                aria-label={item.path}
                as={item.icon}
                bg="transparent"
                color={
                  currentPath === item.path
                    ? isDark
                      ? "whiteAlpha.900"
                      : colors.gradient.primary
                    : isDark
                    ? "whiteAlpha.600"
                    : colors.gradient.primary
                }
                _hover={{
                  bg: isDark ? "whiteAlpha.200" : "gray.100",
                  color: isDark ? "white" : colors.gradient.primary,
                }}
                _active={{
                  bg: isDark ? "whiteAlpha.200" : "gray.100",
                  color: isDark ? "whiteAlpha.900" : colors.gradient.primary,
                }}
                size="sm"
                p={1}
              />
            </Tooltip>
          </Link>
        ))}
      </Flex>
    </Box>
  );
}
