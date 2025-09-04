"use client";

import { Box, Text, useBreakpointValue } from "@chakra-ui/react";

interface InfoDetailBoxProps {
  title: string;
  items: {
    label: string;
    content: string | React.ReactNode;
  }[];
}

export default function InfoDetailBox({ title, items }: InfoDetailBoxProps) {
  // 반응형 값들
  const titleFontSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });
  const contentFontSize = useBreakpointValue({
    base: "sm",
    md: "md",
    lg: "lg",
  });
  const padding = useBreakpointValue({ base: 4, md: 5 });
  const marginBottom = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Box
      bg="#F7F8FB"
      borderRadius="20px"
      py={padding}
      px={padding}
      color="#393939"
      fontSize={contentFontSize}
      w={{ base: "100%", md: "34.125%" }}
      maxW={{ base: "100%", md: "546px" }}
    >
      <Text
        fontWeight="500"
        fontSize={titleFontSize}
        mb={marginBottom}
        color="#373636"
      >
        {title}
      </Text>
      <Box as="ul" listStyleType="none" m={0} p={0}>
        {items.map((item, index) => (
          <Box
            as="li"
            key={index}
            mb={index < items.length - 1 ? 2 : 0}
            lineHeight={1.2}
            display="flex"
            _before={{
              content: '"·"',
              marginRight: "4px",
              flexShrink: 0,
            }}
          >
            {item.label}: {item.content}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
