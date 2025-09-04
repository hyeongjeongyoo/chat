"use client";

import React, { useState, useEffect } from "react";
import { VStack, Text, Button, Box, HStack } from "@chakra-ui/react";
import Image from "next/image";
import { StepHeader } from "./StepHeader";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import {
  niceApi,
  NiceInitiateResponse,
  NiceRegisteredUserDataDto,
  NiceCallbackResultDto,
} from "@/lib/api/niceApi";

// const identityOptions = [
//   { label: "휴대폰 인증", value: "phone" },
//   { label: "아이핀 인증", value: "ipin" },
// ];

interface Step2IdentityProps {
  mainFlowSteps: number;
  currentProgressValue: number;
  onVerificationSuccess: (data: NiceVerificationSuccessPayload) => void;
  onVerificationFail: (data: NiceVerificationFailPayload) => void;
}

interface NiceVerificationSuccessPayload {
  verificationData: NiceRegisteredUserDataDto;
  verificationKey: string | null;
  isJoined?: boolean;
  existingUsername?: string;
}

interface NiceVerificationFailPayload {
  error: string;
  errorCode?: string;
  verificationKey: string | null;
}

// NICE 인증 응답 데이터 타입
interface NiceAuthSuccessData {
  name: string; // 이름
  utf8Name?: string; // UTF8 이름
  birthDate: string; // 생년월일(YYYYMMDD)
  gender: string; // 성별
  nationalInfo: string; // 내/외국인 구분
  di: string; // 중복가입 확인값(DI)
  ci: string; // 연계정보(CI)
  mobileNo: string; // 휴대폰번호
  mobileCo: string; // 통신사
  reqSeq: string; // 요청 번호
  resSeq: string; // 응답 번호
  authType: string; // 인증 수단
}

interface NiceAuthFailData {
  errorCode: string; // 에러 코드
  errorMessage: string; // 에러 메시지
  reqSeq: string; // 요청 번호
  authType: string; // 인증 수단
}

// Message types from callback
interface NiceAuthCallbackBaseMessage {
  source: "nice-auth-callback";
  verificationKey: string | null;
}

interface NiceAuthDuplicateUserMessage extends NiceAuthCallbackBaseMessage {
  type: "DUPLICATE_DI";
  username?: string | null;
  di: string;
}

interface NiceAuthSuccessMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_SUCCESS";
  data: NiceAuthSuccessData;
}

interface NiceAuthFailureMessage extends NiceAuthCallbackBaseMessage {
  type: "NICE_AUTH_FAIL";
  error: string;
  errorCode?: string;
  errorDetail?: string;
}

type NiceAuthCallbackMessage =
  | NiceAuthDuplicateUserMessage
  | NiceAuthSuccessMessage
  | NiceAuthFailureMessage;

// Message types from the /auth/nice-callback page (via postMessage)
// Aligned with NiceAuthCallbackPostMessage from nice-auth-callback/page.tsx
interface NiceAuthCallbackPostMessage {
  source: "nice-auth-callback";
  type: "NICE_AUTH_SUCCESS" | "NICE_AUTH_FAIL" | "NICE_AUTH_OTHER";
  niceServiceType?: "REGISTER" | "FIND_ID" | "RESET_PASSWORD" | null;
  verificationKey?: string | null;
  userData?: NiceRegisteredUserDataDto; // For REGISTER success, fetched by callback page
  error?: string | null;
  errorCode?: string | null;
  status?: string | null; // e.g., "SUCCESS", "ID_SENT", "ACCOUNT_NOT_FOUND"
  email?: string | null;
  isJoined?: boolean | null;
  username?: string | null;
  message?: string | null; // Message from backend redirect
}

const ICON_IMAGE_SIZE = 90;
const NICE_POPUP_NAME = "niceAuthPopup_Signup";

// State to hold the result displayed in this component
interface DisplayAuthResult {
  status: "SUCCESS" | "FAIL" | "ERROR" | "ALREADY_JOINED";
  message?: string;
  rawData?: any;
}

export const Step2Identity = ({
  mainFlowSteps,
  currentProgressValue,
  onVerificationSuccess,
  onVerificationFail,
}: Step2IdentityProps) => {
  const [authResult, setAuthResult] = useState<DisplayAuthResult | null>(null);
  const [storedReqSeq, setStoredReqSeq] = useState<string | null>(null);

  const mutationOptions: UseMutationOptions<NiceInitiateResponse, Error, void> =
    {
      onSuccess: (data: NiceInitiateResponse) => {
        const { encodeData, reqSeq } = data;
        setStoredReqSeq(reqSeq);

        const width = 500;
        const height = 550;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        if (!window.name) window.name = "Parent_Window_Arpina_Signup";

        const nicePopup = window.open(
          "about:blank",
          NICE_POPUP_NAME,
          `width=${width},height=${height},top=${top},left=${left},fullscreen=no,menubar=no,status=no,toolbar=no,titlebar=yes,location=no,scrollbar=no`
        );

        if (!nicePopup) {
          toaster.create({
            title: "팝업 차단 감지",
            description: "브라우저의 팝업 차단을 해제하고 다시 시도해주세요.",
            type: "error",
          });
          setAuthResult({
            status: "ERROR",
            message: "팝업 창을 열 수 없습니다. 팝업 차단 기능을 확인해주세요.",
          });
          return;
        }

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute(
          "action",
          "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
        );
        form.setAttribute("target", NICE_POPUP_NAME);

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
      },
      onError: (error: Error) => {
        console.error("NICE Auth Initiation Error (Step2Identity):", error);
        toaster.create({
          title: "본인인증 초기화 오류",
          description:
            error.message || "본인인증 서비스 실행 중 오류가 발생했습니다.",
          type: "error",
        });
        setAuthResult({
          status: "ERROR",
          message: error.message || "본인인증 초기화 중 오류 발생",
          rawData: error,
        });
      },
    };

  const initiateNiceMutation = useMutation<NiceInitiateResponse, Error, void>({
    mutationFn: () => niceApi.initiateVerification({ serviceType: "REGISTER" }),
    ...mutationOptions,
  });

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn("Message from unexpected origin ignored:", event.origin);
        return;
      }

      const messageData = event.data as NiceAuthCallbackPostMessage;

      if (
        messageData &&
        messageData.source === "nice-auth-callback" &&
        messageData.niceServiceType === "REGISTER"
      ) {
        const nicePopup = window.open("", NICE_POPUP_NAME);
        if (nicePopup && !nicePopup.closed) nicePopup.close();

        if (messageData.type === "NICE_AUTH_SUCCESS") {
          if (messageData.isJoined) {
            setAuthResult({
              status: "ALREADY_JOINED",
              message: `이미 가입된 사용자입니다. (아이디: ${
                messageData.username || "정보 없음"
              })`,
              rawData: messageData,
            });
            toaster.create({
              title: "가입 확인",
              description:
                messageData.message ||
                `이미 가입된 계정입니다. (아이디: ${messageData.username})`,
              type: "warning",
            });
            onVerificationFail({
              error: messageData.message || "이미 가입된 사용자입니다.",
              errorCode: "DUPLICATE_USER",
              verificationKey: messageData.verificationKey ?? null,
            });
          } else if (messageData.userData) {
            setAuthResult({
              status: "SUCCESS",
              message:
                messageData.message ||
                `${messageData.userData.name}님, 본인인증이 성공적으로 완료되었습니다.`,
              rawData: messageData,
            });
            toaster.create({
              title: "본인인증 성공",
              description:
                messageData.message || "본인인증이 성공적으로 완료되었습니다.",
              type: "success",
            });
            onVerificationSuccess({
              verificationData: messageData.userData,
              verificationKey: messageData.verificationKey ?? null,
              isJoined: false,
            });
          } else {
            setAuthResult({
              status: "ERROR",
              message:
                messageData.message ||
                "본인인증 결과 처리 중 오류가 발생했습니다. (데이터 누락)",
              rawData: messageData,
            });
            onVerificationFail({
              error:
                messageData.message || "본인인증 데이터를 받아오지 못했습니다.",
              errorCode: "MISSING_USER_DATA",
              verificationKey: messageData.verificationKey ?? null,
            });
          }
        } else if (messageData.type === "NICE_AUTH_FAIL") {
          setAuthResult({
            status: "FAIL",
            message:
              messageData.message ||
              messageData.error ||
              "본인인증에 실패했습니다.",
            rawData: messageData,
          });
          toaster.create({
            title: "본인인증 실패",
            description:
              messageData.message ||
              messageData.error ||
              "알 수 없는 오류로 본인인증에 실패했습니다.",
            type: "error",
          });
          onVerificationFail({
            error: messageData.message || messageData.error || "본인인증 실패",
            errorCode: messageData.errorCode ?? undefined,
            verificationKey: messageData.verificationKey ?? null,
          });
        } else {
          setAuthResult({
            status: "ERROR",
            message:
              messageData.message || "알 수 없는 본인인증 응답을 받았습니다.",
            rawData: messageData,
          });
          toaster.create({
            title: "본인인증 오류",
            description: messageData.message || "알 수 없는 응답입니다.",
            type: "error",
          });
          onVerificationFail({
            error: messageData.message || "알 수 없는 본인인증 응답",
            errorCode: "UNKNOWN_CALLBACK_TYPE",
            verificationKey: messageData.verificationKey ?? null,
          });
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
    };
  }, [onVerificationSuccess, onVerificationFail, storedReqSeq]);

  const handleNiceAuthClick = () => {
    setAuthResult(null);
    initiateNiceMutation.mutate();
  };

  return (
    <VStack gap={6} align="stretch" w="full">
      <StepHeader
        title="본인인증"
        currentStep={2}
        totalSteps={mainFlowSteps}
        currentProgressValue={currentProgressValue}
      />
      <VStack gap={3} align="center" py={8}>
        <Image
          src="/images/signup/auth_oneself.png"
          alt="본인인증 아이콘"
          width={ICON_IMAGE_SIZE}
          height={ICON_IMAGE_SIZE}
          priority
        />
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={3}>
          휴대폰인증
        </Text>
        <Button
          bg={authResult?.status === "SUCCESS" ? "gray.400" : "#2E3192"}
          color="white"
          _hover={{
            bg: authResult?.status === "SUCCESS" ? "gray.400" : "#1A365D",
          }}
          px={12}
          mt={4}
          size="lg"
          minW="180px"
          onClick={handleNiceAuthClick}
          loading={initiateNiceMutation.isPending}
          disabled={
            initiateNiceMutation.isPending || authResult?.status === "SUCCESS"
          }
          loadingText="처리중..."
        >
          {authResult?.status === "SUCCESS" ? "인증완료" : "인증하기"}
        </Button>

        {authResult && (
          <Box
            mt={4}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor={
              authResult.status === "SUCCESS"
                ? "green.300"
                : authResult.status === "ALREADY_JOINED"
                ? "orange.300"
                : "red.300"
            }
            bg={
              authResult.status === "SUCCESS"
                ? "green.50"
                : authResult.status === "ALREADY_JOINED"
                ? "orange.50"
                : "red.50"
            }
            w="full"
            maxW="md"
          >
            <Text
              fontWeight="bold"
              color={
                authResult.status === "SUCCESS"
                  ? "green.700"
                  : authResult.status === "ALREADY_JOINED"
                  ? "orange.700"
                  : "red.700"
              }
            >
              {authResult.message}
            </Text>
          </Box>
        )}
        {initiateNiceMutation.isError && !authResult && (
          <Text color="red.500" mt={2} fontSize="sm">
            초기화 실패: {initiateNiceMutation.error?.message}
          </Text>
        )}
      </VStack>

      <Box bg="gray.50" p={5} borderRadius="md" mt={authResult ? 2 : 4}>
        <HStack align="flex-start" gap={3}>
          <VStack align="start" gap={1.5} fontSize="sm" color="gray.600">
            <Text>본인 확인을 위해 최초1회 인증 절차를 진행합니다.</Text>
            <Text>
              인증 과정에서 입력된 정보는 본인 확인 목적 외에는 사용되지 않으며,
              저장되지 않습니다.
            </Text>
            <Text>
              인증에 사용되는 정보는 해당 인증기관에서 직접 수집 및 처리하며,
              서비스 제공자는 이를 저장하거나 별도로 보관하지 않습니다.
            </Text>
            <Text>
              타인의 주민등록번호를 부정하게 사용할 경우, 3년 이하의 징역 또는
              1천만원 이하의 벌금에 처해질 수 있습니다. (관련 법령: 주민등록법,
              제37조제8항)
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};
