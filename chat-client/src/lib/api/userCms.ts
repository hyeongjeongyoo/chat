import {
  User,
  UserData,
  PaginatedResponse,
  PaginationParams,
  UserEnrollmentHistoryDto,
  ApiResponse,
  Page,
  UserCreationDto,
  UserUpdateDto,
  LessonDto,
} from "@/types/api";
import { privateApi } from "./client";

export interface UserListParams {
  page?: number;
  size?: number;
  sort?: string;
  username?: string;
  name?: string;
  phone?: string;
  payStatus?: string;
  lessonTime?: string;
  searchKeyword?: string;
}

export const userKeys = {
  all: ["cms_users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userCmsApi = {
  getUsers: (params: UserListParams) =>
    privateApi.get<PaginatedResponse<UserEnrollmentHistoryDto>>("/cms/user", {
      params,
    }),

  getUser: (uuid: string) => {
    return privateApi.get<User>(`/cms/user/${uuid}`);
  },

  createUser: (data: UserCreationDto) =>
    privateApi.post<ApiResponse<any>>("/cms/user", data),

  updateUser: (userId: string, data: Partial<UserUpdateDto>) =>
    privateApi.patch<ApiResponse<any>>(`/cms/user/${userId}`, data),

  deleteUser: (userId: string) =>
    privateApi.delete<ApiResponse<any>>(`/cms/user/${userId}`),

  getLatestMonthlyLessons: () =>
    privateApi.get<ApiResponse<LessonDto[]>>("/lessons/latest-monthly"),

  changeUserLesson: (enrollmentId: string, newLessonId: string) =>
    privateApi.patch<ApiResponse<null>>(
      `/cms/enrollments/${enrollmentId}/change-lesson`,
      { newLessonId }
    ),
};
