// export const statusOptions = [
//   { label: "상태 전체선택", value: "all" },
//   { label: "접수대기", value: "WAITING" },
//   { label: "접수중", value: "OPEN" },
//   { label: "수강중", value: "ONGOING" },
//   { label: "수강종료", value: "CLOSED" },
// ];

import dayjs from "dayjs";

export const monthOptions = (() => {
  const today = dayjs();
  const currentMonth = today.month() + 1;
  const currentYear = today.year();

  const months = [];
  months.push({ label: "월별 전체선택", value: "all" });

  for (let i = -1; i <= 1; i++) {
    const targetDate = today.add(i, 'month');
    const monthIndex = targetDate.month() + 1;
    const year = targetDate.year();

    months.push({
      label: `${year}년 ${String(monthIndex).padStart(2, "0")}월`,
      value: monthIndex,
    });
  }

  return months;
})();

export const timeTypeOptions = [
  { label: "시간 전체선택", value: "all" },
  { label: "오전시간 전체선택", value: "morning" },
  { label: "오후시간 전체선택", value: "afternoon" },
];

export const timeSlots = [
  { label: "06:00~06:50", value: "06:00-06:50", type: "morning" },
  { label: "07:00~07:50", value: "07:00-07:50", type: "morning" },
  { label: "08:00~08:50", value: "08:00-08:50", type: "morning" },
  { label: "09:00~09:50", value: "09:00-09:50", type: "morning" },
  { label: "10:00~10:50", value: "10:00-10:50", type: "morning" },
  { label: "11:00~11:50", value: "11:00-11:50", type: "morning" },
  { label: "13:00~13:50", value: "13:00-13:50", type: "afternoon" },
  { label: "14:00~14:50", value: "14:00-14:50", type: "afternoon" },
  { label: "15:00~15:50", value: "15:00-15:50", type: "afternoon" },
  { label: "16:00~16:50", value: "16:00-16:50", type: "afternoon" },
  { label: "17:00~17:50", value: "17:00-17:50", type: "afternoon" },
  { label: "18:00~18:50", value: "18:00-18:50", type: "afternoon" },
  { label: "19:00~19:50", value: "19:00-19:50", type: "afternoon" },
  { label: "20:00~20:50", value: "20:00-20:50", type: "afternoon" },
  { label: "21:00~21:50", value: "21:00-21:50", type: "afternoon" },
];

export const ACCORDION_ITEM_VALUE = "filter-category-item";
