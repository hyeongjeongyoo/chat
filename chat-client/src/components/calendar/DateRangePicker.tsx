"use client";

import React from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";

interface DateInfo {
  year: number;
  month: number;
  day: number;
}

interface NightsDays {
  nights: number;
  days: number;
}

type SelectionMode = "checkIn" | "checkOut";

interface DateRangePickerProps {
  currentDate: Date;
  nextMonthDate: Date;
  checkInDate: DateInfo | null;
  checkOutDate: DateInfo | null;
  selectionMode: SelectionMode;
  onDateClick: (day: number, monthDate: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onApplyDates: () => void;
  onResetDates: () => void;
}

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number): number =>
  new Date(year, month, 1).getDay();

const isSameDate = (d1: DateInfo | null, d2: DateInfo | null): boolean =>
  !!(
    d1 &&
    d2 &&
    d1.year === d2.year &&
    d1.month === d2.month &&
    d1.day === d2.day
  );

const isDateInRange = (
  date: DateInfo,
  start: DateInfo,
  end: DateInfo
): boolean => {
  const check = new Date(date.year, date.month, date.day);
  const s = new Date(start.year, start.month, start.day);
  const e = new Date(end.year, end.month, end.day);
  return check >= s && check <= e;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentDate,
  nextMonthDate,
  checkInDate,
  checkOutDate,
  selectionMode,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onApplyDates,
  onResetDates,
}) => {
  const renderCalendar = (monthDate: Date, calendarIndex: number) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // 이전 달의 날짜들
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      return daysInPrevMonth - firstDayOfMonth + i + 1;
    });

    // 현재 달의 날짜들
    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    );

    return (
      <Box flex="1">
        <Flex justify="space-between" align="center" mb={2}>
          {(calendarIndex === 0 || window.innerWidth < 768) && (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={onPrevMonth}
              aria-label="이전 달"
            >
              <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.84306 12.7109L7.50006 18.3679L8.91406 16.9539L3.96406 12.0039L8.91406 7.05389L7.50006 5.63989L1.84306 11.2969C1.65559 11.4844 1.55028 11.7387 1.55028 12.0039C1.55028 12.2691 1.65559 12.5234 1.84306 12.7109Z"
                  fill="#2E3192"
                />
              </svg>
            </Box>
          )}
          <Text
            fontWeight="700"
            fontSize="md"
            color="#2E3192"
            textAlign="center"
            flex="1"
          >
            {year}년 {month + 1}월
          </Text>
          {(calendarIndex === 1 || window.innerWidth < 768) && (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={onNextMonth}
              aria-label="다음 달"
            >
              <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.1569 12.7109L4.49994 18.3679L3.08594 16.9539L8.03594 12.0039L3.08594 7.05389L4.49994 5.63989L10.1569 11.2969C10.3444 11.4844 10.4497 11.7387 10.4497 12.0039C10.4497 12.2691 10.3444 12.5234 10.1569 12.7109Z"
                  fill="#2E3192"
                />
              </svg>
            </Box>
          )}
        </Flex>
        <Flex
          justifyContent="space-between"
          color="#373636"
          fontWeight="bold"
          fontSize="sm"
          mb={1}
          w="100%"
        >
          {weekDays.map((d, i) => (
            <Box
              key={d}
              w="calc(100% / 7)"
              textAlign="center"
              color={i === 0 || i === 6 ? "#2E3192" : "#373636"}
            >
              {d}
            </Box>
          ))}
        </Flex>
        {/* 날짜 셀 */}
        <Flex wrap="wrap" w="100%">
          {prevMonthDays.map((day, i) => (
            <Box
              key={`prev-${i}`}
              w="calc(100% / 7)"
              h="32px"
              textAlign="center"
              lineHeight="32px"
              borderRadius="8px"
              color="#BDBDBD"
              bg="transparent"
              fontSize="sm"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
          {currentMonthDays.map((day, i) => {
            const dateInfo: DateInfo = { year, month, day };
            const isCheckIn = checkInDate && isSameDate(dateInfo, checkInDate);
            const isCheckOut =
              checkOutDate && isSameDate(dateInfo, checkOutDate);
            const isInRange =
              checkInDate &&
              checkOutDate &&
              isDateInRange(dateInfo, checkInDate, checkOutDate);
            return (
              <Box
                key={`current-${i}`}
                w="calc(100% / 7)"
                h="32px"
                textAlign="center"
                lineHeight="32px"
                borderRadius="8px"
                fontWeight={
                  isCheckIn || isCheckOut ? "700" : isInRange ? "600" : "500"
                }
                color={
                  isCheckIn || isCheckOut
                    ? "#fff"
                    : isInRange
                    ? "#2E3192"
                    : "#232323"
                }
                bg={
                  isCheckIn || isCheckOut
                    ? "#2E3192"
                    : isInRange
                    ? "#F0F2F7"
                    : "transparent"
                }
                cursor="pointer"
                onClick={() => onDateClick(day, monthDate)}
              >
                {day}
              </Box>
            );
          })}
        </Flex>
      </Box>
    );
  };

  return (
    <Box>
      <Flex
        px={{ base: 4, md: 5, lg: 6 }}
        py={{ base: 3, md: 3.5, lg: 4 }}
        gap={{ base: 6, md: 8, lg: 12 }}
        direction={{
          base: "column",
          md: "column",
          lg: "row",
        }}
      >
        <Box flex="1">{renderCalendar(currentDate, 0)}</Box>
        <Box flex="1" display={{ base: "none", lg: "block" }}>
          {renderCalendar(nextMonthDate, 1)}
        </Box>
      </Flex>
      <Box
        borderTop="1.5px solid #E0E0E0"
        mt={{ base: 4, md: 5, lg: 6 }}
        px={{ base: 4, md: 5, lg: 6 }}
        py={{ base: 3, md: 3.5, lg: 4 }}
      >
        <Flex justifyContent="flex-end" gap={3}>
          <Button
            variant="outline"
            borderColor="#2E3192"
            color="#2E3192"
            borderRadius={{
              base: "6px",
              md: "7px",
              lg: "8px",
            }}
            fontWeight="700"
            px={{ base: 4, md: 5, lg: 6 }}
            py={{ base: 1.5, md: 1.75, lg: 2 }}
            fontSize={{ base: "sm", md: "md", lg: "md" }}
            _hover={{ bg: "#ECECF6" }}
            onClick={onResetDates}
          >
            초기화
          </Button>
          <Button
            bg="#2E3192"
            color="#fff"
            borderRadius={{
              base: "6px",
              md: "7px",
              lg: "8px",
            }}
            fontWeight="700"
            px={{ base: 4, md: 5, lg: 6 }}
            py={{ base: 1.5, md: 1.75, lg: 2 }}
            fontSize={{ base: "sm", md: "md", lg: "md" }}
            _hover={{ bg: "#232366" }}
            onClick={onApplyDates}
            disabled={!(checkInDate && checkOutDate)}
          >
            적용
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
