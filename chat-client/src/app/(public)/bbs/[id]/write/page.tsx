"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Container, Heading, Text, Flex, Button } from "@chakra-ui/react";
import {
  ArticleEditor,
  ArticleEditorProps,
} from "@/components/article/ArticleEditor";
import { findMenuByPath } from "@/lib/menu-utils";
import { menuApi } from "@/lib/api/menu";

// Define a type for the attachment properties ArticleEditor expects
type EditorAttachmentConfig = Pick<
  ArticleEditorProps,
  "maxFileAttachments" | "maxFileSizeMB" | "disableAttachments"
>;

export default function ArticleWritePage() {
  const params = useParams();
  const router = useRouter();
  const pathSlug = params.id as string;

  const [actualBoardId, setActualBoardId] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [boardName, setBoardName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  // State to hold attachment properties derived from pageDetails
  const [attachmentConfig, setAttachmentConfig] =
    useState<EditorAttachmentConfig>({
      disableAttachments: false,
      maxFileAttachments: undefined,
      maxFileSizeMB: undefined,
    });

  useEffect(() => {
    async function fetchDetailsForWritePage() {
      if (!pathSlug) {
        setError("게시판 경로를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCanWrite(false);
      // Reset attachment config on new fetch
      setAttachmentConfig({
        disableAttachments: true,
        maxFileAttachments: undefined,
        maxFileSizeMB: undefined,
      });

      try {
        const menuPath = `/bbs/${pathSlug}`;
        const menu = await findMenuByPath(menuPath);

        if (!menu || !menu.id || menu.type !== "BOARD") {
          setError(
            "유효한 게시판 정보를 찾을 수 없거나, 글쓰기가 지원되지 않는 메뉴 타입입니다."
          );
          setIsLoading(false);
          return;
        }

        const pageDetails = await menuApi.getPageDetails(menu.id);
        if (!pageDetails || typeof pageDetails.boardId !== "number") {
          setError("게시판 세부 정보를 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }

        // Check write permissions
        const writeAuthAllowed =
          pageDetails.boardWriteAuth &&
          pageDetails.boardWriteAuth !== "NONE" &&
          pageDetails.boardWriteAuth !== "NONE_OR_SIMILAR_RESTRICTIVE_VALUE";

        if (!writeAuthAllowed) {
          setError("이 게시판에 글을 작성할 권한이 없습니다.");
          setCanWrite(false); // Explicitly set canWrite to false
          setIsLoading(false);
          return;
        }

        setCanWrite(true);
        setActualBoardId(pageDetails.boardId);
        setMenuId(menu.id);
        setBoardName(pageDetails.boardName || pageDetails.menuName || "글쓰기");

        // Derive attachment configuration from pageDetails
        const limit = pageDetails.boardAttachmentLimit;
        const size = pageDetails.boardAttachmentSize;

        if (
          typeof limit === "number" &&
          limit > 0 &&
          typeof size === "number" &&
          size > 0
        ) {
          setAttachmentConfig({
            maxFileAttachments: limit,
            maxFileSizeMB: size,
            disableAttachments: false, // Enabled because limits are positive & user can write
          });
        } else {
          // Default to disabled if limits are not positive or not numbers
          setAttachmentConfig({
            disableAttachments: true,
            maxFileAttachments: undefined,
            maxFileSizeMB: undefined,
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch details for write page:", err);
        setError(
          err.message || "게시판 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (pathSlug) {
      fetchDetailsForWritePage();
    } else {
      setError("게시판 경로가 유효하지 않습니다.");
      setIsLoading(false);
    }
  }, [pathSlug]);

  const handleCancel = () => {
    router.push(`/bbs/${pathSlug}`);
  };

  const handleSubmit = () => {
    // After successful submission, navigate back to the board list page
    router.push(`/bbs/${pathSlug}`);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
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

  if (error || !canWrite) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center" p={6} borderWidth="1px" borderRadius="lg">
          <Heading
            size="md"
            color={
              error === "이 게시판에 글을 작성할 권한이 없습니다."
                ? "orange.500"
                : "red.500"
            }
          >
            {error === "이 게시판에 글을 작성할 권한이 없습니다."
              ? "접근 제한"
              : "오류"}
          </Heading>
          <Text mt={4}>
            {error || "글을 작성할 수 없습니다. 권한을 확인해주세요."}
          </Text>
          <Button mt={6} onClick={() => router.push(`/bbs/${pathSlug}`)}>
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  if (menuId === null || actualBoardId === null) {
    // This case should ideally be covered by the error handling above,
    // but as a fallback if canWrite is true but IDs are still null.
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center" p={6} borderWidth="1px" borderRadius="lg">
          <Heading size="md" color="red.500">
            오류
          </Heading>
          <Text mt={4}>
            게시판 정보를 완전히 불러오지 못했습니다. 다시 시도해주세요.
          </Text>
          <Button mt={6} onClick={() => router.push(`/bbs/${pathSlug}`)}>
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md">
        <Box p={4} borderBottomWidth="1px">
          <Heading size="lg">{boardName || "글쓰기"}</Heading>
        </Box>
        <Box p={6}>
          <ArticleEditor
            bbsId={actualBoardId}
            menuId={menuId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="등록하기"
            cancelLabel="취소"
            {...attachmentConfig}
          />
        </Box>
      </Box>
    </Container>
  );
}
