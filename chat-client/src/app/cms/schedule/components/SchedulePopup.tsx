import React from "react";
import { Dialog, Text, Stack, Box } from "@chakra-ui/react";
import { Schedule } from "../types";
import { formatDateTime } from "../utils";

interface SchedulePopupProps {
  schedule: Schedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SchedulePopup: React.FC<SchedulePopupProps> = ({
  schedule,
  isOpen,
  onClose,
}) => {
  if (!schedule) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Text fontWeight="bold">{schedule.title}</Text>
            <Dialog.CloseTrigger asChild />
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <Stack direction="column" gap={4}>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  일시
                </Text>
                <Text>
                  {formatDateTime(schedule.startDateTime)} ~{" "}
                  {formatDateTime(schedule.endDateTime)}
                </Text>
              </Box>
              {schedule.content && (
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    내용
                  </Text>
                  <Text whiteSpace="pre-line">{schedule.content}</Text>
                </Box>
              )}
            </Stack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
