"use client";

import { Box, AspectRatio } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

export function CCTVGridSection() {
  const colors = useColors();

  return (
    <AspectRatio ratio={16 / 9} h="full">
      <Box
        bg="blue.900"
        borderRadius="xl"
        overflow="hidden"
        position="relative"
        boxShadow={colors.shadow.sm}
        transition="all 0.3s ease-in-out"
        _hover={{ boxShadow: colors.shadow.md }}
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          bg: "gray.500",
          opacity: 0.1,
        }}
      />
    </AspectRatio>
  );
}
