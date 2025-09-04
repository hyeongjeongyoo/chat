"use client";

import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";
import { AuthGuard } from "@/components/auth/AuthGuard";

export function CMSLayoutClient({ children }: { children: React.ReactNode }) {
  const colors = useColors();

  return (
    <AuthGuard allowedRoles={["ADMIN", "SYSTEM_ADMIN"]} redirectTo="/cms/login">
      <Box
        minH="100vh"
        bg={colors.bg}
        color={colors.text.primary}
        transition="background-color 0.2s"
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </Box>
    </AuthGuard>
  );
}
