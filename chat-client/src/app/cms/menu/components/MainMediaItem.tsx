"use client";

import { useRef } from "react";
import { Box, Flex, Text, Image, IconButton } from "@chakra-ui/react";
import { useDrag, useDrop } from "react-dnd";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuGripVertical, LuTrash2, LuImage, LuVideo } from "react-icons/lu";
import { MainMediaDto } from "@/types/api";

interface MainMediaItemProps {
  media: MainMediaDto;
  index: number;
  onDelete: (id: number) => void;
  moveMedia: (dragIndex: number, hoverIndex: number) => void;
}

export function MainMediaItem({
  media,
  index,
  onDelete,
  moveMedia,
}: MainMediaItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = useColors();

  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const dropBg = useColorModeValue("blue.100", "blue.700");

  const [{ isDragging }, drag] = useDrag({
    type: "MEDIA_ITEM",
    item: { type: "MEDIA_ITEM", id: media.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: "MEDIA_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // 자기 자신 위에 드롭하는 경우 무시
      if (dragIndex === hoverIndex) {
        return;
      }

      // 마우스 포인터의 위치를 계산
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset
        ? clientOffset.y - hoverBoundingRect.top
        : 0;

      // 드래그가 절반 이상 넘어가야 이동
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // 미디어 순서 변경
      moveMedia(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Box
      ref={ref}
      data-handler-id={handlerId}
      borderWidth="1px"
      borderRadius="md"
      p={2}
      mb={2}
      bg={isDragging ? dropBg : "transparent"}
      opacity={isDragging ? 0.4 : 1}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
    >
      <Flex align="center" gap={2}>
        <IconButton
          aria-label="Drag handle"
          variant="ghost"
          size="sm"
          cursor="grab"
          _active={{ cursor: "grabbing" }}
        >
          <LuGripVertical />
        </IconButton>
        <IconButton aria-label="Media type" variant="ghost" size="sm" disabled>
          {media.type === "VIDEO" ? <LuVideo /> : <LuImage />}
        </IconButton>
        {media.thumbnailUrl && (
          <Image
            src={media.thumbnailUrl}
            alt={media.title}
            boxSize="40px"
            objectFit="cover"
            borderRadius="md"
          />
        )}
        <Text flex={1} fontSize="sm">
          {media.title}
        </Text>
        <IconButton
          aria-label="Delete media"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(media.id)}
          _hover={{ color: "red.500" }}
        >
          <LuTrash2 />
        </IconButton>
      </Flex>
    </Box>
  );
}
