import { privateApi, publicApi } from "./client";
import {
  ApiResponse,
  GroupReservationInquiry,
  PaginatedResponse,
} from "@/types/api";

export interface RoomReservationRequest {
  roomSizeDesc: string;
  roomTypeDesc: string;
  startDate: string;
  endDate: string;
  usageTimeDesc: string;
}

export interface GroupReservationInquiryData {
  eventType?: string;
  eventName?: string;
  seatingArrangement?: string;
  adultAttendees?: number;
  childAttendees?: number;
  diningServiceUsage?: boolean;
  otherRequests?: string;
  customerGroupName: string;
  customerRegion?: string;
  contactPersonName: string;
  contactPersonDpt?: string;
  contactPersonPhone: string;
  contactPersonTel: string;
  contactPersonEmail: string;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  roomReservations: RoomReservationRequest[];
}

export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (params: any) => [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
};

export const reservationApi = {
  getGroupReservationInquiries: async (params: {
    page?: number;
    size?: number;
    searchType?: string;
    searchTerm?: string;
    status?: string;
    eventType?: string;
  }) => {
    const { searchTerm, searchType, ...rest } = params;
    const apiParams = {
      ...rest,
      search: searchTerm,
      type: searchType === "ALL" ? undefined : searchType,
    };
    const response = await privateApi.get<
      PaginatedResponse<GroupReservationInquiry>
    >("/cms/group-reservations", { params: apiParams });
    return response.data;
  },

  createGroupReservationInquiry: async (
    data: GroupReservationInquiryData
  ): Promise<ApiResponse<{ id: number }>> => {
    const response = await publicApi.post<ApiResponse<{ id: number }>>(
      "/group-reservations",
      data
    );
    return response.data;
  },

  updateGroupReservationInquiryStatus: (
    id: number,
    payload: { status: string; memo?: string }
  ) => {
    return privateApi.patch(`/cms/group-reservations/${id}`, payload);
  },
}; 