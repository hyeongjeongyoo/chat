"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Box, Flex } from "@chakra-ui/react";
import {
  EstimateProvider,
  useEstimateContext,
} from "@/contexts/EstimateContext";
import { EstimateStepper } from "@/components/rooms/estimate/EstimateStepper";

const EstimateView = () => {
  return (
    <Flex align="flex-start">
      <Box flex="1" m={0}>
        <EstimateStepper />
      </Box>
    </Flex>
  );
};

export default function EstimatePage() {
  return (
    <PageContainer>
      <EstimateProvider>
        <EstimateView />
      </EstimateProvider>
    </PageContainer>
  );
}
