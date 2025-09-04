"use client";

import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ValueFormatterParams,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";

import { Box, Badge } from "@chakra-ui/react";
import { UserEnrollmentHistoryDto } from "@/types/api";
import { useColorMode } from "@/components/ui/color-mode";
import { UserActionsCellRenderer } from "./UserActionsCellRenderer";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CommonPayStatusBadge } from "@/components/common/CommonPayStatusBadge";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";
import { UsernameCellRenderer } from "./UsernameCellRenderer";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface UserGridRef {
  exportToCsv: () => void;
}

interface UserGridProps {
  users: UserEnrollmentHistoryDto[];
  onEditUser: (user: UserEnrollmentHistoryDto) => void;
  onRowSelected: (user: UserEnrollmentHistoryDto) => void;
  isLoading: boolean;
  selectedUserId?: string | null;
}

export const UserGrid = forwardRef<UserGridRef, UserGridProps>(
  ({ users, onEditUser, onRowSelected, isLoading }, ref) => {
    const gridRef = React.useRef<AgGridReact<UserEnrollmentHistoryDto>>(null);
    const { colorMode } = useColorMode();
    const agGridTheme =
      colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

    useImperativeHandle(ref, () => ({
      exportToCsv: () => {
        const params = {
          fileName: `사용자_목록_${new Date().toISOString().slice(0, 10)}.csv`,
        };
        gridRef.current?.api.exportDataAsCsv(params);
      },
    }));

    const defaultColDef = useMemo<ColDef>(
      () => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: false,
        cellStyle: { fontSize: "13px", display: "flex", alignItems: "center" },
      }),
      []
    );

    const colDefs = useMemo<ColDef<UserEnrollmentHistoryDto>[]>(
      () => [
        {
          headerName: "No.",
          field: "index",
          width: 80,
          sortable: false,
          filter: false,
        },
        {
          headerName: "ID",
          field: "username",
          minWidth: 180,
          cellRenderer: UsernameCellRenderer,
          cellRendererParams: {
            onUsernameClick: onRowSelected,
          },
        },
        { headerName: "이름", field: "name", width: 120 },
        {
          headerName: "연락처",
          field: "phone",
          width: 150,
          valueFormatter: (p: ValueFormatterParams) => {
            if (!p.value) return "-";
            return formatPhoneNumberWithHyphen(p.value);
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        { headerName: "차량번호", field: "carNo", width: 120 },
        {
          headerName: "상태",
          field: "status",
          width: 100,
          cellRenderer: (p: { value: string }) => (
            <Badge
              size="sm"
              colorPalette={p.value === "ACTIVE" ? "green" : "red"}
            >
              {p.value}
            </Badge>
          ),
        },
        {
          headerName: "최근 강습명",
          field: "lastEnrollment.lessonTitle",
          flex: 1,
          minWidth: 200,
          tooltipField: "lastEnrollment.lessonTitle",
        },
        {
          headerName: "최근 강습 시간",
          field: "lastEnrollment.lessonTime",
          minWidth: 200,
          tooltipField: "lastEnrollment.lessonTime",
        },
        {
          headerName: "최근 결제 상태",
          field: "lastEnrollment.payStatus",
          width: 150,
          cellRenderer: (p: { value?: string }) => {
            if (!p.value) return null;
            return <CommonPayStatusBadge status={p.value} />;
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        {
          headerName: "최근 결제일",
          field: "lastEnrollment.paymentDate",
          width: 180,
          valueFormatter: (p: ValueFormatterParams) => {
            return p.value ? new Date(p.value).toLocaleString("ko-KR") : "-";
          },
        },
        // {
        //   headerName: "관리",
        //   field: "uuid",
        //   width: 80,
        //   pinned: "right",
        //   cellRenderer: UserActionsCellRenderer,
        //   cellRendererParams: {
        //     onEditUser,
        //   },
        //   suppressRowClickSelection: true,
        // },
      ],
      [onEditUser]
    );

    return (
      <Box className={agGridTheme} h="560px" w="full" mt={2}>
        <AgGridReact<UserEnrollmentHistoryDto>
          ref={gridRef}
          rowData={users}
          columnDefs={colDefs}
          rowSelection="single"
          defaultColDef={defaultColDef}
          enableCellTextSelection={true}
          headerHeight={36}
          rowHeight={40}
          overlayLoadingTemplate={
            isLoading
              ? '<span class="ag-overlay-loading-center">사용자 목록을 불러오는 중...</span>'
              : '<span class="ag-overlay-no-rows-center">표시할 사용자가 없습니다.</span>'
          }
          rowDragManaged={false}
        />
      </Box>
    );
  }
);

UserGrid.displayName = "UserGrid";
