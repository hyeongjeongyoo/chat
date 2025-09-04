"use client";

import { Box, List, Heading, VStack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

interface InfoBoxList01Props {
  items: ReactNode[];
  title?: string;
  subtitle?: string;
}

export default function InfoBoxList01({
  items,
  title,
  subtitle,
}: InfoBoxList01Props) {
  return (
    <Box
      className="info-list-box01"
      marginTop={{ base: "5px", md: "10px", lg: "15px" }}
      padding={{ base: "2", md: "3", lg: "4" }}
      style={{
        backgroundColor: "#F7F8FB",
        borderRadius: "20px",
      }}
    >
      <Box>
        {title && (
          <Heading
            as="h3"
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight="500"
            color="#373636"
            mb={subtitle ? 2 : 0}
          >
            - {title}
          </Heading>
        )}
        {subtitle && (
          <Text
            color="#393939"
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            fontWeight="400"
          >
            {subtitle}
          </Text>
        )}
        <List.Root>
          {items.map((item, index) => (
            <List.Item
              key={index}
              _marker={{ fontSize: "0" }}
              color={"#393939"}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
              _before={{
                content: '"·"',
                alignSelf: "flex-start",
                marginRight: "10px",
              }}
            >
              {item}
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </Box>
  );
}
