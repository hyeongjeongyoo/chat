"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { FaComments, FaRegClock, FaRegUser } from "react-icons/fa";
import Link from "next/link";

export default function CommunityPage() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Container maxW="container.xl" py={16}>
      <VStack gap={12} align="stretch">
        <Box textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
          >
            커뮤니티
          </Heading>
          <Text fontSize="xl" color={isDark ? "gray.300" : "gray.600"}>
            입주 기업들과 함께 소통하고 정보를 공유하세요
          </Text>
        </Box>

        <Box gap={8}>
          <Link href="/community/write">글쓰기</Link>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {[1, 2, 3, 4, 5, 6].map((post) => (
              <Card.Root
                key={post}
                bg={isDark ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
                boxShadow="lg"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                  transition: "all 0.2s",
                }}
              >
                <Card.Body>
                  <VStack align="start" gap={4}>
                    <Box w="100%">
                      <Badge colorPalette="blue" mb={2}>
                        일반
                      </Badge>
                      <Heading
                        size="md"
                        mb={2}
                        color={isDark ? "white" : "gray.800"}
                      >
                        게시글 제목 {post}
                      </Heading>
                      <Text color={isDark ? "gray.300" : "gray.600"}>
                        게시글 내용이 들어갈 자리입니다. 게시글의 주요 내용에
                        대한 간단한 설명을 작성할 수 있습니다.
                      </Text>
                    </Box>

                    <HStack gap={4} color={isDark ? "gray.400" : "gray.500"}>
                      <HStack>
                        <FaRegUser />
                        <Text>작성자</Text>
                      </HStack>
                      <HStack>
                        <FaRegClock />
                        <Text>2024-03-{post}</Text>
                      </HStack>
                      <HStack>
                        <FaComments />
                        <Text>{post * 2}</Text>
                      </HStack>
                    </HStack>

                    <Link href={`/community/${post}`}>자세히 보기</Link>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
}
