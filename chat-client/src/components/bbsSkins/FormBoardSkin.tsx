"use client";

import React, { useMemo, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Link as ChakraLink,
  Icon,
  VStack,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { PageDetailsDto } from "@/types/menu";
import { Post, FileDto } from "@/types/api";
import { PaginationData } from "@/types/common";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomPagination } from "@/components/common/CustomPagination";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileAlt,
} from "react-icons/fa";
import PostTitleDisplay from "@/components/common/PostTitleDisplay";

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
} from "ag-grid-community";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import {
  themeDarkMode,
  themeLightMode,
  WriterCellRenderer,
} from "@/lib/ag-grid-config";
import { env } from "process";
import dayjs from "dayjs";

ModuleRegistry.registerModules([AllCommunityModule]);

const AVAILABLE_PAGE_SIZES_FORM = [10, 20, 50];

interface FormBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
  currentPathId: string;
}

const NoticeNumberRenderer = (params: ICellRendererParams<Post>) => {
  const { data, node, context } = params;
  const { pagination } = context;

  if (data && data.no === 0) {
    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <Badge colorPalette="orange" variant="subtle">
          공지
        </Badge>
      </Flex>
    );
  }

  if (pagination && node && typeof node.rowIndex === "number") {
    const { totalElements, currentPage, pageSize } = pagination;
    const calculatedNumber =
      totalElements - ((currentPage - 1) * pageSize + node.rowIndex);
    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <span>{calculatedNumber}</span>
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      <span>{params.value}</span>
    </Flex>
  );
};

const dateFormatter = (params: ValueFormatterParams<Post>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return FaFilePdf;
  if (extension === "doc" || extension === "docx") return FaFileWord;
  if (extension === "xls" || extension === "xlsx") return FaFileExcel;
  if (extension === "ppt" || extension === "pptx") return FaFilePowerpoint;
  if (extension === "zip" || extension === "tar" || extension === "rar")
    return FaFileArchive;
  return FaFileAlt;
};

const TitleRenderer: React.FC<
  ICellRendererParams<Post, any, { currentPathId: string }>
> = ({ data, context }) => {
  if (!data || !context) return null;
  const { currentPathId } = context;
  return (
    <ChakraLink
      as={NextLink}
      href={`${currentPathId}/read/${data.nttId}`}
      fontWeight={data.noticeState === "Y" ? "bold" : "normal"}
      color={data.noticeState === "Y" ? "blue.600" : "inherit"}
      display="flex"
      alignItems="center"
      h="100%"
      py={1}
      _hover={{ textDecoration: "underline" }}
    >
      <PostTitleDisplay title={data.title} postData={data} />
    </ChakraLink>
  );
};

const AttachmentsRenderer: React.FC<ICellRendererParams<Post>> = ({ data }) => {
  if (!data || !data.attachments || data.attachments.length === 0) {
    return (
      <Text textAlign="center" my={1}>
        -
      </Text>
    );
  }
  const getDownloadLink = (file: FileDto) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${file.fileId}`;
  };

  return (
    <VStack align="start" gap={1} w="100%" py={1}>
      {data.attachments.map((file: FileDto) => (
        <ChakraLink
          key={file.fileId}
          href={getDownloadLink(file)}
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          w="100%"
          _hover={{ textDecoration: "underline", color: "blue.500" }}
        >
          <Icon as={getFileIcon(file.originName)} mr={2} />
          <Text
            fontSize="sm"
            lineClamp={1}
            title={file.originName}
            flexShrink={1}
            minWidth={0}
          >
            {file.originName} ({Math.ceil(file.size / 1024)} KB)
          </Text>
        </ChakraLink>
      ))}
    </VStack>
  );
};

const FormBoardSkin: React.FC<FormBoardSkinProps> = ({
  pageDetails,
  posts,
  pagination,
  currentPathId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<AgGridReact<Post>>(null);
  const { colorMode } = useColorMode();
  const colors = useColors();

  const canWrite =
    pageDetails.boardWriteAuth &&
    pageDetails.boardWriteAuth !== "NONE_OR_SIMILAR_RESTRICTIVE_VALUE";

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

  const agGridContext = useMemo(() => ({ currentPathId }), [currentPathId]);

  const agGridThemeClass =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const rowBackgroundColor = colors.bg;
  const rowTextColor = colors.text.primary;

  const columnDefs = useMemo<ColDef<Post>[]>(
    () => [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        cellStyle: {
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        } as CellStyle,
        sortable: false,
        cellRenderer: NoticeNumberRenderer,
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        minWidth: 250,
        cellRenderer: TitleRenderer,
        wrapText: true,
        autoHeight: true,
      },
      {
        headerName: "첨부파일",
        field: "attachments",
        width: 280,
        cellRenderer: AttachmentsRenderer,
        wrapText: true,
        autoHeight: true,
        sortable: false,
      },
      {
        headerName: "작성자",
        field: "displayWriter",
        width: 120,
        cellRenderer: WriterCellRenderer,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "등록일",
        field: "postedAt",
        width: 120,
        cellStyle: { textAlign: "center" },
        valueFormatter: dateFormatter,
      },
      {
        headerName: "다운로드",
        field: "hits",
        width: 100,
        cellStyle: { textAlign: "center" },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<Post>>(() => {
    return {
      sortable: true,
      resizable: true,
      cellStyle: { display: "flex", alignItems: "center" },
    };
  }, []);

  return (
    <Box p={4} maxW="1600px" mx="auto">
      <Box className={agGridThemeClass} mb={8} style={{ width: "100%" }}>
        {posts.length > 0 ? (
          <AgGridReact<Post>
            ref={gridRef}
            rowData={posts}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            context={agGridContext}
            enableCellTextSelection={true}
            getRowStyle={() => ({
              background: rowBackgroundColor,
              color: rowTextColor,
            })}
            theme="legacy"
          />
        ) : (
          <Flex
            justify="center"
            align="center"
            p={10}
            borderWidth="1px"
            borderRadius="md"
          >
            <Text>등록된 서식이 없습니다.</Text>
          </Flex>
        )}
      </Box>

      {posts.length > 0 && pagination.totalPages > 1 && (
        <Flex justifyContent="center">
          <CustomPagination
            currentPage={pagination.currentPage - 1}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={handlePageSizeChange}
            availablePageSizes={AVAILABLE_PAGE_SIZES_FORM}
          />
        </Flex>
      )}
    </Box>
  );
};

export default FormBoardSkin;
