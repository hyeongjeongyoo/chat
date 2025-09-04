import { Box, Flex, Text, IconButton, VStack, HStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuPencil,
  LuTrash,
} from "react-icons/lu";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";

export interface TreeItem {
  id: number;
  name: string;
  type: string;
  url?: string;
  targetId?: number;
  displayPosition: string;
  visible: boolean;
  sortOrder: number;
  parentId?: number;
  children?: TreeItem[];
  createdAt: string;
  updatedAt: string;
}

interface TreeListProps {
  items: TreeItem[];
  onEdit?: (item: TreeItem) => void;
  onDelete?: (item: TreeItem) => void;
  renderBadges?: (item: TreeItem) => React.ReactNode;
  renderDetails?: (item: TreeItem) => React.ReactNode;
}

interface TreeItemProps {
  item: TreeItem;
  level: number;
  onEdit?: (item: TreeItem) => void;
  onDelete?: (item: TreeItem) => void;
  renderBadges?: (item: TreeItem) => React.ReactNode;
  renderDetails?: (item: TreeItem) => React.ReactNode;
}

function TreeListItem({
  item,
  level,
  onEdit,
  onDelete,
  renderBadges,
  renderDetails,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const colors = useColors();
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const borderColor = useColorModeValue(colors.border, colors.border);
  const hoverBg = useColorModeValue(
    "rgba(0, 0, 0, 0.02)",
    "rgba(255, 255, 255, 0.02)"
  );

  const hasChildren = item.children && item.children.length > 0;

  return (
    <Box>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        borderColor={borderColor}
        bg="transparent"
        position="relative"
        transition="all 0.2s ease"
        _hover={{
          bg: hoverBg,
          "& .action-buttons": {
            opacity: 1,
            transform: "translateX(0)",
          },
        }}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <HStack gap={2}>
            {hasChildren && (
              <IconButton
                aria-label={isExpanded ? "Collapse" : "Expand"}
                size="xs"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
              </IconButton>
            )}
            <Text
              fontSize="lg"
              fontWeight="medium"
              color={textColor}
              pl={!hasChildren ? 6 : 0}
            >
              {item.name}
            </Text>
            {renderBadges?.(item)}
          </HStack>
          <HStack
            className="action-buttons"
            opacity={0}
            transform="translateX(10px)"
            transition="all 0.2s ease"
          >
            {onEdit && (
              <IconButton
                aria-label="Edit item"
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item)}
                color="gray.500"
                _hover={{
                  color: colors.primary.default,
                  bg: colors.primary.alpha,
                }}
              >
                <LuPencil size={16} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                aria-label="Delete item"
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item)}
                color="gray.500"
                _hover={{
                  color: colors.accent.delete.default,
                  bg: colors.accent.delete.bg,
                }}
              >
                <LuTrash size={16} />
              </IconButton>
            )}
          </HStack>
        </Flex>
        {renderDetails?.(item)}
      </Box>
      {hasChildren && isExpanded && item.children && (
        <VStack gap={2} pl={6} mt={2}>
          {item.children.map((child) => (
            <TreeListItem
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              renderBadges={renderBadges}
              renderDetails={renderDetails}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}

export function TreeList({
  items,
  onEdit,
  onDelete,
  renderBadges,
  renderDetails,
}: TreeListProps) {
  return (
    <VStack gap={2} align="stretch">
      {items.map((item) => (
        <TreeListItem
          key={item.id}
          item={item}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          renderBadges={renderBadges}
          renderDetails={renderDetails}
        />
      ))}
    </VStack>
  );
}
