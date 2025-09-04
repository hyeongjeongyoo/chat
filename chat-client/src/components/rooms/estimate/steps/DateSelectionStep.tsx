"use client";

import { EstimateCalendar } from "@/components/rooms/EstimateCalendar";
import { useEstimateContext } from "@/contexts/EstimateContext";
import { Box, Heading } from "@chakra-ui/react";
import React from "react";

export const DateSelectionStep = ({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) => {
  const { checkInDate, setCheckInDate, checkOutDate, setCheckOutDate } =
    useEstimateContext();

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [nextMonthDate, setNextMonthDate] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });
  const [selectionMode, setSelectionMode] = React.useState<
    "checkIn" | "checkOut"
  >("checkIn");
  const [selectedRangeText, setSelectedRangeText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(true);

  const handleResetDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
    setSelectedRangeText("");
  };

  return (
    <Box>
      <Heading size="xl" as="h2" mb={10} textAlign="center">
        이용하실 날짜를 선택해주세요.
      </Heading>
      <EstimateCalendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        nextMonthDate={nextMonthDate}
        setNextMonthDate={setNextMonthDate}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        selectedRangeText={selectedRangeText}
        setSelectedRangeText={setSelectedRangeText}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onApplyDates={handleNext}
        onResetDates={handleResetDates}
        handlePrev={handlePrev}
      />
    </Box>
  );
};
