"use client";

import { Box, Text } from "@chakra-ui/react";
import { Schedule } from "@/app/cms/schedule/types";
import dayjs from "dayjs";

interface ScheduleItemProps {
  schedule: Schedule;
}

// Component to display a schedule item
export function ScheduleItem({ schedule }: ScheduleItemProps) {
  // Helper to format date as YYYY.MM.DD(요일)
  const formatDatePart = (date: Date): string => {
    const d = dayjs(date);
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[d.day()];
    return `${d.format("YYYY.MM.DD")}(${weekday})`;
  };

  // Helper to format time as HH:MM
  const formatTimePart = (date: Date): string => {
    return dayjs(date).format("HH:mm");
  };

  // Format the full start and end date/time strings
  const formatDetailedDateTime = (dateTimeString: string): string => {
    const date = dayjs(dateTimeString);
    return `${formatDatePart(date.toDate())} ${formatTimePart(date.toDate())}`;
  };

  const startDateObj = dayjs(schedule.startDateTime).toDate();
  const endDateObj = dayjs(schedule.endDateTime).toDate();

  // Determine the text for the blue time slot header
  const getTimeSlotHeaderText = (): string => {
    const startCalDate = dayjs(schedule.startDateTime).format("YYYY-MM-DD");
    const endCalDate = dayjs(schedule.endDateTime).format("YYYY-MM-DD");

    const startTime = formatTimePart(startDateObj);

    if (startCalDate === endCalDate) {
      // Event starts and ends on the same calendar day
      const endTime = formatTimePart(endDateObj);
      return `${startTime} ~ ${endTime}`;
    } else {
      // Event spans multiple calendar days
      return startTime; // Show only start time in header
    }
  };

  const timeSlotHeaderText = getTimeSlotHeaderText();
  const formattedStartDateTime = formatDetailedDateTime(schedule.startDateTime);
  const formattedEndDateTime = formatDetailedDateTime(schedule.endDateTime);

  return (
    <Box borderBottom="1px solid" borderColor="gray.200">
      {/* Time slot with light blue background */}
      <Box bg="#E3F2FD" p={2} px={4}>
        <Text fontWeight="medium">{timeSlotHeaderText}</Text>
      </Box>

      {/* Schedule content */}
      <Box p={4}>
        <Text fontWeight="bold" mb={1}>
          {schedule.title}
        </Text>
        {schedule.content && (
          <Text color="gray.600" fontSize="sm" whiteSpace="pre-line" mb={2}>
            {schedule.content}
          </Text>
        )}
        <Text fontSize="sm" color="gray.700">
          시작: {formattedStartDateTime}
        </Text>
        <Text fontSize="sm" color="gray.700">
          종료: {formattedEndDateTime}
        </Text>
      </Box>
    </Box>
  );
}
