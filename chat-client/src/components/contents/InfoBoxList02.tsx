"use client";

import { Box, List, Heading, Text } from "@chakra-ui/react";

interface InfoBoxList02Props {
  items: string[];
  title?: string;
  subtitle?: string;
  hideBullets?: boolean;
}

export default function InfoBoxList02({
  items,
  title,
  subtitle,
  hideBullets,
}: InfoBoxList02Props) {
  return (
    <Box
      className="info-list-box02"
      marginTop={{ base: "5", md: "10", lg: "15" }}
      padding={{ base: "2", md: "3", lg: "4" }}
      style={{
        border: "1px solid #F2F2FF",
        borderRadius: "20px",
      }}
    >
      <Box>
        {title && (
          <Box>
            <Heading
              as="h3"
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              fontWeight="500"
              color="#373636"
              mb={subtitle ? 2 : 0}
            >
              - {title}
            </Heading>
            {subtitle && (
              <Text
                color="#393939"
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                fontWeight="400"
                pl={3}
              >
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        <List.Root>
          {items.map((item, index) => (
            <List.Item
              key={index}
              _marker={{ fontSize: "0" }}
              color={"#393939"}
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              textAlign="justify"
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
              _before={
                hideBullets
                  ? undefined
                  : {
                      content: '"·"',
                      alignSelf: "flex-start",
                      marginRight: "10px",
                    }
              }
            >
              {item}
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </Box>
  );
}
