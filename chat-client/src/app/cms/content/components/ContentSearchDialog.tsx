"use client";

import { useState } from "react";
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  Input,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { ContentBlock } from "@/types/api/content";

interface ContentSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (blockId: number) => void;
  blocks: ContentBlock[];
}

export function ContentSearchDialog({
  open,
  onClose,
  onSelect,
  blocks,
}: ContentSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlocks = blocks.filter(
    (block) =>
      block.content &&
      block.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (blockId: number) => {
    onSelect(blockId);
  };

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
              <Dialog.Title>콘텐츠 블록 검색</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Input
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mb={4}
              />
              <Box maxH="400px" overflowY="auto">
                <VStack gap={2} align="stretch">
                  {filteredBlocks.map((block) => (
                    <Box
                      key={block.id}
                      onClick={() => handleSelect(block.id)}
                      p={2}
                      _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                      cursor="pointer"
                      borderRadius="md"
                    >
                      <Text>
                        <Text as="span" fontWeight="bold" mr={2}>
                          [{block.type}]
                        </Text>
                        {block.content || "(내용 없음)"}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost">닫기</Button>
              </Dialog.CloseTrigger>
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
