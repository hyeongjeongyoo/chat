"use client";
import NextLink from "next/link";
import {
  Box,
  Text,
  HStack,
  Link as ChakraLink,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { CommonCardData } from "@/types/common";
import { LuExternalLink } from "react-icons/lu";

interface PressListItemProps {
  cardData: CommonCardData;
}

export const PressListItem: React.FC<PressListItemProps> = ({ cardData }) => {
  const titleTargetUrl = cardData.externalLink || cardData.detailUrl;
  const isTitleExternal = !!cardData.externalLink;
  const date = cardData.createdAt
    ? new Date(cardData.createdAt)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\.$/, "") // Remove trailing dot if any from ko-KR format
        .replace(/\s/g, "") // Remove all spaces
    : "N/A";

  const titleContent = (
    <Text
      as="span"
      fontWeight="medium"
      fontSize={{ base: "sm", md: "md" }}
      color="#75E6DA"
      _hover={{ textDecoration: "underline", color: "#A0FDFA" }}
      title={cardData.title}
    >
      {cardData.title}
    </Text>
  );

  return (
    <Flex
      justify="space-between"
      align="center"
      py={4}
      px={{ base: 2, md: 4 }}
      borderBottom="1px solid"
      borderColor="gray.700"
      _hover={{ bg: "gray.700" }}
      color="gray.300"
    >
      <HStack flex={1} gap={3} overflow="hidden" alignItems="center">
        {cardData.externalLink ? (
          <ChakraLink
            href={cardData.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            title={cardData.title}
            color="#75E6DA"
            fontWeight="medium"
            fontSize={{ base: "sm", md: "md" }}
            _hover={{ textDecoration: "underline", color: "#A0FDFA" }}
          >
            {cardData.title}
          </ChakraLink>
        ) : (
          <NextLink href={cardData.detailUrl} passHref>
            <ChakraLink
              title={cardData.title}
              color="#75E6DA"
              fontWeight="medium"
              fontSize={{ base: "sm", md: "md" }}
              _hover={{ textDecoration: "underline", color: "#A0FDFA" }}
            >
              {cardData.title}
            </ChakraLink>
          </NextLink>
        )}

        {cardData.externalLink && (
          <ChakraLink
            href={cardData.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            display="inline-flex"
            aria-label="Open external link"
          >
            <Icon
              as={LuExternalLink}
              color="gray.400"
              _hover={{ color: "#75E6DA" }}
              cursor="pointer"
              boxSize={{ base: 4, md: 5 }}
            />
          </ChakraLink>
        )}
      </HStack>
      <HStack gap={{ base: 3, md: 6 }} whiteSpace="nowrap" ml={4}>
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400">
          {cardData.writer || "관리자"}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400">
          {date.replace(/\./g, ".")}
        </Text>
      </HStack>
    </Flex>
  );
};
