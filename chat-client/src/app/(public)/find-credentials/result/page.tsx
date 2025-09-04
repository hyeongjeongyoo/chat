"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Spinner,
  // Dialog related imports are not used here directly if we use simple text display
  // If we want the exact same dialogs, we'd need Dialog, Portal, CloseButton etc.
  // For now, let's use a simpler display based on query params.
} from "@chakra-ui/react";
import Image from "next/image";

interface ResultState {
  status: "success" | "fail" | "error" | "idle" | "loading";
  title: string;
  message: string;
  imageSrc?: string;
  isError: boolean;
}

function FindCredentialsResultLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resultState, setResultState] = useState<ResultState>({
    status: "loading",
    title: "처리 중...",
    message: "결과를 불러오고 있습니다.",
    isError: false,
  });

  useEffect(() => {
    const status = searchParams.get("status");
    const messageFromQuery = searchParams.get("message");
    const email = searchParams.get("email"); // For ID sent or password reset sent

    let newTitle = "";
    let newMessage = "";
    let newImageSrc = "";
    let newIsError = false;
    let newStatus: ResultState["status"] = "idle";

    if (!status) {
      newStatus = "error";
      newTitle = "잘못된 접근";
      newMessage = "결과 상태 정보가 없습니다. 다시 시도해주세요.";
      newIsError = true;
    } else {
      switch (status) {
        case "id_sent":
          newStatus = "success";
          newTitle = "아이디 찾기 완료";
          newMessage =
            messageFromQuery ||
            `회원님의 아이디를 이메일(${
              email || "등록된 이메일"
            })로 발송했습니다. 메일함을 확인해주세요.`;
          newImageSrc = "/images/auth/mail_success_img.png";
          break;
        case "password_reset_sent":
          newStatus = "success";
          newTitle = "임시 비밀번호 발급 완료";
          newMessage =
            messageFromQuery ||
            `임시 비밀번호를 이메일(${
              email || "등록된 이메일"
            })로 발송했습니다. 로그인 후 비밀번호를 변경해주세요.`;
          newImageSrc = "/images/auth/mail_success_img.png";
          break;
        case "no_account":
          newStatus = "fail";
          newTitle = "계정 정보 없음";
          newMessage =
            messageFromQuery ||
            "본인인증 정보와 일치하는 회원을 찾을 수 없습니다.";
          newImageSrc = "/images/find-credentials/mail_fail_img.png"; // Specific image for no account
          newIsError = true;
          break;
        case "error": // Generic error from backend after NICE auth
        default: // Handles unknown status as an error too
          newStatus = "error";
          newTitle = "처리 실패";
          newMessage =
            messageFromQuery ||
            "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          newImageSrc = "/images/find-credentials/mail_fail_img.png";
          newIsError = true;
          break;
      }
    }
    setResultState({
      status: newStatus,
      title: newTitle,
      message: newMessage,
      imageSrc: newImageSrc,
      isError: newIsError,
    });

    // Optional: Clear query params after reading them, though navigating away or refreshing will do this too.
    // Be cautious with router.replace in useEffect if not managed correctly, can lead to loops or unwanted behavior.
    // window.history.replaceState(null, '', window.location.pathname);
  }, [searchParams]);

  if (resultState.status === "loading") {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 160px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minH="calc(100vh - 160px)"
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
      >
        <Heading
          size={{ base: "md", md: "lg" }}
          fontWeight="semibold"
          color={resultState.isError ? "red.600" : "gray.700"}
        >
          {resultState.title}
        </Heading>

        {resultState.imageSrc && (
          <Image
            src={resultState.imageSrc}
            alt={resultState.title}
            width={80}
            height={80}
          />
        )}

        <Text
          textAlign="center"
          color={resultState.isError ? "red.600" : "gray.700"}
          px={4}
        >
          {resultState.message}
        </Text>

        <VStack gap={3} w="full" pt={4}>
          {resultState.status === "success" && (
            <Button
              bg="#2E3192"
              color="white"
              _hover={{ bg: "#1A365D" }}
              w="full"
              onClick={() => router.push("/login")}
            >
              로그인 페이지로 이동
            </Button>
          )}
          {(resultState.status === "fail" ||
            resultState.status === "error") && (
            <Button
              variant="outline"
              w="full"
              onClick={() => router.push("/find-credentials/id")}
            >
              아이디 다시 찾기
            </Button>
          )}
          {(resultState.status === "fail" ||
            resultState.status === "error") && (
            <Button
              variant="outline"
              w="full"
              onClick={() => router.push("/find-credentials/password")}
            >
              비밀번호 다시 찾기
            </Button>
          )}
          <Button
            variant="ghost"
            w="full"
            onClick={() => router.push("/")}
            mt={
              resultState.status === "fail" || resultState.status === "error"
                ? 0
                : 2
            }
          >
            홈으로 이동
          </Button>
        </VStack>
      </VStack>
    </Flex>
  );
}

export default function FindCredentialsResultPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" minH="calc(100vh - 160px)">
          <Spinner size="xl" />
        </Flex>
      }
    >
      <FindCredentialsResultLogic />
    </Suspense>
  );
}
