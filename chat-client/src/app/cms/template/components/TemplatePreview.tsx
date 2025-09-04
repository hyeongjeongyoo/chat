import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Template } from "@/types/api";
import { useColors } from "@/styles/theme";

interface TemplatePreviewProps {
  template: Template | null;
  isLoading: boolean;
}

export function TemplatePreview({ template, isLoading }: TemplatePreviewProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton height="200px" />
      </Box>
    );
  }

  if (!template) {
    return (
      <Box p={4}>
        <Text color={colors.text.secondary}>템플릿을 선택해주세요</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack align="start" gap={4}>
        <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
          {template.templateName}
        </Text>
        <Text color={colors.text.secondary}>{template.description}</Text>
        <Box
          border="1px solid"
          borderColor={colors.border}
          borderRadius="md"
          p={4}
          w="full"
        >
          <Text color={colors.text.secondary}>템플릿 미리보기</Text>
        </Box>
      </VStack>
    </Box>
  );
}
