export interface ContentBlockFile {
  fileId: number;
  fileUrl: string;
  sortOrder: number;
}

export interface ContentBlock {
  id: number;
  menuId: number;
  type: "TEXT" | "IMAGE" | "VIDEO" | "BUTTON" | string;
  content: string | null;
  files: ContentBlockFile[]; // fileId, fileUrl 대신 사용
  sortOrder: number;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
}

export interface ContentBlockHistory {
  id: number;
  version: number;
  type: "TEXT" | "IMAGE" | "VIDEO" | "BUTTON" | "string";
  content: string | null;
  fileIds: number[]; // files 대신 사용
  createdBy: string;
  createdIp: string;
  createdDate: string;
}

export interface CreateContentBlockDto {
  type: string;
  content?: string | null;
  fileIds?: number[]; // fileId 대신 사용
  sortOrder: number;
}

export interface UpdateContentBlockDto {
  type: string;
  content?: string | null;
  fileIds?: number[]; // fileId 대신 사용
}

export interface ReorderContentBlockItem {
  id: number;
  sortOrder: number;
}

export interface ReorderContentBlocksDto {
  reorderItems: ReorderContentBlockItem[];
}
