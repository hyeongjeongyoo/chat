"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  Flex,
  Heading,
  Badge,
  VStack,
  Box,
  Separator,
} from "@chakra-ui/react";
import { Calendar } from "@/app/cms/schedule/components/calendar/Calendar";
import { Schedule, ScheduleListResponse } from "@/app/cms/schedule/types";
import { scheduleApi } from "@/lib/api/schedule";
import { useQuery } from "@tanstack/react-query";
import { ScheduleItem } from "./components/ScheduleItem";
import dayjs from "dayjs";

export default function GuidePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [schedulesForSelectedDate, setSchedulesForSelectedDate] = useState<
    Schedule[]
  >([]);

  // Queries
  const { data: schedulesResponse, isLoading: isSchedulesLoading } = useQuery<
    ScheduleListResponse,
    Error
  >({
    queryKey: [
      "schedules",
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
    ],
    queryFn: () =>
      scheduleApi.getSchedules({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      }),
  });

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    // Find all schedules for the selected date
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    const filteredSchedules = schedules.filter((schedule) => {
      const scheduleDate = dayjs(schedule.startDateTime).format("YYYY-MM-DD");
      return scheduleDate === formattedDate;
    });

    setSchedulesForSelectedDate(filteredSchedules);

    // Open dialog if there are schedules for this date
    if (filteredSchedules.length > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleScheduleClick = (schedule: Schedule | null) => {
    if (schedule) {
      setSelectedSchedule(schedule);
      setIsDialogOpen(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const weekdays = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    const weekday = weekdays[date.day()];
    return `${date.format("YYYY.MM.DD")} ${weekday}`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    return `${start.format("HH:mm")} ~ ${end.format("HH:mm")}`;
  };

  useEffect(() => {
    if (schedulesResponse?.data?.schedules) {
      setSchedules(schedulesResponse.data.schedules);
    }
  }, [schedulesResponse]);

  return (
    <Container maxW="1600px" height="100vh">
      <Calendar
        currentDate={currentDate}
        schedules={schedules}
        onDateChange={handleDateChange}
        onDateSelect={handleDateSelect}
        onScheduleClick={handleScheduleClick}
        selectedDate={selectedDate || undefined}
      />

      {/* Schedule Details Dialog */}
      <Dialog.Root
        lazyMount
        placement="center"
        preventScroll
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="500px"
              p={0}
              borderRadius="md"
              overflow="hidden"
            >
              {/* Custom header with blue background */}
              <Box bg="#2962FF" color="white" py={4} px={4} position="relative">
                <Text fontWeight="bold" fontSize="lg">
                  예약현황
                </Text>
                <Dialog.CloseTrigger position="absolute">
                  <CloseButton color="white" size="md" />
                </Dialog.CloseTrigger>
              </Box>

              {/* Date header */}
              {selectedDate && (
                <Box
                  textAlign="center"
                  py={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <Heading size="md">
                    {formatDate(selectedDate.toISOString())}
                  </Heading>
                </Box>
              )}

              {/* Schedule list with scroll */}
              <Box maxH="400px" overflowY="auto" px={0} py={0}>
                {schedulesForSelectedDate.length === 0 && selectedSchedule && (
                  <ScheduleItem schedule={selectedSchedule} />
                )}

                {schedulesForSelectedDate.length > 0 && (
                  <VStack gap={0} align="stretch">
                    {schedulesForSelectedDate.map((schedule, index) => (
                      <ScheduleItem
                        key={schedule.scheduleId || index}
                        schedule={schedule}
                      />
                    ))}
                  </VStack>
                )}

                {schedulesForSelectedDate.length === 0 && !selectedSchedule && (
                  <Box p={4} textAlign="center">
                    <Text>선택한 날짜에 예정된 일정이 없습니다.</Text>
                  </Box>
                )}
              </Box>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Container>
  );
}
