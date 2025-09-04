"use client";

import React, { useMemo, useState } from "react";
import { Box, VStack, Text, Flex, Badge, Button } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import type { AdminLessonDto } from "@/types/api";
import { LuBook, LuTrash2 } from "react-icons/lu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import dayjs from "dayjs";

interface LessonListProps {
  lessons: AdminLessonDto[];
  onAddLesson: () => void;
  onEditLesson: (lesson: AdminLessonDto) => void;
  onDeleteLesson: (lessonId: number) => Promise<void>;
  isLoading: boolean;
  selectedLessonMenuId?: number;
  loadingLessonId: number | null;
}

// Helper to parse YYYY-MM-DD strings to Date objects (ignoring time, comparing dates only)
const parseAdminDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  const date = dayjs(dateString);
  if (!date.isValid()) return null;
  return date.startOf('day').toDate();
};

const LessonList = React.memo(function LessonList({
  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  isLoading,
  selectedLessonMenuId,
  loadingLessonId,
}: LessonListProps) {
  const colors = useColors();
  const hoverBg = useColorModeValue(colors.bg, colors.darkBg);
  const selectedBorderColor = colors.primary.default;
  const textColor = colors.text.primary;
  const secondaryTextColor = colors.text.secondary;

  // Deletion confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  const handleDelete = () => {
    if (lessonToDelete) {
      setIsDeleteDialogOpen(false);
      onDeleteLesson(lessonToDelete);
      setLessonToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const getDerivedStatusInfo = (
    lesson: AdminLessonDto
  ): { label: string; colorScheme: string } => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare date part only

    const startDate = parseAdminDate(lesson.startDate);
    const endDate = parseAdminDate(lesson.endDate);
    const registrationEndDateTime = parseAdminDate(
      lesson.registrationEndDateTime
    );

    if (!startDate || !endDate) {
      return { label: "- 날짜오류 -", colorScheme: "red" };
    }

    if (now > endDate) {
      return { label: "강습종료", colorScheme: "purple" }; // Was "종료"
    }
    if (now >= startDate && now <= endDate) {
      return { label: "진행중", colorScheme: "blue" };
    }
    // If now < startDate (before lesson starts)
    if (registrationEndDateTime) {
      if (now <= registrationEndDateTime) {
        return { label: "모집중", colorScheme: "green" };
      } else {
        return { label: "모집마감", colorScheme: "gray" }; // Was "마감"
      }
    } else {
      // No specific registration end date, assume open for recruitment if lesson status is OPEN
      // or simply "모집예정" if we want to be more generic before start
      if (lesson.status === "OPEN") {
        return { label: "모집중", colorScheme: "green" };
      }
      // If lesson.status is CLOSED, but it's before startDate and no reg end date, it's effectively "모집마감" or "비공개"
      if (lesson.status === "CLOSED") {
        return { label: "모집마감 (비공개)", colorScheme: "gray" };
      }
      return { label: "시작전", colorScheme: "teal" }; // Default if before start and no other conditions met
    }
  };

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Box>
    );
  }

  return (
    <>
      <VStack gap={1} align="stretch">
        {lessons.length === 0 ? (
          <Text color={secondaryTextColor} textAlign="center" py={4}>
            등록된 강습이 없습니다.
          </Text>
        ) : (
          lessons.map((lesson) => {
            const statusInfo = getDerivedStatusInfo(lesson);
            return (
              <Flex
                key={lesson.lessonId}
                pl={2}
                py={1.5}
                px={2}
                alignItems="center"
                cursor="pointer"
                bg={
                  selectedLessonMenuId === lesson.lessonId
                    ? colors.bg
                    : "transparent"
                }
                borderLeft={
                  selectedLessonMenuId === lesson.lessonId
                    ? "3px solid"
                    : "none"
                }
                borderColor={
                  selectedLessonMenuId === lesson.lessonId
                    ? selectedBorderColor
                    : "transparent"
                }
                _hover={{
                  bg: hoverBg,
                  transform: "translateX(2px)",
                  boxShadow: "sm",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "& .lesson-icon": {
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                }}
                transition="all 0.2s ease-out"
                borderRadius="md"
                position="relative"
                role="group"
                mb={1}
                mr={1}
                onClick={() => onEditLesson(lesson)}
              >
                <Box
                  width="24px"
                  mr={2}
                  textAlign="center"
                  className="lesson-icon"
                  style={{ cursor: "pointer" }}
                >
                  <Flex
                    width="24px"
                    height="24px"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuBook
                      size={18}
                      style={{
                        color:
                          selectedLessonMenuId === lesson.lessonId
                            ? selectedBorderColor
                            : textColor,
                        transition: "color 0.3s",
                      }}
                    />
                  </Flex>
                </Box>
                <VStack align="stretch" gap={0} flex={1}>
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={textColor}
                      maxW="calc(100% - 100px)" // Adjusted to make space for potentially longer status
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {lesson.title}
                    </Text>
                    <Badge
                      ml={2}
                      colorScheme={statusInfo.colorScheme}
                      fontSize="xs"
                      px={1.5}
                      py={0.5}
                    >
                      {statusInfo.label}
                    </Badge>
                  </Flex>
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {lesson.lessonTime}
                  </Text>
                </VStack>

                {loadingLessonId === lesson.lessonId ? (
                  <Box
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    <Box
                      as="div"
                      w="16px"
                      h="16px"
                      border="2px solid"
                      borderColor="gray.300"
                      borderTopColor="blue.500"
                      borderRadius="full"
                      animation="spin 1s linear infinite"
                    />
                  </Box>
                ) : (
                  <Box
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                  >
                    <LuTrash2
                      size={16}
                      color="red.500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLessonToDelete(lesson.lessonId!);
                        setIsDeleteDialogOpen(true);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                )}
              </Flex>
            );
          })
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        title="강습 삭제"
        description="정말로 이 강습을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
});

export { LessonList };
