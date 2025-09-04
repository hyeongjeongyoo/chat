"use client";
import {
  Drawer,
  CloseButton,
  Portal,
  Box,
  Text,
  Flex,
  Button,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { BoardArticleCommon } from "@/types/api";

import { ArticleDisplay } from "@/components/articles/ArticleDisplay";
import { toaster } from "@/components/ui/toaster";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { AdminComment } from "@/components/comments/AdminComment";

interface ArticleDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: BoardArticleCommon | null;
  isFaq?: boolean;
  isQna?: boolean;
  previousArticle?: { nttId: number; title: string } | null;
  nextArticle?: { nttId: number; title: string } | null;
  onNavigate?: (nttId: number) => void;
  onNavigateToPrevious?: () => void;
  onNavigateToNext?: () => void;
  onWriteNew?: (bbsId: number, menuId: number) => void;
  onEditArticle?: (articleToEdit: BoardArticleCommon) => void;
  onDeleteArticle?: (articleToDelete: BoardArticleCommon) => Promise<void>;
  canWrite?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ArticleDetailDrawer = ({
  open,
  onOpenChange,
  article,
  isFaq,
  isQna,
  previousArticle,
  nextArticle,
  onNavigate,
  onNavigateToPrevious,
  onNavigateToNext,
  onWriteNew,
  onEditArticle,
  onDeleteArticle,
  canWrite = false,
  canEdit = false,
  canDelete = false,
}: ArticleDetailDrawerProps) => {
  const { isAuthenticated, user } = useRecoilValue(authState);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePrevClick = () => {
    if (onNavigateToPrevious) {
      onNavigateToPrevious();
    } else if (previousArticle && onNavigate) {
      onNavigate(previousArticle.nttId);
    }
  };

  const handleNextClick = () => {
    if (onNavigateToNext) {
      onNavigateToNext();
    } else if (nextArticle && onNavigate) {
      onNavigate(nextArticle.nttId);
    }
  };

  const handleWriteClick = () => {
    if (onWriteNew && article) {
      onWriteNew(article.bbsId, article.menuId!);
    } else if (onWriteNew && !article) {
      console.warn(
        "onWriteNew called without article context for bbsId/menuId."
      );
    }
  };

  const handleEditClick = () => {
    if (onEditArticle && article) {
      onEditArticle(article);
    }
  };

  const handleDeleteClick = async () => {
    if (onDeleteArticle && article) {
      const confirmed = window.confirm(
        `'${article.title}' 게시글을 정말 삭제하시겠습니까?`
      );
      if (confirmed) {
        setIsDeleting(true);
        try {
          await onDeleteArticle(article);
        } catch (err) {
          console.error("Failed to delete article from drawer:", err);
          toaster.error({
            title: "삭제 실패",
            description: "게시글 삭제 중 오류가 발생했습니다.",
          });
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const effectiveCanEdit =
    canEdit && article && isAuthenticated && user?.name === article.writer;
  const effectiveCanDelete =
    canDelete && article && isAuthenticated && user?.name === article.writer;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="xl"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header></Drawer.Header>
            <Drawer.Body px={8} py={6}>
              <ArticleDisplay article={article} isFaq={isFaq} />
              {isQna && article && <AdminComment nttId={article.nttId} />}

              <Flex justify="space-between" align="center" my={6} gap={2}>
                <Box
                  flex={1}
                  minW={0}
                  onClick={handlePrevClick}
                  cursor={previousArticle ? "pointer" : "default"}
                  opacity={previousArticle ? 1 : 0.4}
                  title={previousArticle?.title}
                >
                  {previousArticle ? (
                    <HStack gap={1} alignItems="center">
                      <Icon as={ChevronLeft} boxSize="16px" />
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        title={previousArticle.title}
                      >
                        {previousArticle.title}
                      </Text>
                    </HStack>
                  ) : (
                    <HStack gap={1} alignItems="center" visibility="hidden">
                      <Icon as={ChevronLeft} boxSize="16px" />
                      <Text fontSize="sm">이전 글 없음</Text>
                    </HStack>
                  )}
                </Box>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onOpenChange(false)}
                >
                  목록
                </Button>

                <Box
                  flex={1}
                  minW={0}
                  textAlign="right"
                  onClick={handleNextClick}
                  cursor={nextArticle ? "pointer" : "default"}
                  opacity={nextArticle ? 1 : 0.4}
                  title={nextArticle?.title}
                >
                  {nextArticle ? (
                    <HStack
                      gap={1}
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        title={nextArticle.title}
                      >
                        {nextArticle.title}
                      </Text>
                      <Icon as={ChevronRight} boxSize="16px" />
                    </HStack>
                  ) : (
                    <HStack
                      gap={1}
                      alignItems="center"
                      justifyContent="flex-end"
                      visibility="hidden"
                    >
                      <Text fontSize="sm">다음 글 없음</Text>
                      <Icon as={ChevronRight} boxSize="16px" />
                    </HStack>
                  )}
                </Box>
              </Flex>
              {article && (
                <Flex justify="flex-end" gap={2} mt={6}>
                  <Button
                    colorPalette="blue"
                    variant="solid"
                    size="xs"
                    onClick={handleWriteClick}
                    disabled={!canWrite || !onWriteNew}
                  >
                    글쓰기
                  </Button>
                  <Button
                    colorPalette="blue"
                    variant="outline"
                    size="xs"
                    onClick={handleEditClick}
                    disabled={!effectiveCanEdit || !onEditArticle}
                  >
                    수정
                  </Button>
                  <Button
                    colorPalette="red"
                    variant="solid"
                    size="xs"
                    onClick={handleDeleteClick}
                    loading={isDeleting}
                    disabled={!effectiveCanDelete || !onDeleteArticle}
                  >
                    삭제
                  </Button>
                </Flex>
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
