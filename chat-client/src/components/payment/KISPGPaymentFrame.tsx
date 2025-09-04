"use client";

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import {
  EnrollInitiationResponseDto,
  PaymentApprovalRequestDto,
  KISPGPaymentResultDto,
} from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import { formatPhoneNumberForKISPG } from "@/lib/utils/phoneUtils";
import { Box } from "@chakra-ui/react";
import { swimmingPaymentService } from "@/lib/api/swimming";

interface KISPGPaymentFrameProps {
  paymentData: EnrollInitiationResponseDto;
  enrollId: number;
  onPaymentComplete?: (success: boolean, data?: any) => void;
  onPaymentClose?: () => void;
}

export interface KISPGPaymentFrameRef {
  triggerPayment: () => void;
}

const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const KISPGPaymentFrame = forwardRef<
  KISPGPaymentFrameRef,
  KISPGPaymentFrameProps
>(({ paymentData, enrollId, onPaymentComplete, onPaymentClose }, ref) => {
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);

  // 범용 enrollId 추출 함수 - temp_ 및 enroll_ 접두사 모두 처리
  const extractEnrollIdFromResponse = (
    data: any,
    fallbackEnrollId: number
  ): number => {
    try {
      // 1. moid에서 추출 시도 (temp_enrollId_timestamp 또는 enroll_enrollId_timestamp)
      if (data.moid || paymentData.moid) {
        const moid = data.moid || paymentData.moid;

        const parts = moid.split("_");
        if (parts.length >= 2) {
          // temp_123_timestamp 또는 enroll_123_timestamp 형식
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              return extractedId;
            }
          }
        }
      }

      // 2. mbsReserved1에서 추출 시도 (temp_enrollId 또는 enroll_enrollId)
      if (data.mbsReserved1 || paymentData.mbsReserved1) {
        const mbsReserved1 = data.mbsReserved1 || paymentData.mbsReserved1;

        const parts = mbsReserved1.split("_");
        if (parts.length >= 2) {
          // temp_123 또는 enroll_123 형식
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              return extractedId;
            }
          }
        }
      }

      // 3. ordNo에서 추출 시도 (추가 대안)
      if (data.ordNo) {
        const parts = data.ordNo.split("_");
        if (parts.length >= 2) {
          if ((parts[0] === "temp" || parts[0] === "enroll") && parts[1]) {
            const extractedId = parseInt(parts[1]);
            if (!isNaN(extractedId)) {
              return extractedId;
            }
          }
        }
      }

      // 4. 직접 enrollId 필드에서 추출 시도
      if (data.enrollId && !isNaN(parseInt(data.enrollId))) {
        const extractedId = parseInt(data.enrollId);
        return extractedId;
      }

      return fallbackEnrollId;
    } catch (error) {
      console.error("💥 Error extracting enrollId from response:", error);
      return fallbackEnrollId;
    }
  };

  // KISPG 결제창에서 오는 메시지 처리 (JSP의 returnData 함수와 동일한 역할)
  const handleKISPGMessage = (event: MessageEvent) => {
    // KISPG에서 오는 메시지는 특정 구조를 가져야 함
    // JSP 샘플에 따르면: { resultCode: '0000', data: {...} } 형태
    // 하지만 실제 KISPG는 다른 형태일 수 있음
    const { resultCode, resultCd, data } = event.data;
    const actualResultCode = resultCode || resultCd; // 두 가지 모두 체크

    const kispgFields = [
      "resultCd",
      "resultMsg",
      "payMethod",
      "tid",
      "appDtm",
      "appNo",
      "ordNo",
      "goodsName",
      "amt",
      "ordNm",
      "fnNm",
      "cancelYN",
      "appCardCd",
      "acqCardCd",
      "quota",
      "nointFlg",
      "usePointAmt",
      "cardType",
      "authType",
      "cashCrctFlg",
      "vacntNo",
      "lmtDay",
      "socHpNo",
      "cardNo",
      "mbsReserved",
      "crctType",
      "crctNo",
      "easyPayCd",
      "easyPayNm",
      "discountType",
      "discountAmt",
      "mbsFeeType",
      "mbsFeeAmt",
    ];

    // 🎯 올바른 데이터 위치 확정
    // data가 존재하고 객체이면 data 사용, 아니면 event.data 사용
    const actualPaymentData =
      data && typeof data === "object" ? data : event.data;

    const receivedFields: { [key: string]: any } = {};
    const missingFields: string[] = [];

    kispgFields.forEach((field) => {
      if (actualPaymentData && actualPaymentData.hasOwnProperty(field)) {
        receivedFields[field] = actualPaymentData[field];
      } else {
        missingFields.push(field);
      }
    });

    // resultCode가 없으면 KISPG 메시지가 아님 - 하지만 다른 필드명일 수 있음
    if (actualResultCode === undefined || actualResultCode === null) {
      // KISPG 메시지인지 다른 방법으로 확인
      const hasKISPGFields =
        event.data.hasOwnProperty("tid") ||
        event.data.hasOwnProperty("amt") ||
        event.data.hasOwnProperty("payMethod") ||
        event.data.hasOwnProperty("moid");

      if (hasKISPGFields) {
        // 다른 결제 성공 지표가 있는지 확인
        if (event.data.type === "KISPG_PAYMENT_RESULT" && event.data.success) {
          submitToResultPage(event.data);
          return;
        }
      }

      return;
    }

    if (actualResultCode === "0000") {
      // 결제 성공 - JSP의 receive_result 함수와 동일한 로직
      submitToResultPage(data || event.data);
    } else if (actualResultCode === "XXXX") {
      // 인증 실패
      handlePaymentFailure(data || event.data, "인증에 실패했습니다.");
    } else {
      // 기타 실패
      handlePaymentFailure(
        data || event.data,
        data?.resultMsg ||
          event.data?.resultMsg ||
          "결제 처리 중 오류가 발생했습니다."
      );
    }
  };

  // 결제 실패 처리 함수
  const handlePaymentFailure = (data: any, message: string) => {
    // 결제창 닫기
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    // 메시지 리스너 제거
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    // 실패 토스터 표시
    toaster.create({
      title: "결제 실패",
      description: message,
      type: "error",
      duration: 5000,
    });

    // 실패 콜백 호출
    if (onPaymentComplete) {
      onPaymentComplete(false, { message, ...data });
    }
  };

  // JSP의 receive_result 함수와 동일한 로직 - 폼을 생성해서 결과 페이지로 POST
  const submitToResultPage = async (data: any) => {
    // 🔍 KISPG 결제 결과 파라미터 모두 추출 및 로깅
    const kispgResult: KISPGPaymentResultDto = {
      // 기본 결제 정보
      resultCd: data.resultCd || data.resultCode, // 결과코드
      resultMsg: data.resultMsg || data.resultMessage, // 결과메시지
      payMethod: data.payMethod, // 지불수단
      tid: data.tid || data.TID, // 거래번호
      appDtm: data.appDtm, // 결제일시
      appNo: data.appNo, // 승인번호
      ordNo: data.ordNo, // 주문번호
      goodsName: data.goodsName, // 결제 상품명
      amt: data.amt || data.AMT, // 거래금액
      ordNm: data.ordNm, // 결제자 이름

      // 카드/은행 정보
      fnNm: data.fnNm, // 카드사명, 은행명
      cancelYN: data.cancelYN, // 취소여부
      appCardCd: data.appCardCd, // 발급사코드
      acqCardCd: data.acqCardCd, // 매입사코드
      quota: data.quota, // 카드 할부기간
      nointFlg: data.nointFlg, // 분담무이자구분
      usePointAmt: data.usePointAmt, // 사용 포인트 양
      cardType: data.cardType, // 카드타입 (0:신용, 1:체크)
      authType: data.authType, // 인증타입
      cardNo: data.cardNo, // 마스킹 카드번호

      // 현금영수증 정보
      cashCrctFlg: data.cashCrctFlg, // 현금영수증 사용여부
      crctType: data.crctType, // 현금영수증타입
      crctNo: data.crctNo, // 현금영수증번호

      // 가상계좌 정보
      vacntNo: data.vacntNo, // 가상계좌 번호
      lmtDay: data.lmtDay, // 입금기한

      // 휴대폰 결제 정보
      socHpNo: data.socHpNo, // 휴대폰번호

      // 간편결제 정보
      easyPayCd: data.easyPayCd, // 간편결제 코드
      easyPayNm: data.easyPayNm, // 간편결제사명

      // 할인 정보
      discountType: data.discountType, // 할인구분
      discountAmt: data.discountAmt, // 할인금액

      // 수수료 정보
      mbsFeeType: data.mbsFeeType, // 가맹점수수료구분
      mbsFeeAmt: data.mbsFeeAmt, // 가맹점수수료금액

      // 가맹점 예약 필드
      mbsReserved: data.mbsReserved, // 가맹점예약필드

      // 추가 필드들 (원본 데이터에서 누락된 것이 있을 수 있음)
      ...data, // 모든 원본 데이터도 포함
    };

    // 결제창 먼저 닫기
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    // 메시지 리스너 제거
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    let processingToastId: string | number | undefined = undefined;

    try {
      // 승인 처리 중이라는 중간 상태 알림
      processingToastId = toaster.create({
        title: "승인 처리 중",
        description:
          "결제 정보를 확인했습니다. 최종 승인 처리를 진행 중입니다...",
        type: "info",
      });

      // 1. PaymentApprovalRequestDto 구성
      const approvalRequestData: PaymentApprovalRequestDto = {
        tid: kispgResult.tid,
        moid: kispgResult.ordNo, // KISPG의 ordNo가 백엔드의 moid에 해당 (주문번호)
        amt: kispgResult.amt,
        kispgPaymentResult: kispgResult, // 전체 KISPG 결과 전달
      };

      // 2. 백엔드 승인 API 호출
      const approvalResponse =
        await swimmingPaymentService.approvePaymentAndCreateEnrollment(
          approvalRequestData
        );

      if (approvalResponse && approvalResponse.success) {
        if (processingToastId) toaster.dismiss(processingToastId);
        toaster.create({
          title: "결제 및 신청 완료",
          description:
            approvalResponse.message ||
            "수영 강습 결제 및 신청이 성공적으로 완료되었습니다.",
          type: "success",
          duration: 4000,
        });
        if (onPaymentComplete) {
          const finalEnrollId =
            approvalResponse.data?.enrollId ||
            extractEnrollIdFromResponse(data, enrollId);

          onPaymentComplete(true, {
            ...kispgResult,
            ...approvalResponse.data,
            enrollId: finalEnrollId,
            approved: true,
            autoApproval: false,
            message:
              approvalResponse.message || "결제가 성공적으로 완료되었습니다.",
          });
        }
      } else {
        const errorMessage =
          approvalResponse?.message ||
          "결제는 성공했으나 최종 등록 처리에 실패했습니다. 관리자에게 문의해주세요.";
        console.error("❌ 백엔드 승인 실패:", errorMessage);

        if (processingToastId) toaster.dismiss(processingToastId);
        toaster.create({
          title: "결제 처리 실패",
          description: errorMessage,
          type: "error",
          duration: 5000,
        });
        if (onPaymentComplete) {
          onPaymentComplete(false, {
            ...kispgResult,
            approved: false,
            autoApproval: false,
            errorMessage: errorMessage,
          });
        }
      }
    } catch (error: any) {
      console.error("❌ 백엔드 승인 API 호출 중 치명적 오류:", error);

      if (processingToastId) toaster.dismiss(processingToastId);
      toaster.create({
        title: "승인 처리 오류",
        description:
          error.message ||
          "결제는 성공했으나 승인 처리 중 시스템 오류가 발생했습니다. 관리자에게 문의해주세요.",
        type: "error",
        duration: 5000,
      });
      if (onPaymentComplete) {
        onPaymentComplete(false, {
          ...kispgResult,
          approved: false,
          autoApproval: false,
          errorMessage:
            error.message || "승인 처리 중 시스템 오류가 발생했습니다.",
        });
      }
    }
  };

  const handleSubmitPayment = () => {
    if (isPaymentInProgress) {
      toaster.create({
        title: "알림",
        description: "이미 결제가 진행 중입니다.",
        type: "info",
      });
      return;
    }

    if (!isValidEmail(paymentData.buyerEmail)) {
      toaster.create({
        title: "유효하지 않은 이메일",
        description: "결제 정보에 올바른 이메일 주소가 포함되어야 합니다.",
        type: "error",
      });
      return;
    }

    try {
      setIsPaymentInProgress(true);
      setShowPaymentFrame(true);

      // iframe이 로드된 후 폼 제출 및 메시지 리스너 등록
      setTimeout(() => {
        if (formRef.current && iframeRef.current) {
          // 메시지 리스너 등록 (폼 제출 직전에)
          messageHandlerRef.current = handleKISPGMessage;
          window.addEventListener("message", handleKISPGMessage, false);

          formRef.current.submit();
        }
      }, 500); // 좀 더 충분한 시간 확보
    } catch (error) {
      console.error("Error initiating KISPG payment:", error);
      toaster.create({
        title: "결제 오류",
        description: "결제 창을 열 수 없습니다. 다시 시도해주세요.",
        type: "error",
      });
      setIsPaymentInProgress(false);
      setShowPaymentFrame(false);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerPayment: handleSubmitPayment,
  }));

  // 결제창 닫기
  const handleClosePayment = () => {
    setShowPaymentFrame(false);
    setIsPaymentInProgress(false);

    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    if (onPaymentClose) {
      onPaymentClose();
    }
  };

  return (
    <>
      <form
        ref={formRef}
        id="kispg_payment_form"
        name="kispg_payment_form"
        method="POST"
        target="kispg_payment_frame"
        action={
          process.env.NEXT_PUBLIC_KISPG_URL || "https://api.kispg.co.kr/v2/auth"
        }
        acceptCharset="UTF-8"
        style={{ display: "none" }}
      >
        <input type="hidden" name="payMethod" value="card" />
        <input type="hidden" name="trxCd" value="0" />
        <input type="hidden" name="mid" value={paymentData.mid} />
        <input type="hidden" name="goodsNm" value={paymentData.itemName} />
        <input type="hidden" name="ordNo" value={paymentData.moid} />
        <input type="hidden" name="goodsAmt" value={paymentData.amt} />
        <input type="hidden" name="ordNm" value={paymentData.buyerName} />
        <input
          type="hidden"
          name="ordTel"
          value={formatPhoneNumberForKISPG(paymentData.buyerTel)}
        />
        <input type="hidden" name="ordEmail" value={paymentData.buyerEmail} />
        <input
          type="hidden"
          name="returnUrl"
          value={`${window.location.origin}/payment/kispg-result`}
        />

        {/* 옵션 필드들 */}
        <input
          type="hidden"
          name="userIp"
          value={paymentData.userIp || "0:0:0:0:0:0:0:1"}
        />
        <input
          type="hidden"
          name="mbsUsrId"
          value={(
            paymentData.mbsUsrId ||
            paymentData.buyerEmail?.split("@")[0] ||
            String(enrollId || "temp")
          ).substring(0, 16)}
        />
        <input type="hidden" name="ordGuardEmail" value="" />
        <input type="hidden" name="rcvrAddr" value="" />
        <input type="hidden" name="rcvrPost" value="" />
        <input
          type="hidden"
          name="mbsIp"
          value={paymentData.userIp || "127.0.0.1"}
        />
        <input
          type="hidden"
          name="mbsReserved"
          value={paymentData.mbsReserved1 || String(enrollId || "temp")}
        />
        <input type="hidden" name="rcvrMsg" value="" />
        <input
          type="hidden"
          name="goodsSplAmt"
          value={paymentData.goodsSplAmt || "0"}
        />
        <input
          type="hidden"
          name="goodsVat"
          value={paymentData.goodsVat || "0"}
        />
        <input type="hidden" name="goodsSvsAmt" value="0" />
        <input type="hidden" name="payReqType" value="1" />
        <input type="hidden" name="model" value="WEB" />
        <input type="hidden" name="charSet" value="UTF-8" />
        <input type="hidden" name="ediDate" value={paymentData.ediDate} />
        <input type="hidden" name="encData" value={paymentData.requestHash} />
      </form>

      {/* 결제창 iframe - JSP의 pay_frame과 동일 */}
      {showPaymentFrame && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.6)"
          zIndex="10000"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            width="90%"
            maxWidth="800px"
            height="90%"
            maxHeight="700px"
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            {/* 닫기 버튼 */}
            <Box
              position="absolute"
              top="10px"
              right="10px"
              zIndex="10001"
              bg="white"
              borderRadius="full"
              p="2"
              cursor="pointer"
              boxShadow="md"
              onClick={handleClosePayment}
            >
              ✕
            </Box>

            {/* KISPG 결제 iframe */}
            <iframe
              ref={iframeRef}
              name="kispg_payment_frame"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              src={iframeUrl || undefined}
            />
          </Box>
        </Box>
      )}
    </>
  );
});

KISPGPaymentFrame.displayName = "KISPGPaymentFrame";

export default KISPGPaymentFrame;
