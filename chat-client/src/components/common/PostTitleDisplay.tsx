"use client";

import React from "react";
import { Text, HStack, Icon, Flex } from "@chakra-ui/react";
import { LuImage, LuPaperclip } from "react-icons/lu";
import { Post, BoardArticleCommon } from "@/types/api";

export interface ArticleDisplayData {
  hasImageInContent?: boolean;
  hasAttachment?: boolean;
}

interface PostTitleDisplayProps {
  title: string;
  postData?: ArticleDisplayData; // BoardArticleCommon -> ArticleDisplayData로 변경
}

const PostTitleDisplay: React.FC<PostTitleDisplayProps> = ({
  title,
  postData,
}) => {
  return (
    <HStack
      gap={0.5}
      alignItems="center"
      justifyContent="flex-start"
      h="100%"
      maxW="100%" // 부모 컨테이너(AG-Grid 셀 등)의 너비를 넘지 않도록 제한
      cursor="pointer"
      title={title}
    >
      <Text truncate fontSize="16px" flex="1" minW="0">
        {title}
      </Text>
      {postData?.hasImageInContent && (
        <Icon
          as={LuImage}
          boxSize="1em"
          aria-label="Image in content"
          flexShrink={0}
        />
      )}
      {postData?.hasAttachment && (
        <Icon
          as={LuPaperclip}
          boxSize="0.9em"
          aria-label="Has attachments"
          flexShrink={0}
        />
      )}
    </HStack>
  );
};

export default PostTitleDisplay;
