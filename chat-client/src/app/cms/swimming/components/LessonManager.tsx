"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Badge,
  Portal,
  createListCollection,
  Select,
} from "@chakra-ui/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  AdminLessonDto,
  PaginationParams,
  PaginatedResponse,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { LessonEditor } from "./LessonEditor";
import { LessonList } from "./LessonList";
import { AdminTabsManager } from "./AdminTabsManager";
import { LockerManager } from "./LockerManager";
import { StatisticsManager } from "./StatisticsManager";

// Admin Lesson Query Keys
const adminLessonKeys = {
  all: ["adminLessons"] as const,
  lists: () => [...adminLessonKeys.all, "list"] as const,
  list: (params: PaginationParams & { year?: number; month?: number }) =>
    [...adminLessonKeys.lists(), params] as const,
  details: () => [...adminLessonKeys.all, "detail"] as const,
  detail: (id: number) => [...adminLessonKeys.details(), id] as const,
};

const currentYear = new Date().getFullYear();
let yearsArray = [];
if (currentYear < 2025) {
  // If current year is before 2025, only include current year
  yearsArray.push({ label: `${currentYear}년`, value: currentYear.toString() });
} else {
  // Otherwise, generate years from 2025 to current year
  for (let y = 2025; y <= currentYear; y++) {
    yearsArray.push({ label: `${y}년`, value: y.toString() });
  }
}
const yearCollection = createListCollection({ items: yearsArray });

const months = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
  label: `${month}월`,
  value: month.toString(),
}));
const monthCollection = createListCollection({ items: months });

export const LessonManager: React.FC = () => {
  const queryClient = useQueryClient();
  const colors = useColors();

  const [selectedAdminLesson, setSelectedAdminLesson] =
    useState<AdminLessonDto | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>(
    yearsArray.length > 0 ? yearsArray[yearsArray.length - 1].value : ""
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );

  // Lesson data query
  const { data: adminLessonsResponse, isLoading: isAdminLessonsLoading } =
    useQuery<
      PaginatedResponse<AdminLessonDto>,
      Error,
      PaginatedResponse<AdminLessonDto>
    >({
      queryKey: adminLessonKeys.list({
        page: 0,
        size: 50,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
      }),
      queryFn: () =>
        adminApi.getAdminLessons({
          page: 0,
          size: 50,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
        }),
      enabled:
        !!selectedYear && !!selectedMonth && yearCollection.items.length > 0,
    });

  const adminLessons = adminLessonsResponse?.data?.content || [];

  // Effect to handle selection changes based on list updates
  useEffect(() => {
    const lessonsList = adminLessonsResponse?.data?.content || [];

    if (selectedAdminLesson) {
      const selectedStillExists = lessonsList.some(
        (l) => l.lessonId === selectedAdminLesson.lessonId
      );
      if (!selectedStillExists) {
        setSelectedAdminLesson(lessonsList.length > 0 ? lessonsList[0] : null);
      }
    } else {
      if (lessonsList.length > 0) {
        setSelectedAdminLesson(lessonsList[0]);
      }
    }
  }, [adminLessonsResponse, selectedAdminLesson, setSelectedAdminLesson]);

  const createAdminLessonMutation = useMutation<
    AdminLessonDto,
    Error,
    AdminLessonDto
  >({
    mutationFn: (newData: AdminLessonDto) =>
      adminApi.createAdminLesson(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      toaster.create({
        title: "성공",
        description: "강습이 생성되었습니다.",
        type: "success",
      });
    },
    onError: (error) =>
      toaster.create({
        title: "오류",
        description: `강습 생성 실패: ${error.message}`,
        type: "error",
      }),
  });
  const updateAdminLessonMutation = useMutation<
    AdminLessonDto,
    Error,
    { lessonId: number; data: AdminLessonDto }
  >({
    mutationFn: ({ lessonId, data }) =>
      adminApi.updateAdminLesson(lessonId, data),
    onSuccess: (updatedLesson) => {
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      if (updatedLesson.lessonId)
        queryClient.setQueryData(
          adminLessonKeys.detail(updatedLesson.lessonId),
          updatedLesson
        );
      toaster.create({
        title: "성공",
        description: "강습이 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) =>
      toaster.create({
        title: "오류",
        description: `강습 수정 실패: ${error.message}`,
        type: "error",
      }),
  });
  const deleteAdminLessonMutation = useMutation<void, Error, number>({
    mutationFn: (lessonId: number) => adminApi.deleteAdminLesson(lessonId),
    onSuccess: (_, deletedLessonId) => {
      toaster.create({
        title: "성공",
        description: "강습이 삭제되었습니다.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: adminLessonKeys.lists() });
      if (selectedAdminLesson?.lessonId === deletedLessonId)
        setSelectedAdminLesson(null);
    },
    onError: (error) =>
      toaster.create({
        title: "오류",
        description: `강습 삭제 실패: ${error.message}`,
        type: "error",
      }),
  });

  const handleAddLesson = () => setSelectedAdminLesson(null);
  const handleEditLesson = (lesson: AdminLessonDto) =>
    setSelectedAdminLesson(lesson);
  const handleDeleteLesson = async (lessonId: number) =>
    deleteAdminLessonMutation.mutateAsync(lessonId);
  const handleSaveLesson = async (data: AdminLessonDto) => {
    if (selectedAdminLesson?.lessonId) {
      const u = await updateAdminLessonMutation.mutateAsync({
        lessonId: selectedAdminLesson.lessonId,
        data,
      });
      if (u) setSelectedAdminLesson(u);
    } else {
      const c = await createAdminLessonMutation.mutateAsync(data);
      if (c) setSelectedAdminLesson(c);
    }
  };
  const handleRemoveLesson = async () => {
    if (selectedAdminLesson?.lessonId)
      await deleteAdminLessonMutation.mutateAsync(selectedAdminLesson.lessonId);
  };
  const handleAddLessonClick = () => setSelectedAdminLesson(null);

  const swimmingLayout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    {
      id: "lessonList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "강습 목록",
      subtitle: "등록된 강습 목록입니다.",
    },
    {
      id: "lessonEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "강습 편집",
      subtitle: "강습의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "adminTabs",
      x: 3,
      y: 1,
      w: 6,
      h: 11,
      title: "관리 시스템",
      subtitle: "신청자, 취소/환불, 결제 내역 관리입니다.",
    },
    {
      id: "lockerManager",
      x: 9,
      y: 1,
      w: 3,
      h: 5,
      title: "실시간 사물함 재고 관리",
      subtitle: "실시간 성별별 사물함 재고를 관리합니다.",
    },
    {
      id: "statisticsManager",
      x: 9,
      y: 6,
      w: 3,
      h: 6,
      title: "통계 및 리포트",
      subtitle: "수영장 운영 현황과 매출 통계입니다.",
    },
  ];

  if (
    isAdminLessonsLoading &&
    yearCollection.items.length > 0 &&
    selectedYear &&
    selectedMonth
  ) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
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
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={swimmingLayout}>
          <Flex justify="flex-start" align="center" h="full" px={2} gap={2}>
            <Flex align="center" gap={1}>
              <Select.Root
                collection={yearCollection}
                value={selectedYear ? [selectedYear] : []}
                onValueChange={(details: { value: string[] }) =>
                  details.value[0] && setSelectedYear(details.value[0])
                }
                size="sm"
                width="90px"
                disabled={yearCollection.items.length === 0}
              >
                <Select.HiddenSelect />
                <Select.Label srOnly>년도 선택</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="년도" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {yearCollection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              <Select.Root
                collection={monthCollection}
                value={selectedMonth ? [selectedMonth] : []}
                onValueChange={(details: { value: string[] }) =>
                  details.value[0] && setSelectedMonth(details.value[0])
                }
                size="sm"
                width="70px"
                disabled={yearCollection.items.length === 0} // Also disable month if no year can be selected
              >
                <Select.HiddenSelect />
                <Select.Label srOnly>월 선택</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="월" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {monthCollection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Flex>
            <Flex align="center" gap={2}>
              <Heading
                size="lg"
                color={colors.text.primary}
                letterSpacing="tight"
              >
                수영장 관리
              </Heading>
              <Badge
                bg={colors.secondary.light}
                color={colors.secondary.default}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
          </Flex>

          {/* Lesson List */}
          <Box>
            <LessonList
              lessons={adminLessons}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              isLoading={isAdminLessonsLoading}
              selectedLessonMenuId={selectedAdminLesson?.lessonId}
              loadingLessonId={
                deleteAdminLessonMutation.isPending
                  ? selectedAdminLesson?.lessonId ?? null
                  : null
              }
            />
          </Box>

          {/* Lesson Editor */}
          <Box id="lessonEditor" position="relative">
            <LessonEditor
              lesson={selectedAdminLesson}
              onSubmit={handleSaveLesson}
              onDelete={handleRemoveLesson}
              onAddNew={handleAddLessonClick}
              isLoading={
                createAdminLessonMutation.isPending ||
                updateAdminLessonMutation.isPending ||
                deleteAdminLessonMutation.isPending
              }
            />
          </Box>

          {/* Admin Tabs Manager */}
          <Box id="adminTabs" position="relative">
            <AdminTabsManager
              activeLessonId={selectedAdminLesson?.lessonId}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </Box>

          {/* Locker Manager */}
          <Box id="lockerManager" position="relative">
            <LockerManager />
          </Box>

          {/* Statistics Manager */}
          <Box id="statisticsManager" position="relative">
            <StatisticsManager />
          </Box>
        </GridSection>
      </Box>
    </Box>
  );
};
