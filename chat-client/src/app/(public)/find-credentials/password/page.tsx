"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import Image from "next/image";
import {
  Button,
  VStack,
  Text,
  Box,
  Heading,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import {
  niceApi,
  NiceInitiateResponse,
  NiceRegisteredUserDataDto, // For type consistency in NiceAuthCallbackPostMessage
} from "@/lib/api/niceApi";
import { toaster } from "@/components/ui/toaster";

// Expected message from nice-auth-callback page
interface NiceAuthCallbackPostMessage {
  source: "nice-auth-callback";
  type: "NICE_AUTH_SUCCESS" | "NICE_AUTH_FAIL" | "NICE_AUTH_OTHER";
  niceServiceType?: "REGISTER" | "FIND_ID" | "RESET_PASSWORD" | null;
  verificationKey?: string | null;
  userData?: NiceRegisteredUserDataDto; // Not used by password reset, but keep for type consistency
  error?: string | null;
  errorCode?: string | null;
  status?: string | null; // Backend's actual status: e.g. "PASSWORD_RESET_SENT", "ACCOUNT_NOT_FOUND"
  email?: string | null; // Masked email if PASSWORD_RESET_SENT
  message?: string | null; // Message from backend
}

type PageStatus =
  | "idle"
  | "auth_popup_initiated"
  | "password_reset_link_sent"
  | "account_not_found"
  | "auth_fail_from_popup"
  | "error_from_initiation"
  | "error_from_callback";

interface StatusDisplayInfo {
  image?: string;
  title: string;
  message: string | React.ReactNode;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  showLoginButton?: boolean;
}

const NICE_POPUP_NAME_RESET_PW = "niceAuthPopup_ResetPassword";

function FindPasswordContent() {
  const router = useRouter();
  const [pageStatus, setPageStatus] = useState<PageStatus>("idle");
  const [statusDisplay, setStatusDisplay] = useState<StatusDisplayInfo | null>(
    null
  );
  const [infoAlertText, setInfoAlertText] = useState<string | null>(null);

  const mutationOptions: UseMutationOptions<
    NiceInitiateResponse,
    Error,
    void,
    unknown
  > = {
    onSuccess: (data: NiceInitiateResponse) => {
      const { encodeData, reqSeq } = data;
      const width = 500;
      const height = 550;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      if (!window.name) window.name = "Parent_Window_Arpina_FindPassword";
      const nicePopup = window.open(
        "about:blank",
        NICE_POPUP_NAME_RESET_PW,
        `width=${width},height=${height},top=${top},left=${left},fullscreen=no,menubar=no,status=no,toolbar=no,titlebar=yes,location=no,scrollbar=no`
      );

      if (!nicePopup) {
        toaster.create({
          title: "팝업 차단 감지",
          description: "브라우저의 팝업 차단을 해제하고 다시 시도해주세요.",
          type: "error",
        });
        setPageStatus("error_from_initiation");
        return;
      }

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute(
        "action",
        "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
      );
      form.setAttribute("target", NICE_POPUP_NAME_RESET_PW);

      const mInput = document.createElement("input");
      mInput.setAttribute("type", "hidden");
      mInput.setAttribute("name", "m");
      mInput.setAttribute("value", "checkplusService");
      form.appendChild(mInput);

      const encodeDataInput = document.createElement("input");
      encodeDataInput.setAttribute("type", "hidden");
      encodeDataInput.setAttribute("name", "EncodeData");
      encodeDataInput.setAttribute("value", encodeData);
      form.appendChild(encodeDataInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      nicePopup.focus();
      setPageStatus("auth_popup_initiated");
    },
    onError: (error: Error) => {
      console.error("NICE Auth Initiation Error (Password Reset):", error);
      toaster.create({
        title: "본인인증 실행 오류",
        description: error.message || "본인인증 절차를 시작하지 못했습니다.",
        type: "error",
      });
      setPageStatus("error_from_initiation");
    },
  };

  const initiateNiceMutation = useMutation<
    NiceInitiateResponse,
    Error,
    void,
    unknown
  >({
    mutationFn: () =>
      niceApi.initiateVerification({ serviceType: "RESET_PASSWORD" }),
    ...mutationOptions,
  });

  useEffect(() => {
    const handleNiceCallbackMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn(
          "Find Password: Message from unexpected origin ignored:",
          event.origin
        );
        return;
      }

      const messageData = event.data as NiceAuthCallbackPostMessage;
      if (
        messageData &&
        messageData.source === "nice-auth-callback" &&
        messageData.niceServiceType === "RESET_PASSWORD"
      ) {
        const nicePopup = window.open("", NICE_POPUP_NAME_RESET_PW);
        if (nicePopup && !nicePopup.closed) nicePopup.close();

        if (
          messageData.type === "NICE_AUTH_OTHER" &&
          messageData.status === "PASSWORD_RESET_SENT"
        ) {
          toaster.create({
            title: "비밀번호 재설정 완료",
            description:
              messageData.message ||
              "비밀번호 재설정 안내가 이메일로 발송되었습니다.",
            type: "success",
          });
          setPageStatus("password_reset_link_sent");
          setStatusDisplay({
            image: "/images/find-credentials/mail_success.png",
            title: "재설정 메일 발송완료",
            message: (
              <VStack align="stretch" gap={1}>
                <Text>
                  회원가입시 입력하신 이메일 주소로 비밀번호 재설정 메일을
                  전송했습니다.
                </Text>
                <Text fontSize="sm" color="gray.500">
                  (메일이 보이지 않는 경우 스팸함도 확인해주세요)
                </Text>
              </VStack>
            ),
            showHomeButton: true,
            showLoginButton: true,
          });
        } else if (
          messageData.type === "NICE_AUTH_OTHER" &&
          messageData.status === "ACCOUNT_NOT_FOUND"
        ) {
          toaster.create({
            title: "계정 없음",
            description:
              messageData.message ||
              "해당 정보로 가입된 계정을 찾을 수 없습니다.",
            type: "warning",
          });
          setPageStatus("account_not_found");
          setStatusDisplay({
            image: "/images/find-credentials/mail_fail.png",
            title: "전송실패",
            message: (
              <VStack align="stretch" gap={1}>
                <Text>등록된 회원정보가 확인되지 않습니다.</Text>
                <Text>정보를 다시 확인한 후 시도해 주세요.</Text>
                <Text fontSize="sm" color="gray.500">
                  (회원가입을 아직 하지 않았다면, 회원가입을 먼저 진행해주세요)
                </Text>
              </VStack>
            ),
            showHomeButton: true,
            showRetryButton: true,
          });
        } else if (messageData.type === "NICE_AUTH_FAIL") {
          toaster.create({
            title: "본인인증 실패",
            description:
              messageData.error || "본인인증 과정 중 오류가 발생했습니다.",
            type: "error",
          });
          setPageStatus("auth_fail_from_popup");
          setStatusDisplay({
            image: "/images/find-credentials/mail_fail.png",
            title: "본인인증 실패",
            message: (
              <VStack align="stretch" gap={1}>
                <Text>{messageData.error || "본인인증에 실패했습니다."}</Text>
                <Text fontSize="sm" color="gray.500">
                  {messageData.errorCode
                    ? `(오류코드: ${messageData.errorCode})`
                    : "다시 시도해주시기 바랍니다."}
                </Text>
              </VStack>
            ),
            showHomeButton: true,
            showRetryButton: true,
          });
        } else {
          toaster.create({
            title: "처리 오류",
            description:
              messageData.message ||
              "비밀번호 재설정 처리 중 알 수 없는 상태 또는 오류가 발생했습니다.",
            type: "error",
          });
          setPageStatus("error_from_callback");
          setStatusDisplay({
            image: "/images/find-credentials/mail_fail.png",
            title: "처리 중 오류 발생",
            message: (
              <VStack align="stretch" gap={1}>
                <Text>
                  {messageData.message ||
                    `비밀번호 재설정 처리 중 오류가 발생했습니다.`}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {messageData.status
                    ? `(상태: ${messageData.status})`
                    : "다시 시도해주시기 바랍니다."}
                </Text>
              </VStack>
            ),
            showHomeButton: true,
            showRetryButton: true,
          });
        }
      }
    };

    window.addEventListener("message", handleNiceCallbackMessage);
    return () => {
      window.removeEventListener("message", handleNiceCallbackMessage);
    };
  }, []);

  useEffect(() => {
    switch (pageStatus) {
      case "idle":
        setStatusDisplay(null);
        setInfoAlertText(
          "· 본인 확인을 위해 휴대폰 인증을 진행합니다.\n· 인증 과정에서 입력된 정보는 본인 확인 목적 외에는 사용되지 않으며, 저장되지 않습니다.\n· 인증에 사용되는 정보는 해당 인증기관에서 직접 수집 및 처리하며, 서비스 제공자는 이를 제공받거나 별도로 보관하지 않습니다.\n· 타인의 확인을 도용하거나 휴대폰 문자메세지를 부정하게 사용할 경우, 3년 이하의 징역 또는 1천만원 이하의 벌금에 처해질 수 있습니다.\n· 관련 법령: 「주민등록법」 제37조(벌칙)"
        );
        break;
      case "auth_popup_initiated":
        setStatusDisplay({
          image: "/images/signup/auth_oneself.png",
          title: "휴대폰인증",
          message: (
            <VStack>
              <Text>NICE 본인인증 팝업창의 절차를 완료해주세요.</Text>
              <Spinner size="lg" mt={4} />
            </VStack>
          ),
        });
        setInfoAlertText(null);
        break;
      case "password_reset_link_sent":
        setInfoAlertText(null);
        break;
      case "account_not_found":
        setInfoAlertText(null);
        break;
      case "auth_fail_from_popup":
        if (!statusDisplay?.message) {
          setStatusDisplay({
            image: "/images/find-credentials/mail_fail.png",
            title: "본인인증 실패",
            message:
              "본인인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.",
            showHomeButton: true,
            showRetryButton: true,
          });
        }
        setInfoAlertText(null);
        break;
      case "error_from_initiation":
        setStatusDisplay({
          image: "/images/find-credentials/mail_fail.png",
          title: "실행 오류",
          message:
            "본인인증 절차를 시작하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          showHomeButton: true,
          showRetryButton: true,
        });
        setInfoAlertText(null);
        break;
      case "error_from_callback":
        if (!statusDisplay?.message) {
          setStatusDisplay({
            image: "/images/find-credentials/mail_fail.png",
            title: "오류 발생",
            message: "비밀번호 재설정 처리 중 알 수 없는 오류가 발생했습니다.",
            showHomeButton: true,
            showRetryButton: true,
          });
        }
        setInfoAlertText(null);
        break;
    }
  }, [pageStatus]);

  const handleInitiateNiceAuth = () => {
    setPageStatus("idle");
    setStatusDisplay(null);
    initiateNiceMutation.mutate();
  };

  if (statusDisplay) {
    return (
      <VStack gap={6} align="center" w="full" py={10} maxW="lg">
        {statusDisplay.image && (
          <Image
            src={statusDisplay.image}
            alt={statusDisplay.title || "Status image"}
            width={80}
            height={80}
          />
        )}
        <Heading size="xl" fontWeight="bold" mt={2}>
          {statusDisplay.title}
        </Heading>
        <Box
          p={
            statusDisplay.message && typeof statusDisplay.message === "string"
              ? 4
              : 0
          }
          bg={
            statusDisplay.message && typeof statusDisplay.message === "string"
              ? "gray.100"
              : "transparent"
          }
          borderRadius="md"
          w="full"
          textAlign="center"
        >
          <Text fontSize="md" whiteSpace="pre-line">
            {statusDisplay.message}
          </Text>
        </Box>
        <VStack gap={3} mt={4} w="full" maxW="xs">
          {statusDisplay.showRetryButton && (
            <Button
              variant={pageStatus === "account_not_found" ? "solid" : "outline"}
              colorPalette="blue"
              onClick={
                pageStatus === "account_not_found"
                  ? () => router.push("/signup")
                  : handleInitiateNiceAuth
              }
              loading={
                initiateNiceMutation.isPending &&
                pageStatus !== "account_not_found"
              }
              w="full"
              size="lg"
            >
              {pageStatus === "account_not_found" ? "회원가입" : "다시 시도"}
            </Button>
          )}
          {statusDisplay.showLoginButton && (
            <Button
              variant="solid"
              colorPalette="blue"
              onClick={() => router.push("/login")}
              w="full"
              size="lg"
            >
              로그인
            </Button>
          )}
          {statusDisplay.showHomeButton && (
            <Button
              variant={
                statusDisplay.showLoginButton ||
                (statusDisplay.showRetryButton &&
                  pageStatus !== "account_not_found")
                  ? "outline"
                  : "solid"
              }
              colorPalette={
                statusDisplay.showLoginButton ||
                (statusDisplay.showRetryButton &&
                  pageStatus !== "account_not_found")
                  ? "gray"
                  : "blue"
              }
              onClick={() => router.push("/")}
              w="full"
              size="lg"
            >
              홈으로
            </Button>
          )}
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack gap={8} align="stretch" w="full" maxW="lg">
      <Heading size="xl" textAlign="center" fontWeight="bold">
        비밀번호 찾기
      </Heading>
      <VStack
        gap={6}
        p={8}
        borderWidth={1}
        borderRadius="md"
        shadow="none"
        bg="white"
      >
        <Image
          src="/images/signup/auth_oneself.png"
          alt="휴대폰인증 아이콘"
          width={80}
          height={80}
        />
        <Heading size="lg" textAlign="center" fontWeight="semibold">
          휴대폰인증
        </Heading>

        <Button
          colorPalette="blue"
          size="lg"
          w="full"
          onClick={handleInitiateNiceAuth}
          loading={
            initiateNiceMutation.isPending ||
            pageStatus === "auth_popup_initiated"
          }
          disabled={
            initiateNiceMutation.isPending ||
            pageStatus === "auth_popup_initiated"
          }
          mt={4}
        >
          {initiateNiceMutation.isPending ||
          pageStatus === "auth_popup_initiated"
            ? "본인인증 진행 중..."
            : "인증하기"}
        </Button>
      </VStack>
      {infoAlertText && (
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
            {infoAlertText}
          </Text>
        </Box>
      )}
      <Text textAlign="center" fontSize="sm" color="gray.500" mt={4}>
        문의사항이 있으시면 고객센터로 연락주시기 바랍니다.
      </Text>
    </VStack>
  );
}

export default function FindPasswordPage() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="calc(100vh - 160px)"
      py={{ base: "12", md: "16" }}
    >
      <Suspense fallback={<Spinner size="xl" />}>
        <FindPasswordContent />
      </Suspense>
    </Flex>
  );
}
