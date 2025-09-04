import React, { Dispatch, SetStateAction } from "react";
import { Box, Flex, Grid, Text, Button } from "@chakra-ui/react";
import { DateInfo } from "@/types/calendar";

interface EstimateCalendarProps {
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  nextMonthDate: Date;
  setNextMonthDate: Dispatch<SetStateAction<Date>>;
  checkInDate: DateInfo | null;
  setCheckInDate: Dispatch<SetStateAction<DateInfo | null>>;
  checkOutDate: DateInfo | null;
  setCheckOutDate: Dispatch<SetStateAction<DateInfo | null>>;
  selectionMode: "checkIn" | "checkOut";
  setSelectionMode: Dispatch<SetStateAction<"checkIn" | "checkOut">>;
  selectedRangeText: string;
  setSelectedRangeText: Dispatch<SetStateAction<string>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  // Added for direct use in EstimateCalendar
  onApplyDates: () => void; // A callback to apply dates, passed from parent
  onResetDates: () => void; // A callback to reset dates, passed from parent
  handlePrev: () => void;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDate = (date1: DateInfo, date2: DateInfo) => {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
};

const isDateInRange = (date: DateInfo, start: DateInfo, end: DateInfo) => {
  const checkDate = new Date(date.year, date.month, date.day);
  const startDate = new Date(start.year, start.month, start.day);
  const endDate = new Date(end.year, end.month, end.day);

  return checkDate >= startDate && checkDate <= endDate;
};

const getNightsDays = (checkIn: DateInfo | null, checkOut: DateInfo | null) => {
  if (!checkIn || !checkOut) return null;
  const inDate = new Date(checkIn.year, checkIn.month, checkIn.day);
  const outDate = new Date(checkOut.year, checkOut.month, checkOut.day);
  const diff = outDate.getTime() - inDate.getTime();
  if (diff <= 0) return null;
  const nights = diff / (1000 * 60 * 60 * 24);
  const days = nights + 1;
  return { nights, days };
};

export const EstimateCalendar = ({
  currentDate,
  setCurrentDate,
  nextMonthDate,
  setNextMonthDate,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  selectionMode,
  setSelectionMode,
  selectedRangeText,
  setSelectedRangeText,
  isOpen,
  setIsOpen,
  onApplyDates,
  onResetDates,
  handlePrev,
}: EstimateCalendarProps) => {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    const newCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newCurrentDate);
    setNextMonthDate(
      new Date(newCurrentDate.getFullYear(), newCurrentDate.getMonth() + 1, 1)
    );
  };

  const handleNextMonth = () => {
    const newCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newCurrentDate);
    setNextMonthDate(
      new Date(newCurrentDate.getFullYear(), newCurrentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number, monthDate: Date) => {
    const clickedDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day
    );

    if (clickedDate < today) {
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
        day: day,
      });
      setCheckOutDate(null);
      setSelectionMode("checkOut");
      setSelectedRangeText(
        `${monthDate.getFullYear()}.${monthDate.getMonth() + 1}.${day} -`
      );
    } else {
      const checkInAsDate = new Date(
        checkInDate.year,
        checkInDate.month,
        checkInDate.day
      );

      if (clickedDate.getTime() === checkInAsDate.getTime()) {
        onResetDates();
        return;
      }

      if (clickedDate < checkInAsDate) {
        setCheckOutDate(checkInDate);
        setCheckInDate({
          year: monthDate.getFullYear(),
          month: monthDate.getMonth(),
          day: day,
        });
        setSelectedRangeText(
          `${monthDate.getFullYear()}.${monthDate.getMonth() + 1}.${day} - ${
            checkInDate.year
          }.${checkInDate.month + 1}.${checkInDate.day}`
        );
      } else {
        setCheckOutDate({
          year: monthDate.getFullYear(),
          month: monthDate.getMonth(),
          day: day,
        });
        setSelectedRangeText(
          `${checkInDate.year}.${checkInDate.month + 1}.${
            checkInDate.day
          } - ${monthDate.getFullYear()}.${monthDate.getMonth() + 1}.${day}`
        );
      }
      setSelectionMode("checkIn");
    }
  };

  const renderCalendarContent = (
    monthDate: Date,
    calendarIndex: number,
    isMobile: boolean
  ) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      return daysInPrevMonth - firstDayOfMonth + i + 1;
    });

    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    );

    const nextMonthDays = Array.from(
      { length: 42 - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => i + 1
    );

    return (
      <>
        <Flex justify="space-between" align="center" mb={2}>
          {calendarIndex === 0 || isMobile ? (
            <Box
              as="button"
              p={1}
              _hover={{ bg: "gray.100" }}
              onClick={handlePrevMonth}
              aria-label="이전 달"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="24"
                viewBox="0 0 12 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.84306 12.7109L7.50006 18.3679L8.91406 16.9539L3.96406 12.0039L8.91406 7.05389L7.50006 5.63989L1.84306 11.2969C1.65559 11.4844 1.55028 11.7387 1.55028 12.0039C1.55028 12.2691 1.65559 12.5234 1.84306 12.7109Z"
                  fill="black"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
          <Text
            fontWeight="700"
            fontSize="sm"
            color="#2E3192"
            textAlign="center"
          >
            {year}년 {month + 1}월
          </Text>
          {calendarIndex === 1 || isMobile ? (
            <Box
              as="button"
              p={1}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
              onClick={handleNextMonth}
              aria-label="다음 달"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="24"
                viewBox="0 0 12 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.1569 12.7109L4.49994 18.3679L3.08594 16.9539L8.03594 12.0039L3.08594 7.05389L4.49994 5.63989L10.1569 11.2969C10.3444 11.4844 10.4497 11.7387 10.4497 12.0039C10.4497 12.2691 10.3444 12.5234 10.1569 12.7109Z"
                  fill="black"
                />
              </svg>
            </Box>
          ) : (
            <Box width="32px" />
          )}
        </Flex>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
          {weekDays.map((day, i) => (
            <Box
              key={i}
              textAlign="center"
              fontWeight="bold"
              color={i === 0 ? "#2E3192" : i === 6 ? "#2E3192" : "#373636"}
              fontSize="xs"
              py={1}
            >
              {day}
            </Box>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} flex="1">
          {prevMonthDays.map((day, i) => (
            <Box
              key={`prev-${i}`}
              textAlign="center"
              p={1}
              borderRadius="md"
              color="#BDBDBD"
              bg="transparent"
              fontSize="xs"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
          {currentMonthDays.map((day, i) => {
            const dateInfo: DateInfo = {
              year: year,
              month: month,
              day: day,
            };
            const isWeekend =
              (i + firstDayOfMonth) % 7 === 0 ||
              (i + firstDayOfMonth) % 7 === 6;
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;
            const isCheckIn = checkInDate && isSameDate(dateInfo, checkInDate);
            const isCheckOut =
              checkOutDate && isSameDate(dateInfo, checkOutDate);
            const isInRange =
              checkInDate &&
              checkOutDate &&
              isDateInRange(dateInfo, checkInDate, checkOutDate);
            const isDisabled = new Date(year, month, day) < today;
            return (
              <Box
                key={`current-${i}`}
                textAlign="center"
                p={1}
                borderRadius="8px"
                fontWeight="bold"
                fontSize="xs"
                bg={
                  isCheckIn || isCheckOut
                    ? "#2E3192"
                    : isInRange
                    ? "#F0F2F7"
                    : isToday
                    ? "#E6F0FA"
                    : "transparent"
                }
                color={isCheckIn || isCheckOut ? "white" : "#373636"}
                transition="background 0.2s, color 0.2s"
                cursor="pointer"
                _hover={{
                  bg: isCheckIn || isCheckOut ? "#1B2066" : "#E6F0FA",
                }}
                onClick={() => handleDateClick(day, monthDate)}
                _disabled={{
                  bg: isCheckIn || isCheckOut ? "#1B2066" : "#E6F0FA",
                  cursor: "default",
                }}
              >
                {day}
              </Box>
            );
          })}
          {nextMonthDays.map((day, i) => (
            <Box
              key={`next-${i}`}
              textAlign="center"
              p={1}
              borderRadius="md"
              color="#BDBDBD"
              bg="transparent"
              fontSize="xs"
              opacity={0.5}
              cursor="default"
            >
              {day}
            </Box>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <Box p={4} backgroundColor="#F7F8FB">
      <Flex gap={4} justify="space-between">
        <Box display="flex" flexDirection="column" flex="1">
          {renderCalendarContent(
            currentDate,
            0,
            typeof window !== "undefined" && window.innerWidth < 768
          )}
        </Box>
        <Box
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          flex="1"
        >
          {renderCalendarContent(nextMonthDate, 1, false)}
        </Box>
      </Flex>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={2}
        mt={2}
        py={2}
        borderTop="1px solid #838383"
      >
        <Button
          px={4}
          py={2}
          borderRadius="md"
          bg="#F8F8FA"
          color="#2E3192"
          fontWeight="bold"
          border="1px solid #2E3192"
          _hover={{ bg: "#E6F0FA" }}
          onClick={handlePrev}
        >
          이전
        </Button>
        <Button
          px={4}
          py={2}
          borderRadius="md"
          bg="#F8F8FA"
          color="#2E3192"
          fontWeight="bold"
          border="1px solid #2E3192"
          _hover={{ bg: "#E6F0FA" }}
          onClick={onResetDates}
        >
          날짜 초기화
        </Button>
        <Button
          px={4}
          py={2}
          borderRadius="md"
          bg="#2E3192"
          color="white"
          fontWeight="bold"
          _hover={{ bg: "#1B2066" }}
          onClick={onApplyDates}
          disabled={
            !(
              checkInDate &&
              checkOutDate &&
              getNightsDays(checkInDate, checkOutDate)
            )
          }
        >
          적용
        </Button>
      </Box>
    </Box>
  );
};
