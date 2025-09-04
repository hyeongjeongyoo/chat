"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import Image from "next/image";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const errorCode = searchParams.get("errorCode"); // Optional error code

  let displayMessage = "인증 처리 중 오류가 발생했습니다.";
  if (message) {
    displayMessage = decodeURIComponent(message);
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minH="calc(100vh - 160px)" // Adjust based on your layout (header/footer height)
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
      bg="gray.50"
    >
      <VStack
        gap={{ base: "6", md: "8" }}
        align="center"
        w="full"
        maxW="md"
        p={{ base: 6, md: 8 }}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        textAlign="center"
      >
        <Image
          src="/images/error/error_icon.png" // Replace with a generic error icon if you have one
          alt="Error Icon"
          width={80}
          height={80}
        />
        <Heading size={{ base: "md", md: "lg" }} color="red.600">
          인증 오류
        </Heading>
        <Text fontSize="md" color="gray.700">
          {displayMessage}
        </Text>
        {errorCode && (
          <Text fontSize="sm" color="gray.500">
            에러코드: {decodeURIComponent(errorCode)}
          </Text>
        )}
        <Button
          mt={6}
          bg="#2E3192"
          color="white"
          _hover={{ bg: "#1A365D" }}
          onClick={() => router.push("/")}
        >
          홈으로 돌아가기
        </Button>
      </VStack>
    </Flex>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" minH="calc(100vh - 160px)">
          <Spinner size="xl" />
        </Flex>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
