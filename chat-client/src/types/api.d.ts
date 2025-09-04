// 페이지네이션 파라미터
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: any; // 추가 파라미터를 위한 인덱스 시그니처
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  code: number;
  message: string;
  success: boolean;
} 