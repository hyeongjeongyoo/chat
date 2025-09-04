"use client";

import React from "react";
import { useState } from "react";
import { Box, Text, Badge, Flex, Stack } from "@chakra-ui/react";
import { Schedule } from "../types";
import { useColors } from "@/styles/theme";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: number) => void;
  selectedDate?: Date;
  selectedScheduleId?: number;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onEdit,
  onDelete,
  selectedDate,
  selectedScheduleId,
}) => {
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(
    null
  );
  const colors = useColors();

  // 선택된 날짜에 포함되는 일정 필터링
  const filteredSchedules = React.useMemo(() => {
    if (!selectedDate) return schedules;

    return schedules.filter((schedule) => {
      const startDate = new Date(schedule.startDateTime);
      const endDate = new Date(schedule.endDateTime);
      const selected = new Date(selectedDate);

      // 날짜만 비교하기 위해 시간을 0으로 설정
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      // 선택된 날짜가 시작일과 종료일 사이에 있는지 확인
      return selected >= startDate && selected <= endDate;
    });
  }, [schedules, selectedDate]);

  const handleDeleteClick = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
  };

  const handleDeleteConfirm = () => {
    if (scheduleToDelete?.scheduleId) {
      onDelete(scheduleToDelete.scheduleId);
      setScheduleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setScheduleToDelete(null);
  };

  if (filteredSchedules.length === 0) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text color="gray.500">일정이 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Stack direction="column" gap={2}>
        {filteredSchedules.map((schedule) => (
          <Box
            key={schedule.scheduleId}
            p={4}
            bg={
              schedule.scheduleId === selectedScheduleId
                ? "blue.50"
                : schedule.displayYn
                ? "white"
                : "gray.50"
            }
            borderRadius="lg"
            borderWidth="1px"
            borderColor={
              schedule.scheduleId === selectedScheduleId
                ? "blue.200"
                : colors.border
            }
            cursor="pointer"
            _hover={{
              bg:
                schedule.scheduleId === selectedScheduleId
                  ? "blue.100"
                  : schedule.displayYn
                  ? "blue.50"
                  : "gray.100",
              transform: "translateX(4px)",
              boxShadow: "sm",
            }}
            transition="all 0.2s ease-out"
            onClick={() => onEdit(schedule)}
          >
            <Flex direction="column" gap={2}>
              <Flex justify="space-between" align="center">
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color={
                    schedule.displayYn ? colors.text.primary : colors.text.muted
                  }
                >
                  {schedule.title}
                </Text>
                <Flex gap={2}>
                  {!schedule.displayYn && (
                    <Badge
                      bg="gray.100"
                      color="gray.500"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      숨김
                    </Badge>
                  )}
                </Flex>
              </Flex>
              <Text
                fontSize="sm"
                color={
                  schedule.displayYn ? colors.text.secondary : colors.text.muted
                }
              >
                {format(new Date(schedule.startDateTime), "yyyy-MM-dd HH:mm")} ~{" "}
                {format(new Date(schedule.endDateTime), "yyyy-MM-dd HH:mm")}
              </Text>
              {schedule.content && (
                <Text
                  fontSize="sm"
                  color={
                    schedule.displayYn
                      ? colors.text.secondary
                      : colors.text.muted
                  }
                  maxLines={2}
                >
                  {schedule.content}
                </Text>
              )}
            </Flex>
          </Box>
        ))}
      </Stack>

      <ConfirmDialog
        isOpen={!!scheduleToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="일정 삭제"
        description="선택한 일정을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
    </Box>
  );
};
