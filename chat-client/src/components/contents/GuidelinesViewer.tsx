"use client";

import { Box, Heading, Text } from "@chakra-ui/react";

interface GuidelineArticle {
  title?: string;
  content?: string;
}

interface GuidelineChapter {
  title?: string;
  articles: GuidelineArticle[];
}

interface GuidelinesViewerProps {
  revisions: string[];
  chapters: GuidelineChapter[];
}

export default function GuidelinesViewer({
  revisions,
  chapters,
}: GuidelinesViewerProps) {
  return (
    <Box
      border="1px solid #E2E8F0"
      borderRadius="md"
      p={{ base: 4, md: 6 }}
      mt={4}
      lineHeight="tall"
      textAlign="justify"
    >
      {revisions.map((revision, index) => (
        <Text key={index} fontSize={{ base: "sm", md: "md" }}>
          {revision}
        </Text>
      ))}

      {chapters.map((chapter, index) => (
        <Box key={index}>
          {chapter.title && (
            <Heading
              as="h5"
              mt={index > 0 ? { base: "40px", md: "60px" } : 6}
              mb={3}
              fontSize={{ base: "20px", md: "28px" }}
              fontWeight="bold"
            >
              {chapter.title}
            </Heading>
          )}
          {chapter.articles.map((article, articleIndex) => (
            <Box key={articleIndex} mt={articleIndex > 0 ? "20px" : 0}>
              {article.title && (
                <Text
                  as="span"
                  pr={2}
                  whiteSpace="pre-line"
                  fontSize={{ base: "18px", md: "24px" }}
                  display="block"
                  fontWeight="semibold"
                >
                  {article.title}
                </Text>
              )}
              {article.content && (
                <Text
                  as="span"
                  whiteSpace="pre-line"
                  fontSize={{ base: "14px", md: "18px" }}
                  fontWeight="normal"
                >
                  {article.content}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
 