import { privateApi, publicApi } from "./client";
import {
  ContentBlock,
  ContentBlockHistory,
  CreateContentBlockDto,
  ReorderContentBlocksDto,
  UpdateContentBlockDto,
} from "@/types/api/content";
import { ApiResponse } from "@/types/api-response";

const CMS_API_URL = "/cms";

export const contentApi = {
  // 1a. (Public) 메인 페이지 콘텐츠 블록 목록 조회
  getMainPageContentBlocks: async (): Promise<ContentBlock[]> => {
    const response = await publicApi.get<ApiResponse<ContentBlock[]>>(
      `${CMS_API_URL}/contents/main`
    );
    return response.data.data;
  },

  // 1b. (Public) 메뉴의 콘텐츠 블록 목록 조회
  getPublicContentBlocks: async (menuId: number): Promise<ContentBlock[]> => {
    const response = await publicApi.get<ApiResponse<ContentBlock[]>>(
      `${CMS_API_URL}/menus/${menuId}/contents/public`
    );
    return response.data.data;
  },

  // 1b. (Private) 메뉴의 콘텐츠 블록 목록 조회
  getContentBlocks: async (menuId: number): Promise<ContentBlock[]> => {
    const url =
      menuId === 0
        ? `${CMS_API_URL}/contents/main`
        : `${CMS_API_URL}/menus/${menuId}/contents`;
    const response = await privateApi.get<ApiResponse<ContentBlock[]>>(url);
    return response.data.data;
  },

  // 2. 콘텐츠 블록 생성
  createContentBlock: async (
    menuId: number,
    dto: CreateContentBlockDto
  ): Promise<ContentBlock> => {
    const url =
      menuId === 0
        ? `${CMS_API_URL}/contents/main`
        : `${CMS_API_URL}/menus/${menuId}/contents`;
    const response = await privateApi.post<ApiResponse<ContentBlock>>(url, dto);
    return response.data.data;
  },

  // 3. 콘텐츠 블록 수정
  updateContentBlock: async (
    contentId: number,
    dto: UpdateContentBlockDto
  ): Promise<ContentBlock> => {
    const response = await privateApi.put<ApiResponse<ContentBlock>>(
      `${CMS_API_URL}/contents/${contentId}`,
      dto
    );
    return response.data.data;
  },

  // 4. 콘텐츠 블록 순서 변경
  reorderContentBlocks: async (dto: ReorderContentBlocksDto): Promise<void> => {
    await privateApi.put(`${CMS_API_URL}/contents/reorder`, dto);
  },

  // 5. 콘텐츠 블록 삭제
  deleteContentBlock: async (contentId: number): Promise<void> => {
    await privateApi.delete(`${CMS_API_URL}/contents/${contentId}`);
  },

  // 6. 콘텐츠 블록 변경 이력 조회
  getContentBlockHistory: async (
    contentId: number
  ): Promise<ContentBlockHistory[]> => {
    const response = await privateApi.get<ApiResponse<ContentBlockHistory[]>>(
      `${CMS_API_URL}/contents/${contentId}/history`
    );
    return response.data.data;
  },

  // 7. 특정 버전으로 복원
  restoreContentBlock: async (historyId: number): Promise<ContentBlock> => {
    const response = await privateApi.post<ApiResponse<ContentBlock>>(
      `${CMS_API_URL}/contents/history/${historyId}/restore`
    );
    return response.data.data;
  },
};

export const contentKeys = {
  all: ["contents"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (menuId: number) => [...contentKeys.lists(), { menuId }] as const,
  publicLists: () => [...contentKeys.all, "public-list"] as const,
  publicList: (menuId: number) =>
    [...contentKeys.publicLists(), { menuId }] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: number) => [...contentKeys.details(), id] as const,
  histories: () => [...contentKeys.all, "history"] as const,
  history: (id: number) => [...contentKeys.histories(), id] as const,
};
