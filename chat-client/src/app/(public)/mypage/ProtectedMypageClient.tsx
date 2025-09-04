"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

export default function ProtectedMypageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined") return;

    const authToken = localStorage.getItem("auth_token");
    const authUser = localStorage.getItem("auth_user");

    if (authToken && authUser) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);

      // 토스트 메시지 표시
      toaster.create({
        title: "로그인이 필요합니다",
        description: "마이페이지는 로그인 후 이용 가능합니다.",
        type: "error",
        duration: 5000,
      });

      // 로그인 페이지로 리디렉션
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  }, [router]);

  // 로딩 상태 표시
  if (isAuthorized === null) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>마이페이지 로딩 중...</Text>
        </Box>
      </Flex>
    );
  }

  // 인증되지 않은 사용자 처리는 useEffect에서 리디렉션으로 처리

  // 인증된 사용자에게 컨텐츠 표시
  return <>{children}</>;
}
