import React, { useState } from "react";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { Template, TemplateBlock } from "@/types/api";
import { useColors } from "@/styles/theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LayoutGrid } from "./LayoutGrid";
import { PlusIcon } from "lucide-react";

interface TemplateLayoutEditorProps {
  template: Template | null;
  isLoading: boolean;
  onLayoutChange: (layout: TemplateBlock[]) => void;
}

const CONTENT_TYPES = [
  { type: "HEADER", name: "헤더", width: 12, height: 1 },
  { type: "FOOTER", name: "푸터", width: 12, height: 1 },
  { type: "SIDEBAR", name: "사이드바", width: 3, height: 10 },
  { type: "CONTENT", name: "컨텐츠", width: 9, height: 10 },
  { type: "BANNER", name: "배너", width: 12, height: 2 },
  { type: "WIDGET", name: "위젯", width: 4, height: 4 },
];

export function TemplateLayoutEditor({
  template,
  isLoading,
  onLayoutChange,
}: TemplateLayoutEditorProps) {
  const [layout, setLayout] = useState<TemplateBlock[]>(template?.layout || []);
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();

  const handleAddContentArea = (
    contentType: (typeof CONTENT_TYPES)[number]
  ) => {
    const newBlock: TemplateBlock = {
      id: `block-${Date.now()}`,
      name: contentType.name,
      type: contentType.type,
      x: 0,
      y: 0,
      width: contentType.width,
      height: contentType.height,
    };

    const updatedLayout = [...layout, newBlock];
    setLayout(updatedLayout);
    onLayoutChange(updatedLayout);
    setIsOpen(false);
  };

  const handleLayoutChange = (newLayout: TemplateBlock[]) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>로딩 중...</Text>
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
    <VStack align="stretch" gap={4} p={4}>
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          레이아웃 편집
        </Text>
        <Box position="relative">
          <Button
            colorPalette="blue"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <PlusIcon size={16} />
            영역 추가
          </Button>
          {isOpen && (
            <Box
              position="absolute"
              top="100%"
              right={0}
              mt={2}
              bg="white"
              boxShadow="md"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              zIndex={1}
            >
              {CONTENT_TYPES.map((type) => (
                <Box
                  key={type.type}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => handleAddContentArea(type)}
                >
                  {type.name}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Flex>
      <Box position="relative" minH="600px">
        <DndProvider backend={HTML5Backend}>
          <LayoutGrid layout={layout} onLayoutChange={handleLayoutChange} />
        </DndProvider>
      </Box>
    </VStack>
  );
}
