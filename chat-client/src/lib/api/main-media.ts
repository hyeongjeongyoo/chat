import { privateApi } from "./client";
import { MainMediaDto } from "@/types/api";

export interface MainMediaResponse {
  content: MainMediaDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MainMediaOrderDto {
  mediaId: number;
  displayOrder: number;
}

export const mainMediaKeys = {
  all: ["main-media"] as const,
  lists: () => [...mainMediaKeys.all, "list"] as const,
  list: (params: any) => [...mainMediaKeys.lists(), params] as const,
  details: () => [...mainMediaKeys.all, "detail"] as const,
  detail: (id: number) => [...mainMediaKeys.details(), id] as const,
};

export const mainMediaApi = {
  getMainMediaList: async () => {
    const response = await privateApi.get<MainMediaResponse>("/cms/main-media");
    return response;
  },

  getMainMedia: async (mediaId: number) => {
    const response = await privateApi.get<MainMediaDto>(
      `/cms/main-media/${mediaId}`
    );
    return response;
  },

  createMainMedia: async (formData: FormData) => {
    const response = await privateApi.post<MainMediaDto>(
      "/cms/main-media",
      formData
    );
    return response;
  },

  updateMainMedia: async (mediaId: number, formData: FormData) => {
    const response = await privateApi.put<MainMediaDto>(
      `/cms/main-media/${mediaId}`,
      formData
    );
    return response;
  },

  deleteMainMedia: async (mediaId: number) => {
    const response = await privateApi.delete(`/cms/main-media/${mediaId}`);
    return response;
  },

  updateMainMediaOrder: async (orderData: MainMediaOrderDto[]) => {
    const response = await privateApi.put("/cms/main-media/order", orderData);
    return response;
  },
};
