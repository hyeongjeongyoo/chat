"use client"; // Make it a client component

import { useEffect, useState } from "react"; // Added hooks
import { notFound, useRouter, useSearchParams } from "next/navigation"; // Added useRouter, useSearchParams
import { menuApi } from "@/lib/api/menu";
import { articleApi } from "@/lib/api/article";
import { PageDetailsDto } from "@/types/menu";
import { Post, Menu, BoardArticleCommon, FileDto } from "@/types/api"; // BoardArticleCommon, FileDto 임포트 추가
import { PaginationData } from "@/types/common";
import PressBoardSkin from "@/components/bbsSkins/PressBoardSkin";
import { findMenuByPath } from "@/lib/menu-utils";
import BoardControls from "@/components/bbsCommon/BoardControls"; // Import BoardControls
import { PageContainer } from "@/components/layout/PageContainer"; // For consistent layout
import { Box, Flex } from "@chakra-ui/react"; // For loading/error states and Flex
import { useQuery } from "@tanstack/react-query"; // For client-side data fetching

const CURRENT_PATH = "/reference/press";
const EXPECTED_SKIN_TYPE = "PRESS";
const DEFAULT_PAGE_SIZE = 10; // Keep this, but allow URL to override
const DEFAULT_SORT_ORDER = "createdAt,desc";

// --- Helper functions (copied and adapted from /bbs/[id]/page.tsx) ---

// Helper to map Article to Post
function mapArticleToPost(article: BoardArticleCommon): Post {
  const mappedAttachments: FileDto[] | null = article.attachments
    ? article.attachments.map((att): FileDto => {
        return {
          fileId: att.fileId,
          originName: att.originName,
          mimeType: att.mimeType,
          size: att.size,
          ext: att.ext,
          downloadUrl: att.downloadUrl, // FileDto에 downloadUrl 추가
          publicYn: att.publicYn, // FileDto에 publicYn 추가
        };
      })
    : null;

  return {
    no: article.no,
    nttId: article.nttId,
    bbsId: article.bbsId,
    parentNttId: article.parentNttId,
    threadDepth: article.threadDepth,
    displayWriter: article.displayWriter || "",
    postedAt: article.postedAt || "",
    writer: article.writer,
    title: article.title,
    content: article.content,
    hasImageInContent: article.hasImageInContent,
    hasAttachment: article.hasAttachment,
    noticeState: article.noticeState as "Y" | "N" | "P",
    noticeStartDt: article.noticeStartDt,
    noticeEndDt: article.noticeEndDt,
    publishState: article.publishState as "Y" | "N" | "P",
    publishStartDt: article.publishStartDt,
    publishEndDt: article.publishEndDt,
    externalLink: article.externalLink,
    hits: article.hits,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    thumbnailUrl: article.thumbnailUrl,
    status: article.status,
    attachments: mappedAttachments,
    categories: [],
  };
}

interface BoardPageData {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
}

// This function will now be called by useQuery
async function fetchBoardData(
  menuId: number,
  currentPage: number,
  requestedPageSize: number,
  keyword?: string
): Promise<BoardPageData | null> {
  const pageSizeToUse = requestedPageSize || DEFAULT_PAGE_SIZE;
  try {
    const pageDetails = await menuApi.getPageDetails(menuId);
    if (
      !pageDetails ||
      pageDetails.menuType !== "BOARD" ||
      typeof pageDetails.boardId !== "number" ||
      pageDetails.boardSkinType !== EXPECTED_SKIN_TYPE
    ) {
      console.warn(
        `[PressPage] Invalid pageDetails for menuId ${menuId}`,
        pageDetails
      );
      return null;
    }
    const apiResponse = await articleApi.getArticles({
      bbsId: pageDetails.boardId,
      menuId: menuId,
      page: currentPage - 1,
      size: pageSizeToUse,
      keyword: keyword,
      sort: DEFAULT_SORT_ORDER,
    });
    if (!apiResponse.data.success || !apiResponse.data.data) {
      console.error(
        `[PressPage] Failed to fetch articles for menuId ${menuId}`,
        apiResponse.data.message
      );
      return null;
    }
    const articlesData = apiResponse.data.data;
    const articles = articlesData.content || [];
    const posts: Post[] = articles.map(mapArticleToPost);
    const { pageNumber, pageSize } = articlesData.pageable || {
      pageNumber: 0,
      pageSize: pageSizeToUse,
    };
    const totalElements = articlesData.totalElements || 0;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const pagination: PaginationData = {
      currentPage: pageNumber + 1,
      totalPages,
      pageSize,
      totalElements,
    };
    return { pageDetails, posts, pagination };
  } catch (error) {
    console.error(
      `[PressPage] Error fetching data for menuId: ${menuId}:`,
      error
    );
    return null;
  }
}

export default function PressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keywordInput, setKeywordInput] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list"); // Default to list for Press

  // Get query params for pagination and search
  const pageQuery = searchParams.get("page");
  const sizeQuery = searchParams.get("size");
  const keywordQuery = searchParams.get("keyword");

  const currentPage = parseInt(pageQuery || "1", 10);
  const currentSize = parseInt(sizeQuery || String(DEFAULT_PAGE_SIZE), 10);
  const currentKeyword = keywordQuery || undefined;
  const currentViewMode =
    (searchParams.get("view") as "list" | "card") || "list";

  useEffect(() => {
    setKeywordInput(currentKeyword || "");
    setViewMode(currentViewMode);
  }, [currentKeyword, currentViewMode]);

  // Fetch menu info first to get menuId
  const { data: currentMenu, isLoading: isLoadingMenu } = useQuery<Menu | null>(
    {
      queryKey: ["menuByPath", CURRENT_PATH],
      queryFn: () => findMenuByPath(CURRENT_PATH),
    }
  );

  const menuIdToUse = currentMenu?.id;

  // Fetch board data based on menuId and searchParams
  const {
    data: boardData,
    isLoading: isLoadingBoardData,
    isError,
  } = useQuery<BoardPageData | null>({
    queryKey: [
      "boardData",
      CURRENT_PATH,
      menuIdToUse,
      currentPage,
      currentSize,
      currentKeyword,
    ],
    queryFn: () => {
      if (!menuIdToUse) return null; // Don't fetch if menuId isn't resolved
      return fetchBoardData(
        menuIdToUse,
        currentPage,
        currentSize,
        currentKeyword
      );
    },
    enabled: !!menuIdToUse, // Only run query if menuIdToUse is available
  });

  const handleSearch = () => {
    router.push(
      `${CURRENT_PATH}?page=1&size=${currentSize}&keyword=${keywordInput}&view=${viewMode}`
    );
  };

  const handleClearSearch = () => {
    setKeywordInput("");
    router.push(`${CURRENT_PATH}?page=1&size=${currentSize}&view=${viewMode}`);
  };

  const handleViewModeChange = (newMode: "list" | "card") => {
    setViewMode(newMode);
    // Optionally, push to router to make view mode part of URL, or manage locally
    router.push(
      `${CURRENT_PATH}?page=${currentPage}&size=${currentSize}&keyword=${
        currentKeyword || ""
      }&view=${newMode}`
    );
  };

  if (isLoadingMenu || (menuIdToUse && isLoadingBoardData)) {
    return (
      <Flex justify="center" align="center" h="80vh">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Flex>
    );
  }

  if (isError || !boardData || !boardData.pageDetails) {
    // console.warn for debugging if needed
    notFound(); // Or show a custom error component
    return null; // Keep TS happy
  }

  const { pageDetails, posts, pagination } = boardData;

  return (
    <PageContainer>
      <BoardControls
        pageDetails={pageDetails}
        pagination={pagination}
        currentPathId={CURRENT_PATH} // currentPathId for links
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        requestedPageSize={currentSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        currentKeyword={currentKeyword}
      />
      <PressBoardSkin
        pageDetails={pageDetails}
        posts={posts}
        pagination={pagination}
        currentPathId={CURRENT_PATH}
        viewMode={viewMode}
      />
    </PageContainer>
  );
}
