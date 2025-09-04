import React, { useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Flex,
  Text,
  Spinner,
  Checkbox,
} from "@chakra-ui/react";
import { Schedule, ScheduleFormData } from "../types";
import { useForm, Controller } from "react-hook-form";
import { useColors } from "@/styles/theme";
import { CheckIcon, DeleteIcon, PlusIcon } from "lucide-react";

interface ScheduleFormProps {
  schedule?: Schedule;
  selectedDateForNew?: Date;
  onSubmit: (data: ScheduleFormData) => void;
  isSubmitting: boolean;
  onDelete?: (id: number | null) => void;
  onCreateNew?: () => void;
  isCreating?: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  selectedDateForNew,
  onSubmit,
  isSubmitting,
  onDelete,
  onCreateNew,
  isCreating = false,
}) => {
  const colors = useColors();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<ScheduleFormData>({});

  useEffect(() => {
    if (schedule) {
      reset({
        title: schedule.title ?? "", // Ensure title is also handled if null/undefined
        content: schedule.content ?? "",
        startDateTime: schedule.startDateTime,
        endDateTime: schedule.endDateTime,
        displayYn: schedule.displayYn === "Y" ? "Y" : "N",
      });
    } else {
      const baseDate = selectedDateForNew || new Date();
      const newStartDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate()
      );
      const currentTime = new Date();
      newStartDate.setHours(currentTime.getHours());
      newStartDate.setMinutes(currentTime.getMinutes());
      newStartDate.setSeconds(0);
      newStartDate.setMilliseconds(0);
      const newEndDate = new Date(newStartDate.getTime() + 60 * 60 * 1000);

      reset({
        title: "",
        content: "",
        startDateTime: newStartDate.toISOString(),
        endDateTime: newEndDate.toISOString(),
        displayYn: "Y",
      });
    }
  }, [schedule, selectedDateForNew, reset]);

  const handleFormSubmit = async (data: ScheduleFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack gap={3} align="stretch">
          <Box>
            <Flex mb={1}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colors.text.primary}
              >
                제목
              </Text>
              <Text fontSize="sm" color="red.500" ml={1}>
                *
              </Text>
            </Flex>
            <Input
              {...register("title", { required: "제목을 입력해주세요" })}
              placeholder="일정 제목"
              borderColor={errors.title ? "red.500" : colors.border}
              color={colors.text.primary}
              bg="transparent"
            />
            {errors.title && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.title.message}
              </Text>
            )}
          </Box>

          <Box>
            <Flex mb={1}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colors.text.primary}
              >
                상세 내용
              </Text>
            </Flex>
            <Textarea
              {...register("content")}
              placeholder="일정 상세 내용"
              rows={5}
              borderColor={errors.content ? "red.500" : colors.border}
              color={colors.text.primary}
              bg="transparent"
            />
          </Box>

          <Box>
            <Flex mb={1}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colors.text.primary}
              >
                시작 시간
              </Text>
              <Text fontSize="sm" color="red.500" ml={1}>
                *
              </Text>
            </Flex>
            <Input
              {...register("startDateTime", {
                required: "시작 시간을 선택해주세요",
              })}
              type="datetime-local"
              borderColor={errors.startDateTime ? "red.500" : colors.border}
              color={colors.text.primary}
              bg="transparent"
            />
            {errors.startDateTime && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.startDateTime.message}
              </Text>
            )}
          </Box>

          <Box>
            <Flex mb={1}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colors.text.primary}
              >
                종료 시간
              </Text>
              <Text fontSize="sm" color="red.500" ml={1}>
                *
              </Text>
            </Flex>
            <Input
              {...register("endDateTime", {
                required: "종료 시간을 선택해주세요",
              })}
              type="datetime-local"
              borderColor={errors.endDateTime ? "red.500" : colors.border}
              color={colors.text.primary}
              bg="transparent"
            />
            {errors.endDateTime && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.endDateTime.message}
              </Text>
            )}
          </Box>

          <Flex alignItems="center">
            <Controller
              name="displayYn"
              control={control}
              render={({ field }) => (
                <Checkbox.Root
                  checked={field.value === "Y"}
                  onCheckedChange={(eventDetails) => {
                    const isChecked = !!(
                      eventDetails &&
                      typeof eventDetails === "object" &&
                      eventDetails.checked
                    );

                    const newValue = isChecked ? "Y" : "N";
                    field.onChange(newValue);
                  }}
                  size="sm"
                  colorPalette="blue"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderColor={colors.border}
                    bg={colors.bg}
                    _checked={{
                      borderColor: "transparent",
                      bgGradient: colors.gradient.primary,
                      color: "white",
                      _hover: {
                        opacity: 0.8,
                      },
                    }}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label ml={2}>
                    <Text fontWeight="medium" color={colors.text.primary}>
                      일정 노출
                    </Text>
                  </Checkbox.Label>
                </Checkbox.Root>
              )}
            />
          </Flex>

          <Flex justify="space-between" gap={2} mt={4}>
            {schedule && !isCreating ? (
              <Button
                borderColor={colors.accent.delete.default}
                color={colors.accent.delete.default}
                onClick={() => onDelete?.(schedule.scheduleId)}
                variant="outline"
                _hover={{
                  bg: colors.accent.delete.bg,
                  borderColor: colors.accent.delete.hover,
                  color: colors.accent.delete.hover,
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s ease"
                disabled={isSubmitting}
              >
                <Box display="flex" alignItems="center" gap={2} w={4}>
                  <DeleteIcon />
                </Box>
                <Text>삭제</Text>
              </Button>
            ) : (
              <Box />
            )}
            <Flex gap={2}>
              {!isCreating && (
                <Button
                  onClick={onCreateNew}
                  variant="outline"
                  colorPalette="blue"
                  _hover={{
                    transform: "translateY(-1px)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s ease"
                  disabled={isSubmitting}
                >
                  <Box display="flex" alignItems="center" gap={2} w={4}>
                    <PlusIcon />
                  </Box>
                  <Text>일정</Text>
                </Button>
              )}
              <Button
                type="submit"
                bg={colors.primary.default}
                color="white"
                _hover={{ bg: colors.primary.hover }}
                disabled={isSubmitting}
              >
                <Box display="flex" alignItems="center" gap={2} w={4}>
                  {isSubmitting ? <Spinner size="sm" /> : <CheckIcon />}
                </Box>
                <Text>{isCreating ? "생성" : "저장"}</Text>
              </Button>
            </Flex>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
};
