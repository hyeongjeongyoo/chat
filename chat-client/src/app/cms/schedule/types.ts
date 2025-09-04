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

export type ScheduleStatus = "UPCOMING" | "ONGOING" | "ENDED" | "HIDDEN";

export interface Manager {
  name: string;
  tel: string;
}

export interface ScheduleExtra {
  manager?: Manager;
  fee?: number;
  category?: string;
  [key: string]: any;
}

export interface Schedule {
  scheduleId: number | null;
  title: string;
  content: string | null;
  startDateTime: string;
  endDateTime: string;
  displayYn: "Y" | "N";
  createdBy: string | null;
  createdIp: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedIp: string | null;
  updatedDate: string;
}

export interface ScheduleFormData {
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  displayYn: "Y" | "N";
}

export interface PaginationResponse {
  page: number;
  size: number;
  total: number;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  pagination?: PaginationResponse;
}

export interface ScheduleListParams {
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const DEFAULT_SCHEDULE_COLOR = {
  default: "#E2E8F0", // gray.200
  important: "#3182CE", // blue.500
};

export interface ScheduleListResponse {
  success: boolean;
  message: string | null;
  data: {
    schedules: Schedule[];
    totalCount: number;
  };
  errorCode: string | null;
  stackTrace: string | null;
}

export interface ScheduleResponse {
  status: number;
  data: Schedule;
}

export interface ErrorResponse {
  status: number;
  error: {
    code: string;
    message: string;
  };
}
