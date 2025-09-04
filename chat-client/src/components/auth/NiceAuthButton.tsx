"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";
import { niceApi, NiceInitiateResponse } from "@/lib/api/niceApi";

// InitiateVerificationPayload 타입을 niceApi.ts에서 export하지 않았으므로 여기서 정의합니다.
// 실제 niceApi.ts의 정의와 일치해야 합니다.
interface InitiateVerificationPayload {
  serviceType: "REGISTER" | "FIND_ID" | "RESET_PASSWORD";
}

interface NiceAuthButtonProps {
  serviceType: "REGISTER" | "FIND_ID" | "RESET_PASSWORD";
  children?: React.ReactNode; // 버튼 텍스트를 커스텀할 수 있도록 children prop 추가
}

const NiceAuthButton: React.FC<NiceAuthButtonProps> = ({
  serviceType,
  children,
}) => {
  const initiateNiceMutation = useMutation<
    NiceInitiateResponse,
    Error,
    InitiateVerificationPayload // 첫 번째 제네릭: 성공 시 반환 타입, 두 번째: 에러 타입, 세 번째: mutate 함수에 전달될 변수 타입
  >({
    mutationFn: niceApi.initiateVerification, // (payload: InitiateVerificationPayload) => Promise<NiceInitiateResponse>
    onSuccess: (data) => {
      const { encodeData } = data;
      const popupName = "popupChk";
      const width = 500;
      const height = 550;
      const isSSR = typeof window === "undefined";
      let left = 0;
      let top = 0;

      if (!isSSR) {
        left = (window.screen.width - width) / 2;
        top = (window.screen.height - height) / 2;
        window.name = "Parent_window"; // 고유한 이름으로 변경하는 것이 좋을 수 있습니다.
        window.open(
          "",
          popupName,
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
      }

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute(
        "action",
        "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
      );
      form.setAttribute("target", popupName);

      const hiddenFieldM = document.createElement("input");
      hiddenFieldM.setAttribute("type", "hidden");
      hiddenFieldM.setAttribute("name", "m");
      hiddenFieldM.setAttribute("value", "checkplusService");
      form.appendChild(hiddenFieldM);

      const hiddenFieldEncode = document.createElement("input");
      hiddenFieldEncode.setAttribute("type", "hidden");
      hiddenFieldEncode.setAttribute("name", "EncodeData");
      hiddenFieldEncode.setAttribute("value", encodeData);
      form.appendChild(hiddenFieldEncode);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    },
    onError: (error) => {
      console.error("NICE Auth Initiation Error (Button Component):", error);
      toaster.create({
        title: "본인인증 초기화 오류",
        description: error.message || "알 수 없는 에러가 발생했습니다.",
        type: "error",
      });
    },
  });

  const handleNiceAuthClick = () => {
    // mutate 함수 호출 시 serviceType을 payload로 전달합니다.
    initiateNiceMutation.mutate({ serviceType });
  };

  return (
    <div>
      <button
        onClick={handleNiceAuthClick}
        disabled={initiateNiceMutation.isPending}
      >
        {initiateNiceMutation.isPending
          ? "처리 중..."
          : children || "NICE 본인인증"}
      </button>
      {initiateNiceMutation.isError && (
        <p style={{ color: "red" }}>
          에러: {initiateNiceMutation.error?.message}
        </p>
      )}
    </div>
  );
};

export default NiceAuthButton;
