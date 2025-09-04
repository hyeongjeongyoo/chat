import {
  ModuleRegistry,
  GridOptions,
  ClientSideRowModelModule,
  TextEditorModule,
  TextFilterModule,
  NumberFilterModule,
  NumberEditorModule,
  ValidationModule,
  themeQuartz,
  CellStyleModule,
  colorSchemeLightWarm,
  colorSchemeDarkBlue,
  ICellRendererParams,
} from "ag-grid-community";

// Register required modules
ModuleRegistry.registerModules([
  TextEditorModule,
  TextFilterModule,
  NumberFilterModule,
  NumberEditorModule,
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
]);

// Create custom themes with additional styling
export const themeLightMode = themeQuartz.withPart(colorSchemeLightWarm);

export const themeDarkMode = themeQuartz.withPart(colorSchemeDarkBlue);

// 기본 Grid 옵션
export const defaultGridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  },
  suppressPropertyNamesCheck: true,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  animateRows: true,
  domLayout: "normal",
  rowHeight: 48,
  headerHeight: 48,
  suppressMovableColumns: true,
  suppressDragLeaveHidesColumns: true,
};

// 테마 설정
export const getThemeClass = (isDark: boolean) =>
  isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine";

// Grid 컨테이너 스타일
export const gridContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

// 공통 WriterCellRenderer
export const WriterCellRenderer = (params: ICellRendererParams<any>) => {
  if (!params.data) return null;
  const displayName = params.data.displayWriter || params.data.writer;
  return displayName || "";
};
