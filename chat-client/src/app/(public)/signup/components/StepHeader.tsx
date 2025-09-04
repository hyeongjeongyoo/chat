"use client";

import { VStack, Heading, Center, Progress, Box } from "@chakra-ui/react";
import { StepIndicator } from "./StepIndicator";

interface StepHeaderProps {
  title: string;
  currentStep: number; // e.g., 1, 2, or 3 for the step number
  totalSteps: number; // e.g., MAIN_FLOW_STEPS (3)
  currentProgressValue: number; // e.g., currentStep state from parent page (1, 2, or 3)
}

export const StepHeader = ({
  title,
  currentStep,
  totalSteps,
  currentProgressValue,
}: StepHeaderProps) => {
  return (
    <VStack gap={4} align="stretch" w="full" mb={6}>
      {" "}
      {/* Added mb for spacing below header */}
      <Heading size="xl" textAlign="center">
        {title}
      </Heading>
      <Center>
        <VStack gap={3} w="full" align="center">
          <StepIndicator current={currentStep} total={totalSteps} />
          <Box w="80%">
            {" "}
            {/* Wrapper for Progress to control its width if StepIndicator is wider */}
            <Progress.Root
              value={currentProgressValue}
              max={totalSteps}
              size="sm"
              borderRadius="md"

              // Removed hasStripe and isAnimated as they are not direct props of Progress.Root in this v3 setup
              // The animation of the bar filling up is typically handled by CSS transitions on Progress.Range
            >
              <Progress.Track borderRadius="md">
                {/* The Progress.Range typically animates its width change via CSS */}
                <Progress.Range colorPalette="blue" />
              </Progress.Track>
            </Progress.Root>
          </Box>
        </VStack>
      </Center>
    </VStack>
  );
};
