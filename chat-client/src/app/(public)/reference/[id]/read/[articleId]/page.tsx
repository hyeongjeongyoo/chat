"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Container,
  Separator,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleDisplay } from "@/components/articles/ArticleDisplay";
import { articleApi } from "@/lib/api/article";
import { menuApi } from "@/lib/api/menu";
import { PageDetailsDto } from "@/types/menu";
import { findMenuByPath } from "@/lib/menu-utils";
import { BoardArticleCommon, Menu } from "@/types/api";

interface PrevNextArticleInfo {
  nttId: number;
  title: string;
}

export default function ArticleDetailPage() {
  const routeParams = useParams();

  const id = typeof routeParams.id === "string" ? routeParams.id : undefined;
  const currentNttIdString =
    typeof routeParams.articleId === "string"
      ? routeParams.articleId
      : undefined;

  const [article, setArticle] = useState<BoardArticleCommon | null>(null);
  const [pageDetails, setPageDetails] = useState<PageDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prevArticleInfo, setPrevArticleInfo] =
    useState<PrevNextArticleInfo | null>(null);
  const [nextArticleInfo, setNextArticleInfo] =
    useState<PrevNextArticleInfo | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!currentNttIdString || !id) {
        setIsLoading(false);
        setError("Article ID or Board ID not found in URL.");
        return;
      }
      setIsLoading(true);
      setArticle(null);
      setPageDetails(null);
      setPrevArticleInfo(null);
      setNextArticleInfo(null);
      setError(null);

      try {
        const numericArticleId = parseInt(currentNttIdString, 10);
        if (isNaN(numericArticleId)) {
          throw new Error("Invalid Article ID format.");
        }

        const articleResponse = await articleApi.getArticle(numericArticleId);

        if (articleResponse.data) {
          const articleData = articleResponse.data;
          setArticle(articleData);
          if (articleData.bbsId) {
            try {
              const articlesResponse = await articleApi.getArticles({
                bbsId: articleData.bbsId,
                menuId: articleData.menuId ?? 0,
                sort: "createdAt,desc",
                size: 9999,
              });

              if (articlesResponse.data.success && articlesResponse.data.data) {
                const articles = articlesResponse.data.data.content;
                const currentIndex = articles.findIndex(
                  (a: BoardArticleCommon) => a.nttId === numericArticleId
                );

                if (currentIndex !== -1) {
                  if (currentIndex > 0) {
                    setPrevArticleInfo({
                      nttId: articles[currentIndex - 1].nttId,
                      title: articles[currentIndex - 1].title,
                    });
                  }
                  if (currentIndex < articles.length - 1) {
                    setNextArticleInfo({
                      nttId: articles[currentIndex + 1].nttId,
                      title: articles[currentIndex + 1].title,
                    });
                  }
                }
              }
            } catch (listError) {
              console.error(
                "Error fetching article list for prev/next:",
                listError
              );
            }
          }
        } else {
          throw new Error("Failed to fetch article");
        }

        const menuPath = `/reference/${id}`;
        const menu: Menu | null = await findMenuByPath(menuPath);
        if (menu && typeof menu.id === "number") {
          const details = await menuApi.getPageDetails(menu.id);
          setPageDetails(details);
        } else {
          console.warn(
            `Menu not found or menu.id is invalid for path: ${menuPath}`
          );
        }
      } catch (err: any) {
        console.error("Error fetching article page data:", err);
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentNttIdString, id]);

  if (isLoading) {
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

  if (error) {
    return (
      <Container py={10} textAlign="center">
        <Heading size="lg" mb={4}>
          Error
        </Heading>
        <Text color="red.500">{error}</Text>
        <NextLink href={`/reference/${id || ""}`} passHref>
          <Button mt={6} colorPalette="gray" size="xs">
            Back to List
          </Button>
        </NextLink>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container py={10} textAlign="center">
        <Heading size="lg" mb={4}>
          Article Not Found
        </Heading>
        <Text>The requested article could not be found.</Text>
        <NextLink href={`/reference/${id || ""}`} passHref>
          <Button mt={6} colorPalette="gray" size="xs">
            Back to List
          </Button>
        </NextLink>
      </Container>
    );
  }

  const canEdit = pageDetails?.boardWriteAuth === "AUTHORIZED";
  const canDelete = pageDetails?.boardDeleteAuth === "AUTHORIZED";

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={6}>
        <HStack justify="space-between" align="center">
          <Heading size="md" color="gray.600" fontWeight="bold">
            {pageDetails?.menuName || pageDetails?.boardName || id}
          </Heading>
          <NextLink href={`/reference/${id || ""}`} passHref>
            <Button size="xs" variant="outline">
              목록
            </Button>
          </NextLink>
        </HStack>
      </Box>

      <ArticleDisplay
        article={article}
        isFaq={pageDetails?.boardSkinType === "FAQ"}
      />

      <Separator my={8} />

      <Flex justify="flex-end" gap={3} mt={6}>
        <Box flex={1} minW={0}>
          {prevArticleInfo ? (
            <NextLink
              href={`/reference/${id}/read/${prevArticleInfo.nttId}`}
              passHref
            >
              <HStack
                gap={1}
                alignItems="center"
                cursor="pointer"
                w="100%"
                title={prevArticleInfo.title}
              >
                <Icon as={ChevronLeft} boxSize="16px" />
                <Text
                  fontSize="sm"
                  color="gray.600"
                  title={prevArticleInfo.title}
                >
                  {prevArticleInfo.title}
                </Text>
              </HStack>
            </NextLink>
          ) : (
            <HStack gap={1} alignItems="center" visibility="hidden" w="100%">
              <Icon as={ChevronLeft} boxSize="16px" />
              <Text fontSize="sm">Placeholder</Text>
            </HStack>
          )}
        </Box>
        <NextLink href={`/reference/${id || ""}`} passHref>
          <Button variant="outline" size="xs">
            목록
          </Button>
        </NextLink>
        <Box flex={1} minW={0} textAlign="right">
          {nextArticleInfo ? (
            <NextLink
              href={`/reference/${id}/read/${nextArticleInfo.nttId}`}
              passHref
            >
              <HStack
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
                cursor="pointer"
                w="100%"
                title={nextArticleInfo.title}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                  title={nextArticleInfo.title}
                >
                  {nextArticleInfo.title}
                </Text>
                <Icon as={ChevronRight} boxSize="16px" />
              </HStack>
            </NextLink>
          ) : (
            <HStack
              gap={1}
              alignItems="center"
              justifyContent="flex-end"
              visibility="hidden"
              w="100%"
            >
              <Text fontSize="sm">Placeholder</Text>
              <Icon as={ChevronRight} boxSize="16px" />
            </HStack>
          )}
        </Box>
      </Flex>

      <Flex justify="flex-end" gap={3} mt={4}>
        {canEdit && (
          <Button colorPalette="blue" variant="outline" size="xs">
            수정
          </Button>
        )}
        {canDelete && (
          <Button colorPalette="red" size="xs">
            삭제
          </Button>
        )}
      </Flex>
    </Container>
  );
}
