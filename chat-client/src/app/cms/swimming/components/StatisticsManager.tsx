"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { StatisticsTab } from "./tabs/StatisticsTab";

export const StatisticsManager: React.FC = () => {
  return (
    <Box position="relative" h="full">
      <StatisticsTab />
    </Box>
  );
};
