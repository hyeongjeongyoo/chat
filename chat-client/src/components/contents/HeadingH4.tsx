"use client";

import { Heading, useBreakpointValue } from "@chakra-ui/react";

interface HeadingH4Props {
  children: React.ReactNode;
}

export default function HeadingH4({ children }: HeadingH4Props) {
  // 반응형 폰트 크기 설정
  const fontSize = useBreakpointValue({
    base: "2xl", // sm 이하: 2단계 줄임 (60px -> 4xl)
    md: "3xl", // sm: 1단계 줄임 (60px -> 5xl)
    lg: "48px", // lg: 원래 크기 (60px)
  });

  return (
    <Heading
      as="h4"
      mb={{ base: 4, md: 10, lg: 25 }}
      color="#393939"
      fontSize={fontSize}
      fontWeight="bold"
      lineHeight="1"
    >
      {children}
    </Heading>
  );
}
