import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  IconButton,
  Input,
  Portal,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { VisionSection } from "../../types";
import LexicalEditor from "./LexicalEditor";
import { createListCollection } from "@chakra-ui/react";

interface SectionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  section: VisionSection | null;
  onSave: (section: VisionSection) => void;
}

export function SectionEditDialog({
  isOpen,
  onClose,
  section,
  onSave,
}: SectionEditDialogProps) {
  const handleSave = () => {
    if (section) {
      onSave(section);
      onClose();
    }
  };

  const handleAddItem = () => {
    if (section) {
      onSave({
        ...section,
        items: [...(section.items || []), ""],
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (section) {
      onSave({
        ...section,
        items: section.items?.filter((_, idx) => idx !== index),
      });
    }
  };

  const handleUpdateItem = (index: number, value: string) => {
    if (section) {
      onSave({
        ...section,
        items: section.items?.map((item, idx) =>
          idx === index ? value : item
        ),
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>섹션 편집</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2}>제목</Text>
                  <Input
                    value={section?.title || ""}
                    onChange={(e) =>
                      section && onSave({ ...section, title: e.target.value })
                    }
                  />
                </Box>
                <Box>
                  <Select.Root
                    variant="outline"
                    collection={createListCollection({
                      items: [
                        { value: "text", label: "텍스트" },
                        { value: "quote", label: "인용구" },
                        { value: "list", label: "목록" },
                      ],
                    })}
                  >
                    <Select.HiddenSelect />
                    <Select.Label>유형</Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select type" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {[
                            { value: "text", label: "텍스트" },
                            { value: "quote", label: "인용구" },
                            { value: "list", label: "목록" },
                          ].map((type) => (
                            <Select.Item item={type} key={type.value}>
                              {type.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>
                <Box>
                  <Text mb={2}>내용</Text>
                  <LexicalEditor
                    value={section?.content || ""}
                    onChange={(value) =>
                      section && onSave({ ...section, content: value })
                    }
                  />
                </Box>
                {section?.type === "list" && (
                  <Box>
                    <Text mb={2}>목록 항목</Text>
                    <VStack gap={2} align="stretch">
                      {section.items?.map((item, index) => (
                        <HStack key={index}>
                          <Input
                            value={item}
                            onChange={(e) =>
                              handleUpdateItem(index, e.target.value)
                            }
                          />
                          <IconButton
                            aria-label="항목 삭제"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <LuTrash2 />
                          </IconButton>
                        </HStack>
                      ))}
                      <Button onClick={handleAddItem}>
                        <LuPlus />
                        항목 추가
                      </Button>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="blue" onClick={handleSave}>
                저장
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
