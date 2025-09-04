import {
  LuFileText,
  LuCalendar,
  LuUser,
  LuFiles,
  LuLayers3,
  LuMessageCircle,
  LuLayoutPanelLeft,
} from "react-icons/lu";
export const MenuItems = [
  // { icon: LuHouse, label: "HOME", path: "/cms/dashboard" },
  { icon: LuFileText, label: "메뉴관리", path: "/cms/menu" },
  // { icon: LuLayoutPanelTop, label: "템플릿관리", path: "/cms/template" },
  { icon: LuLayoutPanelLeft, label: "컨텐츠관리", path: "/cms/content" },
  { icon: LuCalendar, label: "게시판관리", path: "/cms/board" },
  // { icon: LuAlarmClockCheck, label: "일정관리", path: "/cms/schedule" },
  { icon: LuFiles, label: "수영장관리", path: "/cms/swimming" },
  // { icon: LuFiles, label: "파일관리", path: "/cms/file" },
  { icon: LuMessageCircle, label: "문의관리", path: "/cms/inquiry" },
  { icon: LuLayers3, label: "팝업관리", path: "/cms/popup" },
  { icon: LuUser, label: "회원관리", path: "/cms/user" },
];
