"use client";

import {
  Box,
  Heading,
  List,
  Text,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";

// 서비스 아이템 인터페이스
export interface ServiceItem {
  title: string;
  description: React.ReactNode;
  imageSrc: string;
}

// ListStyle02 컴포넌트 props 인터페이스
export interface ListStyle02Props {
  title: string;
  items: ServiceItem[];
}

function ListStyle02({ title, items }: ListStyle02Props) {
  // 반응형 폰트 사이즈 설정
  const titleFontSize = useBreakpointValue({
    base: "2xl", // sm 이하: 2단계 줄임 (60px -> 2xl)
    md: "4xl", // md: 1단계 줄임 (60px -> 4xl)
    lg: "5xl", // lg: 원래 크기 (60px)
  });

  const itemTitleFontSize = useBreakpointValue({
    base: "lg", // sm 이하: 2단계 줄임 (3xl -> lg)
    md: "xl", // md: 1단계 줄임 (3xl -> xl)
    lg: "2xl", // lg: 1단계 줄임 (3xl -> 2xl)
  });

  const itemDescFontSize = useBreakpointValue({
    base: "md", // sm 이하: 2단계 줄임 (2xl -> md)
    md: "lg", // md: 1단계 줄임 (2xl -> lg)
    lg: "xl", // lg: 1단계 줄임 (2xl -> xl)
  });

  // 반응형 이미지 크기 설정
  const imageWidth = useBreakpointValue({
    base: "60px", // 모바일
    md: "91px", // 태블릿
    lg: "130px", // 데스크톱
  });

  // 반응형 gap 설정
  const gapSize = useBreakpointValue({
    base: "15px", // 모바일
    md: "20px", // 태블릿
    lg: "40px", // 데스크톱
  });

  return (
    <Box
      className="fac-list-box"
      mt={{ base: "80px", md: "120px", lg: "180px" }}
    >
      <Heading
        as="h4"
        mb={{ base: "30px", md: "40px", lg: "60px" }}
        color="#393939"
        fontSize={titleFontSize}
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      <Box className="fac-list">
        <List.Root>
          {items.map((item, index) => (
            <List.Item
              key={`service-${index}`}
              _marker={{ fontSize: "0" }}
              mb={index !== items.length - 1 ? 10 : 0}
              style={{
                display: "flex",
                gap: gapSize,
              }}
            >
              <Box
                className="fac-ico"
                style={{
                  alignSelf: "flex-start",
                  flexShrink: 0,
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  width={imageWidth}
                  height="auto"
                />
              </Box>
              <Box className="fac-detail-txt">
                <Text
                  mb={3}
                  color={"#393939"}
                  fontSize={itemTitleFontSize}
                  fontWeight="bold"
                >
                  {item.title}
                </Text>
                <Text color={"#393939"} fontSize={itemDescFontSize}>
                  {item.description}
                </Text>
              </Box>
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </Box>
  );
}

export default ListStyle02;
