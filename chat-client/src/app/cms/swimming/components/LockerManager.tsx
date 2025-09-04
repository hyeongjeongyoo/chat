"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { LockerInventoryTab } from "./tabs/LockerInventoryTab";

export const LockerManager: React.FC = () => {
  return (
    <Box position="relative" h="full">
      <LockerInventoryTab />
    </Box>
  );
};
