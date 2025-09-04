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
