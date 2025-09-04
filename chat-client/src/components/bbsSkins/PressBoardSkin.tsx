"use client";

import React, { useMemo, useRef, useCallback } from "react";
import {
  Box,
  Text,
  Flex,
  Link as ChakraLink,
  Icon,
  HStack,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { PageDetailsDto } from "@/types/menu";
import { Post } from "@/types/api";
import { PaginationData } from "@/types/common";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomPagination } from "@/components/common/CustomPagination";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  ModuleRegistry,
  AllCommunityModule,
  RowClickedEvent,
  CellStyle,
  GridOptions,
} from "ag-grid-community";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuExternalLink } from "react-icons/lu";
import {
  themeDarkMode,
  themeLightMode,
  WriterCellRenderer,
} from "@/lib/ag-grid-config";
import GenericArticleCard from "@/components/common/cards/GenericArticleCard";
import { mapPostToCommonCardData } from "@/lib/card-utils";
import { useColors } from "@/styles/theme";
import dayjs from "dayjs";
import PostTitleDisplay from "@/components/common/PostTitleDisplay";
import TitleCellRenderer from "../common/TitleCellRenderer";

ModuleRegistry.registerModules([AllCommunityModule]);

// Renderer for the "번호" (Number) column
const NoticeNumberRenderer: React.FC<ICellRendererParams<Post>> = (params) => {
  const { data, node, context } = params;
  const { pagination } = context;
  const isNotice = params.data?.noticeState === "Y" || params.data?.no === 0;
  const textColor = useColorModeValue("gray.700", "gray.300");

  let content;

  if (isNotice) {
    content = (
      <Badge colorPalette="orange" variant="solid" fontSize="xs">
        공지
      </Badge>
    );
  } else if (pagination && node && typeof node.rowIndex === "number") {
    const { totalElements, currentPage, pageSize } = pagination;
    const calculatedNumber =
      totalElements - ((currentPage - 1) * pageSize + node.rowIndex);
    content = (
      <Text fontSize="sm" color={textColor}>
        {calculatedNumber}
      </Text>
    );
  } else {
    // Fallback to original simple numbering if pagination not available.
    const displayValue =
      params.data?.no && params.data.no !== 0
        ? params.data.no
        : (params.node?.rowIndex ?? 0) + 1;
    content = (
      <Text fontSize="sm" color={textColor}>
        {displayValue}
      </Text>
    );
  }

  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      {content}
    </Flex>
  );
};

// Renderer for the "구분" (Category) column
const CategoryBadgeRenderer: React.FC<ICellRendererParams<Post>> = ({
  data,
}) => {
  if (data && data.categories && data.categories.length > 0) {
    // Display the first category in a badge
    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
          {data.categories[0].name}
        </Badge>
      </Flex>
    );
  }
  return null; // Render nothing if no categories
};

// SHARED TITLE RENDERER
const SharedPressTitleRenderer: React.FC<ICellRendererParams<Post>> = (
  params
) => {
  const colors = useColors();
  const post = params.data;
  if (!post) return null;

  const internalDetailUrl = `${params.context.currentPathId}/read/${post.nttId}`;
  let externalLinkHref: string | undefined = undefined;
  if (post.externalLink) {
    const trimmed = post.externalLink.trim();
    if (trimmed)
      externalLinkHref = trimmed.startsWith("http")
        ? trimmed
        : `http://${trimmed}`;
  }

  const titleColor =
    colors.text?.primary || (params.node?.isSelected() ? "#A0FDFA" : "#75E6DA");
  const titleHoverColor = colors.text?.primary || "#A0FDFA";
  const iconColor = colors.text?.secondary || "gray.400";

  return (
    <HStack
      gap={2}
      alignItems="center"
      h="100%"
      overflow="hidden"
      title={post.title}
    >
      {/* Title links internally */}
      {/* Apply link styling directly to this ChakraLink which becomes the <a> tag */}
      <ChakraLink
        href={externalLinkHref ?? internalDetailUrl}
        flex={1}
        minW={0}
        display="flex"
        alignItems="center"
        color={titleColor}
        _hover={{
          textDecoration: "underline",
          color: titleHoverColor,
        }}
        onClick={(e) => {
          if (externalLinkHref) {
            e.preventDefault();
          }
        }}
      >
        <PostTitleDisplay title={post.title} postData={post} />
      </ChakraLink>

      {/* External link icon */}
      {externalLinkHref && (
        <ChakraLink
          href={externalLinkHref}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-flex"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open external link: ${externalLinkHref}`}
        >
          <Icon
            as={LuExternalLink}
            color={iconColor}
            _hover={{ color: titleHoverColor }}
            cursor="pointer"
            boxSize={4}
          />
        </ChakraLink>
      )}
    </HStack>
  );
};

const dateFormatter = (params: ValueFormatterParams<Post, string>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

const AVAILABLE_PAGE_SIZES_PRESS = [10, 20, 30];

interface PressBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
  currentPathId: string;
  viewMode: "list" | "card";
}

const PressBoardSkin: React.FC<PressBoardSkinProps> = ({
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
  const colors = useColors(); // For theme-dependent fallbacks

  const agGridThemeClass =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const selectedAgGridThemeStyles =
    colorMode === "dark" ? themeDarkMode : themeLightMode;

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(page + 1));
    query.set("view", viewMode);
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", "1");
    query.set("size", String(newSize));
    query.set("view", viewMode);
    router.push(`/bbs/${currentPathId}?${query.toString()}`);
  };
  const onRowClicked = useCallback(
    (event: RowClickedEvent<Post>) => {
      if (event.data && event.eventPath) {
        const clickedOnInteractive = (event.eventPath as HTMLElement[]).some(
          (el) =>
            el.tagName === "A" ||
            el.tagName === "BUTTON" ||
            el.getAttribute("aria-label")?.includes("Open external link")
        );
        if (!clickedOnInteractive && !event.data.externalLink) {
          router.push(`${currentPathId}/read/${event.data.nttId}`);
        }
      }
    },
    [router, currentPathId]
  );

  const agGridContext = useMemo(
    () => ({ currentPathId, pagination }),
    [currentPathId, pagination]
  );

  // Memoize cell style objects
  const baseCellStyle = useMemo<CellStyle>(
    () => ({
      display: "flex",
      alignItems: "center",
      paddingLeft: "10px",
      paddingRight: "10px",
      border: "none",
      overflow: "visible",
      textOverflow: "clip",
      whiteSpace: "normal",
    }),
    []
  );

  const writerDateColor = useColorModeValue("gray.600", "gray.400");
  const writerDateCellStyle = useMemo<CellStyle>(
    () => ({
      ...baseCellStyle,
      color: writerDateColor,
      justifyContent: "center",
      textAlign: "center",
      overflow: "visible",
      textOverflow: "clip",
      whiteSpace: "normal",
    }),
    [baseCellStyle, writerDateColor]
  );

  const noticeNumberTextColor = useColorModeValue("gray.700", "gray.300");
  const noticeNumberCellStyle = useMemo<CellStyle>(
    () => ({
      ...baseCellStyle,
      color: noticeNumberTextColor,
      justifyContent: "center",
      textAlign: "center",
      overflow: "visible",
      textOverflow: "clip",
      whiteSpace: "normal",
    }),
    [baseCellStyle, noticeNumberTextColor]
  );

  const columnDefs = useMemo<ColDef<Post>[]>(
    () => [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        cellRenderer: NoticeNumberRenderer,
        cellStyle: noticeNumberCellStyle,
        sortable: false,
        headerClass: ["press-list-header", "ag-header-cell-centered"],
      },
      {
        headerName: "구분",
        field: "categories",
        width: 120,
        cellRenderer: CategoryBadgeRenderer,
        cellStyle: noticeNumberCellStyle,
        headerClass: ["press-list-header", "ag-header-cell-centered"],
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        cellRenderer: TitleCellRenderer,
        cellStyle: {
          ...baseCellStyle,
          paddingLeft: "16px",
          paddingRight: "16px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
        minWidth: 300,
        headerClass: "press-list-header",
      },
      {
        headerName: "작성자",
        field: "displayWriter",
        width: 150,
        cellRenderer: WriterCellRenderer,
        cellStyle: writerDateCellStyle,
        headerClass: ["press-list-header", "ag-header-cell-centered"],
      },
      {
        headerName: "등록일",
        field: "postedAt",
        width: 150,
        valueFormatter: dateFormatter,
        cellStyle: writerDateCellStyle,
        headerClass: ["press-list-header", "ag-header-cell-centered"],
      },
    ],
    [baseCellStyle, noticeNumberCellStyle, writerDateCellStyle]
  );

  const defaultColDef = useMemo<ColDef<Post>>(
    () => ({ sortable: false, resizable: true, suppressMenu: true }),
    []
  );

  const rootBg = useColorModeValue("white", "gray.900");
  const emptyTextColor = useColorModeValue("gray.500", "gray.500"); // Same for both modes, or adjust
  const rowBorderColor = useColorModeValue("gray.200", "gray.700");

  const gridOptions = useMemo<GridOptions>(
    () => ({
      suppressColumnVirtualisation: true,
      suppressRowVirtualisation: true,
      suppressColumnSeparators: true,
    }),
    []
  );

  // Conditional Rendering based on viewMode
  if (viewMode === "card") {
    return (
      <Box /* Style as needed for card view container */>
        {posts.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
            {posts.map((post) => {
              const cardData = mapPostToCommonCardData(post, currentPathId);
              return (
                <GenericArticleCard key={cardData.id} cardData={cardData} />
              );
            })}
          </SimpleGrid>
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            h="40vh"
            p={10}
            color={emptyTextColor}
          >
            <Text>등록된 소식이 없습니다.</Text>
          </Flex>
        )}
        {/* Pagination for card view */}
        {pagination && pagination.totalPages > 1 && (
          <Flex justifyContent="center" py={6} mt={4}>
            <CustomPagination
              currentPage={pagination.currentPage - 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
              availablePageSizes={AVAILABLE_PAGE_SIZES_PRESS}
            />
          </Flex>
        )}
      </Box>
    );
  }

  // List View (AgGrid)
  return (
    <Box bg={rootBg} p={{ base: 0, md: 0 }}>
      <Box
        className={agGridThemeClass}
        style={{ width: "100%", height: "100%", ...selectedAgGridThemeStyles }}
      >
        {posts.length > 0 ? (
          <AgGridReact<Post>
            ref={gridRef}
            rowData={posts}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            headerHeight={50}
            rowHeight={55}
            onRowClicked={onRowClicked}
            suppressCellFocus={true}
            context={agGridContext}
            gridOptions={gridOptions}
            enableCellTextSelection={true}
            getRowStyle={() => ({
              // Rely on ag-theme for row background, or set explicitly if needed for perfect match
              // backgroundColor: useColorModeValue('white', colors.gray_800 || '#1A202C'),
              borderBottom: `1px solid ${rowBorderColor}`,
              // Text color is handled by cellStyle in colDefs and ag-grid theme
            })}
            overlayNoRowsTemplate={`<span style="padding: 20px; color: ${emptyTextColor};">등록된 소식이 없습니다.</span>`}
            theme="legacy"
          />
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            h="40vh"
            p={10}
            color={emptyTextColor}
          >
            <Text>등록된 소식이 없습니다.</Text>
          </Flex>
        )}
      </Box>
      {pagination && pagination.totalPages > 1 && (
        <Flex justifyContent="center" py={6} mt={4}>
          <CustomPagination
            currentPage={pagination.currentPage - 1}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={handlePageSizeChange}
            availablePageSizes={AVAILABLE_PAGE_SIZES_PRESS}
          />
        </Flex>
      )}
    </Box>
  );
};

export default PressBoardSkin;
