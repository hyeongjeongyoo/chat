"use client";

import React from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Badge,
  Separator,
  Button,
  IconButton,
  Icon,
  Link,
  Flex,
} from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { FileDto, Post } from "@/types/api";
import {
  LuFolderGit2,
  LuTrash2,
  LuDownload,
  LuFileText,
  LuImage,
  LuFileArchive,
  LuFileAudio,
  LuFileVideo,
} from "react-icons/lu";
import { getPublicFileDownloadUrl } from "@/lib/utils";

interface PostDetailProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  onReply?: () => void;
}

const getFileIcon = (mimeType: string | undefined, ext: string | undefined) => {
  if (mimeType?.startsWith("image/")) return LuImage;
  if (mimeType === "application/pdf") return LuFileText;
  if (mimeType?.includes("word") || ext === "doc" || ext === "docx")
    return LuFileText;
  if (
    mimeType?.includes("excel") ||
    mimeType?.includes("spreadsheet") ||
    ext === "xls" ||
    ext === "xlsx"
  )
    return LuFileText;
  if (mimeType?.includes("presentation") || ext === "ppt" || ext === "pptx")
    return LuFileText;
  if (mimeType?.startsWith("audio/")) return LuFileAudio;
  if (mimeType?.startsWith("video/")) return LuFileVideo;
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed" ||
    ext === "zip"
  )
    return LuFileArchive;
  return LuFileText;
};

export function PostDetail({
  post,
  onEdit,
  onDelete,
  onReply,
}: PostDetailProps) {
  const colors = useColors();
  const textColor = colors.text.primary;
  const secondaryTextColor = colors.text.secondary;

  return (
    <Box p={4}>
      <VStack align="stretch" gap={4}>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {post.title}
            </Text>
            <HStack>
              <IconButton
                aria-label="Edit post"
                size="sm"
                variant="ghost"
                onClick={onEdit}
              >
                <LuFolderGit2 />
              </IconButton>
              <IconButton
                aria-label="Delete post"
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={onDelete}
              >
                <LuTrash2 />
              </IconButton>
            </HStack>
          </HStack>

          <HStack gap={4} color={secondaryTextColor} fontSize="sm">
            <Text>작성자: {post.writer}</Text>
            <Text>작성일: {new Date(post.createdAt).toLocaleString()}</Text>
            {post.publishStartDt && (
              <Text>
                게시일: {new Date(post.publishStartDt).toLocaleString()}
              </Text>
            )}
          </HStack>

          {post.categories && post.categories.length > 0 && (
            <HStack mt={2} gap={2}>
              {post.categories.map((category) => (
                <Badge key={category.categoryId} colorScheme="blue">
                  {category.name}
                </Badge>
              ))}
            </HStack>
          )}
        </Box>

        <Separator />

        <Box
          dangerouslySetInnerHTML={{ __html: post.content }}
          color={textColor}
          className="post-content"
        />

        {post.attachments && post.attachments.length > 0 && (
          <Box pt={4}>
            <Text fontWeight="bold" mb={3}>
              첨부파일 ({post.attachments.length})
            </Text>
            <VStack align="stretch" gap={2}>
              {post.attachments.map((file: FileDto) => {
                const FileIcon = getFileIcon(file.mimeType, file.ext);
                const downloadUrl = getPublicFileDownloadUrl(file.fileId);
                return (
                  <Flex
                    key={file.fileId}
                    align="center"
                    justify="space-between"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: colors.cardBg }}
                  >
                    <HStack gap={3} flex={1} minWidth={0}>
                      <Icon
                        as={FileIcon}
                        boxSize={5}
                        color={colors.text.secondary}
                      />
                      <Text fontSize="sm" truncate title={file.originName}>
                        {file.originName}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colors.text.tertiary}
                        whiteSpace="nowrap"
                      >
                        ({Math.round(file.size / 1024)} KB)
                      </Text>
                    </HStack>
                    <Link
                      href={downloadUrl}
                      download={file.originName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton
                        aria-label={`Download ${file.originName}`}
                        size="sm"
                        variant="ghost"
                      >
                        <LuDownload />
                      </IconButton>
                    </Link>
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        )}

        {onReply && (
          <Box>
            <Button colorPalette="primary" variant="outline" onClick={onReply}>
              답변 작성
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
