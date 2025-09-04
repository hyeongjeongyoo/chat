"use client";

import { VStack, Heading, Text, HStack, Button, Box } from "@chakra-ui/react";
import Image from "next/image"; // Added import
import { useRouter } from "next/navigation";

interface Step4CompleteProps {
  username: string | null;
}

export const Step4Complete = ({ username }: Step4CompleteProps) => {
  const router = useRouter();

  return (
    <VStack gap={8} align="center" w="full" textAlign="center" py={10}>
      <Heading size="xl" color="gray.700">
        회원가입
      </Heading>

      <Box my={6}>
        <Image
          src="/images/signup/signup_success.png"
          alt="회원가입 완료"
          width={518}
          height={246}
          style={{ objectFit: "contain" }}
        />
      </Box>

      <VStack gap={2} maxW="xl" w="full">
        <Text fontSize="lg" fontWeight="semibold">
          회원가입이 성공적으로 완료되었습니다.
        </Text>
        <Text fontSize="md" color="gray.600">
          안녕하세요, {username || "회원"}님!{" "}
        </Text>
        <Text fontSize="md" color="gray.600">
          {" "}
          아르피나 홈페이지에 오신 것을 환영합니다.{" "}
        </Text>
        <Text fontSize="md" color="gray.600">
          {/* Generic welcome message, can be personalized if user name is available */}
          이제 다양한 아르피나의 서비스를 로그인 후 자유롭게 이용하실 수
          있습니다.
        </Text>
      </VStack>

      <HStack mt={6} gap={4}>
        <Button
          bg="#2E3192"
          color="white"
          _hover={{ bg: "#1A365D" }}
          px={8}
          size="lg"
          onClick={() => {
            router.push("/login");
          }}
        >
          로그인
        </Button>

        {/* <Button
          variant="outline"
          borderColor="#2E3192"
          color="#2E3192"
          _hover={{ bg: "#2E3192", color: "white" }}
          px={8}
          size="lg"
          onClick={() => {
            router.push("/");
          }}
        >
          홈으로
        </Button> */}
      </HStack>
    </VStack>
  );
};
