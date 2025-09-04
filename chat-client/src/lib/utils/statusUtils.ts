import { UiDisplayStatus } from "@/types/statusTypes";

// export type PayStatus = // Original PayStatus type is removed
//   | "PAID"
//   | "PARTIAL_REFUNDED"
//   | "PAYMENT_TIMEOUT"
//   | "REFUND_PENDING_ADMIN_CANCEL"
//   | "REFUNDED";

/**
 * 결제 및 수강신청 상태에 대한 표시 속성을 정의하는 중앙 설정 객체입니다.
 * 이 객체는 애플리케이션 전체에서 상태를 일관되게 표시하는 데 사용됩니다.
 * 백엔드 `PaymentStatus.java` 및 관련 엔티티 상태를 기반으로 합니다.
 *
 * @property {string} label - UI에 표시될 한글 상태명
 * @property {string} colorPalette - Chakra UI Badge 컴포넌트의 colorScheme 속성에 사용될 색상 팔레트
 * @property {'solid' | 'outline'} [badgeVariant] - Chakra UI Badge 컴포넌트의 variant 속성
 */
export const displayStatusConfig: Record<
  UiDisplayStatus,
  { label: string; colorPalette: string; badgeVariant?: "solid" | "outline" }
> = {
  // --- PaymentStatus 시작 ---
  PAID: {
    label: "결제완료",
    colorPalette: "green",
    badgeVariant: "solid",
  },
  FAILED: {
    label: "결제실패",
    colorPalette: "red",
    badgeVariant: "solid",
  },
  CANCELED: {
    label: "전액환불",
    colorPalette: "gray",
    badgeVariant: "outline",
  },
  PARTIAL_REFUNDED: {
    label: "부분환불",
    colorPalette: "orange",
    badgeVariant: "solid",
  },
  REFUNDED: {
    label: "환불완료",
    colorPalette: "gray",
    badgeVariant: "solid",
  },
  // --- PaymentStatus 끝 ---

  // --- Enrollment 등 다른 엔티티 상태 ---
  REFUND_REQUESTED: {
    label: "환불요청",
    colorPalette: "blue",
    badgeVariant: "outline",
  },
  PAYMENT_PENDING: {
    label: "결제대기",
    colorPalette: "yellow",
    badgeVariant: "outline",
  },
  ADMIN_CANCELED: {
    label: "관리자 취소",
    colorPalette: "red",
    badgeVariant: "solid",
  },
  REFUND_PENDING_ADMIN_CANCEL: {
    label: "관리자 취소(환불필요)",
    colorPalette: "red",
    badgeVariant: "solid",
  },
  EXPIRED: {
    label: "만료",
    colorPalette: "gray",
    badgeVariant: "outline",
  },
};

/**
 * 상태(UiDisplayStatus)를 한글 레이블과 색상 정보로 변환합니다.
 * @param status - 변환할 상태
 * @returns - UI에 표시될 정보. 상태가 유효하지 않으면 기본값을 반환합니다.
 */
export const getDisplayStatusInfo = (status: UiDisplayStatus | string) => {
  const config = displayStatusConfig[status as UiDisplayStatus];
  if (config) {
    return {
      label: config.label,
      color: config.colorPalette,
      variant: config.badgeVariant || "solid",
    };
  }
  return { label: "알 수 없음", color: "gray", variant: "outline" }; // Default for unknown statuses
};
