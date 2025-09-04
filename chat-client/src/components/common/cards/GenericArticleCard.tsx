"use client";

import React from "react";
import {
  Text,
  HStack,
  // Heading, // Not used, Text with fontWeight is used
  AspectRatio,
  Icon,
  Flex,
  Box,
  Link as ChakraLink,
  Badge,
  Spacer,
} from "@chakra-ui/react";
import { CommonCardData } from "@/types/common"; // Import CommonCardData
import { LuEye, LuImageOff, LuExternalLink } from "react-icons/lu";
import { useColors } from "@/styles/theme";
import Image from "next/image";
import { useColorMode as useColorModeComponent } from "@/components/ui/color-mode"; // Correct alias usage
import PostTitleDisplay from "@/components/common/PostTitleDisplay"; // PostTitleDisplay 임포트
import { ArticleDisplayData } from "@/components/common/PostTitleDisplay"; // ArticleDisplayData 임포트
import NextLink from "next/link";

interface GenericArticleCardProps {
  cardData: CommonCardData;
  onClick?: () => void; // Optional click handler for CMS context
}

const GenericArticleCard: React.FC<GenericArticleCardProps> = ({
  cardData,
  onClick,
}) => {
  const colors = useColors();
  const { colorMode } = useColorModeComponent(); // Use the aliased import

  // Assuming cardData.createdAt is a string parsable by new Date()
  // If it's already formatted, this logic can be removed or adapted.
  const formattedDate = cardData.postedAt
    ? new Date(cardData.postedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "N/A";

  // Logic for external link (icon only)
  let externalLinkHref: string | undefined = undefined;
  if (cardData.externalLink) {
    const trimmedExternalLink = cardData.externalLink.trim();
    if (trimmedExternalLink) {
      if (
        trimmedExternalLink.startsWith("http://") ||
        trimmedExternalLink.startsWith("https://")
      ) {
        externalLinkHref = trimmedExternalLink;
      } else {
        externalLinkHref = `http://${trimmedExternalLink}`;
      }
    }
  }

  // Title always links to internal detail URL
  const internalDetailUrl = cardData.detailUrl;
  // Define title color based on theme (not dependent on whether link is external anymore)
  const titleColor =
    colorMode === "dark"
      ? colors.text?.primary || "#E2E8F0"
      : colors.text?.primary || "#2D3748";
  const iconHoverColor = colorMode === "dark" ? "#75E6DA" : "blue.500";
  const iconColor =
    colorMode === "dark"
      ? colors.text?.secondary || "gray.500"
      : colors.text?.secondary || "gray.600";

  const getCategoryStyle = (categoryName: string) => {
    switch (categoryName) {
      case "공지":
        return { bg: "blue.500", color: "#ffffff" };
      case "홍보":
        return { bg: "#FAB20B", color: "#ffffff" };
      case "유관기관 홍보":
        return { bg: "#0C8EA4", color: "#ffffff" };
      default:
        return { bg: "gray.100", color: "gray.800" };
    }
  };

  const cardContent = (
    <Box
      as="article"
      h="100%"
      display="flex"
      flexDirection="column"
      bg={colors.cardBg}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: colors.primary.default,
      }}
    >
      {cardData.thumbnailUrl ? (
        <AspectRatio ratio={16 / 9} w="100%">
          <Image
            src={cardData.thumbnailUrl}
            loader={() => cardData.thumbnailUrl || ""}
            alt={cardData.title}
            objectFit="cover"
            width={100}
            height={100}
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={16 / 9} w="100%">
          <Flex
            w="100%"
            h="100%"
            bg="gray.100"
            alignItems="center"
            justifyContent="center"
            color="gray.400"
          >
            <Icon as={LuImageOff} boxSize={10} />
          </Flex>
        </AspectRatio>
      )}

      <Box p={2} gap={2} alignItems="center" flex={1}>
        <Flex
          gap={2}
          flex={1}
          alignItems="center"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {/* Title display without link since the whole card is now clickable */}
          <Flex flex={1} minW={0}>
            <Box
              flex={1}
              minW={0}
              title={cardData.title}
              display="flex"
              alignItems="center"
            >
              <PostTitleDisplay
                title={cardData.title}
                postData={cardData as ArticleDisplayData}
              />
            </Box>

            {/* External link icon, only if externalLinkHref exists */}
            {externalLinkHref && (
              <ChakraLink
                href={externalLinkHref}
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                aria-label={`Open external link: ${externalLinkHref}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon
                  as={LuExternalLink}
                  color={iconColor}
                  _hover={{ color: iconHoverColor }}
                  cursor="pointer"
                  boxSize={4}
                />
              </ChakraLink>
            )}
          </Flex>
        </Flex>
        <Text fontSize="xs" color={colors.text.tertiary} textAlign="right">
          {formattedDate}
        </Text>
      </Box>

      <HStack p={2} borderTopWidth="1px" borderColor={colors.border} mt="auto">
        <HStack gap={4} alignItems="center">
          {(cardData.displayWriter || cardData.writer) && (
            <Text fontSize="xs" color={colors.text.tertiary}>
              {cardData.displayWriter || cardData.writer}
            </Text>
          )}
          {typeof cardData.hits === "number" && (
            <HStack gap={1} alignItems="center">
              <Icon as={LuEye} boxSize="1em" color={colors.text.tertiary} />
              <Text fontSize="xs" color={colors.text.tertiary}>
                {cardData.hits}
              </Text>
            </HStack>
          )}
        </HStack>
        <Spacer />
        <HStack gap={2} alignItems="center">
          {cardData.categories &&
            cardData.categories.length > 0 &&
            (() => {
              // 리스트뷰와 동일하게 첫 번째 카테고리만 표시
              const category = cardData.categories[0];
              const style = getCategoryStyle(category.name);
              return (
                <Badge
                  key={category.categoryId}
                  bg={style.bg}
                  color={style.color}
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  variant="subtle"
                >
                  {category.name}
                </Badge>
              );
            })()}
        </HStack>
      </HStack>
    </Box>
  );

  // If onClick is provided (CMS context), wrap in a clickable Box
  if (onClick) {
    return (
      <Box onClick={onClick} h="100%">
        {cardContent}
      </Box>
    );
  }

  // Otherwise, wrap in a Link (public context)
  return (
    <ChakraLink
      as={NextLink}
      href={internalDetailUrl}
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
      display="block"
      h="100%"
    >
      {cardContent}
    </ChakraLink>
  );
};

export default GenericArticleCard;
