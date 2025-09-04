export type AuthType = "USER" | "ADMIN" | "SYSTEM_ADMIN";
export type YesNoType = "Y" | "N";
export type ListType = "list" | "grid" | "gallery";
export type SkinType = "BASIC" | "FAQ" | "QNA" | "PRESS" | "FORM";

// 페이지네이션 정보 공통 인터페이스
export interface PaginationData {
  currentPage: number; // 1-indexed for UI display, or as received and converted
  totalPages: number;
  pageSize: number;
  totalElements: number;
  // 필요한 경우 추가 필드 정의 (예: hasNextPage, hasPreviousPage 등)
}

// Added CommonCardData interface
export interface CommonCardData {
  id: string | number; // For React key
  title: string;
  thumbnailUrl?: string | null; // Derived thumbnail URL
  displayWriter?: string | null;
  writer?: string | null;
  postedAt?: string; // Could be pre-formatted or ISO string
  createdAt: string; // Could be pre-formatted or ISO string
  hits?: number; // Optional as some contexts might not show it
  detailUrl: string; // URL for the card to link to
  hasImageInContent?: boolean; // To show image icon
  hasAttachment?: boolean; // To show attachment icon
  contentSnippet?: string | null; // Optional: for a short text preview
  externalLink?: string | null; // Added externalLink
  // Additional fields as needed, e.g., category, tags
  category?: string;
  tags?: string[];
  // Fields for press/event specific cards
  eventDate?: string;
  eventLocation?: string;
  source?: string; // For press releases, the source/media outlet
  categories?: { categoryId: number; name: string }[];
}

export interface MenuLink {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: MenuLink[];
  target?: string;
  isRoot?: boolean;
  isCurrent?: boolean;
}
