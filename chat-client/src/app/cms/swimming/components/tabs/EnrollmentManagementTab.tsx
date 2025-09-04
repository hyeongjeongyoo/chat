"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Text,
  Button,
  Badge,
  Flex,
  IconButton,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { XIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { useColors } from "@/styles/theme";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import type {
  EnrollAdminResponseDto,
  PaginatedResponse,
  ApiResponse,
} from "@/types/api";
import { UiDisplayStatus } from "@/types/statusTypes";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
  type CellStyle,
} from "ag-grid-community";

import { useColorMode } from "@/components/ui/color-mode";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { toaster } from "@/components/ui/toaster";
import { AdminCancelReasonDialog } from "./enrollmentManagement/AdminCancelReasonDialog";
import { displayStatusConfig } from "@/lib/utils/statusUtils";
import { getMembershipLabel } from "@/lib/utils/displayUtils";

// Import the new dialog components
import {
  UserMemoDialog,
  type EnrollmentData as UserMemoEnrollmentData,
} from "./enrollmentManagement/UserMemoDialog";
import { TemporaryEnrollmentDialog } from "./enrollmentManagement/TemporaryEnrollmentDialog";
import { CommonPayStatusBadge } from "@/components/common/CommonPayStatusBadge";

export type EnrollmentData = UserMemoEnrollmentData & {
  lockerNo?: string | null;
};

ModuleRegistry.registerModules([AllCommunityModule]);

interface EnrollmentManagementTabProps {
  lessonIdFilter?: number | null;
  selectedYear: string;
  selectedMonth: string;
}

const enrollmentQueryKeys = {
  all: ["adminEnrollments"] as const,
  list: (
    lessonId?: number | null,
    year?: string,
    month?: string,
    params?: any
  ) => [...enrollmentQueryKeys.all, lessonId, year, month, params] as const,
  temporaryCreate: () => [...enrollmentQueryKeys.all, "temporaryCreate"],
  userHistory: (userLoginId?: string) =>
    [...enrollmentQueryKeys.all, "userHistory", userLoginId] as const,
  cancelRequests: ["adminCancelRequests"] as const,
};

const UsesLockerCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean>
> = (params) => {
  return (
    <Badge
      colorPalette={params.value ? "blue" : "gray"}
      variant="outline"
      size="sm"
    >
      {params.value ? "사용" : "미사용"}
    </Badge>
  );
};

const RenewalCellRenderer: React.FC<
  ICellRendererParams<EnrollmentData, boolean>
> = (params) => {
  return (
    <Badge
      colorPalette={params.value ? "purple" : "blue"}
      variant="outline"
      size="sm"
    >
      {params.value ? "재수강" : "신규"}
    </Badge>
  );
};

const ActionCellRenderer: React.FC<ICellRendererParams<EnrollmentData>> = (
  params
) => {
  const { api, node, data, context } = params;
  if (!data) return null;

  const handleMemoClick = () => context.openMemoDialog(data);
  const handleAdminCancelClick = () =>
    context.adminCancelEnrollment(data.enrollId);

  return (
    <HStack gap={1} h="100%" alignItems="center">
      <IconButton
        size="xs"
        variant="ghost"
        aria-label="View/Edit Memo"
        onClick={handleMemoClick}
      >
        <MessageSquareIcon size={14} />
      </IconButton>
      <IconButton
        size="xs"
        variant="ghost"
        colorPalette="red"
        aria-label="Admin Cancel"
        onClick={handleAdminCancelClick}
      >
        <XIcon size={14} />
      </IconButton>
    </HStack>
  );
};

export const EnrollmentManagementTab = ({
  lessonIdFilter,
  selectedYear,
  selectedMonth,
}: EnrollmentManagementTabProps) => {
  const colors = useColors();
  const { colorMode } = useColorMode();
  const gridRef = useRef<AgGridReact<EnrollmentData>>(null);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    searchTerm: "",
    payStatus: "",
  });

  const payStatusOptionsForFilter = useMemo(() => {
    const specificStatusOptions = Object.keys(displayStatusConfig).map(
      (statusKey) => ({
        value: statusKey as UiDisplayStatus,
        label: displayStatusConfig[statusKey as UiDisplayStatus].label,
      })
    );

    return specificStatusOptions;
  }, []);

  const {
    data: paginatedEnrollmentsData,
    isLoading: isLoadingEnrollments,
    isError: isErrorEnrollments,
    error: enrollmentsError,
  } = useQuery<PaginatedResponse<EnrollAdminResponseDto>, Error>({
    queryKey: enrollmentQueryKeys.list(
      lessonIdFilter,
      selectedYear,
      selectedMonth,
      { payStatus: filters.payStatus || undefined }
    ),
    queryFn: async () => {
      if (!lessonIdFilter) {
        return {
          code: 0,
          message: "No lesson selected.",
          success: true,
          data: {
            content: [],
            pageable: {
              pageNumber: 0,
              pageSize: 0,
              sort: { empty: true, sorted: false, unsorted: true },
            },
            totalElements: 0,
            totalPages: 0,
            last: true,
            size: 0,
            number: 0,
            first: true,
            numberOfElements: 0,
            empty: true,
          },
        };
      }
      return adminApi.getAdminEnrollments({
        lessonId: lessonIdFilter,
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        payStatus: filters.payStatus || undefined,
        size: 1000,
        page: 0,
      });
    },
  });

  const gridData = useMemo<EnrollmentData[]>(() => {
    if (!paginatedEnrollmentsData?.data?.content) {
      return [];
    }
    return paginatedEnrollmentsData.data.content.map(
      (dto: EnrollAdminResponseDto): EnrollmentData => ({
        ...dto,
        userGender: dto.userGender || "OTHER",
        userLoginId: dto.userLoginId || "N/A",
        userPhone: dto.userPhone || "N/A",
        lockerNo: dto.lockerNo,
      })
    );
  }, [paginatedEnrollmentsData]);

  const [selectedUserForMemo, setSelectedUserForMemo] =
    useState<EnrollmentData | null>(null);
  const [isTempEnrollDialogOpen, setIsTempEnrollDialogOpen] = useState(false);
  const [isCancelReasonDialogOpen, setIsCancelReasonDialogOpen] =
    useState(false);
  const [enrollmentIdToCancel, setEnrollmentIdToCancel] = useState<
    number | null
  >(null);

  const updateLockerNoMutation = useMutation<
    ApiResponse<EnrollAdminResponseDto>,
    Error,
    { enrollId: number; lockerNo: string | null }
  >({
    mutationFn: ({ enrollId, lockerNo }) =>
      adminApi.updateEnrollmentLockerNo(enrollId, { lockerNo }),
    onSuccess: (response, variables) => {
      const userName = response.data?.userName || "회원";
      const lockerNo = variables.lockerNo;

      toaster.success({
        title: "사물함 번호 업데이트",
        description: lockerNo
          ? `${userName} 님의 사물함 번호가 ${lockerNo}(으)로 등록되었습니다.`
          : `${userName} 님의 사물함 번호가 해제되었습니다.`,
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.list(
          lessonIdFilter,
          selectedYear,
          selectedMonth,
          {
            payStatus: filters.payStatus || undefined,
          }
        ),
      });
    },
    onError: (error) => {
      toaster.error({
        title: "업데이트 실패",
        description: error.message,
      });
    },
  });

  const onCellValueChanged = useCallback(
    (params: any) => {
      const { colDef, newValue, data } = params;
      if (colDef.field === "lockerNo") {
        updateLockerNoMutation.mutate({
          enrollId: data.enrollId,
          lockerNo: newValue,
        });
      }
    },
    [updateLockerNoMutation]
  );

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const colDefs = useMemo<ColDef<EnrollmentData>[]>(
    () => [
      {
        headerName: "회원명",
        field: "userName",
        width: 120,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "회원ID",
        field: "userLoginId",
        width: 120,
        filter: "agTextColumnFilter",
      },
      {
        headerName: "연락처",
        field: "userPhone",
        filter: "agTextColumnFilter",
        width: 120,
      },
      {
        headerName: "성별",
        field: "userGender",
        width: 60,
        cellRenderer: (params: ICellRendererParams<EnrollmentData, string>) => {
          return params.value === "1" ? "남" : "여";
        },
      },

      {
        headerName: "할인유형",
        field: "membershipType",
        width: 120,
        valueFormatter: (
          params: ValueFormatterParams<EnrollmentData, string | undefined>
        ) => {
          return getMembershipLabel(params.value);
        },
        filter: "agTextColumnFilter",
      },
      {
        headerName: "신청/결제 상태",
        field: "payStatus",
        cellRenderer: (params: ICellRendererParams<EnrollmentData>) => (
          <CommonPayStatusBadge status={params.value} />
        ),
        width: 120,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "사물함",
        field: "usesLocker",
        cellRenderer: UsesLockerCellRenderer,
        width: 80,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "사물함 번호",
        field: "lockerNo",
        editable: true,
        width: 110,
        cellStyle: {
          padding: "0px",
          justifyContent: "center",
        } as CellStyle,
      },
      {
        headerName: "구분",
        field: "renewalFlag",
        cellRenderer: RenewalCellRenderer,
        width: 70,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        headerName: "관리",
        cellRenderer: ActionCellRenderer,
        width: 80,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    ],
    [colors, colorMode]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: {
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      },
    }),
    []
  );

  const adminCancelEnrollmentMutation = useMutation<
    EnrollAdminResponseDto,
    Error,
    { enrollId: number; reason: string }
  >({
    mutationFn: ({ enrollId, reason }) =>
      adminApi.adminCancelEnrollment(enrollId, { reason }),
    onSuccess: (data) => {
      toaster.success({
        title: "신청 취소 성공",
        description: `신청 ID ${data.enrollId}이(가) 취소되었습니다.`,
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.list(
          lessonIdFilter,
          selectedYear,
          selectedMonth,
          {
            payStatus: filters.payStatus || undefined,
          }
        ),
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.cancelRequests,
      });
      setIsCancelReasonDialogOpen(false);
      setEnrollmentIdToCancel(null);
    },
    onError: (error, variables) => {
      toaster.error({
        title: "신청 취소 실패",
        description:
          error.message || `신청 ID ${variables.enrollId} 취소 중 오류 발생`,
      });
      setIsCancelReasonDialogOpen(false);
      setEnrollmentIdToCancel(null);
    },
  });

  const handleAdminCancelRequest = useCallback((enrollId: number) => {
    setEnrollmentIdToCancel(enrollId);
    setIsCancelReasonDialogOpen(true);
  }, []);

  const handleSubmitAdminCancel = useCallback(
    (reason: string) => {
      if (enrollmentIdToCancel) {
        adminCancelEnrollmentMutation.mutate({
          enrollId: enrollmentIdToCancel,
          reason,
        });
      }
    },
    [enrollmentIdToCancel, adminCancelEnrollmentMutation]
  );

  const openMemoDialog = useCallback((data: EnrollmentData) => {
    setSelectedUserForMemo(data);
  }, []);

  const closeMemoDialog = () => {
    setSelectedUserForMemo(null);
  };

  const handleExportEnrollments = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  const agGridContext = useMemo(
    () => ({
      openMemoDialog,
      adminCancelEnrollment: handleAdminCancelRequest,
    }),
    [openMemoDialog, handleAdminCancelRequest]
  );

  const filteredEnrollmentsForGrid = useMemo(() => {
    let data = gridData;
    if (filters.searchTerm) {
      data = data.filter((enrollment) => {
        const term = filters.searchTerm.toLowerCase();
        return (
          enrollment.userName?.toLowerCase().includes(term) ||
          enrollment.userLoginId?.toLowerCase().includes(term) ||
          enrollment.userPhone?.toLowerCase().includes(term)
        );
      });
    }
    return data;
  }, [gridData, filters.searchTerm]);

  const handleOpenTempEnrollDialog = () => {
    if (!lessonIdFilter) {
      console.warn("임시 등록하려면 강습 선택 필요");
      return;
    }
    setIsTempEnrollDialogOpen(true);
  };

  const closeTempEnrollDialog = () => {
    setIsTempEnrollDialogOpen(false);
  };

  if (isLoadingEnrollments && lessonIdFilter) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isErrorEnrollments && lessonIdFilter) {
    return (
      <Box p={4} color="red.500">
        <Text>데이터를 불러오는 중 오류가 발생했습니다.</Text>
        <Text fontSize="sm">{enrollmentsError?.message}</Text>
      </Box>
    );
  }

  if (!lessonIdFilter) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text.secondary}>
          강습을 선택하면 신청자 목록이 표시됩니다.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      h="full"
      display="flex"
      flexDirection="column"
      transform="none"
      willChange="auto"
    >
      <CommonGridFilterBar
        searchTerm={filters.searchTerm}
        onSearchTermChange={(e) =>
          setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        searchTermPlaceholder="검색 (이름/ID/번호)"
        onExport={handleExportEnrollments}
        exportButtonLabel="엑셀 다운로드"
        showSearchButton={true}
      ></CommonGridFilterBar>
      <Flex my={2} justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color={colors.text.secondary}>
          총 {filteredEnrollmentsForGrid.length}건의 신청 내역이 표시됩니다.
        </Text>
        <Button
          size="xs"
          colorPalette="teal"
          variant="outline"
          onClick={handleOpenTempEnrollDialog}
          ml={2}
        >
          <PlusIcon size={12} /> 임시 등록
        </Button>
      </Flex>
      <Box
        className={agGridTheme}
        w="full"
        transform="none"
        willChange="auto"
        h="532px"
      >
        <AgGridReact<EnrollmentData>
          ref={gridRef}
          rowData={filteredEnrollmentsForGrid}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          headerHeight={36}
          rowHeight={40}
          context={agGridContext}
          onCellValueChanged={onCellValueChanged}
          getRowStyle={() => ({
            color: textColor,
            background: bg,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
          })}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </Box>

      <UserMemoDialog
        isOpen={!!selectedUserForMemo}
        onClose={closeMemoDialog}
        selectedUser={selectedUserForMemo}
        agGridTheme={agGridTheme}
        bg={bg}
        textColor={textColor}
        borderColor={borderColor}
        colors={colors}
      />

      <TemporaryEnrollmentDialog
        isOpen={isTempEnrollDialogOpen}
        onClose={closeTempEnrollDialog}
        lessonIdFilter={lessonIdFilter}
      />

      <AdminCancelReasonDialog
        isOpen={isCancelReasonDialogOpen}
        onClose={() => {
          setIsCancelReasonDialogOpen(false);
          setEnrollmentIdToCancel(null);
        }}
        onSubmit={handleSubmitAdminCancel}
        enrollId={enrollmentIdToCancel}
      />
    </Box>
  );
};
