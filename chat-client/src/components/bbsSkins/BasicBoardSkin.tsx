"use client";

import React, { useMemo, useRef, useCallback } from "react";
import {
  Box,
  Text,
  Flex,
  Badge,
  HStack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { useRouter, useSearchParams } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
  type RowClickedEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { themeDarkMode, themeLightMode } from "@/lib/ag-grid-config";
import dayjs from "dayjs";

import { PageDetailsDto } from "@/types/menu";
import { Post } from "@/types/api";
import { PaginationData } from "@/types/common";
import { LuEye } from "react-icons/lu";

// Import GenericArticleCard and the mapping function
import GenericArticleCard from "@/components/common/cards/GenericArticleCard";
import { mapPostToCommonCardData } from "@/lib/card-utils";
import { WriterCellRenderer } from "@/lib/ag-grid-config";
import TitleCellRenderer from "@/components/common/TitleCellRenderer";
import { CustomPagination } from "@/components/common/CustomPagination";

ModuleRegistry.registerModules([AllCommunityModule]);

interface BasicBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
  currentPathId: string;
  viewMode: "list" | "card";
}

const NoticeNumberRenderer = (params: ICellRendererParams<Post>) => {
  const { data, node, context } = params;
  const { pagination } = context;

  // 공지사항 처리
  if (data && data.no === 0) {
    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <Badge colorPalette="orange" variant="subtle">
          공지
        </Badge>
      </Flex>
    );
  }

  // Fallback (pagination 정보가 없을 경우)
  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      <span>{params.value}</span>
    </Flex>
  );
};

const CategoryCellRenderer = (params: ICellRendererParams<Post>) => {
  if (
    params.data &&
    params.data.categories &&
    params.data.categories.length > 0
  ) {
    const category = params.data.categories[0];
    let badgeStyle = { bg: "gray.500", color: "white" }; // Default style

    switch (category.name) {
      case "공지":
        badgeStyle = { bg: "blue.500", color: "white" };
        break;
      case "홍보":
        badgeStyle = { bg: "#FAB20B", color: "white" };
        break;
      case "유관기관 홍보":
        badgeStyle = { bg: "teal", color: "white" };
        break;
      default:
        badgeStyle = { bg: "gray.500", color: "white" };
    }

    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <Badge
          px={2}
          py={0.5}
          borderRadius="md"
          bg={badgeStyle.bg}
          color={badgeStyle.color}
          textTransform="none"
        >
          {category.name}
        </Badge>
      </Flex>
    );
  }
  return null;
};

const ViewsRenderer = (params: ICellRendererParams<Post>) => (
  <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
    <Icon as={LuEye} mr="4px" />
    {params.value}
  </Flex>
);

const dateFormatter = (params: ValueFormatterParams<Post>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

const BasicBoardSkin: React.FC<BasicBoardSkinProps> = ({
  pageDetails,
  posts,
  pagination,
  currentPathId,
  viewMode,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<AgGridReact<Post>>(null);
  const { colorMode } = useColorMode();
  const colors = useColors();

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(page + 1));
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", "1");
    query.set("size", String(newSize));
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };

  const agGridThemeClass =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const selectedAgGridThemeStyles =
    colorMode === "dark" ? themeDarkMode : themeLightMode;

  const rowBackgroundColor = colors.bg;
  const rowTextColor = colors.text.primary;

  const agGridContext = useMemo(
    () => ({
      pagination: pagination,
    }),
    [pagination]
  );

  const colDefs = useMemo<ColDef<Post>[]>(() => {
    const columns: ColDef<Post>[] = [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        sortable: true,
        cellRenderer: NoticeNumberRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
    ];

    // bbsId가 1일 때 (공지사항) "구분" 컬럼 추가
    if (pageDetails.boardId === 1) {
      columns.push({
        headerName: "구분",
        field: "categories",
        width: 120,
        cellRenderer: CategoryCellRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        headerClass: ["press-list-header", "ag-header-cell-centered"],
      });
    }

    columns.push(
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        sortable: true,
        cellRenderer: TitleCellRenderer,
        cellStyle: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        },
      },
      {
        headerName: "작성자",
        field: "displayWriter",
        width: 120,
        sortable: true,
        cellRenderer: WriterCellRenderer,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
      {
        headerName: "등록일",
        field: "postedAt",
        width: 120,
        valueFormatter: dateFormatter,
        sortable: true,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
      {
        headerName: "조회",
        field: "hits",
        width: 80,
        cellRenderer: ViewsRenderer,
        sortable: true,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      }
    );
    return columns;
  }, [pageDetails.boardId]);

  const defaultColDef = useMemo<ColDef<Post>>(() => {
    return {
      filter: true,
      resizable: true,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
    };
  }, []);

  const handleRowClick = useCallback(
    (event: RowClickedEvent<Post>) => {
      if (event.data && event.data.nttId) {
        router.push(`/bbs/${currentPathId}/read/${event.data.nttId}`);
      }
    },
    [router, currentPathId]
  );

  if (viewMode === "card") {
    return (
      <Box maxW="1600px" mx="auto">
        {posts && posts.length > 0 ? (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              {posts.map((post) => {
                const cardData = mapPostToCommonCardData(post, currentPathId);
                return (
                  <GenericArticleCard key={cardData.id} cardData={cardData} />
                );
              })}
            </SimpleGrid>
            <Flex justify="center" mt={8}>
              <CustomPagination
                currentPage={pagination.currentPage - 1}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                pageSize={pagination.pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </Flex>
          </>
        ) : (
          <Flex justify="center" align="center" h="30vh">
            <Text>표시할 게시물이 없습니다.</Text>
          </Flex>
        )}
      </Box>
    );
  }

  return (
    <Box maxW="1600px" mx="auto">
      {posts && posts.length > 0 ? (
        <Box
          className={agGridThemeClass}
          style={{
            width: "100%",
            ...selectedAgGridThemeStyles,
          }}
        >
          <AgGridReact<Post>
            suppressCellFocus
            ref={gridRef}
            rowData={posts}
            columnDefs={colDefs}
            context={agGridContext}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            headerHeight={40}
            rowHeight={50}
            rowSelection="single"
            onRowClicked={handleRowClick}
            getRowStyle={() => ({
              background: rowBackgroundColor,
              color: rowTextColor,
            })}
            theme="legacy"
          />
          <Flex justify="center" mt={8}>
            <CustomPagination
              currentPage={pagination.currentPage - 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </Flex>
        </Box>
      ) : (
        <Flex
          justify="center"
          align="center"
          h="30vh"
          borderWidth="1px"
          borderRadius="md"
          p={10}
        >
          <Text>표시할 게시물이 없습니다.</Text>
        </Flex>
      )}
    </Box>
  );
};

export default BasicBoardSkin;
