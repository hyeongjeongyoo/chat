import {
  Post,
  ApiResponse,
  BoardMaster,
  BoardMasterApiResponse,
  BoardCategory,
} from "@/types/api";

import { privateApi, publicApi } from "./client";

export const boardKeys = {
  all: ["board"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (id: number) => [...boardKeys.details(), id] as const,
  posts: (boardId: number) =>
    [...boardKeys.details(), boardId, "posts"] as const,
  publicBoard: (boardId: number) =>
    [...boardKeys.all, "public", boardId] as const,
} as const;

export const boardApi = {
  // Board Master APIs
  getBoardMasters: () => {
    return privateApi.get<BoardMasterApiResponse>("/cms/bbs/master");
  },

  getBoard: (id: number) => {
    return privateApi.get<ApiResponse<BoardMaster>>(`/cms/bbs/master/${id}`);
  },

  // 공개 게시판 정보 조회 API (일반 사용자용)
  getPublicBoardInfo: (
    bbsId: number
  ): Promise<ApiResponse<BoardMaster>> => {
    return publicApi.get(`/api/v1/bbs/${bbsId}`);
  },

  getBoardCategories: async (
    bbsId: number
  ): Promise<ApiResponse<BoardCategory[]>> => {
    const response = await privateApi.get<ApiResponse<BoardCategory[]>>(
      `/cms/bbs/${bbsId}/categories`
    );
    return response.data;
  },

  saveBoard: ({ id, boardData }: { id?: number; boardData: BoardMaster }) => {
    const { bbsId, ...rest } = boardData;
    if (id) {
      return privateApi.put<BoardMaster>(`/cms/bbs/master/${id}`, rest);
    }
    return privateApi.post<BoardMaster>("/cms/bbs/master", rest);
  },

  deleteBoard: (id: number) => {
    return privateApi.delete(`/cms/bbs/master/${id}`);
  },

  // Post APIs
  getPosts: (
    bbsId: number,
    params?: {
      page?: number;
      size?: number;
      search?: string;
      category?: string;
      sort?: string;
    }
  ) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, value.toString());
        }
      });
    }
    return privateApi.get<{
      content: Post[];
      pageable: {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
      };
    }>(`/cms/bbs/${bbsId}?${queryString.toString()}`);
  },

  getPost: (bbsId: number, nttId: number) => {
    return privateApi.get<Post>(`/cms/bbs/${bbsId}/${nttId}`);
  },

  createPost: (postData: Omit<Post, "createdAt" | "updatedAt">) => {
    return privateApi.post<Post>("/bbs", postData);
  },

  updatePost: (bbsId: number, nttId: number, postData: Partial<Post>) => {
    return privateApi.put<Post>(`/cms/bbs/${bbsId}/${nttId}`, postData);
  },

  deletePost: (bbsId: number, nttId: number) => {
    return privateApi.delete(`/cms/bbs/${bbsId}/${nttId}`);
  },

  // QNA APIs
  createQuestion: (
    bbsId: number,
    questionData: { title: string; contentHtml: string; writer?: string }
  ) => {
    return privateApi.post<Post>(`/cms/bbs/${bbsId}/question`, questionData);
  },

  createReply: (replyData: {
    parentNttId: number;
    bbsId: number;
    title: string;
    contentHtml: string;
    writer: string;
  }) => {
    return privateApi.post<Post>("/cms/bbs/reply", replyData);
  },

  getArticles: ({
    bbsId,
    menuId,
    ...params
  }: {
    bbsId: number;
    menuId: number;
    [key: string]: any;
  }) => {
    const query = new URLSearchParams({
      bbsId: String(bbsId),
      menuId: String(menuId),
      ...params,
    }).toString();
    return privateApi.get(`/cms/bbs/article?${query}`);
  },
};
