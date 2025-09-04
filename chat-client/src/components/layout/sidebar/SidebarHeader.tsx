"use client";

import { Flex } from "@chakra-ui/react";
import { Logo } from "@/components/ui/logo";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
}

export function SidebarHeader({ isSidebarOpen }: SidebarHeaderProps) {
  return (
    <Flex alignItems="center" justifyContent="left" w="full" height="38px">
      <Logo size="md" abbreviated={!isSidebarOpen} />
    </Flex>
  );
}
