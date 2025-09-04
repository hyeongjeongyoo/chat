import { privateApi } from "./client";
import { publicApi } from "./client";
import { BoardArticleCommon } from "@/types/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  stackTrace: string | null;
}

export interface AttachmentInfoDto {
  fileId: number;
  originName: string;
  size: number; // byte
  mimeType: string;
  ext: string;
  downloadUrl: string;
}

export interface ArticleListParams {
  bbsId: number;
  menuId: number;
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  categoryId?: number;
}

export interface ArticleListResponse {
  content: BoardArticleCommon[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface CreateArticleParams {
  bbsId: number;
  menuId: number;
  title: string;
  content: string;
  writer: string;
  noticeState?: string;
  noticeStartDt?: string;
  noticeEndDt?: string;
  publishState?: string;
  publishStartDt?: string;
  publishEndDt?: string;
  externalLink?: string;
}

export interface UpdateArticleParams extends CreateArticleParams {
  nttId: number;
}

export interface AnonymousArticleParams {
  bbsId: number;
  title: string;
  content: string;
  writer: string;
  email: string;
}

export const articleApi = {
  // 게시글 목록 조회
  getArticles: (params: any) => {
    return privateApi.get<ApiResponse<ArticleListResponse>>(
      "/cms/bbs/article",
      {
        params: params,
      }
    );
  },

  // 게시글 상세 조회
  getArticle: async (
    nttId: number
  ): Promise<ApiResponse<BoardArticleCommon>> => {
    const response = await privateApi.get<ApiResponse<BoardArticleCommon>>(
      `/cms/bbs/article/${nttId}`
    );
    return response.data;
  },

  // 게시글 생성
  createArticle: async (formData: FormData): Promise<ApiResponse<number>> => {
    const response = await privateApi.post<ApiResponse<number>>(
      "/cms/bbs/article",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  // 게시글 수정
  updateArticle: async (
    nttId: number,
    formData: FormData
  ): Promise<ApiResponse<void>> => {
    const response = await privateApi.put<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  // 게시글 삭제
  deleteArticle: async (nttId: number): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}`
    );
    return response.data;
  },

  // 첨부파일 업로드
  uploadAttachments: async (
    nttId: number,
    files: File[]
  ): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const response = await privateApi.post<ApiResponse<void>>(
      `/cms/bbs/article/${nttId}/attach`,
      formData
    );
    return response.data;
  },

  // 첨부파일 목록 조회
  getAttachments: async (nttId: number): Promise<ApiResponse<any[]>> => {
    const response = await privateApi.get<ApiResponse<any[]>>(
      `/cms/bbs/article/${nttId}/attach`
    );
    return response.data;
  },

  // 첨부파일 삭제
  deleteAttachment: async (
    attachmentId: number
  ): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete<ApiResponse<void>>(
      `/cms/bbs/attach/${attachmentId}`
    );
    return response.data;
  },

  // 비로그인 QNA 작성
  createAnonymousArticle: async (
    params: AnonymousArticleParams
  ): Promise<ApiResponse<{ nttId: number }>> => {
    const response = await privateApi.post<ApiResponse<{ nttId: number }>>(
      "/cms/bbs/article/anonymous",
      params
    );
    return response.data;
  },
};
