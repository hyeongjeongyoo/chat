"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Input,
  Textarea,
  Flex,
  Text,
  Heading,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import type { AdminLessonDto } from "@/types/api";
import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import dayjs from "dayjs";

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

// RESTORED INTERFACE DEFINITION
interface LessonEditorProps {
  lesson: AdminLessonDto | null;
  onSubmit: (lessonData: AdminLessonDto) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading: boolean;
  onAddNew?: () => void; // For add new lesson functionality
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson,
  onSubmit,
  onDelete,
  isLoading,
  onAddNew,
}) => {
  const colors = useColors();
  const [formData, setFormData] = useState<AdminLessonDto>({
    title: "",
    instructorName: "",
    lessonTime: "",
    startDate: "",
    endDate: "",
    registrationEndDateTime: "",
    capacity: 0,
    price: 0,
    status: "OPEN",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const errorColor = useColorModeValue("red.500", "red.300");

  // Reset the form when a new lesson is selected or set to null for new lesson
  useEffect(() => {
    if (lesson) {
      setFormData({
        lessonId: lesson.lessonId,
        title: lesson.title,
        instructorName: lesson.instructorName || "",
        lessonTime: lesson.lessonTime || "",
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        registrationEndDateTime: lesson.registrationEndDateTime || "",
        capacity: lesson.capacity,
        price: lesson.price,
        status: lesson.status,
      });
    } else {
      // Reset form for new lesson with dynamic date defaults and specific time
      const today = dayjs();
      const firstDayOfMonth = today.startOf("month");
      const lastDayOfMonth = today.endOf("month");
      const lastDayOfLastMonth = today.subtract(1, "month").endOf("month");

      setFormData({
        title: "",
        instructorName: "",
        lessonTime: "09:00~10:00",
        startDate: formatDate(firstDayOfMonth.toDate()),
        endDate: formatDate(lastDayOfMonth.toDate()),
        registrationEndDateTime: formatDate(lastDayOfLastMonth.toDate()),
        capacity: 0,
        price: 0,
        status: "OPEN",
      });
    }
    setError(null);
    setIsSubmitting(false);
  }, [lesson]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.title.trim()) {
        setError("강습 제목은 필수 입력 항목입니다.");
        return;
      }

      if (!formData.startDate) {
        setError("시작일은 필수 입력 항목입니다.");
        return;
      }

      if (!formData.endDate) {
        setError("종료일은 필수 입력 항목입니다.");
        return;
      }

      if (!formData.registrationEndDateTime) {
        setError("등록 마감일은 필수 입력 항목입니다.");
        return;
      }

      if (
        formData.registrationEndDateTime &&
        formData.startDate &&
        formData.registrationEndDateTime > formData.startDate
      ) {
        setError("등록 마감일은 시작일보다 이전이거나 같아야 합니다.");
        return;
      }

      if (formData.capacity <= 0) {
        setError("정원은 1명 이상이어야 합니다.");
        return;
      }

      if (formData.price < 0) {
        setError("가격은 0원 이상이어야 합니다.");
        return;
      }

      // Clear any previous errors
      setError(null);
      setIsSubmitting(true);

      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting lesson data:", error);
      setError("강습 정보 저장 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson?.lessonId) return;
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      setError("강습 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleNewLesson = () => {
    if (onAddNew) {
      onAddNew();
    }
  };

  const isEditing = !!lesson?.lessonId;

  return (
    <Box position="relative" h="full">
      <VStack align="stretch" gap={3} h="full">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="sm" color={textColor}>
            {isEditing ? "강습 수정" : "새 강습 추가"}
          </Heading>
          {/* {onAddNew && (
            <Button
              size="xs"
              onClick={handleNewLesson}
              colorPalette="blue"
              variant="outline"
            >
              새 강습
            </Button>
          )} */}
        </Flex>

        {error && (
          <Box
            p={3}
            bg="red.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.200"
          >
            <Text color={errorColor} fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        <VStack align="stretch" gap={3} flex="1" fontSize="sm">
          <Box>
            <Text mb={1} fontWeight="medium" color={textColor}>
              강습 제목 *
            </Text>
            <Input
              size="xs"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="강습 제목을 입력하세요"
              borderColor={borderColor}
              _focus={{
                borderColor: colors.primary.default,
                boxShadow: `0 0 0 1px ${colors.primary.default}`,
              }}
            />
          </Box>

          <Box>
            <Text mb={1} fontWeight="medium" color={textColor}>
              강사명
            </Text>
            <Input
              size="xs"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleInputChange}
              placeholder="강사명을 입력하세요"
              borderColor={borderColor}
              _focus={{
                borderColor: colors.primary.default,
                boxShadow: `0 0 0 1px ${colors.primary.default}`,
              }}
            />
          </Box>

          <Box>
            <Text mb={1} fontWeight="medium" color={textColor}>
              강습 시간
            </Text>
            <Input
              size="xs"
              name="lessonTime"
              value={formData.lessonTime}
              onChange={handleInputChange}
              placeholder="예: 09:00~10:00"
              borderColor={borderColor}
              _focus={{
                borderColor: colors.primary.default,
                boxShadow: `0 0 0 1px ${colors.primary.default}`,
              }}
            />
          </Box>

          <Flex gap={3}>
            <Box flex="1">
              <Text mb={1} fontWeight="medium" color={textColor}>
                시작일 *
              </Text>
              <Input
                size="xs"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                borderColor={borderColor}
                _focus={{
                  borderColor: colors.primary.default,
                  boxShadow: `0 0 0 1px ${colors.primary.default}`,
                }}
              />
            </Box>

            <Box flex="1">
              <Text mb={1} fontWeight="medium" color={textColor}>
                종료일 *
              </Text>
              <Input
                size="xs"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                borderColor={borderColor}
                _focus={{
                  borderColor: colors.primary.default,
                  boxShadow: `0 0 0 1px ${colors.primary.default}`,
                }}
              />
            </Box>
          </Flex>

          <Box>
            <Text mb={1} fontWeight="medium" color={textColor}>
              등록 마감일
            </Text>
            <Input
              size="xs"
              type="datetime-local"
              name="registrationEndDateTime"
              value={formData.registrationEndDateTime}
              onChange={handleInputChange}
              borderColor={borderColor}
              _focus={{
                borderColor: colors.primary.default,
                boxShadow: `0 0 0 1px ${colors.primary.default}`,
              }}
            />
          </Box>

          <Flex gap={3}>
            <Box flex="1">
              <Text mb={1} fontWeight="medium" color={textColor}>
                정원 *
              </Text>
              <Input
                size="xs"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min={1}
                placeholder="정원을 입력하세요"
                borderColor={borderColor}
                _focus={{
                  borderColor: colors.primary.default,
                  boxShadow: `0 0 0 1px ${colors.primary.default}`,
                }}
              />
            </Box>

            <Box flex="1">
              <Text mb={1} fontWeight="medium" color={textColor}>
                강습료 *
              </Text>
              <Input
                size="xs"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min={0}
                placeholder="강습료를 입력하세요"
                borderColor={borderColor}
                _focus={{
                  borderColor: colors.primary.default,
                  boxShadow: `0 0 0 1px ${colors.primary.default}`,
                }}
              />
            </Box>
          </Flex>
        </VStack>

        <Flex gap={2} mt={4}>
          <Button
            flex="1"
            onClick={handleSubmit}
            loading={isSubmitting || isLoading}
            colorPalette="blue"
          >
            <CheckIcon size={16} style={{ marginRight: "8px" }} />
            {isEditing ? "수정" : "생성"}
          </Button>

          {isEditing && (
            <Button
              onClick={handleDelete}
              loading={isLoading}
              colorPalette="red"
              variant="outline"
            >
              <Trash2Icon size={16} style={{ marginRight: "8px" }} />
              삭제
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};
