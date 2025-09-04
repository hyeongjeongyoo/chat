"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge, Box, Flex, Heading } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  ICellRendererParams,
  RowClickedEvent,
} from "ag-grid-community";

import { reservationApi, reservationKeys } from "@/lib/api/reservation";
import { GroupReservationInquiry } from "@/types/api";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { GridSection } from "@/components/ui/grid-section";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { CustomPagination } from "@/components/common/CustomPagination";
import { ArticleDetailDialog } from "./components/ArticleDetailDialog";
import { STATUS_MAP } from "./lib/constants";

ModuleRegistry.registerModules([AllCommunityModule]);

const StatusRenderer = (props: ICellRendererParams) => {
  const value = props.value as string;
  const statusInfo = STATUS_MAP[value as keyof typeof STATUS_MAP] || {
    label: value,
    colorPalette: "gray",
  };

  return (
    <Badge colorPalette={statusInfo.colorPalette} variant="outline">
      {statusInfo.label}
    </Badge>
  );
};

export default function InquiryManagementPage() {
  const [gridApi, setGridApi] = useState<any>(null);
  const [queryParams, setQueryParams] = useState({
    searchType: "ALL",
    searchTerm: "",
    status: "",
    page: 0,
    size: 20,
  });
  const [searchInputs, setSearchInputs] = useState({
    searchType: "ALL",
    searchTerm: "",
    eventType: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] =
    useState<GroupReservationInquiry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: reservationKeys.list(queryParams),
    queryFn: () => reservationApi.getGroupReservationInquiries(queryParams),
    select: (res) => res.data,
  });
  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );
  const { colorMode } = useColorMode();
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const handleRowClick = (event: RowClickedEvent<GroupReservationInquiry>) => {
    if (event.data) {
      setSelectedInquiry(event.data);
      setIsDialogOpen(true);
    }
  };

  const { rowData, columnDefs } = useMemo(() => {
    const baseColDefs: ColDef<GroupReservationInquiry>[] = [
      {
        headerName: "상태",
        field: "status",
        minWidth: 100,
        cellRenderer: StatusRenderer,
      },
      { headerName: "행사 구분", field: "eventType", minWidth: 120 },
      { headerName: "행사명", field: "eventName", minWidth: 200, flex: 1 },
      { headerName: "단체명", field: "customerGroupName", minWidth: 200 },
      { headerName: "담당자", field: "contactPersonName", minWidth: 120 },
      { headerName: "연락처", field: "contactPersonTel", minWidth: 150 },
      { headerName: "휴대전화", field: "contactPersonPhone", minWidth: 150 },
      { headerName: "이메일", field: "contactPersonEmail", minWidth: 200 },
      {
        headerName: "참석 인원",
        minWidth: 180,
        valueGetter: (params) => {
          if (!params.data) return "";
          return `성인 ${params.data.adultAttendees || 0} / 소인 ${
            params.data.childAttendees || 0
          }`;
        },
      },
      {
        headerName: "식당 사용",
        field: "diningServiceUsage",
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<boolean>) =>
          params.value ? "Y" : "N",
      },
      {
        headerName: "문의일",
        field: "createdDate",
        minWidth: 180,
        valueFormatter: (params) =>
          new Date(params.value).toLocaleString("ko-KR"),
      },
    ];

    if (!data?.content) {
      return {
        rowData: [],
        columnDefs: baseColDefs,
      };
    }

    const inquiries = data.content;
    const maxRoomReservations = inquiries.reduce(
      (max, inquiry) => Math.max(max, inquiry.roomReservations?.length || 0),
      0
    );

    const transformedRowData = inquiries.map((inquiry) => {
      const newRow: any = { ...inquiry };
      if (inquiry.roomReservations) {
        inquiry.roomReservations.forEach((reservation, index) => {
          const num = index + 1;
          newRow[`seminar${num}_type`] = reservation.roomTypeDesc;
          newRow[
            `seminar${num}_schedule`
          ] = `${reservation.startDate} ~ ${reservation.endDate}`;
          newRow[`seminar${num}_time`] = reservation.usageTimeDesc;
        });
      }
      return newRow;
    });

    const dynamicColDefs: ColDef[] = [];
    for (let i = 1; i <= maxRoomReservations; i++) {
      dynamicColDefs.push(
        {
          headerName: `세미나실 ${i}`,
          field: `seminar${i}_type`,
          width: 120,
          cellStyle: { textAlign: "center" },
        },
        {
          headerName: `세미나실 ${i} 일정`,
          field: `seminar${i}_schedule`,
          width: 200,
        },
        {
          headerName: `세미나실 ${i} 시간대`,
          field: `seminar${i}_time`,
          width: 150,
          cellStyle: { textAlign: "right" },
        }
      );
    }

    const finalColumnDefs = [
      ...baseColDefs.slice(0, 7), // 상태 ~ 휴대전화
      ...dynamicColDefs, // 세미나실 관련 컬럼들
      ...baseColDefs.slice(7), // 이메일 ~ 문의일
    ];

    return {
      rowData: transformedRowData,
      columnDefs: finalColumnDefs,
    };
  }, [data]);

  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      searchType: searchInputs.searchType,
      searchTerm: searchInputs.searchTerm,
      eventType: searchInputs.eventType,
      page: 0,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setQueryParams((prev) => ({ ...prev, size, page: 0 }));
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };
  const mainLayout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    {
      id: "popupList",
      x: 0,
      y: 1,
      w: 12,
      h: 11,
      title: "세미나실 신청문의 내역 목록",
      subtitle: "문의 내역을 확인하세요.",
    },
  ];
  const onExportCsv = useCallback(() => {
    gridApi?.exportDataAsCsv();
  }, [gridApi]);

  // if (isLoading) {
  //   return (
  //     <Flex justify="center" align="center" minH="100vh">
  //       <Spinner size="xl" />
  //     </Flex>
  //   );
  // }

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <GridSection initialLayout={mainLayout}>
        <Flex justify="space-between" align="center" h="36px">
          <Flex align="center" gap={2} px={2}>
            <Heading size="lg" color={headingColor} letterSpacing="tight">
              단체 문의 신청 관리
            </Heading>
            <Badge
              bg={colors.secondary.light}
              color={colors.secondary.default}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
            >
              관리자
            </Badge>
          </Flex>
        </Flex>

        <Flex flexDir="column" h="100%" w="full" gap={2}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <CommonGridFilterBar
              searchTerm={searchInputs.searchTerm}
              onSearchTermChange={(e) =>
                setSearchInputs((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              searchTermPlaceholder="검색어"
              onExport={onExportCsv}
              showSearchButton={true}
              onSearchButtonClick={handleSearch}
              selectFilters={[
                {
                  id: "eventType",
                  label: "행사 구분",
                  value: searchInputs.eventType,
                  onChange: (e) =>
                    setSearchInputs((prev) => ({
                      ...prev,
                      eventType: e.target.value,
                    })),
                  options: [
                    { value: "", label: "전체" },
                    { value: "워크숍", label: "워크숍" },
                    { value: "세미나", label: "세미나" },
                    { value: "컨퍼런스", label: "컨퍼런스" },
                    { value: "교육", label: "교육" },
                  ],
                },
                {
                  id: "searchType",
                  label: "검색 조건",
                  value: searchInputs.searchType,
                  onChange: (e) =>
                    setSearchInputs((prev) => ({
                      ...prev,
                      searchType: e.target.value,
                    })),
                  options: [
                    { value: "ALL", label: "전체" },
                    { value: "eventName", label: "행사명" },
                    { value: "customerGroupName", label: "단체명" },
                    { value: "contactPersonName", label: "담당자" },
                    { value: "contactPersonPhone", label: "휴대전화" },
                    { value: "contactPersonTel", label: "연락처" },
                  ],
                },
              ]}
            />
          </form>
          <Box h="682px" w="full" className={agGridTheme}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              onRowClicked={handleRowClick}
              enableCellTextSelection={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              headerHeight={36}
              rowHeight={40}
              overlayLoadingTemplate={
                isLoading
                  ? '<span class="ag-overlay-loading-center">로딩 중...</span>'
                  : ""
              }
              rowDragManaged={true}
            />
          </Box>
          <Flex justifyContent="center">
            <Box />
            <CustomPagination
              currentPage={data?.number || 0}
              totalPages={data?.totalPages || 1}
              onPageChange={handlePageChange}
              pageSize={data?.size || 1}
              onPageSizeChange={handlePageSizeChange}
            />
          </Flex>
        </Flex>
      </GridSection>
      <ArticleDetailDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        inquiry={selectedInquiry}
      />
    </Box>
  );
}
