"use client";

import React from "react";
import { Box, VStack, Text, Flex, Badge } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { BoardMaster, Menu } from "@/types/api";
import { FiFileText } from "react-icons/fi";
import { useColorModeValue } from "@/components/ui/color-mode";

interface BoardListProps {
  boardMenus: Menu[];
  boards: BoardMaster[];
  onAddBoard: () => void;
  onEditBoard: (boardMenu: Menu, board: BoardMaster | null) => void;
  onDeleteBoard: (boardId: number) => void;
  isLoading: boolean;
  selectedBoardMenuId?: number;
  loadingBoardId: number | null;
}

const BoardList = React.memo(function BoardList({
  boardMenus,
  boards,
  onAddBoard,
  onEditBoard,
  onDeleteBoard,
  isLoading,
  selectedBoardMenuId,
  loadingBoardId,
}: BoardListProps) {
  const colors = useColors();
  const hoverBg = useColorModeValue(colors.bg, colors.darkBg);

  const selectedBorderColor = colors.primary.default;
  const textColor = colors.text.primary;
  const secondaryTextColor = colors.text.secondary;

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  return (
    <VStack gap={1} align="stretch">
      {boardMenus.length === 0 ? (
        <Text color={secondaryTextColor} textAlign="center" py={4}>
          등록된 게시판이 없습니다.
        </Text>
      ) : (
        boardMenus.map((boardMenu) => {
          const linkedBoard = boards.find(
            (board) => board.bbsId === boardMenu.targetId
          );
          const boardType = linkedBoard?.skinType;
          return (
            <Flex
              key={boardMenu.id}
              pl={2}
              py={1.5}
              px={2}
              alignItems="center"
              cursor="pointer"
              bg={
                selectedBoardMenuId === boardMenu.id ? colors.bg : "transparent"
              }
              borderLeft={
                selectedBoardMenuId === boardMenu.id ? "3px solid" : "none"
              }
              borderColor={
                selectedBoardMenuId === boardMenu.id
                  ? selectedBorderColor
                  : "transparent"
              }
              _hover={{
                bg: hoverBg,
                transform: "translateX(2px)",
                boxShadow: "sm",
                backdropFilter: "blur(4px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "& .board-icon": {
                  opacity: 1,
                  transform: "scale(1.1)",
                },
              }}
              transition="all 0.2s ease-out"
              borderRadius="md"
              position="relative"
              role="group"
              mb={1}
              mr={1}
              onClick={() => {
                const selectedBoard = boards.find(
                  (board) => board.bbsId === boardMenu.targetId
                );
                onEditBoard(boardMenu, selectedBoard ?? null);
              }}
            >
              <Box
                width="24px"
                mr={2}
                textAlign="center"
                className="board-icon"
                style={{ cursor: "pointer" }}
              >
                <Flex
                  width="24px"
                  height="24px"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiFileText
                    size={14}
                    style={{ color: colors.primary.default, opacity: 0.7 }}
                  />
                </Flex>
              </Box>
              <Flex flex="1" justifyContent="space-between">
                <Flex gap={2} alignItems="center">
                  <Text fontWeight="medium" color={textColor}>
                    {boardMenu.name}
                  </Text>
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {boardMenu.url}
                  </Text>
                </Flex>

                {boardType && (
                  <Badge colorPalette="blue" fontSize="xs" ml={1}>
                    {boardType}
                  </Badge>
                )}
              </Flex>
            </Flex>
          );
        })
      )}
    </VStack>
  );
});

export { BoardList };
