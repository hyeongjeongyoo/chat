"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  niceApi,
  NicePublicUserDataDto,
  NiceCallbackResultDto,
  NiceRegisteredUserDataDto,
} from "@/lib/api/niceApi";
import { Box, Spinner, Text } from "@chakra-ui/react";

// This is the message structure parent windows (Step2Identity, find-credentials/*) expect.
interface NiceAuthCallbackPostMessage {
  source: "nice-auth-callback";
  type: "NICE_AUTH_SUCCESS" | "NICE_AUTH_FAIL" | "NICE_AUTH_OTHER";
  niceServiceType?: "REGISTER" | "FIND_ID" | "RESET_PASSWORD" | null;
  verificationKey?: string | null;
  userData?: NicePublicUserDataDto; // For REGISTER success (after mapping from NiceRegisteredUserDataDto)
  error?: string | null;
  errorCode?: string | null;
  status?: string | null; // The backend's actual status string
  email?: string | null;
  isJoined?: boolean | null;
  username?: string | null;
  message?: string | null;
}

function NiceCallbackContent() {
  const searchParams = useSearchParams();

  // Extract all relevant parameters from the URL
  const statusFromQuery = searchParams.get("status");
  const keyFromQuery = searchParams.get("key");
  const serviceTypeFromQuery = searchParams.get("serviceType") as
    | "REGISTER"
    | "FIND_ID"
    | "RESET_PASSWORD"
    | null;
  const messageFromQuery = searchParams.get("message");
  const errorCodeFromQuery = searchParams.get("errorCode");
  const emailFromQuery = searchParams.get("email");
  const nameFromQuery = searchParams.get("name"); // Often part of userData, but can be separate
  const joinedFromQuery = searchParams.get("joined") === "true";
  const usernameFromQuery = searchParams.get("username");

  // Query to fetch NICE data if serviceType is REGISTER, status is SUCCESS, and it's not already joined.
  const shouldFetchNiceData =
    serviceTypeFromQuery === "REGISTER" &&
    statusFromQuery === "SUCCESS" &&
    !joinedFromQuery &&
    !!keyFromQuery;

  const {
    data: fetchedNiceData, // This will be NiceCallbackResultDto from API
    isSuccess: queryIsSuccess,
    isError: queryIsError,
    error: queryError,
    isLoading: queryIsLoading,
  } = useQuery<
    NiceCallbackResultDto, // Data type from niceApi.getNiceAuthResult
    Error,
    NiceCallbackResultDto, // Data type kept as is for direct use before potential mapping in useEffect
    (string | null)[]
  >({
    queryKey: ["niceAuthResultGet", keyFromQuery, serviceTypeFromQuery], // Include serviceType for query uniqueness if needed
    queryFn: () => {
      if (!keyFromQuery) {
        return Promise.reject(
          new Error("NICE_CB_ERR: Missing key for auth result query")
        );
      }
      return niceApi.getNiceAuthResult(keyFromQuery);
    },
    enabled: shouldFetchNiceData,
    retry: false,
  });

  useEffect(() => {
    if (queryIsLoading && shouldFetchNiceData) {
      // If we are fetching data, wait for it to complete before posting message
      return;
    }

    let postMessageData: NiceAuthCallbackPostMessage = {
      source: "nice-auth-callback",
      type: "NICE_AUTH_OTHER", // Default, will be refined
      niceServiceType: serviceTypeFromQuery,
      verificationKey: keyFromQuery,
      status: statusFromQuery,
      message: messageFromQuery,
      errorCode: errorCodeFromQuery,
      email: emailFromQuery,
      isJoined: joinedFromQuery,
      username: usernameFromQuery,
      // userData and error will be populated based on conditions
    };

    if (statusFromQuery === "SUCCESS") {
      postMessageData.type = "NICE_AUTH_SUCCESS";
      if (serviceTypeFromQuery === "REGISTER") {
        if (joinedFromQuery) {
          // Already joined user, no need for userData from fetch, info is from query params
          postMessageData.isJoined = true;
          postMessageData.username = usernameFromQuery;
        } else if (shouldFetchNiceData) {
          // New user, expecting fetched data
          if (queryIsSuccess && fetchedNiceData?.userData) {
            // Map NiceRegisteredUserDataDto to NicePublicUserDataDto for postMessage
            const userDataForPost: NicePublicUserDataDto = {
              name: fetchedNiceData.userData.name,
              birthDate: fetchedNiceData.userData.birthDate,
              gender: fetchedNiceData.userData.gender,
              mobileNo: fetchedNiceData.userData.mobileNo,
              ci: fetchedNiceData.userData.ci,
              di: fetchedNiceData.userData.di,
              nationalInfo: fetchedNiceData.userData.nationalInfo ?? "",
            };
            postMessageData.userData = userDataForPost;
            postMessageData.isJoined = false; // Explicitly set
          } else if (queryIsError) {
            postMessageData.type = "NICE_AUTH_FAIL";
            postMessageData.error =
              queryError?.message ||
              "Failed to retrieve user details after NICE auth.";
            postMessageData.errorCode = "FETCH_ERROR";
          } else if (!queryIsLoading) {
            // Query finished but no success/error, or data missing
            postMessageData.type = "NICE_AUTH_FAIL";
            postMessageData.error =
              "User details not available after NICE auth.";
            postMessageData.errorCode = "MISSING_DATA";
          }
        } else {
          // Not joined, but shouldFetchNiceData was false (e.g. key missing for REGISTER)
          postMessageData.type = "NICE_AUTH_FAIL";
          postMessageData.error =
            "Required information missing for new user registration processing.";
          postMessageData.errorCode = "MISSING_KEY_FOR_REGISTER";
        }
      } else {
        // serviceType is not REGISTER but status is SUCCESS (e.g., could be custom flow)
        // For FIND_ID or RESET_PASSWORD, status SUCCESS is not typical; ID_SENT or PASSWORD_RESET_SENT is.
        // This branch assumes parameters in URL are sufficient.
      }
    } else if (statusFromQuery === "fail") {
      postMessageData.type = "NICE_AUTH_FAIL";
      postMessageData.error = messageFromQuery || "NICE authentication failed.";
      // errorCode is already set from query params
    } else if (
      statusFromQuery === "ID_SENT" ||
      statusFromQuery === "PASSWORD_RESET_SENT" ||
      statusFromQuery === "ACCOUNT_NOT_FOUND" ||
      statusFromQuery === "ERROR"
    ) {
      // These are valid statuses where we typically don't fetch more data from this page
      postMessageData.type = "NICE_AUTH_OTHER"; // Parent will use the .status field
      // All relevant info (message, errorCode, email etc.) should be in query params and set in base
    } else {
      // Truly invalid or missing status from query
      postMessageData.type = "NICE_AUTH_FAIL";
      postMessageData.error = `Callback received with unhandled or missing status: '${statusFromQuery}'.`;
      postMessageData.errorCode = "INVALID_CALLBACK_STATUS";
    }

    if (window.opener && typeof window.opener.postMessage === "function") {
      try {
        window.opener.postMessage(postMessageData, window.location.origin);
      } catch (e) {
        console.error("[NICE_CB] Failed to postMessage to opener:", e);
      }
    } else {
      console.warn(
        "[NICE_CB] window.opener not available or postMessage is not a function."
      );
    }
    window.close();
  }, [
    statusFromQuery,
    keyFromQuery,
    serviceTypeFromQuery,
    messageFromQuery,
    errorCodeFromQuery,
    emailFromQuery,
    nameFromQuery,
    joinedFromQuery,
    usernameFromQuery,
    queryIsLoading,
    queryIsSuccess,
    queryIsError,
    fetchedNiceData,
    queryError,
    shouldFetchNiceData,
  ]);

  // Basic UI, as window closes quickly
  return (
    <Box textAlign="center" p={10}>
      <Spinner size="xl" />
      <Text mt={4}>본인인증 결과를 처리 중입니다. 이 창은 곧 닫힙니다...</Text>
      {queryIsLoading && shouldFetchNiceData && (
        <Text>사용자 정보를 확인 중입니다...</Text>
      )}
      {postMessageDataForDisplay && (
        <Box mt={2} fontSize="sm" color="gray.500">
          <Text>Status: {postMessageDataForDisplay.status}</Text>
          <Text>Type: {postMessageDataForDisplay.type}</Text>
          {postMessageDataForDisplay.message && (
            <Text>Message: {postMessageDataForDisplay.message}</Text>
          )}
          {postMessageDataForDisplay.error && (
            <Text>Error: {postMessageDataForDisplay.error}</Text>
          )}
        </Box>
      )}
    </Box>
  );
}

// Helper to get a snapshot of postMessageData for display, as it's in useEffect scope
// This is a simplified approach; for robust display, lift state or use a ref.
let postMessageDataForDisplay: NiceAuthCallbackPostMessage | null = null;

export default function NiceCallbackPage() {
  return (
    <Suspense
      fallback={
        <Box textAlign="center" p={10}>
          <Spinner size="xl" />
          <Text mt={4}>페이지를 불러오는 중입니다...</Text>
        </Box>
      }
    >
      <NiceCallbackContent />
    </Suspense>
  );
}
