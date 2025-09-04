"use client";

import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  Textarea,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ContentBlock, ContentBlockHistory } from "@/types/api/content";
import dayjs from "dayjs";
import { LuUndo2 } from "react-icons/lu";

interface TextEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  block: ContentBlock | null;
  history: ContentBlockHistory[];
  onRestore: (historyId: number) => void;
}

export function TextEditDialog({
  open,
  onClose,
  onSave,
  block,
  history,
  onRestore,
}: TextEditDialogProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open && block) {
      setContent(block.content || "");
    }
  }, [open, block]);

  const handleSave = () => {
    onSave(content);
  };

  if (!block) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>텍스트 블록 수정</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                rows={10}
              />
              <Box h="1px" bg="gray.200" my={4} />
              <Box>
                <Text fontWeight="bold" mb={2}>
                  변경 이력
                </Text>
                <Box maxH="200px" overflowY="auto" p={1}>
                  <VStack align="stretch" gap={2}>
                    {history.length > 0 ? (
                      history.map((h) => (
                        <HStack
                          key={h.id}
                          justify="space-between"
                          p={2}
                          bg="gray.50"
                          _dark={{ bg: "gray.700" }}
                          borderRadius="md"
                        >
                          <Box>
                            <Text fontSize="sm">
                              {dayjs(h.createdDate).format(
                                "YYYY-MM-DD HH:mm:ss"
                              )}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.400" }}
                              mt={1}
                              whiteSpace="pre-wrap"
                            >
                              {h.content}
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              수정자: {h.createdBy}
                            </Text>
                          </Box>
                          <Button
                            size="xs"
                            colorPalette="blue"
                            variant="subtle"
                            onClick={() => onRestore(h.id)}
                          >
                            <LuUndo2 />
                          </Button>
                        </HStack>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        변경 이력이 없습니다.
                      </Text>
                    )}
                  </VStack>
                </Box>
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                취소
              </Button>
              <Button colorPalette="blue" onClick={handleSave}>
                저장
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
