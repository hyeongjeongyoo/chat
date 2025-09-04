"use client";

import {
  Box,
  VStack,
  Text,
  Checkbox,
  Separator,
  Textarea,
} from "@chakra-ui/react";
import { AgreementItem } from "./AgreementItem";
import { StepHeader } from "./StepHeader";
import React from "react";

// Define Agreement type locally as it's a prop for Step1Terms
interface Agreement {
  id: string;
  label: string;
  isRequired: boolean;
  isChecked: boolean;
  details?: string;
}

interface Step1TermsProps {
  onMasterAgree: (agreed: boolean) => void;
  allAgreed: boolean;
  agreements: Agreement[];
  onAgreementChange: (id: string, isChecked: boolean) => void;
  mainFlowSteps: number;
  currentProgressValue: number;
}

const renderDetails = (details: string) => {
  // First handle red tags, then bold tags
  const processText = (text: string) => {
    const redParts = text.split(/<red>(.*?)<\/red>/g);
    return redParts.map((redPart, redIndex) => {
      if (redIndex % 2 === 1) {
        // This is content inside red tags
        return (
          <Text as="span" color="red.500" key={`red-${redIndex}`}>
            {redPart}
          </Text>
        );
      } else {
        // This is regular text, check for bold tags
        const boldParts = redPart.split(/<bold>(.*?)<\/bold>/g);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldIndex % 2 === 1) {
            // This is content inside bold tags
            return (
              <Text
                as="span"
                fontWeight="bold"
                key={`bold-${redIndex}-${boldIndex}`}
              >
                {boldPart}
              </Text>
            );
          } else {
            // Regular text - handle line breaks
            return boldPart.split("\n").map((line, lineIndex) => (
              <React.Fragment
                key={`line-${redIndex}-${boldIndex}-${lineIndex}`}
              >
                {line}
                {lineIndex < boldPart.split("\n").length - 1 && <br />}
              </React.Fragment>
            ));
          }
        });
      }
    });
  };

  return processText(details);
};

export const Step1Terms = ({
  onMasterAgree,
  allAgreed,
  agreements,
  onAgreementChange,
  mainFlowSteps,
  currentProgressValue,
}: Step1TermsProps) => (
  <VStack gap={4} align="stretch" w="full">
    <StepHeader
      title="개인정보동의서"
      currentStep={1}
      totalSteps={mainFlowSteps}
      currentProgressValue={currentProgressValue}
    />
    <Checkbox.Root
      checked={allAgreed}
      onChange={(e: any) => onMasterAgree(e.target.checked)}
      variant="subtle"
      colorPalette="orange"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control mr={2} />
      <Checkbox.Label fontWeight="bold" fontSize="lg">
        아래의 사항에 대해 전체 동의합니다.
      </Checkbox.Label>
    </Checkbox.Root>
    <Separator my={4} />
    {agreements.map((agreement) => (
      <AgreementItem
        key={agreement.id}
        title={agreement.label}
        isRequired={agreement.isRequired}
        isChecked={agreement.isChecked}
        onChange={(isChecked: boolean) =>
          onAgreementChange(agreement.id, isChecked)
        }
      >
        {agreement.details && (
          <Box
            border="1px solid"
            borderColor="gray.200"
            p={3}
            borderRadius="md"
            mt={2}
            fontSize="sm"
            h="120px"
            w="full"
            overflowY="auto"
            bg="gray.50"
            whiteSpace="pre-wrap"
          >
            {renderDetails(agreement.details)}
          </Box>
        )}
      </AgreementItem>
    ))}
  </VStack>
);
