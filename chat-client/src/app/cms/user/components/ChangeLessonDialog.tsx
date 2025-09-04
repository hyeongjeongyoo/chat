import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Box,
  Badge,
  Dialog,
  Portal,
  CloseButton,
  Stack,
  Field,
  NativeSelect,
  For,
} from "@chakra-ui/react";
import { UserEnrollmentHistoryDto, AdminLessonDto } from "@/types/api";
import { userCmsApi } from "@/lib/api/userCms";
import { toaster } from "@/components/ui/toaster";
import { adminApi } from "@/lib/api/adminApi";
import dayjs from "dayjs";

interface ChangeLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserEnrollmentHistoryDto | null;
  onSuccess: () => void;
}

export const ChangeLessonDialog: React.FC<ChangeLessonDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchLessons = async () => {
        try {
          const now = dayjs();
          const response = await adminApi.getAdminLessons({
            year: now.year(),
            month: now.month() + 1, // dayjs month is 0-indexed
            size: 100, // Fetch a large number to get all lessons for the month
          });
          setLessons(response.data.content);
        } catch (error) {
          toaster.create({
            title: "강습 목록을 불러오는데 실패했습니다.",
            type: "error",
          });
        }
      };
      fetchLessons();
      // Reset selection when modal opens
      setSelectedLessonId("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user || !selectedLessonId) {
      toaster.create({
        title: "변경할 강습을 선택해주세요.",
        type: "warning",
      });
      return;
    }

    const latestEnrollment = user.lastEnrollment;
    if (!latestEnrollment) {
      toaster.create({
        title: "사용자의 최근 수강 내역을 찾을 수 없습니다.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await userCmsApi.changeUserLesson(
        latestEnrollment.enrollmentId,
        selectedLessonId
      );
      toaster.create({
        title: "성공적으로 강습을 변경했습니다.",
        type: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toaster.create({
        title: "강습 변경에 실패했습니다.",
        description: "다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentLesson = user?.lastEnrollment;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>수강 내역 변경</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="bold">
                    {user?.name} ({user?.username})
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    현재 수강 정보
                  </Text>
                  <Text>
                    {currentLesson?.lessonTitle || "수강 내역 없음"}
                    <Badge ml="2" colorScheme={currentLesson ? "blue" : "gray"}>
                      {currentLesson?.lessonTime}
                    </Badge>
                  </Text>
                </Box>
                <Field.Root>
                  <Field.Label>변경할 강습 선택</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder="강습을 선택하세요"
                      value={selectedLessonId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedLessonId(e.target.value)
                      }
                    >
                      <option value="" disabled>
                        강습을 선택하세요
                      </option>
                      <For each={lessons}>
                        {(lesson) => {
                          return (
                            <option
                              key={lesson.lessonId}
                              value={String(lesson.lessonId)}
                            >
                              {`${lesson.title} (${
                                lesson.lessonTime ?? "시간 미정"
                              }) - ${lesson.capacity}명`}
                            </option>
                          );
                        }}
                      </For>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" mr={3} onClick={onClose}>
                취소
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!selectedLessonId}
              >
                변경
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
