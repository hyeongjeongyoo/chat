import { notFound } from "next/navigation";
import { menuApi } from "@/lib/api/menu";
import { articleApi } from "@/lib/api/article";
import { PageDetailsDto } from "@/types/menu";
import { Post, BoardArticleCommon, FileDto } from "@/types/api";

import { PaginationData } from "@/types/common";
import FormBoardSkin from "@/components/bbsSkins/FormBoardSkin";
import { findMenuByPath } from "@/lib/menu-utils";

const CURRENT_PATH = "/reference/form";
const EXPECTED_SKIN_TYPE = "FORM";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = "createdAt,desc";

function mapArticleToPost(article: BoardArticleCommon): Post {
  const mappedAttachments: FileDto[] | null = article.attachments
    ? article.attachments.map((att): FileDto => {
        return {
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
    attachments: mappedAttachments,
    categories: [],
  };
}

interface BoardPageData {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
}

async function getBoardPageData(
  menuId: number,
  currentPage: number,
  requestedPageSize?: number,
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
        `Invalid pageDetails, boardId, or skinType for menuId ${menuId} (expected ${EXPECTED_SKIN_TYPE}):`,
        pageDetails
      );
      return null;
    }

    const axiosResponse = await articleApi.getArticles({
      bbsId: pageDetails.boardId,
      menuId: menuId,
      page: currentPage - 1,
      size: pageSizeToUse,
      keyword: keyword,
      sort: DEFAULT_SORT_ORDER,
    });

    const apiResponse = axiosResponse.data;

    if (!apiResponse.success || !apiResponse.data) {
      console.error(
        `Failed to fetch articles for menuId ${menuId}, bbsId ${pageDetails.boardId}:`,
        apiResponse.message || "No data in response"
      );
      return null;
    }

    const articlesData = apiResponse.data;
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
      `Error fetching data for board page (menuId: ${menuId}, path: ${CURRENT_PATH}):`,
      error
    );
    return null;
  }
}

export default async function FormPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;

  const currentMenu = await findMenuByPath(CURRENT_PATH);

  if (!currentMenu || !currentMenu.id) {
    console.warn(`[FormPage] Menu not found for path: ${CURRENT_PATH}`);
    notFound();
  }

  const menuIdToUse = currentMenu.id;

  const currentPage = parseInt(String(searchParams?.page), 10) || 1;
  const requestedPageSize =
    parseInt(String(searchParams?.size), 10) || undefined;
  const keyword =
    typeof searchParams?.keyword === "string"
      ? searchParams.keyword
      : undefined;

  const data = await getBoardPageData(
    menuIdToUse,
    currentPage,
    requestedPageSize,
    keyword
  );

  if (!data) {
    console.warn(
      `[FormPage] No board data found for menuId: ${menuIdToUse} at path ${CURRENT_PATH}`
    );
    notFound();
  }

  const { pageDetails, posts, pagination } = data;

  return (
    <FormBoardSkin
      pageDetails={pageDetails}
      posts={posts}
      pagination={pagination}
      currentPathId={CURRENT_PATH}
    />
  );
}
