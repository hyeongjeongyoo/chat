"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Tabs,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import React, { useEffect, useState } from "react";
import { articleApi } from "@/lib/api/article";
import { BoardArticleCommon } from "@/types/api";
import { findMenuByPath } from "@/lib/menu-utils";
import { LuArrowRight } from "react-icons/lu";
import { ContentBlock } from "@/types/api/content";

const NOTICES_PATH = "/bbs/notices"; // 공지사항 경로 상수로 정의

// Helper function to map category to CSS class
const getCategoryClassName = (categoryName?: string) => {
  switch (categoryName) {
    case "홍보":
      return "promotion";
    case "유관기관 홍보":
      return "related";
    case "공지":
    default:
      return "notice";
  }
};

const TABS = ["전체", "공지", "홍보", "유관기관 홍보"];

const CATEGORY_COLORS: { [key: string]: string } = {
  공지: "#2E3192",
  홍보: "#FAB20B",
  "유관기관 홍보": "#0C8EA4",
  전체: "#2E3192", // 기본값
};

const CATEGORY_IDS = {
  전체: undefined,
  공지: 4,
  홍보: 5,
  "유관기관 홍보": 6,
};
interface NoticeSectionProps {
  data: ContentBlock;
}

export function NoticeSection({ data }: NoticeSectionProps) {
  const [articles, setArticles] = useState<BoardArticleCommon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("전체");

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        // 1. /bbs/notices 경로로 메뉴 정보 조회
        const noticeMenu = await findMenuByPath(NOTICES_PATH);

        if (noticeMenu && noticeMenu.targetId) {
          const response = await articleApi.getArticles({
            bbsId: noticeMenu.targetId,
            menuId: noticeMenu.id,
            size: 6,
            sort: "createdAt,desc",
            categoryId: CATEGORY_IDS[selectedTab as keyof typeof CATEGORY_IDS],
          });

          if (response.data.success && response.data.data?.content) {
            setArticles(response.data.data.content);
          } else {
            console.error("Failed to fetch notices:", response.data.message);
            setArticles([]);
          }
        } else {
          console.error(`Menu not found for path: ${NOTICES_PATH}`);
          setArticles([]);
        }
      } catch (error: unknown) {
        console.error("Error fetching notices:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [selectedTab]); // selectedTab을 의존성 배열에 추가

  const filteredArticles = articles;

  const noticeItemPadding = useBreakpointValue({ base: "10px", md: "26px" });
  const noticeCateWidth = useBreakpointValue({ base: "70px", md: "130px" });
  const noticeCateFontSize = useBreakpointValue({ base: "12px", md: "16px" });
  const noticeTitleFontSize = useBreakpointValue({ base: "14px", md: "24px" });
  const noticeDateFontSize = useBreakpointValue({ base: "12px", md: "20px" });
  const noticeDateWidth = useBreakpointValue({ base: "auto", md: "140px" });

  const renderNoticeList = (items: BoardArticleCommon[]) => {
    if (isLoading) {
      return <Text>Loading...</Text>;
    }

    if (items.length === 0) {
      return <Text>게시물이 없습니다.</Text>;
    }

    return (
      <Flex className="mnotice-list" flexDirection={"column"} gap={4}>
        {items.map((article) => {
          const categoryName =
            article.categories && article.categories.length > 0
              ? article.categories[0].name
              : "공지"; // 기본값
          const categoryClass = getCategoryClassName(categoryName);

          return (
            <Link
              key={article.nttId}
              href={`/bbs/notices/read/${article.nttId}`}
              className={`notice-item ${categoryClass}`}
              p={noticeItemPadding}
            >
              <Box
                as="span"
                className="notice-cate"
                w={noticeCateWidth}
                fontSize={noticeCateFontSize}
              >
                {categoryName}
              </Box>
              <Box
                as="span"
                className="notice-title"
                fontSize={noticeTitleFontSize}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                maxWidth="100%"
              >
                {article.title}
              </Box>
              <Box
                as="span"
                className="notice-date"
                w={noticeDateWidth}
                fontSize={noticeDateFontSize}
              >
                {new Date(article.createdAt).toLocaleDateString("ko-KR")}
              </Box>
            </Link>
          );
        })}
      </Flex>
    );
  };

  const flexDirection = useBreakpointValue<"row" | "column">({
    base: "column",
    lg: "row",
  });
  const bannerWidth = useBreakpointValue({ base: "100%", lg: "460px" });
  const headingFontSize = useBreakpointValue({ base: "30px", md: "40px" });
  const sectionMarginBottom = useBreakpointValue({ base: "100px", md: "80px" });

  const banner1 = data?.files[0];
  const banner2 = data?.files[1];

  const banner1Src =
    process.env.NEXT_PUBLIC_API_URL +
    "/api/v1/cms/file/public/view/" +
    banner1?.fileId;

  const banner2Src =
    process.env.NEXT_PUBLIC_API_URL +
    "/api/v1/cms/file/public/view/" +
    banner2?.fileId;

  return (
    <>
      <Global
        styles={{
          ".notice-item": {
            padding: "28px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderRadius: "50px",
            border: "1px solid",
            transition: "all 0.3s ease-out",
            "&:hover": {
              color: "#fff",
              "& .notice-title": {
                color: "#fff",
              },
              "& .notice-date": {
                color: "#fff",
              },
            },
          },
          ".notice-item.notice": {
            borderColor: "#2E3192",
            "&:hover": {
              backgroundColor: "#2E3192",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#2E3192",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#2E3192",
            },
          },
          ".notice-item.promotion": {
            borderColor: "#FAB20B",
            "&:hover": {
              backgroundColor: "#FAB20B",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#FAB20B",
              },
            },
            "& .notice-cate": {
              color: "#fff",
              backgroundColor: "#FAB20B",
            },
          },
          ".notice-item.related": {
            borderColor: "#0C8EA4",
            "&:hover": {
              backgroundColor: "#0C8EA4",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#0C8EA4",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#0C8EA4",
            },
          },
          ".notice-cate": {
            flexShrink: 0,
            width: "130px",
            textAlign: "center",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "800",
          },
          ".notice-title": {
            color: "#232323",
            fontSize: "24px",
            fontWeight: "700",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          },
          ".notice-date": {
            marginLeft: "auto",
            color: "#808080",
            fontSize: "20px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          },
        }}
      />
      <Box className="msec02" mb={sectionMarginBottom}>
        <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
          <Flex gap={20} direction={flexDirection}>
            <Box flex="1" minW="0">
              <Tabs.Root
                defaultValue="전체"
                onValueChange={(details) => setSelectedTab(details.value)}
                colorPalette="purple"
                variant="subtle"
              >
                {/* 넓은 화면용 레이아웃 (> 2xl) */}
                <Flex
                  display={{ base: "none", "2xl": "flex" }}
                  justify="space-between"
                  align="center"
                  mb={4}
                >
                  <Flex align="center" gap={4}>
                    <Heading
                      as="h3"
                      fontSize={headingFontSize}
                      fontWeight="bold"
                      color={"#333333"}
                      lineHeight={"1"}
                      fontFamily="'Paperlogy', sans-serif"
                    >
                      공지사항
                    </Heading>
                    <Tabs.List
                      display={{ base: "none", sm: "flex" }}
                      borderBottom="0"
                      alignItems="center"
                      gap="10px"
                    >
                      {/* 전체 탭 */}
                      <Tabs.Trigger
                        key="전체"
                        value="전체"
                        fontSize={{ base: "14px", md: "lg" }}
                        fontWeight="semibold"
                        px={6}
                        py={2}
                        borderRadius="30px"
                        transition="all 0.2s"
                        _selected={{
                          color: "white",
                          bg: CATEGORY_COLORS["전체"],
                        }}
                      >
                        전체
                      </Tabs.Trigger>
                      {/* 나머지 탭 */}
                      {TABS.slice(1).map((tab, index) => (
                        <React.Fragment key={tab}>
                          <Text color="gray.300" mx={2}>
                            |
                          </Text>
                          <Tabs.Trigger
                            value={tab}
                            fontSize={{ base: "14px", md: "lg" }}
                            fontWeight="semibold"
                            color="#5F5F5F"
                            bg="transparent"
                            p={0}
                            _selected={{
                              color:
                                CATEGORY_COLORS[tab] || CATEGORY_COLORS["전체"],
                            }}
                          >
                            {tab}
                          </Tabs.Trigger>
                        </React.Fragment>
                      ))}
                    </Tabs.List>
                  </Flex>

                  <Link
                    href="/bbs/notices"
                    display={{ base: "none", md: "flex" }}
                    alignItems="center"
                    gap={1}
                  >
                    <Text
                      fontSize={{ base: "14px", md: "md" }}
                      color="gray.600"
                      fontWeight="bold"
                    >
                      VIEW MORE
                    </Text>
                    <LuArrowRight color="gray.600" />
                  </Link>
                </Flex>

                {/* 좁은 화면용 레이아웃 (<= 2xl) */}
                <Box display={{ base: "block", "2xl": "none" }} mb={4}>
                  <Heading
                    as="h3"
                    fontSize={headingFontSize}
                    fontWeight="bold"
                    color={"#333333"}
                    lineHeight={"1"}
                    fontFamily="'Paperlogy', sans-serif"
                    mb={4}
                  >
                    공지사항
                  </Heading>
                  <Flex
                    justify={{ base: "flex-end", sm: "space-between" }}
                    align="center"
                  >
                    <Tabs.List
                      display={{ base: "none", sm: "flex" }}
                      borderBottom="0"
                      alignItems="center"
                      gap="10px"
                    >
                      {/* 전체 탭 */}
                      <Tabs.Trigger
                        key="전체"
                        value="전체"
                        fontSize={{ base: "14px", md: "lg" }}
                        fontWeight="semibold"
                        px={6}
                        py={2}
                        borderRadius="30px"
                        transition="all 0.2s"
                        _selected={{
                          color: "white",
                          bg: CATEGORY_COLORS["전체"],
                        }}
                      >
                        전체
                      </Tabs.Trigger>
                      {/* 나머지 탭 */}
                      {TABS.slice(1).map((tab, index) => (
                        <React.Fragment key={tab}>
                          {index > 0 && (
                            <Text color="gray.300" mx={2}>
                              |
                            </Text>
                          )}
                          <Tabs.Trigger
                            value={tab}
                            fontSize={{ base: "14px", md: "lg" }}
                            fontWeight="semibold"
                            color="#5F5F5F"
                            bg="transparent"
                            p={0}
                            _selected={{
                              color:
                                CATEGORY_COLORS[tab] || CATEGORY_COLORS["전체"],
                            }}
                          >
                            {tab}
                          </Tabs.Trigger>
                        </React.Fragment>
                      ))}
                    </Tabs.List>
                    <Link
                      href="/bbs/notices"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Text
                        fontSize={{ base: "14px", md: "md" }}
                        color="gray.600"
                        fontWeight="bold"
                      >
                        VIEW MORE
                      </Text>
                      <LuArrowRight color="gray.600" />
                    </Link>
                  </Flex>
                </Box>

                <Tabs.Content value={selectedTab} mt={3}>
                  <Box>{renderNoticeList(filteredArticles)}</Box>
                </Tabs.Content>
              </Tabs.Root>
            </Box>
            <Box w={bannerWidth} flexShrink={0}>
              <Heading
                as="h3"
                fontSize={headingFontSize}
                fontWeight="bold"
                color={"#333333"}
                lineHeight={"1"}
                fontFamily="'Paperlogy', sans-serif"
                mb={6}
              >
                배너존
              </Heading>
              <Flex direction="column" gap={5}>
                <Box borderRadius="20px" overflow="hidden">
                  <Link href="/meeting/estimate">
                    <Image
                      src={banner1Src}
                      alt="회의실 단체 예약문의"
                      w="100%"
                      h="auto"
                      objectFit="cover"
                    />
                  </Link>
                </Box>
                <Box borderRadius="20px" overflow="hidden">
                  <Link href="/rooms/estimate/calculate">
                    <Image
                      src={banner2Src}
                      alt="회의실 이용 견적 산출"
                      w="100%"
                      h="auto"
                      objectFit="cover"
                    />
                  </Link>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
