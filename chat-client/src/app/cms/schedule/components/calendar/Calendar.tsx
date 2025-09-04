import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Stack,
  Flex,
} from "@chakra-ui/react";
import {
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  getYear,
  setMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Schedule } from "../../types";
import { useColors } from "@/styles/theme";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

interface CalendarProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onScheduleClick: (schedule: Schedule | null) => void;
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  schedules,
  onDateChange,
  onDateSelect,
  onScheduleClick,
  minDate,
  maxDate,
  selectedDate,
}) => {
  const colors = useColors();
  const bgColor = colors.bg;
  const scheduleBgColor = colors.primary.default;
  const [selectedDateState, setSelectedDate] = useState<Date | null>(
    selectedDate || null
  );

  // 날짜 유효성 검사
  const validateDate = (date: Date): boolean => {
    const d = dayjs(date);
    if (!d.isValid()) return false;
    if (minDate && d.isBefore(dayjs(minDate))) return false;
    if (maxDate && d.isAfter(dayjs(maxDate))) return false;
    return true;
  };

  const currentMonth = dayjs(currentDate).month(); // 0-indexed

  // 현재 달의 시작일과 마지막일 계산
  const startDate = useMemo(
    () => dayjs(currentDate).startOf("month").toDate(),
    [currentDate]
  );
  const endDate = useMemo(
    () => dayjs(currentDate).endOf("month").toDate(),
    [currentDate]
  );

  // 달력에 표시할 모든 날짜 계산
  const days = useMemo(() => {
    const firstDayOfMonth = dayjs(startDate).day();
    const daysInMonth = dayjs(currentDate).daysInMonth();

    const prevMonthDaysArray = Array.from({ length: firstDayOfMonth }, (_, i) =>
      dayjs(startDate)
        .subtract(firstDayOfMonth - i, "day")
        .toDate()
    );

    const currentMonthDaysArray = Array.from({ length: daysInMonth }, (_, i) =>
      dayjs(startDate).add(i, "day").toDate()
    );

    const totalCells = 35; // 7 days * 5 weeks
    const remainingCells =
      totalCells - (prevMonthDaysArray.length + currentMonthDaysArray.length);

    const nextMonthDaysArray = Array.from(
      { length: Math.max(0, remainingCells) },
      (_, i) =>
        dayjs(
          currentMonthDaysArray[currentMonthDaysArray.length - 1] || endDate
        )
          .add(i + 1, "day")
          .toDate()
    );

    return [
      ...prevMonthDaysArray,
      ...currentMonthDaysArray,
      ...nextMonthDaysArray,
    ].slice(0, totalCells);
  }, [currentDate, startDate, endDate]);

  // 일정 그룹화
  const schedulesMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const startDate = new Date(schedule.startDateTime);
      const endDate = new Date(schedule.endDateTime);
      const currentDate = new Date(startDate);

      // 시작일부터 종료일까지 모든 날짜에 일정 추가
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(schedule);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return map;
  }, [schedules]);

  // 일정 정렬
  const sortSchedulesByTime = (schedules: Schedule[]) => {
    return [...schedules].sort((a, b) => {
      return (
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
      );
    });
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex);
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  const handlePrevYear = () => {
    const newDate = subMonths(currentDate, 12);
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  const handleNextYear = () => {
    const newDate = addMonths(currentDate, 12);
    if (validateDate(newDate)) {
      onDateChange(newDate);
      setSelectedDate(null);
    }
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (!validateDate(date)) return;
    setSelectedDate(date);
    onDateSelect(date);

    const dateStr = format(date, "yyyy-MM-dd");
    const daySchedules = schedulesMap[dateStr] || [];

    if (daySchedules.length > 0) {
      onScheduleClick(sortSchedulesByTime(daySchedules)[0]);
    } else {
      onScheduleClick(null);
    }
  };

  // 일정 클릭 핸들러
  const handleScheduleClick = (schedule: Schedule, date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
    onScheduleClick(schedule);
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDayEng = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = Array.from(
    { length: 12 },
    (_, i) => `${String(i + 1).padStart(2, "0")}월`
  );

  return (
    <Box bg={bgColor} p={0} width="100%">
      {/* Year Navigation */}
      <Flex justify="center" align="center" mb={2}>
        <IconButton
          aria-label="이전 년도"
          onClick={handlePrevYear}
          variant="ghost"
          size="lg"
          disabled={
            minDate && getYear(subMonths(currentDate, 12)) < getYear(minDate)
          }
          color="gray.700"
          _hover={{
            bg: "transparent",
            color: "blue.700",
          }}
        >
          <FiChevronLeft />
        </IconButton>
        <Text fontSize="2xl" fontWeight="bold" mx={4} color="gray.700">
          {getYear(currentDate)}년
        </Text>
        <IconButton
          aria-label="다음 년도"
          onClick={handleNextYear}
          variant="ghost"
          size="lg"
          color="gray.700"
          disabled={
            maxDate && getYear(addMonths(currentDate, 12)) > getYear(maxDate)
          }
          _hover={{
            bg: "transparent",
            color: "blue.700",
          }}
        >
          <FiChevronRight />
        </IconButton>
      </Flex>

      {/* Month Navigation */}
      <HStack
        gap={0}
        justify="space-between"
        mb={2}
        p={3}
        bg="#0A2540"
        borderRadius="md"
      >
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            onClick={() => handleMonthChange(index)}
            fontWeight={currentMonth === index ? "bold" : "normal"}
            color={currentMonth === index ? "#FFD700" : "white"}
            fontSize="md"
            flex={1}
            textAlign="center"
            _hover={{
              color: currentMonth === index ? "#FFD700" : "gray.300",
              textDecoration: "none",
              bg: "transparent",
            }}
            _focus={{ boxShadow: "none" }}
          >
            {month}
          </Button>
        ))}
      </HStack>

      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={0}
        borderWidth="1px"
        borderColor="gray.300"
        borderRadius="md"
        overflow="hidden"
      >
        {weekDays.map((day, index) => (
          <VStack
            key={day}
            textAlign="center"
            py={2}
            fontWeight="bold"
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.300"
            gap={0}
          >
            <Text
              fontSize="sm"
              color={
                day === "일"
                  ? "red.500"
                  : day === "토"
                  ? "blue.500"
                  : "gray.700"
              }
            >
              {day}
            </Text>
            <Text
              fontSize="xs"
              color={
                day === "일"
                  ? "red.500"
                  : day === "토"
                  ? "blue.500"
                  : "gray.500"
              }
            >
              {weekDayEng[index]}
            </Text>
          </VStack>
        ))}

        {days.map((date, idx) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const daySchedules = schedulesMap[dateStr] || [];
          const sortedSchedules = sortSchedulesByTime(daySchedules);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isDisabled = !isCurrentMonth || !validateDate(date);
          const dayOfWeekIndex = getDay(date);
          const isSelected =
            selectedDateState && isSameDay(date, selectedDateState);
          const isTodayDate = isToday(date);

          return (
            <Box
              key={dateStr}
              p={1.5}
              bg={isSelected ? "blue.100" : isTodayDate ? "blue.50" : "white"}
              minH="120px"
              maxH="120px"
              role="gridcell"
              aria-label={format(date, "yyyy년 M월 d일 EEEE", { locale: ko })}
              opacity={isCurrentMonth ? 1 : 0.4}
              cursor={isDisabled ? "not-allowed" : "pointer"}
              onClick={() => !isDisabled && handleDateClick(date)}
              overflow="hidden"
              _hover={
                !isDisabled && !isSelected
                  ? {
                      bg: "gray.50",
                    }
                  : {}
              }
              transition="background-color 0.2s ease-out"
              position="relative"
              borderRightWidth={idx % 7 === 6 ? "0" : "1px"}
              borderBottomWidth={idx >= days.length - 7 ? "0" : "1px"}
              borderColor="gray.300"
            >
              <Flex direction="column" gap={1} height="100%">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={
                    isDisabled
                      ? "gray.400"
                      : isSelected
                      ? "blue.700"
                      : isTodayDate
                      ? colors.primary.default
                      : dayOfWeekIndex === 0
                      ? "red.500"
                      : dayOfWeekIndex === 6
                      ? "blue.500"
                      : "gray.800"
                  }
                  alignSelf="flex-start"
                  pb={0.5}
                >
                  {format(date, "d")}
                </Text>
                <Stack
                  direction="column"
                  gap={0.5}
                  flexGrow={1}
                  overflowY="auto"
                  maxH="calc(100% - 20px)"
                  css={{
                    "&::-webkit-scrollbar": {
                      width: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: colors.primary.default,
                      borderRadius: "24px",
                    },
                  }}
                >
                  {sortedSchedules.slice(0, 2).map((schedule) => {
                    const isStartDate =
                      format(new Date(schedule.startDateTime), "yyyy-MM-dd") ===
                      dateStr;

                    const scheduleItemBgColor = schedule.title.includes("중요")
                      ? scheduleBgColor
                      : isTodayDate && !isSelected
                      ? "gray.50"
                      : "gray.100";
                    const scheduleItemTextColor = schedule.title.includes(
                      "중요"
                    )
                      ? "white"
                      : "gray.700";

                    return (
                      <Box
                        key={schedule.scheduleId}
                        py={0.5}
                        px={1.5}
                        bg={scheduleItemBgColor}
                        color={scheduleItemTextColor}
                        borderRadius="xs"
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleClick(schedule, date);
                        }}
                        _hover={{
                          opacity: 0.8,
                        }}
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                      >
                        <Text fontSize="11px" lineHeight="1.2">
                          {isStartDate
                            ? `${format(
                                new Date(schedule.startDateTime),
                                "HH:mm"
                              )}~${format(
                                new Date(schedule.endDateTime),
                                "HH:mm"
                              )}`
                            : ""}{" "}
                          {schedule.title}
                        </Text>
                      </Box>
                    );
                  })}
                  {sortedSchedules.length > 2 && (
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textAlign="center"
                      cursor="pointer"
                      mt={0.5}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(date);
                      }}
                      _hover={{ textDecoration: "underline" }}
                    >
                      +{sortedSchedules.length - 2} 더보기
                    </Text>
                  )}
                </Stack>
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
