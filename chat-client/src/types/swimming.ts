// 수영장 강습 관련 타입 정의

import {
  PaymentStatus,
  EnrollmentPayStatus,
  EnrollmentCancellationProgressStatus,
  // LessonStatus, // LessonDTO here doesn't use this level of detail for its own status field
} from "./statusTypes";
import type { ApiResponse as GenericApiResponse } from "./api"; // For the generic wrapper example

// 강습 DTO
export interface LessonDTO {
  id: number;
  title: string;
  name: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  timePrefix: string;
  days: string;
  capacity: number;
  remaining: number;
  price: number;
  reservationId: string; // 접수 시작 정보
  receiptId: string; // 접수 마감 정보
  instructor: string;
  location: string;
}

// 사물함 DTO
export interface LockerDTO {
  id: number;
  lockerNumber: string;
  zone: string;
  gender: "M" | "F";
  isActive: boolean;
}

// 강습 신청 요청 DTO
export interface EnrollRequestDto {
  lessonId: number;
  usesLocker: boolean;
}

// 수강 신청 자격 확인 응답 DTO
export interface EnrollmentEligibility {
  eligible: boolean;
  message: string;
}

// 강습 신청 응답 DTO
export interface EnrollResponseDto {
  enrollId: number;
  lessonId: number;
  lockerId?: number;
  status: string; // This is likely EnrollmentApplicationStatus or similar, but API might send generic string.
  payStatus: EnrollmentPayStatus | string; // Allow string for flexibility
  expireDt: string;
  userName: string;
  lessonTitle: string;
  lessonTimeSlot: string;
  lessonDays: string;
  price: number;
  lockerPrice?: number;
  totalPrice: number;
}

// 강습 신청 취소 요청 DTO
export interface CancelRequestDto {
  reason: string;
}

// 강습 신청 취소 응답 DTO = EnrollResponseDto

// 강습 신청 목록 DTO
export interface EnrollDTO {
  enrollId: number;
  lessonId: number;
  lockerId?: number;
  status: string; // General status of the enrollment, could be EnrollmentApplicationStatus
  payStatus: EnrollmentPayStatus | string; //  PAID// Allow string
  expireDt: string;
  userName: string;
  lessonTitle: string;
  lessonTimeSlot: string;
  lessonDays: string;
  price: number;
  lockerPrice?: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  remainingMinutes?: number; // 프론트엔드에서 계산
}

// 결제 요청 DTO
export interface PaymentRequestDto {
  enrollId: number;
  pgToken: string;
}

// 재등록 DTO
export interface RenewalDTO {
  previousEnrollId: number;
  previousLessonId: number;
  previousLessonTitle: string;
  previousLockerInfo?: {
    lockerId: number;
    lockerNumber: string;
  };
  suggestedLessonId: number;
  suggestedLessonTitle: string;
  suggestedLessonTimeSlot: string;
  suggestedLessonDays: string;
  suggestedLessonStartDate: string;
  suggestedLessonEndDate: string;
  suggestedLessonPrice: number;
}

// 재등록 요청 DTO
export interface RenewalRequestDto {
  lessonId: number;
  usesLocker: boolean;
}

/**
 * DTO for POST /api/v1/payment/prepare-kispg-payment
 * Request body when a user initiates a lesson enrollment.
 */
export interface EnrollLessonRequestDto {
  lessonId: number;
}

/**
 * DTO for POST /api/v1/payment/prepare-kispg-payment
 * Response after successfully initiating a lesson enrollment and payment preparation.
 * Contains KISPG payment initialization parameters.
 */
export interface EnrollInitiationResponseDto {
  mid: string;
  moid: string; // Merchant Order ID (temp_enrollId_timestamp)
  amt: string; // Amount as string
  itemName: string; // Goods name (lesson title)
  buyerName: string; // Buyer name
  buyerTel: string; // Buyer phone
  buyerEmail: string; // Buyer email
  returnUrl: string; // Return URL after payment
  notifyUrl: string; // Webhook URL
  ediDate: string; // Transaction datetime (yyyyMMddHHmmss)
  requestHash: string; // Security hash (encData)
  mbsReserved1: string; // Contains enrollId info (temp_enrollId)
  mbsUsrId: string; // Merchant user ID
  userIp: string; // User IP address
  goodsSplAmt: string; // Supply amount
  goodsVat: string; // VAT amount
}

/**
 * DTO for GET /api/v1/payment/details/{enrollId}
 * Contains details needed for the KISPG payment page, including lesson info,
 * pricing, locker options, and payment deadline.
 */
export interface PaymentPageDetailsDto {
  enrollId: number;
  lessonTitle: string;
  lessonPrice: number;
  userGender: "MALE" | "FEMALE" | "OTHER"; // Assuming OTHER might be possible or just MALE/FEMALE
  lockerOptions?: {
    // Optional if lesson has no locker linkage
    availableForGender: boolean;
    lessonMaleLockerCap: number;
    lessonFemaleLockerCap: number;
    lessonMaleLockersUsed: number;
    lessonFemaleLockersUsed: number;
    lockerFee: number;
  };
  amountToPay: number; // Final amount, may include lockerFee
  paymentDeadline: string; // UTC ISO 8601 string, from enroll.expire_dt
}

/**
 * DTO for GET /api/v1/payment/kispg-init-params/{enrollId}
 * Contains parameters required to initialize the KISPG payment gateway/widget.
 * The exact fields will depend on KISPG's specification.
 * Based on user.md and general PG knowledge.
 */
export interface KISPGInitParamsDto {
  mid?: string; // Merchant ID
  moid?: string; // Merchant Order ID (likely derived from enrollId)
  itemName?: string; // Lesson Title
  amount?: number; // Amount to pay
  buyerName?: string; // User's name
  buyerTel?: string; // User's phone
  buyerEmail?: string; // User's email
  returnUrl?: string; // URL KISPG redirects to after payment
  notifyUrl?: string; // Webhook URL KISPG sends async notification to
  requestHash?: string; // Security hash if required by KISPG
  // ... other KISPG specific parameters
  // For example, from swim-user.md's DDL comment for kispg-payment-integration.md:
  // "mid", "moid", "requestHash"
  // Other common fields might be: goodname, currency, offerperiod, acceptmethod etc.
  [key: string]: any; // Allow for other KISPG specific fields
}

/**
 * DTO for POST /api/v1/payment/confirm/{enrollId}
 * Request body sent from the frontend after KISPG payment process returns to the client.
 */
export interface PaymentConfirmRequestDto {
  pgToken: string; // The token or transaction ID from KISPG
  usesLocker: boolean; // Final confirmation of locker choice
}

/**
 * DTO for POST /api/v1/payment/confirm/{enrollId}
 * Response after frontend confirms payment post-KISPG interaction.
 * Could be a generic success message or specific status.
 */
export interface PaymentConfirmResponseDto {
  status:
    | "PAYMENT_SUCCESSFUL"
    | "PAYMENT_PROCESSING"
    | "PAYMENT_FAILED"
    | string; // Allow for other statuses
  message?: string;
  // Potentially include updated enrollStatus or paymentStatus if available immediately
  enrollId?: number;
}

// --- DTOs for Mypage (based on user.md) ---

/**
 * DTO for Mypage enrollments (GET /mypage/enroll)
 * Represents a single enrollment item in the user's Mypage.
 * Based on user.md EnrollDto.
 */
export interface MypageEnrollDto {
  enrollId: number;
  lesson: {
    title: string;
    period: string; // e.g., "2025-05-01 ~ 2025-05-30"
    time: string; // e.g., "(월,화,수,목,금) 오전 07:00 ~ 07:50"
    price: number;
    // lesson.status field from api.ts MypageEnrollDto.lesson has 'string', not specific LessonStatus yet.
    // If this needs to be more specific, it should align with LessonStatus from statusTypes.ts
    status: string;
  };
  status: EnrollmentPayStatus; // pay_status from enroll table // Allow string
  applicationDate: string; // ISO 8601 datetime string
  paymentExpireDt: string | null; // enroll.expire_dt (KISPG 결제 페이지 만료 시간)
  usesLocker: boolean;
  isRenewal: boolean;
  cancelStatus: EnrollmentCancellationProgressStatus; // from enroll.cancel_status // Allow string
  cancelReason: string | null;
  renewalWindow?: {
    // Optional
    open: string; // ISO 8601 datetime string
    close: string; // ISO 8601 datetime string
  };
  canAttemptPayment: boolean; // Calculated: if status is UNPAID and paymentExpireDt not passed
  paymentPageUrl: string | null; // URL to KISPG payment page if resumable
}

/**
 * DTO for Mypage renewal request (POST /mypage/renewal)
 * Based on user.md RenewalRequestDto.
 */
export interface MypageRenewalRequestDto {
  lessonId: number;
  usesLocker: boolean; // 희망 여부, 결제페이지에서 최종선택
}
// Response for POST /mypage/renewal is EnrollInitiationResponseDto

/**
 * DTO for Mypage payment history (GET /mypage/payment)
 * Represents a single payment item in the user's Mypage.
 * Based on user.md PaymentDto.
 */
export interface MypagePaymentDto {
  paymentId: number;
  enrollId: number;
  tid: string | null; // KISPG 거래번호
  paid_amt: number; // 초기 승인 총액
  refunded_amt: number; // 누적 환불액
  paidAt: string | null; // 결제일시 ISO 8601
  refund_dt: string | null; // 마지막 환불 시각 ISO 8601
  status: PaymentStatus | string; // Allow string
}

// It's good practice to also have a generic API response type,
// if one isn't already globally defined and used.
// The existing `PaginatedResponse<T>` seems suitable for lists.
// For single object responses or simple success/error messages,
// the API client seems to expect the `data` part directly.
// However, the server might wrap it. For consistency with `PaginatedResponse<T>`
// which has `success`, `message`, `code` at the top level,
// non-paginated successful responses might look like:

export interface ApiResponse<T> extends GenericApiResponse<T> {}

// Example usage for a single item response:
// getPaymentDetails(enrollId: number): Promise<ApiResponse<PaymentPageDetailsDto>>
// However, `privateApiMethods.get<T>` returns `T` directly (response.data).
// So, the functions will be typed as Promise<PaymentPageDetailsDto>
// and the actual wrapping (if any) is handled by the backend and Axios.
