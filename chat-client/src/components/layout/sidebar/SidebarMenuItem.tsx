"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { useColors } from "@/styles/theme";
import { IconType } from "react-icons";

interface SidebarMenuItemProps {
  isSidebarOpen: boolean;
  item: {
    path: string;
    label: string;
    icon: IconType;
  };
  activePath: string;
}

export function SidebarMenuItem({
  isSidebarOpen,
  item,
  activePath,
}: SidebarMenuItemProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Link
      href={item.path}
      style={{
        textDecoration: "none",
        transition: "all 0.2s ease-in-out",
      }}
      passHref
    >
      <Tooltip
        content={isSidebarOpen ? "" : item.label}
        disabled={isSidebarOpen}
        positioning={{ placement: "right" }}
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
        <Button
          variant="ghost"
          h="10"
          mb="2"
          w={isSidebarOpen ? "full" : "0"}
          display="flex"
          alignItems="center"
          justifyContent="start"
          overflow="hidden"
          textAlign="left"
          borderRadius="4px"
          ml="-9px"
          p="9px"
          bg="transparent"
          transition="all 0.2s ease-in-out"
          color={isDark ? colors.gradient.primary : "gray.700"}
          _hover={{
            bg:
              activePath === item.path
                ? isDark
                  ? "whiteAlpha.200"
                  : "gray.100"
                : "transparent",
            color:
              activePath === item.path
                ? colors.gradient.primary
                : isDark
                ? "white"
                : "gray.700",
          }}
          _active={{
            bg:
              activePath === item.path
                ? isDark
                  ? "whiteAlpha.200"
                  : "gray.100"
                : "transparent",
            color:
              activePath === item.path
                ? isDark
                  ? "whiteAlpha.900"
                  : colors.gradient.primary
                : isDark
                ? "white"
                : colors.gradient.primary,
          }}
          css={{
            "&[data-active='true']": {
              bg: isDark ? "whiteAlpha.200" : "gray.100",
              color: isDark ? "whiteAlpha.900" : colors.gradient.primary,
            },
          }}
          data-active={activePath === item.path}
        >
          <Box as={item.icon} color="inherit" />
          <Text
            fontSize="14px"
            h="5"
            overflow="hidden"
            opacity={isSidebarOpen ? 1 : 0}
            w={isSidebarOpen ? "80px" : "0"}
            color="inherit"
          >
            {item.label}
          </Text>
        </Button>
      </Tooltip>
    </Link>
  );
}
