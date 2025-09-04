"use client";
import {
  Box,
  Text,
  Flex,
  HStack,
  Link,
  Icon,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { BoardArticleCommon, FileDto } from "@/types/api"; // BoardArticleCommon, FileDto 임포트 추가
import {
  LuDownload,
  LuFileText,
  LuImage,
  LuFileArchive,
  LuFileAudio,
  LuFileVideo,
  LuPaperclip,
  LuEye,
  LuExternalLink,
} from "react-icons/lu";
// import { getPublicFileDownloadUrl } from "@/lib/utils"; // Download URL is in AttachmentInfoDto

// Lexical Imports for Rendering
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { baseInitialConfig } from "@/lib/lexicalConfig";
import { useColors } from "@/styles/theme";

// Simple Error Boundary for Lexical (Keep or import from shared location)
// (This could be moved to a shared util if used elsewhere)
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return <Box color="red.500">Error rendering content.</Box>;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Lexical Rendering Error:", error);
    setHasError(true);
    return <Box color="red.500">Error rendering content.</Box>;
  }
}

interface ArticleDisplayProps {
  article?: BoardArticleCommon | null; // Article -> BoardArticleCommon 변경
  contentString?: string;
  isFaq?: boolean;
  contentStyle?: React.CSSProperties;
  boardInfo?: {
    skinType?: string;
  };
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

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({
  article,
  contentString,
  isFaq,
  contentStyle,
  boardInfo,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialConfig = React.useMemo(
    () => ({
      ...baseInitialConfig,
      namespace: `ContentRenderer-${
        article?.nttId || contentString?.substring(0, 10) || Date.now()
      }`,
      editable: false,
      editorState: contentString ?? article?.content ?? null,
    }),
    [article, contentString]
  );

  const colors = useColors();

  if (!article && !contentString) {
    return <Text>내용을 표시할 수 없습니다.</Text>;
  }

  const shouldRenderArticleStructure = !!article;

  return (
    <Box>
      {shouldRenderArticleStructure && article && (
        <>
          {/* Header Section (Title & Metadata) */}
          <Flex direction="column" gap={1} mb={6} borderBottomWidth={1} pb={4}>
            <HStack alignItems="center">
              <Text
                fontWeight="bold"
                fontSize="2xl"
                truncate
                title={article.title}
              >
                {article.title}
              </Text>
              {article.hasImageInContent && (
                <Icon
                  as={LuImage}
                  boxSize={5}
                  color={colors.text.secondary}
                  aria-label="Image in content"
                  ml={2}
                />
              )}
              {article.hasAttachment && (
                <Icon
                  as={LuPaperclip}
                  boxSize={5}
                  color={colors.text.secondary}
                  aria-label="Has attachments"
                  ml={1}
                />
              )}
            </HStack>
            <Flex justify="end" align="center" gap={4} mt={1}>
              <Text color="gray.500" fontSize="sm">
                {article.displayWriter || article.writer}
              </Text>
              <HStack align="center" gap={1}>
                <Icon as={LuEye} boxSize={4} color="gray.500" />
                <Text color="gray.500" fontSize="sm">
                  {article.hits}
                </Text>
              </HStack>

              <Text color="gray.400" fontSize="sm">
                {article.postedAt?.slice(0, 10)}
              </Text>
            </Flex>
          </Flex>

          {/* External Link for Press Releases */}
          {article.externalLink &&
            article.bbsId &&
            boardInfo?.skinType === "PRESS" && (
              <Box
                mb={4}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor="blue.300"
                bg="blue.50"
              >
                <HStack>
                  <Text fontWeight="medium" color="blue.700">
                    원본 기사 링크:
                  </Text>
                  <Link
                    href={article.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue.600"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {article.externalLink} <Icon as={LuExternalLink} mx="2px" />
                  </Link>
                </HStack>
              </Box>
            )}
        </>
      )}

      {/* Lexical Content Renderer */}
      <Box
        className="lexical-rich-text-container"
        mb={shouldRenderArticleStructure ? 8 : 0}
      >
        {isFaq && article && article.title && (
          <Box mb={4}>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color={colors.primary.default}
            >
              Q: {article.title}
            </Text>
          </Box>
        )}
        {contentString || article?.content ? (
          <LexicalErrorBoundary>
            {isFaq && article && (
              <Text fontWeight="bold" color={colors.text.secondary} mb={1}>
                A:
              </Text>
            )}
            {isMounted && (
              <LexicalComposer
                key={
                  article?.nttId ||
                  contentString?.substring(0, 20) ||
                  Date.now()
                }
                initialConfig={initialConfig}
              >
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="article-content"
                      style={{
                        ...contentStyle,
                      }}
                      readOnly={true}
                    />
                  }
                  placeholder={null}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <ListPlugin />
                <LinkPlugin />
              </LexicalComposer>
            )}
          </LexicalErrorBoundary>
        ) : (
          <Text color="gray.500">내용이 없습니다.</Text>
        )}
      </Box>

      {shouldRenderArticleStructure &&
        article &&
        article.attachments &&
        article.attachments.length > 0 && (
          <Box pt={4} borderTopWidth="1px" borderColor="gray.200" mt={8}>
            <Text fontWeight="bold" mb={3}>
              첨부파일 ({article.attachments.length})
            </Text>
            <VStack align="stretch" gap={2}>
              {article.attachments.map((file: FileDto) => {
                // AttachmentInfoDto -> FileDto 변경
                if (
                  !file ||
                  typeof file.fileId === "undefined" ||
                  typeof file.originName === "undefined" ||
                  typeof file.size === "undefined"
                ) {
                  console.error(
                    "Invalid file object found in ArticleDisplay:",
                    file
                  );
                  return null;
                }

                const FileIcon = getFileIcon(file.mimeType, file.ext);
                const downloadUrl = file.downloadUrl;
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
                      <Text fontSize="sm" title={file.originName} truncate>
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
    </Box>
  );
};

export default ArticleDisplay;
