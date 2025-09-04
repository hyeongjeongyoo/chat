"use client";

import { useEstimateContext } from "@/contexts/EstimateContext";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";

const steps = [
  { id: 1, name: "서비스 선택" },
  { id: 2, name: "날짜 선택" },
  { id: 3, name: "항목 선택" },
];

export const StepperIndicator = () => {
  const { step } = useEstimateContext();

  return (
    <HStack justify="center" mb={12} gap={4}>
      {steps.map((s, index) => (
        <React.Fragment key={s.id}>
          <VStack>
            <Flex
              w={10}
              h={10}
              rounded="full"
              align="center"
              justify="center"
              position="relative"
              bg={step >= s.id ? "#2E3192" : "gray.200"}
              color={step >= s.id ? "white" : "gray.500"}
              transition="background-color 0.3s"
            >
              {s.id}
            </Flex>
            <Text
              fontSize="sm"
              fontWeight={step === s.id ? "bold" : "normal"}
              color={step === s.id ? "#2E3192" : "gray.500"}
            >
              {s.name}
            </Text>
          </VStack>
          {index < steps.length - 1 && (
            <Box
              flex={1}
              h="2px"
              bg={step > s.id ? "#2E3192" : "gray.200"}
              transition="background-color 0.3s"
              mx={-2}
              mb={7}
            />
          )}
        </React.Fragment>
      ))}
    </HStack>
  );
};
