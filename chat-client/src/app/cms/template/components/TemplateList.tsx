"use client";

import {
  Box,
  Flex,
  Text,
  Spinner,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Template, TemplateListResponse } from "@/types/api";
import { ListItem } from "@/components/ui/list-item";
import { LuLayoutList, LuFileText } from "react-icons/lu";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { TemplateSkeleton } from "./TemplateSkeleton";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface TemplateListProps {
  templates: TemplateListResponse | undefined;
  onEditTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: number) => void;
  isLoading: boolean;
  selectedTemplateId: number | null;
  loadingTemplateId: number | null;
}

export function TemplateList({
  templates,
  onEditTemplate,
  onDeleteTemplate,
  isLoading,
  selectedTemplateId,
  loadingTemplateId,
}: TemplateListProps) {
  const colors = useColors();
  const iconColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );

  // API 응답에서 실제 템플릿 배열 추출
  const templateList = templates?.data?.content || [];

  const getTemplateIcon = (template: Template) => {
    const color = iconColor;

    switch (template.type) {
      case "MAIN":
        return (
          <Box color={color}>
            <LuLayoutList />
          </Box>
        );
      case "SUB":
        return (
          <Box color={color}>
            <LuFileText />
          </Box>
        );
      default:
        return (
          <Box color={color}>
            <LuFileText />
          </Box>
        );
    }
  };

  const renderTemplateItem = (template: Template) => {
    const isLoading = loadingTemplateId === template.id;
    const isDefaultTemplate = template.id === 1;

    return (
      <div key={template.id}>
        <Box cursor="pointer">
          <ListItem
            id={template.id}
            name={template.templateName}
            icon={isLoading ? <Spinner size="sm" /> : getTemplateIcon(template)}
            isSelected={template.id === selectedTemplateId}
            onDelete={
              !isDefaultTemplate && onDeleteTemplate
                ? () => onDeleteTemplate(template.id)
                : undefined
            }
            renderBadges={() => (
              <HStack gap={1}>
                {!template.published && (
                  <Badge colorPalette="gray" variant="subtle">
                    비공개
                  </Badge>
                )}
              </HStack>
            )}
            onClick={() => onEditTemplate(template)}
          />
        </Box>
      </div>
    );
  };

  if (isLoading) {
    return <TemplateSkeleton />;
  }

  if (!templateList || templateList.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">템플릿이 없습니다.</Text>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
        <VStack gap={1} align="stretch">
          {templateList.map((template) => renderTemplateItem(template))}
        </VStack>
      </Box>
    </DndProvider>
  );
}
