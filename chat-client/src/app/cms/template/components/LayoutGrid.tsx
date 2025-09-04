import React, { useRef, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { TemplateBlock } from "@/types/api";
import { LayoutItem } from "./LayoutItem";

interface LayoutGridProps {
  layout: TemplateBlock[];
  onLayoutChange: (layout: TemplateBlock[]) => void;
}

interface DragItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  layout,
  onLayoutChange,
}) => {
  const gridRef = useRef(null) as React.MutableRefObject<HTMLDivElement | null>;
  const [gridSize, setGridSize] = useState({ width: 800, height: 600 }); // 고정된 크기로 설정

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: "layout-item",
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta || !gridRef.current) return;

      const cellWidth = gridRef.current.clientWidth / 12;
      const cellHeight = gridRef.current.clientHeight / 12;

      const x = Math.max(
        0,
        Math.min(12 - item.width, Math.round(item.x + delta.x / cellWidth))
      );
      const y = Math.max(
        0,
        Math.min(12 - item.height, Math.round(item.y + delta.y / cellHeight))
      );

      const updatedLayout = layout.map((block) => {
        if (block.id === item.id) {
          return { ...block, x, y };
        }
        return block;
      });

      onLayoutChange(updatedLayout);
    },
    collect: (monitor: DropTargetMonitor<DragItem, void>) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleResize = (id: string, width: number, height: number) => {
    const updatedLayout = layout.map((block) => {
      if (block.id === id) {
        // 그리드 경계를 벗어나지 않도록 제한
        const maxX = 12 - width;
        const maxY = 12 - height;
        const x = Math.min(block.x, maxX);
        const y = Math.min(block.y, maxY);
        return { ...block, width, height, x, y };
      }
      return block;
    });
    onLayoutChange(updatedLayout);
  };

  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        drop(node);
        gridRef.current = node;
      }}
      position="relative"
      width="800px"
      height="600px"
      bg={isOver ? "gray.50" : "white"}
      border="1px dashed"
      borderColor={isOver ? "blue.300" : "gray.200"}
      borderRadius="md"
      p={2}
    >
      {layout.map((item) => (
        <LayoutItem
          key={item.id}
          item={item}
          gridSize={gridSize}
          onResize={handleResize}
        />
      ))}
    </Box>
  );
};
