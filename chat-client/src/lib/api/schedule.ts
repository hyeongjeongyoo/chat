import {
  Schedule,
  ScheduleFormData,
  ScheduleListResponse,
  ScheduleResponse,
  ScheduleListParams,
} from "@/app/cms/schedule/types";
import { privateApi, publicApi } from "./client";

export const scheduleKeys = {
  all: ["schedules"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (filters: ScheduleListParams) =>
    [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, "detail"] as const,
  detail: (id: number) => [...scheduleKeys.details(), id] as const,
};

export const scheduleApi = {
  // Get schedules for a month
  getSchedules: async (
    params: ScheduleListParams
  ): Promise<ScheduleListResponse> => {
    const response = await publicApi.get<ScheduleListResponse>(
      `/cms/schedule/${params.year}/${params.month}`
    );
    return response.data;
  },

  // Get schedules by date range
  getSchedulesByRange: async (
    dateFrom: string,
    dateTo: string
  ): Promise<ScheduleListResponse> => {
    const response = await publicApi.get<ScheduleListResponse>(
      `/cms/schedule/range/${dateFrom}/${dateTo}`
    );
    return response.data;
  },

  // Get a single schedule
  getSchedule: async (id: number): Promise<ScheduleResponse> => {
    const response = await publicApi.get<ScheduleResponse>(
      `/cms/schedule/${id}`
    );
    return response.data;
  },

  // Create a new schedule
  createSchedule: async (data: ScheduleFormData): Promise<ScheduleResponse> => {
    const response = await privateApi.post<ScheduleResponse>(
      "/cms/schedule",
      data
    );
    return response.data;
  },

  // Update a schedule
  updateSchedule: async (
    id: number,
    data: Partial<ScheduleFormData>
  ): Promise<ScheduleResponse> => {
    const response = await privateApi.put<ScheduleResponse>(
      `/cms/schedule/${id}`,
      data
    );
    return response.data;
  },

  // Delete a schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await privateApi.delete<void>(`/cms/schedule/${id}`);
  },
};
