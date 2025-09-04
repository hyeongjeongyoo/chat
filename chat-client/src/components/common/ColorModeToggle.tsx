"use client";

import { IconButton } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useColorMode } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";

interface ColorModeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
}

export function ColorModeToggle({
  size = "md",
  variant = "icon",
}: ColorModeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const colors = useColors();
  const isDark = colorMode === "dark";

  return (
    <IconButton
      size={size}
      variant={variant === "icon" ? "ghost" : "solid"}
      bg={colors.cardBg}
      borderWidth={1}
      borderColor={colors.border}
      borderRadius="full"
      aria-label={isDark ? "다크 모드로 전환" : "라이트 모드로 전환"}
      onClick={toggleColorMode}
      color={isDark ? "#8b5cf6" : "#fbbf24"}
      boxShadow={colors.shadow.lg}
      transition="all 0.3s ease-in-out"
    >
      {isDark ? <LuMoon /> : <LuSun />}
    </IconButton>
  );
}
