import React, { useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { TemplateBlock } from "@/types/api";

interface LayoutItemProps {
  item: TemplateBlock;
  gridSize: { width: number; height: number };
  onResize: (id: string, width: number, height: number) => void;
}

export const LayoutItem: React.FC<LayoutItemProps> = ({
  item,
  gridSize,
  onResize,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "layout-item",
    item: {
      id: item.id,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isResizing,
  }));

  const handleResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!itemRef.current || !resizeHandleRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = item.width;
    const startHeight = item.height;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const cellWidth = gridSize.width / 12;
      const cellHeight = gridSize.height / 12;

      const newWidth = Math.max(
        1,
        Math.min(12 - item.x, Math.round(startWidth + deltaX / cellWidth))
      );
      const newHeight = Math.max(
        1,
        Math.min(12 - item.y, Math.round(startHeight + deltaY / cellHeight))
      );

      onResize(item.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    setIsResizing(true);
  };

  const cellWidth = gridSize.width / 12;
  const cellHeight = gridSize.height / 12;

  return (
    <Box
      ref={drag}
      position="absolute"
      left={`${item.x * cellWidth}px`}
      top={`${item.y * cellHeight}px`}
      width={`${item.width * cellWidth}px`}
      height={`${item.height * cellHeight}px`}
      bg="blue.100"
      border="1px solid"
      borderColor="blue.300"
      borderRadius="md"
      opacity={isDragging ? 0.5 : 1}
      cursor="move"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="sm"
      fontWeight="medium"
      color="blue.700"
      _hover={{
        bg: "blue.200",
      }}
    >
      {item.name}
      <Box
        ref={resizeHandleRef}
        position="absolute"
        right={0}
        bottom={0}
        width="16px"
        height="16px"
        bg="blue.500"
        cursor="nwse-resize"
        onMouseDown={handleResize}
        borderTopLeftRadius="md"
        _hover={{
          bg: "blue.600",
        }}
        _active={{
          bg: "blue.700",
        }}
      />
    </Box>
  );
};
