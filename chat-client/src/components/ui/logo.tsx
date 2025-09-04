"use client";

import { Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  abbreviated?: boolean;
  isLogin?: boolean;
}

export function Logo({
  size = "md",
  abbreviated = false,
  isLogin = false,
}: LogoProps) {
  const colors = useColors();

  // 크기에 따른 폰트 사이즈 설정
  const fontSizes = {
    sm: abbreviated ? "28px" : "24px",
    md: abbreviated ? "34px" : "30px",
    lg: abbreviated ? "42px" : "36px",
    xl: abbreviated ? "56px" : "48px",
  };

  return (
    <Text
      fontSize={fontSizes[size]}
      fontWeight="black"
      transition="all 0.2s ease-in-out"
      bgGradient={colors.gradient.primary}
      bgClip="text"
      letterSpacing="tight"
      lineHeight="1"
    >
      {abbreviated ? "H" : isLogin ? "HANDY CMS" : "HANDY"}
    </Text>
  );
}
