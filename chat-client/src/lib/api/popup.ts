import { privateApi, publicApi } from "./client";
import { Popup, PopupOrderUpdatePayload } from "@/types/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string | null;
  stackTrace?: string | null;
}

export type PopupListResponse = {
  content: Popup[];
  // ... other pagination properties if any
};

const API_URL = "/cms/popups";

export const popupApi = {
  getActivePopups: async (): Promise<ApiResponse<Popup[]>> => {
    const response = await publicApi.get<ApiResponse<Popup[]>>(API_URL+'/active');
    return response.data;
  },
  getPopups: async (): Promise<ApiResponse<Popup[]>> => {
    const response = await privateApi.get<ApiResponse<Popup[]>>(API_URL);
    return response.data;
  },

  getPopup: async (id: number): Promise<ApiResponse<Popup>> => {
    const response = await privateApi.get<ApiResponse<Popup>>(`${API_URL}/${id}`);
    return response.data;
  },

  createPopup: async (formData: FormData): Promise<ApiResponse<{ id: number }>> => {
    const response = await privateApi.post<ApiResponse<{ id: number }>>(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updatePopup: async (id: number, formData: FormData): Promise<ApiResponse<void>> => {
    const response = await privateApi.put<ApiResponse<void>>(`${API_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deletePopup: async (id: number): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete<ApiResponse<void>>(`${API_URL}/${id}`);
    return response.data;
  },
  
  updatePopupVisibility: async (id: number, visible: boolean): Promise<ApiResponse<void>> => {
    const response = await privateApi.patch<ApiResponse<void>>(`${API_URL}/${id}/visibility`, { isVisible: visible });
    return response.data;
  },
  
  updatePopupsOrder: async (payload: PopupOrderUpdatePayload): Promise<ApiResponse<void>> => {
    const response = await privateApi.patch<ApiResponse<void>>(`${API_URL}/order`, payload);
    return response.data;
  },
};

export const popupKeys = {
  all: ["popups"] as const,
  lists: () => [...popupKeys.all, "list"] as const,
  list: (filters: string) => [...popupKeys.lists(), { filters }] as const,
  details: () => [...popupKeys.all, "detail"] as const,
  detail: (id: number) => [...popupKeys.details(), id] as const,
}; 