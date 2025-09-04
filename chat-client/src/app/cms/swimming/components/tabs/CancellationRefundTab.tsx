"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Stack,
  Badge,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type { CancelRequestAdminDto, PaginatedResponse } from "@/types/api";
import { UiDisplayStatus } from "@/types/statusTypes";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  CellClickedEvent,
} from "ag-grid-community";
import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { ReviewCancelRequestDialog } from "./cancellationRefund/ReviewCancelRequestDialog";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";
import {
  displayStatusConfig,
  getDisplayStatusInfo,
} from "@/lib/utils/statusUtils";
import { formatDateTime } from "@/app/cms/schedule/utils";

interface CancellationRefundTabProps {
  lessonIdFilter?: number | null;
  selectedYear: string;
  selectedMonth: string;
}

const cancelTabQueryKeys = {
  cancelRequests: (lessonId?: number | null, year?: string, month?: string) =>
    ["adminCancelRequests", lessonId, year, month] as const,
};

const PaymentLifecycleStatusCellRenderer: React.FC<
  ICellRendererParams<CancelRequestAdminDto>
> = (params) => {
  const { data } = params;

  if (!data) {
    return (
      <Badge colorPalette="gray" variant="outline" size="sm">
        -
      </Badge>
    );
  }

  const processingStatus = data.cancellationProcessingStatus;
  const paymentStatus = data.paymentStatus;

  // New logic based on the guide
  if (processingStatus === "ADMIN_CANCELED") {
    const config = {
      label: "관리자 취소 (환불필요)",
      colorPalette: "red",
      variant: "outline",
    };
    return (
      <Badge
        colorPalette={config.colorPalette as any}
        variant={config.variant as any}
      >
        {config.label}
      </Badge>
    );
  }

  // Use centralized status util for other statuses
  if (processingStatus && processingStatus !== "NONE") {
    const statusInfo = getDisplayStatusInfo(
      processingStatus as UiDisplayStatus
    );
    return (
      <Badge
        colorPalette={statusInfo.color as any}
        variant={statusInfo.variant as any}
      >
        {statusInfo.label}
      </Badge>
    );
  }

  // Fallback to paymentStatus
  if (paymentStatus) {
    const statusInfo = getDisplayStatusInfo(paymentStatus as UiDisplayStatus);
    return (
      <Badge
        colorPalette={statusInfo.color as any}
        variant={statusInfo.variant as any}
      >
        {statusInfo.label}
      </Badge>
    );
  }

  // 3. 기본값
  return (
    <Badge colorPalette="gray" variant="outline" size="sm">
      -
    </Badge>
  );
};

const ActionCellRenderer: React.FC<
  ICellRendererParams<CancelRequestAdminDto>
> = (params) => {
  const { data, context } = params;
  if (!data || !context.openReviewDialog) {
    return null;
  }

  const { paymentStatus, cancellationProcessingStatus } = data;

  // 사용자의 취소 요청 건 ("환불 검토" 버튼)
  if (paymentStatus === "REFUND_REQUESTED") {
    return (
      <Button
        size="xs"
        colorPalette="teal"
        variant="outline"
        disabled={cancellationProcessingStatus !== "REQ"}
        onClick={() => context.openReviewDialog(data)}
      >
        {cancellationProcessingStatus === "REQ" ? "환불 검토" : "검토 완료"}
      </Button>
    );
  }

  // 관리자 직권 취소 건 (환불 필요 시 "환불 처리" 버튼)
  if (paymentStatus === "REFUND_PENDING_ADMIN_CANCEL") {
    return (
      <Button
        size="xs"
        colorPalette="red"
        variant="outline"
        onClick={() => {
          if (cancellationProcessingStatus === "ADMIN_CANCELED")
            context.openReviewDialog(data);
        }}
      >
        {cancellationProcessingStatus === "ADMIN_CANCELED"
          ? "환불 처리"
          : "취소 처리"}
      </Button>
    );
  }

  // 그 외의 경우는 상태에 맞는 비활성 버튼 표시
  const statusInfo = getDisplayStatusInfo(paymentStatus as UiDisplayStatus);

  return (
    <Button size="xs" variant="ghost" colorPalette="gray" disabled>
      {statusInfo.label || "-"}
    </Button>
  );
};

export const CancellationRefundTab = ({
  lessonIdFilter,
  selectedYear,
  selectedMonth,
}: CancellationRefundTabProps) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    searchTerm: string;
    status: UiDisplayStatus | "";
  }>({ searchTerm: "", status: "" });

  const gridRef = React.useRef<AgGridReact<CancelRequestAdminDto>>(null);
  const [selectedRequestForDialog, setSelectedRequestForDialog] =
    useState<CancelRequestAdminDto | null>(null);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  const handleOpenDialog = (request: CancelRequestAdminDto) =>
    setSelectedRequestForDialog(request);
  const handleCloseDialog = () => setSelectedRequestForDialog(null);

  const agGridContext = useMemo(
    () => ({ openReviewDialog: handleOpenDialog }),
    [handleOpenDialog]
  );

  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const {
    data: cancelRequestsData,
    isLoading: isLoadingCancelRequests,
    isError: isErrorCancelRequests,
    error: cancelRequestsError,
  } = useQuery<
    PaginatedResponse<CancelRequestAdminDto>,
    Error,
    CancelRequestAdminDto[]
  >({
    queryKey: cancelTabQueryKeys.cancelRequests(
      lessonIdFilter,
      selectedYear,
      selectedMonth
    ),
    queryFn: () =>
      adminApi.getAdminCancelRequests({
        lessonId: lessonIdFilter ?? undefined,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        page: 0,
        size: 1000,
      }),
    select: (apiResponse) => apiResponse?.data?.content || [],
  });

  const filteredCancelRequests = useMemo(() => {
    if (!cancelRequestsData) return [];
    return cancelRequestsData.filter((item) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        item.userName.toLowerCase().includes(searchTermLower) ||
        (item.userLoginId &&
          item.userLoginId.toLowerCase().includes(searchTermLower)) ||
        item.lessonTitle.toLowerCase().includes(searchTermLower) ||
        (item.userPhone && item.userPhone.includes(searchTermLower));

      const matchesStatus =
        !filters.status || item.paymentStatus === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [cancelRequestsData, filters]);

  const statusFilterOptions = useMemo(
    () => [
      {
        label: displayStatusConfig.REFUND_REQUESTED.label,
        value: "REFUND_REQUESTED",
      },
      {
        label: displayStatusConfig.CANCELED.label,
        value: "CANCELED",
      },
      {
        label: displayStatusConfig.PARTIAL_REFUNDED.label,
        value: "PARTIAL_REFUNDED",
      },
    ],
    []
  );

  const colDefs = useMemo<ColDef<CancelRequestAdminDto>[]>(
    () => [
      {
        headerName: "요청ID",
        field: "paymentInfo.tid",
        width: 250,
        headerTooltip: "결제 트랜잭션 ID (TID)",
      },
      { headerName: "회원명", field: "userName", flex: 1, minWidth: 100 },
      { headerName: "회원ID", field: "userLoginId", flex: 1, minWidth: 100 },
      {
        headerName: "연락처",
        field: "userPhone",
        valueFormatter: (p) => formatPhoneNumberWithHyphen(p.value) || "-",
        width: 130,
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        flex: 1.5,
        minWidth: 200,
      },
      {
        headerName: "결제금액",
        field: "paymentInfo.paidAmt",
        valueFormatter: (p) => formatCurrency(p.value),
        cellStyle: { justifyContent: "flex-end" },
        width: 120,
      },
      {
        headerName: "요청일시",
        field: "requestedAt",
        valueFormatter: (p) => formatDateTime(p.value),
        width: 160,
      },
      {
        headerName: "처리 상태",
        field: "paymentStatus",
        cellRenderer: PaymentLifecycleStatusCellRenderer,
        width: 120,
        sortable: true,
      },
      {
        headerName: "관리",
        field: "status",
        cellRenderer: ActionCellRenderer,
        width: 100,
        pinned: "right",
        cellStyle: { justifyContent: "center" },
        onCellClicked: (event: CellClickedEvent<CancelRequestAdminDto>) => {
          if (event.data?.paymentStatus === "REFUND_REQUESTED") {
            agGridContext.openReviewDialog(event.data);
          }
        },
      },
    ],
    [formatDate, formatCurrency, agGridContext]
  );

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

  const handleExportGrid = () => gridRef.current?.api.exportDataAsCsv();

  return (
    <Stack h="full" gap={2}>
      <CommonGridFilterBar
        searchTerm={filters.searchTerm}
        onSearchTermChange={(e) =>
          setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/ID/강습명)"
        onExport={handleExportGrid}
        exportButtonLabel="엑셀 다운로드"
        selectFilters={[
          {
            id: "statusFilter",
            label: "처리상태",
            value: filters.status,
            onChange: (e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as UiDisplayStatus | "",
              })),
            options: statusFilterOptions,
            placeholder: "전체",
          },
        ]}
      />
      <Box my={1}>
        <Text fontSize="sm">
          총 {filteredCancelRequests.length}개의 요청이 있습니다.
        </Text>
      </Box>
      {isLoadingCancelRequests ? (
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      ) : isErrorCancelRequests ? (
        <Box color="red.500">
          <Text>오류가 발생했습니다: {cancelRequestsError?.message}</Text>
        </Box>
      ) : (
        <>
          <Box className={agGridTheme} h="548px" w="full">
            <AgGridReact<CancelRequestAdminDto>
              ref={gridRef}
              rowData={filteredCancelRequests}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              context={agGridContext}
              enableCellTextSelection={true}
              headerHeight={36}
              rowHeight={40}
              animateRows
            />
          </Box>
          {selectedRequestForDialog && (
            <ReviewCancelRequestDialog
              isOpen={!!selectedRequestForDialog}
              onClose={handleCloseDialog}
              selectedRequest={selectedRequestForDialog as any}
            />
          )}
        </>
      )}
    </Stack>
  );
};
