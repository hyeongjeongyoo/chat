"use client";

import React, { useState } from "react";
import { useEstimateContext } from "@/contexts/EstimateContext";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { EstimateCart } from "./EstimateCart";
import { StepperIndicator } from "./steps/StepperIndicator";
import { ServiceSelectionStep } from "./steps/ServiceSelectionStep";
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { ItemSelectionStep } from "./steps/ItemSelectionStep";

const MotionBox = motion(Box);

export const EstimateStepper = () => {
  const { step, setStep } = useEstimateContext();
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    setStep(step + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ServiceSelectionStep handleNext={handleNext} />;
      case 2:
        return (
          <DateSelectionStep handleNext={handleNext} handlePrev={handlePrev} />
        );
      case 3:
        return <ItemSelectionStep />;
      default:
        return <Text>알 수 없는 단계</Text>;
    }
  };

  return (
    <Box>
      <StepperIndicator />
      <HStack align="flex-start" gap={8}>
        <Flex flex="1" overflow="hidden" position="relative">
          <AnimatePresence mode="wait">
            <MotionBox
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              width="100%"
            >
              {renderStep()}
            </MotionBox>
          </AnimatePresence>
        </Flex>

        {step >= 3 && <EstimateCart handlePrev={handlePrev} />}
      </HStack>
    </Box>
  );
};
