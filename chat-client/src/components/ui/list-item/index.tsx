import { useRef } from "react";
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useDrag } from "react-dnd";
import React from "react";

export interface ListItemProps {
  id: number;
  name: React.ReactNode;
  icon: React.ReactElement;
  isSelected?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
  renderBadges?: () => React.ReactNode;
  renderDetails?: () => React.ReactNode;
  onClick?: () => void;
  index?: number;
  level?: number;
  type?: "LINK" | "FOLDER" | "BOARD" | "CONTENT" | "MAIN" | "SUB";
  isDragging?: boolean;
}

export function ListItem({
  id,
  name,
  icon,
  isSelected,
  onAdd,
  onDelete,
  renderBadges,
  renderDetails,
  onClick,
  index,
  level,
  type,
}: ListItemProps) {
  const colors = useColors();
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const selectedBg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  const [{ isDragging }, drag] = useDrag({
    type: "LIST_ITEM",
    item: { id, index, level },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag}
      onClick={onClick}
      bg={isSelected ? selectedBg : "transparent"}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      borderRadius="md"
      p={2}
      opacity={isDragging ? 0.5 : 1}
      cursor="grab"
    >
      <Flex align="center" gap={2}>
        {icon}
        <Text
          color={textColor}
          flex={1}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {name}
        </Text>
        {renderBadges && renderBadges()}
        {onAdd && (
          <IconButton
            aria-label="Add"
            size="sm"
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <FiPlus />
          </IconButton>
        )}
        {onDelete && (
          <IconButton
            aria-label="Delete"
            size="sm"
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <FiTrash2 />
          </IconButton>
        )}
      </Flex>
      {renderDetails && renderDetails()}
    </Box>
  );
}
