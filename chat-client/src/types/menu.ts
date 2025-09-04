export interface Menu {
  id: number;
  name: string;
  type: "LINK" | "FOLDER" | "BOARD" | "CONTENT" | "POPUP" | "PROGRAM";
  url?: string;
  targetId?: string;
  displayPosition: "HEADER" | "FOOTER";
  visible: boolean;
  sortOrder: number;
  parentId: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuType =
  | "LINK"
  | "FOLDER"
  | "BOARD"
  | "CONTENT"
  | "POPUP"
  | "PROGRAM";
export type BoardSkinType = "BASIC" | "FAQ" | "QNA" | "PRESS" | "FORM";
export type BoardAuthType = "PUBLIC" | "USER" | "ADMIN"; // Assuming ROLE_ADMIN can be part of auth

export interface PageDetailsBaseDto {
  menuId: number;
  menuName: string;
  menuType: MenuType;
}

// Specific details for menuType: "BOARD"
export interface BoardSpecificDetails {
  boardId: number;
  boardName: string;
  boardSkinType: BoardSkinType;
  boardReadAuth: BoardAuthType | string;
  boardWriteAuth: BoardAuthType | string;
  boardAttachmentLimit: number;
  boardAttachmentSize: number;
}

// Combined PageDetailsDto using a conditional type approach might be cleaner,
// but for now, using optional fields for simplicity based on the provided DTO structure.
export interface PageDetailsDto extends PageDetailsBaseDto {
  // Fields for menuType: "BOARD"
  boardId?: number;
  boardName?: string;
  boardSkinType?: BoardSkinType;
  boardReadAuth?: BoardAuthType | string;
  boardWriteAuth?: BoardAuthType | string;
  boardDeleteAuth?: BoardAuthType | string;
  boardAttachmentLimit?: number;
  boardAttachmentSize?: number;

  // Future support for CONTENT or PROGRAM will extend this.
  // Example:
  // contentId?: number;
  // programDetails?: any;
}

// You might also want a more specific type for when menuType is "BOARD"
export type BoardPageDetailsDto = PageDetailsBaseDto & {
  menuType: "BOARD";
} & BoardSpecificDetails;

// And for other types when they become supported
// export type ContentPageDetailsDto = PageDetailsBaseDto & {
//   menuType: "CONTENT";
//   // ... content specific fields
// };

// export type ProgramPageDetailsDto = PageDetailsBaseDto & {
//   menuType: "PROGRAM";
//   // ... program specific fields
// };

// A discriminated union could be used for PageDetailsDto if you prefer stricter typing:
// export type AnyPageDetailsDto = BoardPageDetailsDto | ContentPageDetailsDto | ProgramPageDetailsDto | PageDetailsBaseDto;
// This would require menuType to be checked to access specific fields safely.
// For now, the PageDetailsDto with optional fields matches the example JSON.
