"use client";

import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
  Icon as ChakraIcon,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react"; // Standard Chakra UI Checkbox
import { ChevronDownIcon as LucideChevronDown } from "lucide-react"; // Keep lucide for Chevron if preferred
// import { CheckIcon as LucideCheckIcon } from "lucide-react"; // No longer needed

export const AgreementItem = ({
  title,
  isRequired,
  isChecked,
  onChange,
  children,
}: {
  title: string;
  isRequired: boolean;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  children?: React.ReactNode;
}) => (
  <VStack align="start" w="full" gap={1}>
    <Flex
      justify="space-between"
      align="center"
      w="full"
      // onClick={() => onChange(!isChecked)} // Checkbox itself will handle this
      cursor="pointer" // Keep if the whole row should feel clickable, though checkbox is the target
      py={2}
    >
      <HStack flexGrow={1} onClick={() => onChange(!isChecked)} gap={3}>
        {" "}
        {/* Make HStack clickable, adjust spacing */}
        <Checkbox.Root
          checked={isChecked}
          onChange={(e: any) => onChange(e.target.checked)} // Or simply onChange={onChange} if type matches
          variant="subtle"
          colorPalette="orange" // This will color the checkmark and box in orange theme
          size="md" // Adjust size as needed
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control
          // Custom styling for the control box if needed beyond colorPalette
          // e.g., borderColor={isChecked ? "orange.500" : "gray.300"}
          // The checkmark inside is usually handled by the colorPalette or default theme
          />
        </Checkbox.Root>
        <Text fontWeight="medium">
          {title}{" "}
          {isRequired && (
            <Text as="span" color="orange.500" fontWeight="bold">
              (필수)
            </Text>
          )}
        </Text>
      </HStack>
      <ChakraIcon as={LucideChevronDown} color="gray.400" boxSize={5} />
    </Flex>
    {children && (
      <Box pl={10} pb={2} fontSize="sm" w="full">
        {" "}
        {/* Adjusted padding to align with new checkbox */}
        {children}
      </Box>
    )}
  </VStack>
);
