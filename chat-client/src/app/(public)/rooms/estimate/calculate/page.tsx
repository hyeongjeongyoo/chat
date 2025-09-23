"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Box, Flex } from "@chakra-ui/react";
import {
  EstimateProvider,
  useEstimateContext,
} from "@/contexts/EstimateContext";
// import { EstimateStepper } from "@/components/rooms/estimate/EstimateStepper"; // 컴포넌트 누락으로 임시 주석처리

const EstimateView = () => {
  return (
    <Flex align="flex-start">
      <Box flex="1" m={0}>
        {/* <EstimateStepper /> 컴포넌트 누락으로 임시 주석처리 */}
        <Box p={4}>견적 계산 페이지</Box>
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
