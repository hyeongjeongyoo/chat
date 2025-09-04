import React from "react";
import { Box, Flex, Text, Heading, Highlight, Image } from "@chakra-ui/react";

interface TopInfoBoxProps {
  title: string;
  highlightText: string;
  fullText: string;
  description: string;
  bgColor?: string;
  highlightColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageOrder?: number;
}

export const TopInfoBox: React.FC<TopInfoBoxProps> = ({
  title,
  highlightText,
  fullText,
  description,
  bgColor = "#F4F7FF",
  highlightColor = "#4CCEC6",
  titleColor = "#424242",
  descriptionColor = "#424242",
  imageSrc,
  imageAlt = "정보 이미지",
  imageOrder = "auto",
}) => {
  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      wrap="wrap"
      align="center"
      justify="center"
      gap={{ base: 5, lg: 8 }}
      mb="60px"
      bg={bgColor}
      p={{ base: 4, lg: 8 }}
      borderRadius="3xl"
    >
      <Box width={{ base: "100%", lg: "calc(100% - 350px)" }}>
        <Text fontSize={{ base: "md", md: "lg", lg: "xl" }} color={titleColor}>
          {title}
        </Text>
        <Heading
          as="h3"
          fontSize={{ base: "2xl", md: "2xl", lg: "4xl" }}
          mb={4}
        >
          <Highlight query={highlightText} styles={{ color: highlightColor }}>
            {fullText}
          </Highlight>
        </Heading>
        <Text
          fontSize={{ base: "md", md: "lg", lg: "xl" }}
          color={descriptionColor}
        >
          {description}
        </Text>
      </Box>

      {imageSrc && (
        <Flex
          flex="1"
          display={{ base: "none", lg: "flex" }}
          order={imageOrder}
          width={{ lg: "300px" }}
          justifyContent="center"
          alignItems="center"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width="auto"
            maxWidth="100%"
            height="auto"
            objectFit="cover"
          />
        </Flex>
      )}
    </Flex>
  );
};
