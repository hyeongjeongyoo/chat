import { Menu } from "./api";
import { PageDetailsDto } from "./menu";

/**
 * 표준 API 응답 인터페이스
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string | null;
  stackTrace?: string | null;
  status?: number;
}

/**
 * 메뉴 API 응답 타입
 */
export type MenuApiResponse = ApiResponse<Menu[]>;

/**
 * 페이지 상세 API 응답 타입
 */
export interface PageDetailsApiResponse {
  data: PageDetailsDto;
  status?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
