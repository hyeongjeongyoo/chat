"use client";

import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useColors } from "@/styles/theme";

interface SidebarToggleProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isSidebarOpen, onToggle }: SidebarToggleProps) {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Flex
      position="absolute"
      h="36px"
      top="68px"
      right="0"
      borderY="1px solid"
      borderLeft="1px solid"
      borderColor={borderColor}
      borderRadius="10px 0 0 10px"
      w={isSidebarOpen ? "132px" : "24px"}
      transition="all 0.2s ease-in-out"
      justifyContent="right"
      alignItems="center"
      overflow="hidden"
      cursor="pointer"
      onClick={onToggle}
      bg={isDark ? "blackAlpha.50" : "whiteAlpha.50"}
      _hover={{
        borderColor: colors.primary.alpha,
      }}
    >
      <Text
        color={textColor}
        fontSize="10px"
        h="32px"
        transition="all 0.2s ease-in-out"
        textAlign="center"
        w="full"
      >
        Handy Content Management System
      </Text>
      <IconButton
        w="10px"
        h="36px"
        size="2xs"
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        variant="ghost"
        bg={isDark ? "whiteAlpha.50" : "white"}
        color={isDark ? "white" : "gray.700"}
        textAlign="right"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderWidth="0 0 0 1px"
        borderRadius="0"
        borderColor={borderColor}
      >
        <Box
          as={isSidebarOpen ? LuChevronLeft : LuChevronRight}
          fontSize="14px"
          bgClip="text"
          color={colors.gradient.primary}
        />
      </IconButton>
    </Flex>
  );
}
