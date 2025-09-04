"use client";

import { Heading } from "@chakra-ui/react";

interface HeadingH401Props {
  children: React.ReactNode;
  color?: string;
  fontSize?: string | object;
  fontWeight?: string;
  mb?: number | object;
  p?: number | object;
  textAlign?: string;
  border?: string;
  borderRadius?: string | object;
  lineHeight?: string;
}

export default function HeadingH401({
  children,
  color = "#2E3192",
  fontSize = { base: "lg", md: "xl", lg: "2xl" },
  fontWeight = "bold",
  mb = { base: 2, md: 3, lg: 5 },
  p = { base: 2, md: 3, lg: 5 },
  textAlign = "center",
  border = "1px solid #2E3192",
  borderRadius = "100px",
  lineHeight = "1",
}: HeadingH401Props) {
  return (
    <Heading
      as="h4"
      border={border}
      borderRadius={borderRadius}
      mb={mb}
      p={p}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      lineHeight={lineHeight}
      textAlign={textAlign}
    >
      {children}
    </Heading>
  );
}
