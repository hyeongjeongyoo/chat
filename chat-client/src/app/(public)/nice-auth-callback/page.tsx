"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner, VStack, Text, Box } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  niceApi,
  NiceRegisteredUserDataDto,
  NiceCallbackResultDto,
} from "@/lib/api/niceApi";

const VALID_SERVICE_TYPES = ["REGISTER", "FIND_ID", "RESET_PASSWORD"] as const;
type ValidServiceType = (typeof VALID_SERVICE_TYPES)[number];

interface NiceAuthCallbackPostMessage {
  source: "nice-auth-callback";
  type: "NICE_AUTH_SUCCESS" | "NICE_AUTH_FAIL" | "NICE_AUTH_OTHER";
  niceServiceType?: ValidServiceType | null;
  verificationKey?: string | null;
  userData?: NiceRegisteredUserDataDto | null;
  error?: string | null;
  errorCode?: string | null;
  status?: string | null;
  email?: string | null;
  isJoined?: boolean | null;
  username?: string | null;
  foundId?: string | null;
  message?: string | null;
}

function isValidServiceType(type: string | null): type is ValidServiceType {
  return VALID_SERVICE_TYPES.includes(type as ValidServiceType);
}

function NiceAuthCallbackContent() {
  const searchParams = useSearchParams();

  const serviceTypeParam = searchParams.get("serviceType");
  const keyParam = searchParams.get("key");
  const statusParam = searchParams.get("status");
  const errorParam = searchParams.get("error");
  const errorCodeParam = searchParams.get("errorCode");
  const emailParam = searchParams.get("email");
  const isJoinedParam = searchParams.get("isJoined");
  const usernameParam = searchParams.get("username");
  const foundIdParam = searchParams.get("foundId");
  const messageParam = searchParams.get("message");

  let serviceForComparison: ValidServiceType | null = null;
  if (isValidServiceType(serviceTypeParam)) {
    serviceForComparison = serviceTypeParam;
  }

  const shouldFetchUserData =
    serviceForComparison === "REGISTER" &&
    keyParam &&
    (statusParam === "SUCCESS" || statusParam === "success") &&
    !errorParam;

  const {
    data: fetchedNiceResult,
    isLoading: isLoadingUserData,
    error: userDataFetchError,
  } = useQuery<
    NiceCallbackResultDto,
    Error,
    NiceCallbackResultDto,
    readonly [string, string | null]
  >({
    queryKey: ["niceVerificationResult", keyParam],
    queryFn: () => {
      if (!keyParam)
        throw new Error("Verification key is missing for user data fetch");
      return niceApi.getNiceAuthResult(keyParam);
    },
    enabled: !!shouldFetchUserData,
  });

  useEffect(() => {
    if (shouldFetchUserData && isLoadingUserData) {
      return;
    }

    if (window.opener && !window.opener.closed) {
      let msgType: NiceAuthCallbackPostMessage["type"] = "NICE_AUTH_OTHER";
      let finalUserData: NiceRegisteredUserDataDto | null | undefined =
        undefined;
      let finalError: string | null | undefined = errorParam;
      let finalErrorCode: string | null | undefined = errorCodeParam;
      let finalIsJoined: boolean | null | undefined = undefined;
      let finalUsername: string | null | undefined = usernameParam;
      let finalMessage: string | null | undefined = messageParam;

      if (serviceForComparison === "REGISTER") {
        if (shouldFetchUserData) {
          if (userDataFetchError) {
            msgType = "NICE_AUTH_FAIL";
            finalError =
              userDataFetchError.message ||
              "Failed to fetch user details after NICE auth.";
            finalErrorCode = "USER_DATA_FETCH_FAILED";
          } else if (fetchedNiceResult?.userData) {
            msgType = "NICE_AUTH_SUCCESS";
            finalUserData = fetchedNiceResult.userData;
            finalIsJoined =
              isJoinedParam !== null
                ? isJoinedParam === "true"
                : fetchedNiceResult.isJoined ?? false;
            finalUsername =
              usernameParam ?? fetchedNiceResult.existingUsername ?? undefined;
            finalMessage =
              finalMessage ??
              fetchedNiceResult.message ??
              "본인인증이 완료되었습니다.";
          } else if (fetchedNiceResult) {
            msgType = "NICE_AUTH_FAIL";
            finalError =
              fetchedNiceResult.message ||
              "User data missing in NICE result for REGISTER.";
            finalErrorCode =
              fetchedNiceResult.errorCode ||
              "USER_DATA_FIELD_MISSING_IN_RESULT";
            finalIsJoined =
              isJoinedParam !== null
                ? isJoinedParam === "true"
                : fetchedNiceResult.isJoined ?? undefined;
          } else {
            msgType = "NICE_AUTH_FAIL";
            finalError =
              "Failed to retrieve user details after NICE auth (empty result).";
            finalErrorCode = "USER_DATA_FETCH_EMPTY";
          }
        } else {
          msgType =
            statusParam === "SUCCESS" || statusParam === "success"
              ? "NICE_AUTH_SUCCESS"
              : "NICE_AUTH_FAIL";
          finalIsJoined =
            isJoinedParam !== null ? isJoinedParam === "true" : undefined;
          if (
            msgType === "NICE_AUTH_SUCCESS" &&
            !finalIsJoined &&
            !finalUserData
          ) {
            finalError = "User data was not fetched for new registration.";
            finalErrorCode = "USER_DATA_NOT_FETCHED";
            msgType = "NICE_AUTH_FAIL";
          }
          if (!finalError && msgType === "NICE_AUTH_FAIL")
            finalError =
              messageParam || "본인인증 처리 중 문제가 발생했습니다.";
        }
      } else {
        if (
          statusParam === "success" ||
          statusParam === "id_sent" ||
          statusParam === "password_reset_sent"
        ) {
          msgType = "NICE_AUTH_SUCCESS";
        } else if (statusParam === "fail" || finalError || finalErrorCode) {
          msgType = "NICE_AUTH_FAIL";
          if (!finalError) finalError = messageParam || "오류가 발생했습니다.";
        } else {
          msgType = "NICE_AUTH_OTHER";
        }
      }

      const postMessageData: NiceAuthCallbackPostMessage = {
        source: "nice-auth-callback",
        type: msgType,
        niceServiceType: serviceForComparison,
        verificationKey: keyParam ?? undefined,
        userData: finalUserData,
        error: finalError,
        errorCode: finalErrorCode,
        status: statusParam ?? fetchedNiceResult?.status ?? undefined,
        email: emailParam ?? fetchedNiceResult?.userEmail ?? undefined,
        isJoined: finalIsJoined,
        username: finalUsername,
        foundId:
          serviceForComparison === "FIND_ID"
            ? foundIdParam ?? undefined
            : undefined,
        message:
          finalMessage ??
          (msgType === "NICE_AUTH_SUCCESS"
            ? "성공적으로 처리되었습니다."
            : finalError),
      };

      window.opener.postMessage(postMessageData, "*");
      window.close();
    } else {
      console.warn(
        "NICE Auth Callback: No window.opener found or opener is closed. Cannot post message."
      );
    }
  }, [
    serviceForComparison,
    keyParam,
    statusParam,
    errorParam,
    errorCodeParam,
    emailParam,
    isJoinedParam,
    usernameParam,
    foundIdParam,
    messageParam,
    fetchedNiceResult,
    isLoadingUserData,
    userDataFetchError,
    shouldFetchUserData,
  ]);

  if (shouldFetchUserData && isLoadingUserData) {
    return (
      <VStack gap={4} justify="center" align="center" minH="100vh" p={5}>
        <Spinner size="xl" />
        <Text fontSize="lg" fontWeight="medium">
          사용자 정보를 확인 중입니다...
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap={4} justify="center" align="center" minH="100vh" p={5}>
      <Spinner size="xl" />
      <Text fontSize="lg" fontWeight="medium">
        본인인증 결과를 처리 중입니다...
      </Text>
      <Text fontSize="sm" color="gray.500">
        이 창은 곧 자동으로 닫힙니다. 문제가 지속되면 관리자에게 문의하세요.
      </Text>
      <Box
        mt={4}
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        w="full"
        maxW="md"
      >
        <Text fontSize="xs" color="gray.600">
          <strong>Query Parameters Received (Initial Redirect):</strong>
        </Text>
        <pre
          style={{
            fontSize: "10px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
        </pre>
        {serviceForComparison === "REGISTER" && shouldFetchUserData && (
          <Box mt={2}>
            <Text fontSize="xs" color="gray.600">
              <strong>User Data Fetch (/result/{keyParam}):</strong>
            </Text>
            {isLoadingUserData && <Text>Loading user data...</Text>}
            {userDataFetchError && (
              <Text color="red.500">
                Error fetching: {userDataFetchError.message}
              </Text>
            )}
            {fetchedNiceResult && (
              <pre
                style={{
                  fontSize: "10px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                Result: {JSON.stringify(fetchedNiceResult, null, 2)}
              </pre>
            )}
          </Box>
        )}
      </Box>
    </VStack>
  );
}

export default function NiceAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <VStack gap={4} justify="center" align="center" minH="100vh">
          <Spinner size="xl" />
          <Text>로딩 중...</Text>
        </VStack>
      }
    >
      <NiceAuthCallbackContent />
    </Suspense>
  );
}
