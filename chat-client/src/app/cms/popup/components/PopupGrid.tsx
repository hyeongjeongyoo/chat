"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ICellRendererParams,
  RowDragEndEvent,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "lucide-react";
import { Popup, PopupOrderUpdatePayload } from "@/types/api";
import { useColorMode } from "@/components/ui/color-mode";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PopupGridProps {
  popups: Popup[];
  onEditPopup: (popup: Popup) => void;
  onDeletePopup: (id: number) => void;
  onRowSelected: (popup: Popup) => void;
  onVisibilityChange: (params: { id: number; visible: boolean }) => void;
  onOrderChange: (payload: PopupOrderUpdatePayload) => void;
  isLoading: boolean;
}

const VisibilityCellRenderer = (
  props: ICellRendererParams<Popup> & {
    onVisibilityChange: (params: { id: number; visible: boolean }) => void;
  }
) => {
  const { data, onVisibilityChange } = props;
  if (!data) return null;

  return (
    <Switch.Root
      size="sm"
      checked={data.visible}
      onCheckedChange={(details) => {
        if (props.api.getRenderedNodes().length) {
          onVisibilityChange({ id: data.id, visible: !!details.checked });
        }
      }}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
  );
};

export const PopupGrid = ({
  popups,
  onEditPopup,
  onDeletePopup,
  onRowSelected,
  onVisibilityChange,
  onOrderChange,
  isLoading,
}: PopupGridProps) => {
  const gridRef = React.useRef<AgGridReact<Popup>>(null);
  const { colorMode } = useColorMode();
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      floatingFilter: false,
      cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
    }),
    []
  );
  const colDefs = useMemo<ColDef<Popup>[]>(() => {
    return [
      {
        headerName: "순서",
        field: "id", // Assuming there is no display_order field yet
        width: 80,
        rowDrag: true,
        cellRenderer: (params: ICellRendererParams<Popup>) =>
          params.node.rowIndex != null ? params.node.rowIndex + 1 : "",
      },
      {
        headerName: "노출",
        field: "visible",
        width: 80,
        cellRenderer: VisibilityCellRenderer,
        cellRendererParams: { onVisibilityChange },
        onCellClicked: (params) => {
          if (params.data) {
            onVisibilityChange({
              id: params.data.id,
              visible: !params.data.visible,
            });
          }
        },
      },
      { headerName: "ID", field: "id", width: 80 },
      { headerName: "제목", field: "title", flex: 1, minWidth: 200 },
      {
        headerName: "노출 시작일",
        field: "startDate",
        width: 180,
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
      },
      {
        headerName: "노출 종료일",
        field: "endDate",
        width: 180,
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
      },
      {
        headerName: "관리",
        field: "id",
        width: 120,
        pinned: "right",
        cellRenderer: (params: ICellRendererParams<Popup>) => {
          if (!params.data) return null;
          return (
            <Box>
              <IconButton
                aria-label="Edit"
                size="sm"
                variant="ghost"
                onClick={() => onEditPopup(params.data!)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="Delete"
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => onDeletePopup(params.data!.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        },
      },
    ];
  }, [onEditPopup, onDeletePopup, onVisibilityChange]);

  const handleRowDragEnd = (event: RowDragEndEvent<Popup>) => {
    const newOrderedPopups = event.api
      .getRenderedNodes()
      .map((node) => node.data!);
    const orderedIds = newOrderedPopups.map((p) => p.id);
    onOrderChange({ orderedIds });
  };

  return (
    <Box className={agGridTheme} h="672px" w="full">
      <AgGridReact<Popup>
        ref={gridRef}
        rowData={popups}
        columnDefs={colDefs}
        onRowClicked={(e) => e.data && onRowSelected(e.data)}
        defaultColDef={defaultColDef}
        enableCellTextSelection={true}
        headerHeight={36}
        rowHeight={40}
        overlayLoadingTemplate={
          isLoading
            ? '<span class="ag-overlay-loading-center">로딩 중...</span>'
            : ""
        }
        onRowDragEnd={handleRowDragEnd}
        rowDragManaged={true}
      />
    </Box>
  );
};
