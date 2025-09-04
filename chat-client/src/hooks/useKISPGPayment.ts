"use client";

import { useState, useCallback, useRef } from "react";
import { swimmingPaymentService } from "@/lib/api/swimming";
import { KISPGPaymentInitResponseDto } from "@/types/api";
import { toaster } from "@/components/ui/toaster";
import type { KISPGPaymentFrameRef } from "@/components/payment/KISPGPaymentFrame";

interface UseKISPGPaymentProps {
  enrollId: number;
  onPaymentInitError?: (error: any) => void;
}

export const useKISPGPayment = ({
  enrollId,
  onPaymentInitError,
}: UseKISPGPaymentProps) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentData, setPaymentData] =
    useState<KISPGPaymentInitResponseDto | null>(null);
  const paymentRef = useRef<KISPGPaymentFrameRef>(null);

  const initializePayment = useCallback(
    async (overrideEnrollId?: number) => {
      const effectiveEnrollId = overrideEnrollId || enrollId;
      if (!effectiveEnrollId) {
        console.error("No enrollId provided for payment initialization");
        return;
      }

      setIsInitializing(true);
      try {
        const response = await swimmingPaymentService.initKISPGPayment(
          effectiveEnrollId
        );
        setPaymentData(response);

        toaster.create({
          title: "결제 준비 완료",
          description: "결제창으로 이동합니다.",
          type: "info",
          duration: 2000,
        });

        // Auto-trigger payment after data is set
        setTimeout(() => {
          paymentRef.current?.triggerPayment();
        }, 500);
      } catch (error: any) {
        console.error("Payment initialization failed:", error);
        toaster.create({
          title: "결제 준비 실패",
          description: error.message || "결제 준비 중 오류가 발생했습니다.",
          type: "error",
        });
        onPaymentInitError?.(error);
      } finally {
        setIsInitializing(false);
      }
    },
    [enrollId, onPaymentInitError]
  );

  const triggerPayment = useCallback(() => {
    paymentRef.current?.triggerPayment();
  }, []);

  return {
    isInitializing,
    paymentData,
    paymentRef,
    initializePayment,
    triggerPayment,
  };
};
