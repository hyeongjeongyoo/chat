"use client";

import React, { useState, useMemo } from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GridApi } from "ag-grid-community";

import type { AdminPaymentData, PaginatedResponse } from "@/types/api";

import { adminApi } from "@/lib/api/adminApi"; // Adjust path if necessary

import { PaymentsView } from "./paymentHistory/PaymentsView";
import { useColorMode } from "@/components/ui/color-mode";
import "@/styles/ag-grid-custom.css";

interface PaymentHistoryTabProps {
  lessonIdFilter?: number | null;
  selectedYear: string;
  selectedMonth: string;
}

export const PaymentHistoryTab = ({
  lessonIdFilter,
  selectedYear,
  selectedMonth,
}: PaymentHistoryTabProps) => {
  const { colorMode } = useColorMode();

  const [paymentsCurrentPage] = useState(0);
  const [paymentsPageSize] = useState(100);

  const [gridApi, setGridApi] = useState<GridApi<AdminPaymentData> | null>(
    null
  );
  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const {
    data: paymentsApiResponse,
    isLoading: isLoadingPayments,
    error: errorPayments,
  } = useQuery<PaginatedResponse<AdminPaymentData>, Error>({
    queryKey: [
      "adminPaymentHistory",
      lessonIdFilter,
      selectedYear,
      selectedMonth,
      paymentsCurrentPage,
      paymentsPageSize,
    ],
    queryFn: () =>
      adminApi.getAdminPaymentHistory({
        lessonId: lessonIdFilter ?? undefined,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        page: paymentsCurrentPage,
        size: paymentsPageSize,
      }),
    enabled: !!selectedYear && !!selectedMonth,
  });

  const queryPgMutation = useMutation({
    mutationFn: adminApi.queryPgTransaction,
    onSuccess: (response, variables) => {
      const pgData = response.data;
      const rowNode = gridApi?.getRowNode(variables.tid); // Use tid as row ID
      if (rowNode) {
        // Create a new data object with the updated status
        const updatedData = {
          ...rowNode.data,
          pgQueryResult: pgData, // Store the full result
          pgResultMsg: pgData.resultMsg, // For direct display
        };
        rowNode.setData(updatedData as unknown as AdminPaymentData);
      }
      toaster.create({
        title: "PG사 조회 성공",
        description: `[${pgData.resultMsg}] TID: ${pgData.tid}`,
        type: "success",
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: "PG사 조회 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
        type: "error",
      });
    },
  });

  const handleQueryPg = (tid: string, amt: number) => {
    if (!tid || amt === undefined) {
      toaster.create({
        title: "조회 불가",
        description: "TID 또는 결제 금액 정보가 없습니다.",
        type: "warning",
      });
      return;
    }
    queryPgMutation.mutate({ tid, amt: String(amt) });
  };

  const payments: AdminPaymentData[] = useMemo(
    () => paymentsApiResponse?.data.content || [],
    [paymentsApiResponse]
  );

  return (
    <Box h="full" display="flex" flexDirection="column">
      {isLoadingPayments && (
        <Box textAlign="center" p={10}>
          <Spinner size="xl" />
          <Text mt={2}>결제 내역을 불러오는 중...</Text>
        </Box>
      )}
      {errorPayments && !isLoadingPayments && (
        <Box p={4} bg="red.50" borderRadius="md" color="red.700">
          <Text fontWeight="bold">오류 발생</Text>
          <Text>
            결제 내역을 불러오는데 실패했습니다: {errorPayments.message}
          </Text>
        </Box>
      )}
      {!isLoadingPayments && !errorPayments && (
        <PaymentsView
          payments={payments}
          agGridTheme={agGridTheme}
          bg={bg}
          textColor={textColor}
          borderColor={borderColor}
          onQueryPg={handleQueryPg}
          setGridApi={setGridApi}
        />
      )}
    </Box>
  );
};
