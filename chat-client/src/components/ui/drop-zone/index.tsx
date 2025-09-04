import { useRef, useCallback, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { useDrop, DropTargetMonitor } from "react-dnd";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { DragItem } from "@/app/cms/menu/types";

interface DropZoneProps {
  onDrop: (
    draggedId: number,
    targetId: number,
    position: "before" | "after" | "inside"
  ) => void;
  targetId: number;
  level: number;
  isFolder?: boolean;
}

export function DropZone({ onDrop, targetId }: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colors = useColors();
  const dropBg = useColorModeValue(
    "rgba(66, 153, 225, 0.12)",
    "rgba(99, 179, 237, 0.15)"
  );
  const dropLineBg = useColorModeValue(
    colors.primary.default,
    colors.primary.light
  );

  const handleDrop = useCallback(
    (item: DragItem, monitor: DropTargetMonitor) => {
      if (item.id === targetId) return;

      const dragOffset = monitor.getClientOffset();
      const rect = ref.current?.getBoundingClientRect();

      if (dragOffset && rect) {
        // 이전 타임아웃 취소
        if (dropTimeoutRef.current) {
          clearTimeout(dropTimeoutRef.current);
        }

        // 새로운 타임아웃 설정 (100ms)
        dropTimeoutRef.current = setTimeout(() => {
          const centerY = rect.top + rect.height / 2;

          // 드래그 위치가 중앙선에 가까운지 확인 (10px 이내)
          const distanceFromCenter = Math.abs(dragOffset.y - centerY);

          if (distanceFromCenter <= 10) {
            // 중앙선에 드롭된 경우
            onDrop(item.id, targetId, "before");
          } else {
            // 중앙선 위/아래로 드롭된 경우
            if (dragOffset.y < centerY) {
              onDrop(item.id, targetId, "before");
            } else {
              onDrop(item.id, targetId, "after");
            }
          }
        }, 100);
      }
    },
    [onDrop, targetId]
  );

  const [{ isOver }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "LIST_ITEM",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop: handleDrop,
  });

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current);
      }
    };
  }, []);

  drop(ref);

  return (
    <Box
      ref={ref}
      h="20px"
      bg={isOver ? dropBg : "transparent"}
      transition="all 0.2s ease"
      position="relative"
      my="-10px"
    >
      {/* 드롭존 배경 */}
      <Box
        position="absolute"
        left={0}
        right={0}
        top={0}
        bottom={0}
        bg={isOver ? dropBg : "transparent"}
        opacity={0.5}
        transition="all 0.2s ease"
      />

      {/* 중앙선 */}
      <Box
        position="absolute"
        left={0}
        right={0}
        top="50%"
        transform="translateY(-50%)"
        h="2px"
        bg={isOver ? dropLineBg : "transparent"}
        transition="all 0.2s ease"
      />
    </Box>
  );
}
