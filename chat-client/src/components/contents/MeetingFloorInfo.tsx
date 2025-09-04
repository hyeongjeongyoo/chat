"use client";

import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import HeadingH4 from "./HeadingH4";

interface FloorInfoItem {
  label: string;
  value: string;
}

interface MeetingFloorInfoProps {
  title?: string;
  floorImage: {
    src: string;
    alt: string;
  };
  infoItems: FloorInfoItem[];
}

export default function MeetingFloorInfo({
  title,
  floorImage,
  infoItems,
}: MeetingFloorInfoProps) {
  // 반응형 폰트 크기 설정
  const textFontSize = useBreakpointValue({
    base: "sm", // sm 이하: 2단계 줄임 (3xl -> xl)
    md: "xl", // sm: 1단계 줄임 (3xl -> 2xl)
    lg: "3xl", // lg: 원래 크기 (3xl)
  });

  return (
    <Box
      className="mr-floor-box"
      mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}
    >
      <HeadingH4>{title || floorImage.alt}</HeadingH4>
      <Flex
        justifyContent="space-between"
        gap="10px"
        direction={{ base: "column", lg: "row" }}
      >
        <Image
          src={floorImage.src}
          alt={floorImage.alt}
          w={"auto"}
          maxW={"80%"}
          margin={"0 auto"}
          objectFit={"contain"}
        />
        <Box
          style={{ flex: "1 1 0", maxWidth: "750px" }}
          w={{ base: "100%", lg: "auto" }}
        >
          {infoItems.map((item, index) => (
            <Flex key={index} alignItems="stretch" gap={{ base: 5, lg: 12 }}>
              <Text
                flexShrink={0}
                backgroundColor="#F7F8FB"
                w={{ base: "100px", lg: "200px" }}
                py={{ base: 2, lg: 4 }}
                color="#4B4B4B"
                fontSize={textFontSize}
                fontWeight="medium"
                textAlign="center"
                className="title"
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH={{ base: "40px", lg: "60px" }}
              >
                {item.label}
              </Text>
              <Text
                py={{ base: 2, lg: 4 }}
                color="#4B4B4B"
                fontSize={textFontSize}
                fontWeight="medium"
                display="flex"
                alignItems="center"
                flex="1"
                minH={{ base: "40px", lg: "60px" }}
              >
                {item.value}
              </Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
}
