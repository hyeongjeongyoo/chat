import { TreeItem } from "@/components/ui/tree-list";

export interface VisionSection {
  id?: string;
  title: string;
  content: string;
  type: "text" | "quote" | "list";
  items?: string[];
}

export interface Content extends TreeItem {
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  type: "page" | "vision" | "news" | "notice";
  sections?: VisionSection[];
  settings: {
    layout: "default" | "wide" | "full";
    showThumbnail: boolean;
    showTags: boolean;
    showDate: boolean;
    showAuthor: boolean;
    showRelatedContent: boolean;
    showTableOfContents: boolean;
  };
  metadata?: {
    author?: string;
    position?: string;
    department?: string;
    contact?: string;
  };
}

export function convertTreeItemToContent(item: TreeItem | null): {
  id: number;
  name: string;
  url: string;
  type: string;
} | null {
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    url: item.url || "/", // url이 없으면 기본값으로 '/'
    type: item.type,
  };
}
