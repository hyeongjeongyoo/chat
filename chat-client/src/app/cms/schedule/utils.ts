import { Schedule, ScheduleStatus } from "./types";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export const calculateScheduleStatus = (schedule: Schedule): ScheduleStatus => {
  const now = dayjs();
  const startTime = dayjs(schedule.startDateTime);
  const endTime = dayjs(schedule.endDateTime);

  if (!schedule.displayYn) return "HIDDEN";
  if (now.isBefore(startTime)) return "UPCOMING";
  if (now.isBetween(startTime, endTime, null, "[]")) return "ONGOING";
  return "ENDED";
};

export const formatDateTime = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

export const getStatusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case "UPCOMING":
      return "blue.500";
    case "ONGOING":
      return "green.500";
    case "ENDED":
      return "gray.500";
    case "HIDDEN":
      return "red.500";
    default:
      return "gray.500";
  }
};

export const getStatusText = (status: ScheduleStatus): string => {
  switch (status) {
    case "UPCOMING":
      return "예정";
    case "ONGOING":
      return "진행중";
    case "ENDED":
      return "종료";
    case "HIDDEN":
      return "숨김";
    default:
      return "";
  }
};

export const groupSchedulesByDate = (schedules: Schedule[]) => {
  return schedules.reduce((acc, schedule) => {
    const date = formatDate(schedule.startDateTime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);
};

export const sortSchedulesByTime = (schedules: Schedule[]) => {
  return [...schedules].sort(
    (a, b) =>
      dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf()
  );
};

export const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  return date.isValid() ? date.format("MM.DD HH:mm") : dateString;
};
