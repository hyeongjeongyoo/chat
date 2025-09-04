import { Menu } from "@/types/api";

export interface DragItem {
  id: number;
  type: string;
  parentId?: number;
  index: number;
  level: number;
}

export interface MenuItemProps {
  menu: Menu;
  level: number;
  onEditMenu: (menu: Menu) => void;
  expanded: boolean;
  onToggle: () => void;
  onMoveMenu: (
    draggedId: number,
    targetId: number,
    position: "inside" | "before" | "after"
  ) => void;
  onDeleteMenu: (menuId: number) => void;
  index: number;
  selectedMenuId?: number;
  refreshMenus: () => Promise<void>;
}

export interface MenuListProps {
  menus: Menu[];
  onEditMenu: (menu: Menu) => void;
  onDeleteMenu: (menuId: number) => void;
  onMoveMenu: (
    menuId: number,
    targetId: number,
    position: "before" | "after" | "inside"
  ) => void;
  isLoading: boolean;
  selectedMenuId?: number;
  refreshMenus: () => Promise<void>;
}

export interface MenuItem {
  id: number;
  name: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  children?: MenuItem[];
  level: number;
}
