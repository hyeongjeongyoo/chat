import { useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import {
  Flex,
  Text,
  IconButton,
  Box,
  HStack,
  Input,
  Image,
} from "@chakra-ui/react";
import { LuGripVertical, LuTrash2 } from "react-icons/lu";
import { ContentBlock } from "@/types/api/content";

interface ContentBlockItemProps {
  block: ContentBlock;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (blockId: number) => void;
  onEdit: (block: ContentBlock) => void;
}

const ItemTypes = {
  BLOCK: "block",
};

export function ContentBlockItem({
  block,
  index,
  moveBlock,
  onDelete,
  onEdit,
}: ContentBlockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const renderContent = () => {
    if (block.type === "TEXT") {
      return (
        <Input
          readOnly
          value={block.content || ""}
          placeholder="텍스트 블록"
          cursor="pointer"
          size="sm"
        />
      );
    }
    if (block.type === "IMAGE" && block.files && block.files.length > 0) {
      // 첫 번째 파일을 대표 이미지로 사용
      const firstFile = block.files[0];
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${firstFile.fileId}`;

      return (
        <Flex align="center" cursor="pointer" w="full" minW={0}>
          <HStack
            gap={2}
            overflowX="auto"
            py={1}
            // 스크롤바 스타일링 (선택 사항)
            css={{
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "gray.300",
                borderRadius: "24px",
              },
              "&::-webkit-scrollbar-track": {
                background: "gray.100",
              },
            }}
          >
            {block.files.map((file, i) => (
              <Image
                key={file.fileId}
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${file.fileId}`}
                alt={block.content || `image ${i + 1}`}
                boxSize="40px"
                objectFit="cover"
                borderRadius="md"
                bg="gray.100"
                flexShrink={0} // 이미지가 줄어들지 않도록 설정
              />
            ))}
          </HStack>
          <Text
            ml={2}
            title={block.content || "이미지 블록"}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {block.content || "이미지 블록"}
          </Text>
        </Flex>
      );
    }
    return <Text>{block.type} 블록</Text>;
  };

  return (
    <Box
      id={`block-${block.id}`}
      ref={preview}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Flex
        ref={ref}
        p={2}
        mb={2}
        gap={2}
        border="1px solid"
        borderColor="gray.100"
        _dark={{ bg: "gray.700" }}
        borderRadius="md"
        align="center"
        justifyContent="space-between"
      >
        <Flex align="center" flex="1" minW="0">
          <Box ref={drag} cursor="move" p={1} mr={2}>
            <LuGripVertical />
          </Box>
          <Box flex="1" minW="0" onClick={() => onEdit(block)} cursor="pointer">
            {renderContent()}
          </Box>
        </Flex>
        <HStack>
          <IconButton
            aria-label="Delete block"
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(block.id)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  );
}
