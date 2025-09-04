"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Stack,
  Badge,
  IconButton,
  HStack,
  Image,
  Card,
  Separator,
} from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { Post } from "@/types/api";
import {
  LuTrash2,
  LuEye,
  LuPencil,
  LuImage,
  LuPaperclip,
} from "react-icons/lu";
import { getPublicFileDownloadUrl } from "@/lib/utils";
import PostTitleDisplay from "@/components/common/PostTitleDisplay";

interface PostListItemProps {
  post: Post;
  onViewPost: (nttId: number) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (nttId: number) => void;
  loadingNttId: number | null;
  colors: ReturnType<typeof useColors>;
}

const PostListItem: React.FC<PostListItemProps> = ({
  post,
  onViewPost,
  onEditPost,
  onDeletePost,
  loadingNttId,
  colors,
}) => {
  let thumbnailUrl: string | null = null;
  let isFirstAttachmentImage = false;

  if (post.attachments && post.attachments.length > 0) {
    const firstFile = post.attachments[0];
    if (
      firstFile &&
      firstFile.mimeType &&
      firstFile.mimeType.startsWith("image/")
    ) {
      isFirstAttachmentImage = true;
      thumbnailUrl = getPublicFileDownloadUrl(firstFile.fileId);
    }
  }

  return (
    <Card.Root
      key={post.nttId}
      variant="outline"
      onClick={() => onViewPost(post.nttId)}
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        cursor: "pointer",
      }}
      transition="all 0.2s"
      width="100%"
    >
      <Card.Header pb={2}>
        <Stack direction="row" justify="space-between" align="center">
          <HStack flexGrow={1} minWidth={0}>
            {isFirstAttachmentImage && thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={post.title}
                boxSize="50px"
                objectFit="cover"
                mr={3}
                borderRadius="md"
              />
            ) : (
              <Box boxSize="50px" mr={3} bg="gray.100" borderRadius="md" />
            )}
            <PostTitleDisplay title={post.title} postData={post} />
            {post.hasImageInContent && (
              <LuImage
                size="1.1em"
                color={colors.text.secondary}
                style={{ marginLeft: "4px", marginRight: "2px" }}
                aria-label="Image in content"
              />
            )}
            {post.hasAttachment && (
              <LuPaperclip
                size="1.0em"
                color={colors.text.secondary}
                style={{ marginLeft: "2px", marginRight: "4px" }}
                aria-label="Has attachments"
              />
            )}
            {post.noticeState === "Y" && (
              <Badge colorPalette="blue">공지</Badge>
            )}
            {post.parentNttId && <Badge colorPalette="purple">답변</Badge>}
          </HStack>
          <HStack>
            <IconButton
              aria-label="View post"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onViewPost(post.nttId);
              }}
            >
              <LuEye />
            </IconButton>
            <IconButton
              aria-label="Edit post"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEditPost(post);
              }}
            >
              <LuPencil />
            </IconButton>
            <IconButton
              aria-label="Delete post"
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePost(post.nttId);
              }}
              disabled={loadingNttId !== null && loadingNttId === post.nttId}
            >
              {loadingNttId === post.nttId ? (
                <Box
                  width="40px"
                  height="40px"
                  border="4px solid"
                  borderColor="blue.500"
                  borderTopColor="transparent"
                  borderRadius="full"
                  animation="spin 1s linear infinite"
                />
              ) : (
                <LuTrash2 />
              )}
            </IconButton>
          </HStack>
        </Stack>
      </Card.Header>
      <Separator />
      <Card.Body pt={2}>
        <Stack gap={2}>
          <Text fontSize="sm" color={colors.text.secondary}>
            작성자: {post.writer}
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>
            게시일: {new Date(post.publishStartDt).toLocaleDateString()}
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>
            조회수: {post.hits}
          </Text>
          {post.categories && post.categories.length > 0 && (
            <HStack>
              {post.categories.map((category) => (
                <Badge key={category.categoryId} colorPalette="teal">
                  {category.name}
                </Badge>
              ))}
            </HStack>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

interface PostListProps {
  bbsId: number;
  posts: Post[];
  onAddPost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (nttId: number) => void;
  onViewPost: (nttId: number) => void;
  isLoading: boolean;
  loadingNttId: number | null;
}

export function PostList({
  bbsId,
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onViewPost,
  isLoading,
  loadingNttId,
}: PostListProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch" p={4}>
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold" color={colors.text.primary}>
          게시글 목록
        </Text>
        <Button onClick={onAddPost} colorPalette="blue" size="sm">
          새 게시글 작성
        </Button>
      </Stack>

      {posts.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          bg={colors.bg}
          borderRadius="md"
          borderWidth="1px"
          borderColor={colors.border}
        >
          <Text color={colors.text.secondary}>등록된 게시글이 없습니다.</Text>
        </Box>
      ) : (
        <VStack gap={4} align="stretch">
          {posts.map((post) => (
            <PostListItem
              key={post.nttId}
              post={post}
              onViewPost={onViewPost}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              loadingNttId={loadingNttId}
              colors={colors}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}
