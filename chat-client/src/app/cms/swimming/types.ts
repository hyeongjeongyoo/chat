import { TreeItem } from "@/components/ui/tree-list";

export interface Board extends TreeItem {
  title: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  settings: {
    allowComments: boolean;
    allowFiles: boolean;
    useCategory: boolean;
    useTags: boolean;
    listType: "list" | "grid" | "gallery";
    postsPerPage: number;
    showTitle: boolean;
    showSearch: boolean;
    showPagination: boolean;
    showWriteButton: boolean;
    layout: "list" | "grid" | "gallery";
  };
}

export function convertTreeItemToBoard(item: TreeItem | null): Board | null {
  if (!item) return null;

  return {
    ...item,
    title: item.name,
    status: item.visible ? "ACTIVE" : "INACTIVE",
    settings: {
      allowComments: true,
      allowFiles: true,
      useCategory: false,
      useTags: false,
      listType: "list",
      postsPerPage: 20,
      showTitle: true,
      showSearch: true,
      showPagination: true,
      showWriteButton: true,
      layout: "list",
    },
  };
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount: number;
  files?: {
    id: number;
    name: string;
    url: string;
  }[];
}

export interface Enterprise {
  id: string;
  year: number;
  name: string;
  description: string;
  image?: string; // Optional as per model, can be URL or path
  representative?: string;
  established?: string; // Format: 'YYYY-MM-DD'
  businessType?: string;
  detail?: string; // HTML or plain text
  showButton: boolean;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface EnterpriseCreateData {
  year: number;
  name: string;
  description: string;
  image?: string;
  representative?: string;
  established?: string;
  businessType?: string;
  detail?: string;
  showButton?: boolean; // Optional in request, defaults to true server-side if not provided
}

export type EnterpriseUpdateData = Partial<
  Omit<EnterpriseCreateData, "year">
> & { year?: number }; // Year can also be updated

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * API 응답: 입주 기업 목록
 */
export interface EnterpriseListApiResponse {
  success: boolean;
  message: string | null;
  data: {
    content: Enterprise[]; // This should now match the API and the component usage
    pagination: PaginationInfo;
    // Include other pagination fields if they exist directly under data, e.g., totalElements, totalPages, etc.
    // Based on your log, it seems pagination details are part of the object containing 'content'.
    empty?: boolean;
    first?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pageable?: any; // Or a more specific type if defined
    size?: number;
    sort?: any; // Or a more specific type if defined
    totalElements?: number;
    totalPages?: number;
  } | null; // data can be null
  errorCode: string | null;
  stackTrace?: string | null; // Optional stackTrace
}

export interface EnterpriseDetailApiResponse {
  success: boolean;
  message: string;
  data: Enterprise;
  errorCode?: string;
}

export interface EnterpriseMutationResponse {
  success: boolean;
  message: string;
  data?: Enterprise; // Included on create and update
  errorCode?: string;
  errors?: { field: string; message: string }[]; // For validation errors
}

// Query parameters for listing enterprises
export interface GetEnterprisesParams {
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "established" | "year" | "createdAt";
  sortOrder?: "asc" | "desc";
}
