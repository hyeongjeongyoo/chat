"use client";

import { Box } from "@chakra-ui/react";

export const StepIndicator = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <Box
    border="1px solid"
    borderColor="blue.500"
    color="blue.500"
    borderRadius="full"
    px={3}
    py={1}
    fontSize="sm"
    fontWeight="bold"
    display="inline-block"
    mb={4}
  >
    STEP {current}/{total}
  </Box>
);
