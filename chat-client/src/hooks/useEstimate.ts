import React from "react";
import { DateInfo } from "@/types/calendar";
import { Seminars, rooms } from "@/data/estimateData";

export const useEstimate = () => {
  // 달력 상태 관리 추가
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [nextMonthDate, setNextMonthDate] = React.useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [checkInDate, setCheckInDate] = React.useState<DateInfo | null>(null);
  const [checkOutDate, setCheckOutDate] = React.useState<DateInfo | null>(null);
  const [selectionMode, setSelectionMode] = React.useState<
    "checkIn" | "checkOut"
  >("checkIn");
  const [selectedRangeText, setSelectedRangeText] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);

  // 세미나실/객실 리스트
  const hallList = Seminars.map((s) => s.name);
  const roomList = rooms.map((r) => r.name);

  // 가격적 산출 프로그램 상태 추가
  const [hallDays, setHallDays] = React.useState(
    Array(hallList.length).fill(0)
  );
  const [roomNights, setRoomNights] = React.useState(
    Array(roomList.length).fill(0)
  );
  const [roomCounts, setRoomCounts] = React.useState(
    Array(roomList.length).fill(0)
  );

  // 달력 관련 함수들
  const formatDate = (date: DateInfo) => {
    return `${date.year}.${(date.month + 1)
      .toString()
      .padStart(2, "0")}.${date.day.toString().padStart(2, "0")}`;
  };

  const getNightsDays = (
    checkIn: DateInfo | null,
    checkOut: DateInfo | null
  ) => {
    if (!checkIn || !checkOut) return null;
    const inDate = new Date(checkIn.year, checkIn.month, checkIn.day);
    const outDate = new Date(checkOut.year, checkOut.month, checkOut.day);
    const diff = outDate.getTime() - inDate.getTime();
    if (diff <= 0) return null;
    const nights = diff / (1000 * 60 * 60 * 24);
    const days = nights + 1;
    return { nights, days };
  };

  const handleApplyDates = () => {
    if (checkInDate && checkOutDate) {
      const range = getNightsDays(checkInDate, checkOutDate);
      if (range) {
        setSelectedRangeText(
          `${formatDate(checkInDate)} ~ ${formatDate(checkOutDate)} (${
            range.nights
          }박 ${range.days}일)`
        );
        setRoomNights(Array(roomList.length).fill(range.nights));
        setIsOpen(false);
      }
    }
  };

  const handleResetDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectionMode("checkIn");
    setSelectedRangeText("");
  };

  const getWeekdayWeekendNights = (
    checkIn: DateInfo | null,
    checkOut: DateInfo | null
  ) => {
    if (!checkIn || !checkOut) return { weekday: 0, weekend: 0 };
    const inDate = new Date(checkIn.year, checkIn.month, checkIn.day);
    const outDate = new Date(checkOut.year, checkOut.month, checkOut.day);
    let weekday = 0;
    let weekend = 0;
    for (let d = new Date(inDate); d < outDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) weekend++;
      else weekday++;
    }
    return { weekday, weekend };
  };

  // 핸들러
  const handleHallDay = (idx: number, delta: number) => {
    setHallDays((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };

  const handleRoomCount = (idx: number, delta: number) => {
    setRoomCounts((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };

  // 세미나실 총 금액 계산
  const seminarTotal = React.useMemo(() => {
    return Seminars.reduce((sum, seminar, idx) => {
      return sum + seminar.price * (hallDays[idx] || 0);
    }, 0);
  }, [hallDays]);

  // 객실 총 금액 계산 (주말/평일 요금 반영)
  const roomTotal = React.useMemo(() => {
    const { weekday, weekend } = getWeekdayWeekendNights(
      checkInDate,
      checkOutDate
    );
    return rooms.reduce((sum, room, idx) => {
      const nights = roomNights[idx] || 0;
      const count = roomCounts[idx] || 0;
      let weekdayNights = 0;
      let weekendNights = 0;
      if (weekday + weekend > 0 && nights > 0) {
        weekdayNights = Math.round((weekday / (weekday + weekend)) * nights);
        weekendNights = nights - weekdayNights;
      }
      return (
        sum +
        (room.weekdayPrice * weekdayNights +
          room.weekendPrice * weekendNights) *
          count
      );
    }, 0);
  }, [roomNights, roomCounts, checkInDate, checkOutDate]);

  const totalAmount = seminarTotal + roomTotal;

  return {
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
    handleApplyDates,
    handleResetDates,
    infoItems01: [
      "하단리스트의 선택할 세미나실/객실을 장바구니 버튼을 클릭하여 담습니다.",
      "오른쪽 가견적 산출프로그램에서 담긴 정보를 확인합니다.",
      "담긴 정보의 이용기간 및 수량을 확인 후 선택합니다 (객실은 숙박일정을 먼저 입력 후 선택이 가능합니다)",
      "세미나실 및 객실 정보 입력 후 가견적서 발행 바로가기 버튼이 나오면, 클릭하여 가견적서 발행 페이지로 이동합니다",
    ],
    hallList,
    roomList,
    hallDays,
    handleHallDay,
    roomNights,
    roomCounts,
    handleRoomCount,
    totalAmount,
  };
};
