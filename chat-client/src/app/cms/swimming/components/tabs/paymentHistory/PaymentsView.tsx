"use client";

import React, { useState, useMemo, useRef } from "react";
import { Box, Text, Stack, Badge, Flex } from "@chakra-ui/react";
import { CreditCardIcon } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, GridApi } from "ag-grid-community";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import type { AdminPaymentData as PaymentData } from "@/types/api";
import type { PaymentStatus, UiDisplayStatus } from "@/types/statusTypes";
import { displayStatusConfig } from "@/lib/utils/statusUtils";
import { formatPhoneNumberWithHyphen } from "@/lib/utils/phoneUtils";
import dayjs from "dayjs";

interface PaymentsViewProps {
  payments: PaymentData[];
  agGridTheme: string;
  bg: string;
  textColor: string;
  borderColor: string;
  onQueryPg: (tid: string, amt: number) => void;
  setGridApi: (api: GridApi<PaymentData>) => void;
}

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) return "-";
    return date.format("YYYY-MM-DD HH:mm:ss");
  } catch (e) {
    return "-";
  }
};

const PaymentMethodCellRenderer: React.FC<
  ICellRendererParams<PaymentData, string | undefined>
> = (params) => {
  const paymentMethod = params.data?.paymentMethod?.toUpperCase();
  if (!paymentMethod) return null;

  let paymentMethodText = params.data?.paymentMethod || "";

  if (paymentMethod === "CARD") {
    paymentMethodText = "카드결제";
  } else if (paymentMethod === "BANK_TRANSFER") {
    paymentMethodText = "계좌이체";
  } else if (paymentMethod === "VIRTUAL_ACCOUNT") {
    paymentMethodText = "가상계좌";
  }

  return (
    <Flex align="center" h="100%">
      {paymentMethod === "CARD" && (
        <CreditCardIcon size={16} style={{ marginRight: "4px" }} />
      )}
      <Text fontSize="sm">{paymentMethodText}</Text>
    </Flex>
  );
};

const PaymentStatusCellRenderer: React.FC<
  ICellRendererParams<PaymentData, PaymentStatus>
> = (params) => {
  if (!params.value) return null;
  const config =
    displayStatusConfig[params.value as UiDisplayStatus] ||
    displayStatusConfig["FAILED"];
  return (
    <Badge
      colorPalette={config.colorPalette}
      variant={config.badgeVariant || "solid"}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  agGridTheme,
  bg,
  textColor,
  borderColor,
  onQueryPg,
  setGridApi,
}) => {
  const paymentGridRef = useRef<AgGridReact<PaymentData>>(null);
  const [paymentFilters, setPaymentFilters] = useState({
    searchTerm: "",
    status: "" as PaymentStatus | "",
  });

  const statusOptions: {
    value: PaymentStatus | "";
    label: string;
  }[] = [
    { value: "PAID", label: displayStatusConfig.PAID.label },
    { value: "FAILED", label: displayStatusConfig.FAILED.label },
    { value: "CANCELED", label: displayStatusConfig.CANCELED.label },
    {
      value: "PARTIAL_REFUNDED",
      label: displayStatusConfig.PARTIAL_REFUNDED.label,
    },
  ];

  const handleExportPayments = () => {
    paymentGridRef.current?.api.exportDataAsCsv();
  };

  const filteredPayments = useMemo(() => {
    let data = [...payments];

    return data.filter((payment) => {
      const searchTermLower = paymentFilters.searchTerm.toLowerCase();
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchTermLower) ||
        (payment.userId &&
          payment.userId.toLowerCase().includes(searchTermLower)) ||
        (payment.userPhone && payment.userPhone.includes(searchTermLower)) ||
        (payment.tid && payment.tid.toLowerCase().includes(searchTermLower)); // Check if tid exists
      const matchesStatus =
        !paymentFilters.status || payment.status === paymentFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [payments, paymentFilters]);

  const paymentColDefs = useMemo<ColDef<PaymentData>[]>(
    () => [
      {
        headerName: "이름",
        field: "userName",
        minWidth: 100,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원ID",
        field: "userId",
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "주문ID",
        field: "tid",
        sortable: true,
        flex: 1,
        minWidth: 180,
        filter: "agTextColumnFilter",
        cellStyle: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as any,
      },
      {
        headerName: "강습명",
        field: "lessonTitle",
        minWidth: 200,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "핸드폰 번호",
        field: "userPhone",
        flex: 1,
        minWidth: 130,
        sortable: true,
        valueFormatter: (params) => formatPhoneNumberWithHyphen(params.value),
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "결제금액",
        field: "paidAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 110,
        cellStyle: { textAlign: "right" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "환불금액",
        field: "refundedAmount",
        valueFormatter: (params) => formatCurrency(params.value),
        width: 110,
        cellStyle: { textAlign: "right" },
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "결제수단",
        field: "paymentMethod",
        cellRenderer: PaymentMethodCellRenderer,
        width: 110,
        cellStyle: { textAlign: "center" },
        sortable: true,
      },
      {
        headerName: "결제일시",
        field: "paidAt",
        valueFormatter: (params) => formatDateTime(params.value),
        width: 170,
        sortable: true,
      },
      {
        headerName: "상태",
        field: "status",
        cellRenderer: PaymentStatusCellRenderer,
        width: 100,
        cellStyle: { textAlign: "center" },
        sortable: true,
      },
    ],
    [onQueryPg]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      floatingFilter: false,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    }),
    []
  );

  return (
    <Stack gap={4}>
      <CommonGridFilterBar
        searchTerm={paymentFilters.searchTerm}
        onSearchTermChange={(e) =>
          setPaymentFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/회원ID/번호/주문ID)"
        onExport={handleExportPayments}
        exportButtonLabel="엑셀 다운로드"
        selectFilters={[
          {
            id: "paymentStatusFilter",
            label: "결제상태",
            value: paymentFilters.status,
            onChange: (e) =>
              setPaymentFilters((prev) => ({
                ...prev,
                status: e.target.value as PaymentStatus | "",
              })),
            options: statusOptions,
            placeholder: "전체",
          },
        ]}
        showSearchButton={true}
      />
      <Box>
        <Text fontSize="sm">
          총 {filteredPayments.length}개의 결제 내역이 있습니다.
        </Text>
      </Box>
      <Box className={agGridTheme} h="540px" w="full">
        <AgGridReact<PaymentData>
          ref={paymentGridRef}
          rowData={filteredPayments}
          columnDefs={paymentColDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          headerHeight={36}
          rowHeight={40}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
          })}
          animateRows={true}
          onGridReady={(params) => setGridApi(params.api)}
          getRowId={(params) => params.data.tid}
        />
      </Box>
    </Stack>
  );
};
