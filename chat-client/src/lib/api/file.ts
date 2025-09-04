import {
  File as FileType,
  FileListResponse,
  FileResponse,
  FileOrder,
} from "@/app/cms/file/types";
import { publicApi, privateApi } from "./client";

// Define the new FileUploadResponse interface as per the user's example
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: number;
    originName: string;
    savedName: string;
    mimeType: string;
    size: number;
    ext: string;
    publicYn: string;
    fileOrder: number;
  }[];
}

const BASE_URL = "/cms/file";

// 관리자용 API
export const fileApi = {
  /**
   * 통합 파일 업로드
   * @param files 업로드할 File 객체 또는 File 객체 배열
   * @param menu 메뉴 코드 (e.g., "BBS", "EDITOR")
   * @param menuId 관련 리소스 ID
   * @returns 업로드 결과 Promise (FileUploadResponse)
   */
  upload: async (
    filesToUpload: File | File[],
    menu: string,
    menuId: number
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();

    // Handle single or multiple files
    if (Array.isArray(filesToUpload)) {
      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file) => {
          formData.append("files", file, file.name); // Always use 'files' key
        });
      } else {
        console.warn("[fileApi.upload] No files to upload (empty array)");
      }
    } else {
      // Single file case
      formData.append("files", filesToUpload, filesToUpload.name); // Always use 'files' key
    }

    formData.append("menu", menu);
    formData.append("menuId", String(menuId));

    // articleApi.uploadAttachments와 동일하게, config 객체를 전달하지 않음
    const response = await publicApi.post<FileUploadResponse>(
      `${BASE_URL}/public/upload`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  },

  getList: (params: {
    module: string; // API spec uses 'menu', consider renaming 'module' to 'menu' for consistency
    moduleId: number; // API spec uses 'menuId', consider renaming 'moduleId' to 'menuId'
    publicYn?: "Y" | "N";
  }) => {
    // Rename query params to match API spec ('menu', 'menuId')
    const queryParams = {
      menu: params.module,
      menuId: params.moduleId,
      publicYn: params.publicYn,
    };
    return privateApi.get<FileListResponse>(`${BASE_URL}/private/list`, {
      params: queryParams,
    });
  },

  // Use FileType for response/update data
  getFile: (fileId: number) => {
    return privateApi.get<FileResponse>(`${BASE_URL}/private/${fileId}`);
  },

  updateFile: (fileId: number, data: Partial<FileType>) => {
    return privateApi.put<FileResponse>(`${BASE_URL}/private/${fileId}`, data);
  },

  deleteFile: (fileId: number) => {
    return privateApi.delete<void>(`${BASE_URL}/private/${fileId}`);
  },

  updateOrder: (data: FileOrder[]) => {
    return privateApi.put<void>(`${BASE_URL}/private/order`, data);
  },

  // Use FileType[] for the response type
  getAllFiles: () => privateApi.get<FileType[]>(`${BASE_URL}/private/all`),
};

// 공개용 API
export const publicFileApi = {
  // Use FileType for response
  getFile: (fileId: number) => {
    return publicApi.get<FileResponse>(`${BASE_URL}/public/${fileId}`);
  },

  download: (fileId: number) => {
    return publicApi.get<Blob>(`${BASE_URL}/public/download/${fileId}`, {
      responseType: "blob",
    });
  },

  getList: (params: {
    module: string; // Consider renaming to 'menu'
    moduleId: number; // Consider renaming to 'menuId'
    publicYn?: "Y" | "N";
  }) => {
    // Rename query params to match API spec ('menu', 'menuId')
    const queryParams = {
      menu: params.module,
      menuId: params.moduleId,
      publicYn: params.publicYn,
    };
    return publicApi.get<FileListResponse>(`${BASE_URL}/public/list`, {
      params: queryParams,
    });
  },
};
