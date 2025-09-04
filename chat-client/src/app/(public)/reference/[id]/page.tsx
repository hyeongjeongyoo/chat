"use client"; // 클라이언트 컴포넌트로 전환

import { useRouter, useSearchParams } from "next/navigation";
import { menuApi } from "@/lib/api/menu";
import { articleApi } from "@/lib/api/article";
import { PageDetailsDto } from "@/types/menu";
import { Post, BoardArticleCommon, FileDto } from "@/types/api"; // BoardArticleCommon, FileDto 임포트 추가
import { PaginationData } from "@/types/common";
import { findMenuByPath } from "@/lib/menu-utils"; // Import findMenuByPath
import {
  Input,
  HStack,
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react"; // Chakra UI 컴포넌트 임포트
import React, { useState, useEffect, useCallback } from "react"; // React 훅 임포트
import NextLink from "next/link"; // NextLink import 경로 수정
import { List, LayoutGrid } from "lucide-react"; // Added for view toggle icons

import PressBoardSkin from "@/components/bbsSkins/PressBoardSkin";
import FormBoardSkin from "@/components/bbsSkins/FormBoardSkin";
import CustomPagination from "@/components/common/CustomPagination"; // Import CustomPagination

interface BoardPageProps {
  params: Promise<{ id: string }>; // params is a Promise
  // searchParams는 props로 받지 않고, useSearchParams() 훅을 사용하므로 제거합니다.
  // searchParams: { [key: string]: string | string[] | undefined };
}

interface BoardPageData {
  pageDetails: PageDetailsDto;
  posts: Post[]; // Skins expect Post[]
  pagination: PaginationData;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = "createdAt,desc"; // Default sort for articles

// Helper to map Article to Post
function mapArticleToPost(article: BoardArticleCommon): Post {
  // Explicitly type attachments to satisfy Post.attachments?: FileDto[] | null
  const mappedAttachments: FileDto[] | null = article.attachments
    ? article.attachments.map((att): FileDto => {
        // Use the imported FileDto type for the return type of the map callback
        const savedNameDerived =
          att.downloadUrl.substring(att.downloadUrl.lastIndexOf("/") + 1) ||
          att.originName;
        return {
          // Fields from AttachmentInfoDto (FileDto에 필요한 필드만 포함)
          fileId: att.fileId,
          originName: att.originName,
          mimeType: att.mimeType,
          size: att.size,
          ext: att.ext,
          downloadUrl: att.downloadUrl,
          publicYn: att.publicYn,
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
    attachments: mappedAttachments, // Use the correctly typed variable
    categories: [],
  };
}

async function getBoardPageData(
  menuId: number,
  currentPage: number,
  requestedPageSize?: number,
  keyword?: string // Add keyword parameter
): Promise<BoardPageData | null> {
  const pageSizeToUse = requestedPageSize || DEFAULT_PAGE_SIZE;
  try {
    const pageDetails = await menuApi.getPageDetails(menuId);

    if (
      !pageDetails ||
      pageDetails.menuType !== "BOARD" ||
      typeof pageDetails.boardId !== "number" // Ensure boardId is a number
    ) {
      console.warn(
        `Invalid pageDetails or boardId for menuId ${menuId}:`,
        pageDetails
      );
      return null;
    }

    // Use articleApi.getArticles
    const axiosResponse = await articleApi.getArticles({
      bbsId: pageDetails.boardId,
      menuId: menuId, // Pass menuId as well
      page: currentPage - 1, // API is 0-indexed
      size: pageSizeToUse,
      keyword: keyword,
      sort: DEFAULT_SORT_ORDER, // Add sort order
    });

    const apiResponse = axiosResponse.data;

    // Assuming privateApi in articleApi returns ApiResponse<ArticleListResponse>
    // and we need to access its .data property
    if (!apiResponse.success || !apiResponse.data) {
      console.error(
        `Failed to fetch articles for menuId ${menuId}, bbsId ${pageDetails.boardId}:`,
        apiResponse.message || "No data in response"
      );
      return null;
    }

    const articlesData = apiResponse.data; // This is ArticleListResponse

    const articles = articlesData.content as BoardArticleCommon[]; // 타입 캐스팅
    // Map Article[] to Post[]
    const posts: Post[] = articles.map(mapArticleToPost);

    // Correctly access pageable properties and totalElements
    const { pageNumber, pageSize } = articlesData.pageable || {
      pageNumber: 0,
      pageSize: pageSizeToUse,
    };
    const totalElements = articlesData.totalElements || 0;

    const totalPages = Math.ceil(totalElements / pageSize) || 1;

    const pagination: PaginationData = {
      currentPage: pageNumber + 1, // UI is 1-indexed
      totalPages,
      pageSize,
      totalElements,
    };

    return { pageDetails, posts, pagination };
  } catch (error) {
    console.error(
      `Error fetching data for board page (menuId: ${menuId}, page: ${currentPage}, size: ${pageSizeToUse}, keyword: ${keyword}):`,
      error
    );
    return null;
  }
}

export default function BoardPage({
  params,
}: // searchParams, // searchParams는 useSearchParams()로 가져옴
BoardPageProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams(); // hook 사용

  const [awaitedParams, setAwaitedParams] = useState<{ id: string } | null>(
    null
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [currentMenuPath, setCurrentMenuPath] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<BoardPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list"); // Added viewMode state

  // 컴포넌트 마운트 및 params 변경 시 awaitedParams 설정
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setAwaitedParams(resolvedParams);
      setCurrentMenuPath(`/reference/${resolvedParams.id}`);
      // URL에서 keyword 가져와 검색창 초기화
      setKeywordInput(searchParamsHook.get("keyword") || "");
    }
    resolveParams();
  }, [params, searchParamsHook]);

  // 검색 실행 함수
  const handleSearch = useCallback(() => {
    if (currentMenuPath) {
      const query = new URLSearchParams();
      query.set("page", "1"); // 검색 시 첫 페이지로
      if (keywordInput.trim()) {
        query.set("keyword", keywordInput.trim());
      }
      // 현재 페이지 크기를 유지하려면 searchParamsHook에서 가져와야 함
      const currentSize =
        searchParamsHook.get("size") || String(DEFAULT_PAGE_SIZE);
      query.set("size", currentSize);
      router.push(`${currentMenuPath}?${query.toString()}`);
    }
  }, [router, currentMenuPath, keywordInput, searchParamsHook]);

  // Moved these variable declarations and the fetchData useEffect before the conditional return
  const currentPathId = awaitedParams?.id; // Use optional chaining
  const currentPageFromUrl = parseInt(searchParamsHook.get("page") || "1", 10);
  const requestedPageSizeFromUrl = parseInt(
    searchParamsHook.get("size") || String(DEFAULT_PAGE_SIZE),
    10
  );
  const currentKeyword = searchParamsHook.get("keyword") || undefined;

  useEffect(() => {
    async function fetchData() {
      if (!currentPathId || !currentMenuPath) {
        // If essential parameters are not yet available (e.g., awaitedParams resolved but id is missing, or currentMenuPath isn't set)
        // Set boardData to null and stop loading, allowing subsequent checks to handle UI (e.g., show not found)
        setBoardData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const menu = await findMenuByPath(currentMenuPath); // currentMenuPath is checked above
      if (!menu || !menu.id) {
        console.warn(`[BoardPage] Menu not found for path: ${currentMenuPath}`);
        setBoardData(null); // No menu found
        setIsLoading(false); // Stop loading
        return;
      }
      const menuIdToUse = menu.id;
      const data = await getBoardPageData(
        menuIdToUse,
        currentPageFromUrl, // Use value from URL for fetching
        requestedPageSizeFromUrl, // Use value from URL for fetching
        currentKeyword
      );
      if (!data) {
        console.warn(
          `[BoardPage] No board data found for menuId: ${menuIdToUse} at path ${currentMenuPath}`
        );
        setBoardData(null);
      } else {
        setBoardData(data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [
    currentPathId,
    currentPageFromUrl, // Dependency on URL param
    requestedPageSizeFromUrl, // Dependency on URL param
    currentKeyword,
    currentMenuPath,
  ]);

  // Pagination Handlers
  const handlePageChange = useCallback(
    (page: number) => {
      // page is 0-indexed from CustomPagination
      if (currentMenuPath) {
        const query = new URLSearchParams(searchParamsHook.toString());
        query.set("page", String(page + 1)); // URL is 1-indexed
        router.push(`${currentMenuPath}?${query.toString()}`);
      }
    },
    [router, currentMenuPath, searchParamsHook]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (currentMenuPath) {
        const query = new URLSearchParams(searchParamsHook.toString());
        query.set("page", "1"); // Reset to first page
        query.set("size", String(newPageSize));
        router.push(`${currentMenuPath}?${query.toString()}`);
      }
    },
    [router, currentMenuPath, searchParamsHook]
  );

  // awaitedParams가 설정될 때까지 로딩 상태 등을 표시할 수 있음
  if (!awaitedParams || !currentMenuPath) {
    // params를 기다리는 동안 로딩 UI (옵션)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Flex>
    );
  }

  if (!boardData) {
    // 데이터가 없거나 로드 실패 시 (FOLDER 타입 메뉴 등 포함)
    // 혹은 findMenuByPath에서 menu를 못찾은 경우도 여기에 포함될 수 있도록 notFound() 호출
    // findMenuByPath에서 못찾으면 이미 useEffect에서 notFound() 호출됨
    return (
      <Flex direction="column" justify="center" align="center" h="80vh">
        <Heading mb={4}>게시판 정보를 찾을 수 없습니다.</Heading>
        <Text>
          선택하신 경로에 해당하는 게시판이 없거나 데이터를 불러올 수 없습니다.
        </Text>
        <Text>주소가 올바른지 확인하거나 잠시 후 다시 시도해 주세요.</Text>
        <NextLink href="/" passHref>
          <Button mt={6} colorPalette="teal" size="xs">
            홈으로 가기
          </Button>
        </NextLink>
      </Flex>
    );
  }

  const { pageDetails, posts, pagination } = boardData;

  const viewModeToggle = (
    <HStack gap={1}>
      <IconButton
        aria-label="List view"
        variant={viewMode === "list" ? "solid" : "outline"}
        colorPalette={viewMode === "list" ? "blue" : "gray"}
        size="xs"
        onClick={() => setViewMode("list")}
      >
        <List size="16px" />
      </IconButton>
      <IconButton
        aria-label="Card view"
        variant={viewMode === "card" ? "solid" : "outline"}
        colorPalette={viewMode === "card" ? "blue" : "gray"}
        size="xs"
        onClick={() => setViewMode("card")}
      >
        <LayoutGrid size="16px" />
      </IconButton>
    </HStack>
  );
  // --- End of new UI elements ---

  // 기존 렌더링 로직 (Switch 문 등)
  return (
    <Box p={4} maxW="1600px" mx="auto">
      {/* Combined Control Bar */}
      <Flex
        justify="space-between"
        alignItems={{ base: "stretch", md: "center" }}
        mb={2}
        gap={{ base: 3, md: 4 }}
        direction={{ base: "column", md: "row" }}
      >
        {/* Left Group: Title and Total Posts */}
        <HStack
          align="baseline"
          width={{ base: "100%", md: "auto" }}
          justifyContent={{ base: "space-between", md: "flex-start" }}
          gap={3}
        >
          <Heading size="lg" flexShrink={0} title={pageDetails.menuName}>
            <Text>{pageDetails.menuName}</Text>
          </Heading>
          {pagination && (
            <Text fontSize="md" color="gray.500" whiteSpace="nowrap">
              총 {pagination.totalElements}건
            </Text>
          )}
        </HStack>

        {/* Right Group: Search, View Toggle, Write Button */}
        <Flex
          gap={2}
          justifyContent={{ base: "center", sm: "flex-start", md: "flex-end" }}
          alignItems="center"
          width={{ base: "100%", md: "auto" }}
        >
          <Input
            placeholder="검색어를 입력하세요"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            size="xs"
            maxW={{ base: "full", sm: "200px", md: "300px" }}
            mb={{ base: 2, sm: 0 }} // Margin bottom on mobile
          />
          <Button
            onClick={handleSearch}
            colorPalette="blue"
            size="xs"
            mb={{ base: 2, sm: 0 }}
          >
            검색
          </Button>
          {currentKeyword && (
            <Button
              onClick={() => {
                setKeywordInput("");
                const query = new URLSearchParams();
                query.set("page", "1");
                query.set("size", String(requestedPageSizeFromUrl));
                router.push(`${currentMenuPath}?${query.toString()}`);
              }}
              variant="outline"
              size="xs"
              mb={{ base: 2, sm: 0 }}
            >
              초기화
            </Button>
          )}
          {(pageDetails.boardSkinType === "BASIC" ||
            pageDetails.boardSkinType === "QNA") &&
            viewModeToggle}
          {/* Added margin to writeButton if it exists */}
        </Flex>
      </Flex>
      {/* 스킨 렌더링 ... */}
      {(() => {
        switch (pageDetails.boardSkinType) {
          case "PRESS":
            return (
              <PressBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
                viewMode={viewMode}
              />
            );
          case "FORM":
            return (
              <FormBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
              />
            );
        }
      })()}
      {/* Render CustomPagination if boardData and pagination data exist */}
      {boardData &&
        boardData.pagination &&
        boardData.pagination.totalPages > 0 && (
          <Flex justify="center">
            {/* Added mt for spacing */}
            <CustomPagination
              currentPage={boardData.pagination.currentPage - 1} // CustomPagination is 0-indexed
              totalPages={boardData.pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={boardData.pagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </Flex>
        )}
    </Box>
  );
}
