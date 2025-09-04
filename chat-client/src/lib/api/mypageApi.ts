import { privateApi } from "./client";
import {
  MypageEnrollDto,
  MypagePaymentDto,
  MypageRenewalRequestDto,
  LockerAvailabilityDto,
  MypageRenewalResponseDto,
} from "@/types/api";
import { EnrollmentPayStatus } from "@/types/statusTypes";
import { withAuthRedirect } from "./withAuthRedirect";

// --- Common Query String Parameters (for reference, used in function signatures) ---
// interface PageParams {
//   page?: number; // 1-based
//   size?: number; // rows per page
//   sort?: string; // '+field' ASC / '-field' DESC
// }

// --- 4. Schemas (DTOs) ---

// 4.1 ProfileDto
export interface ProfileDto {
  id: number;
  name: string;
  userId: string;
  phone?: string;
  address?: string;
  email: string;
  carNo?: string;
  tempPwFlag?: boolean;
  gender?: string;
}

// 4.2 PasswordChangeDto
export interface PasswordChangeDto {
  currentPw: string;
  newPw: string;
}

// For POST /password/temp
export interface TemporaryPasswordRequestDto {
  userId: string;
}

// For GET /enroll QS
export interface GetEnrollmentsParams {
  status?: EnrollmentPayStatus | string;
  page?: number;
  size?: number;
  sort?: string;
}

// For PATCH /enroll/{id}/cancel
export interface CancelEnrollmentRequestDto {
  reason: string;
}

// For GET /payment QS
export interface GetPaymentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

interface ApiError extends Error {
  status?: number;
  isNoDataAuthError?: boolean;
}

// --- API Base URL ---
const MYPAGE_API_BASE = "/mypage";
const PUBLIC_API_BASE_LOCKERS = "/lockers";

// --- API Object ---
export const mypageApi = {
  // 3.1 회원정보 (Profile)
  getProfile: withAuthRedirect(async (): Promise<ProfileDto | null> => {
    const response = await privateApi.get<ProfileDto>(
      `${MYPAGE_API_BASE}/profile`
    );
    if (!response.data || !response.data.name || !response.data.email) {
      const error = new Error("필수 프로필 정보가 없습니다.") as any;
      error.isNoDataAuthError = true;
      error.status = 401;
      throw error;
    }
    return response.data;
  }),
  updateProfile: withAuthRedirect(
    async (
      data: Partial<ProfileDto>,
      currentPassword?: string
    ): Promise<ProfileDto> => {
      const payload = currentPassword ? { ...data, currentPassword } : data;
      const response = await privateApi.patch<ProfileDto>(
        `${MYPAGE_API_BASE}/profile`,
        payload
      );
      return response.data;
    }
  ),

  // 3.2 비밀번호 (Pass & Temp)
  changePassword: withAuthRedirect(
    async (data: PasswordChangeDto): Promise<void> => {
      await privateApi.patch<void>(`${MYPAGE_API_BASE}/password`, data);
    }
  ),
  requestTemporaryPassword: withAuthRedirect(
    async (data: TemporaryPasswordRequestDto): Promise<void> => {
      await privateApi.post<void>(`${MYPAGE_API_BASE}/password/temp`, data);
    }
  ),

  // 3.3 수영장 신청 & 결제 (Enroll)
  getEnrollments: withAuthRedirect(
    async (): Promise<{ content: MypageEnrollDto[] }> => {
      const response = await privateApi.get<{ content: MypageEnrollDto[] }>(
        `${MYPAGE_API_BASE}/enroll`
      );
      return response.data;
    }
  ),
  getEnrollmentById: withAuthRedirect(
    async (id: number): Promise<MypageEnrollDto> => {
      const response = await privateApi.get<MypageEnrollDto>(
        `${MYPAGE_API_BASE}/enroll/${id}`
      );
      return response.data;
    }
  ),

  /**
   * @deprecated The checkout flow is now handled by the KISPG payment page.
   * See swimmingPaymentService.enrollLesson and the /payment/process page.
   */
  checkoutEnrollment: async (): Promise<never> => {
    console.warn("mypageApi.checkoutEnrollment is deprecated.");
    return Promise.reject(
      new Error(
        "mypageApi.checkoutEnrollment is deprecated and should not be called."
      )
    );
  },

  /**
   * @deprecated Payment is now handled by the KISPG payment page flow.
   */
  payEnrollment: async (): Promise<never> => {
    console.warn("mypageApi.payEnrollment is deprecated.");
    return Promise.reject(
      new Error(
        "mypageApi.payEnrollment is deprecated and should not be called."
      )
    );
  },

  cancelEnrollment: withAuthRedirect(
    async (id: number, reason?: string): Promise<void> => {
      await privateApi.patch<void>(`${MYPAGE_API_BASE}/enroll/${id}/cancel`, {
        reason,
      });
    }
  ),

  /**
   * @description 재수강 신청을 하고 결제 페이지 정보를 받아옵니다. (신규 재수강 정책)
   */
  requestRenewal: withAuthRedirect(
    async (
      data: MypageRenewalRequestDto
    ): Promise<MypageRenewalResponseDto> => {
      const response = await privateApi.post<MypageRenewalResponseDto>(
        `${MYPAGE_API_BASE}/renewal`,
        data
      );
      return response.data;
    }
  ),

  /**
   * @deprecated Renewal is now handled by swimmingPaymentService.renewalLesson to align with KISPG flow.
   * That service returns EnrollInitiationResponseDto.
   */
  renewEnrollment: async (data: MypageRenewalRequestDto): Promise<never> => {
    console.warn(
      "mypageApi.renewEnrollment is deprecated. Use swimmingPaymentService.renewalLesson instead."
    );
    return Promise.reject(
      new Error(
        "mypageApi.renewEnrollment is deprecated and should not be called."
      )
    );
  },

  // 3.4 결제 내역 (Payment)
  getPayments: withAuthRedirect(
    async (): Promise<{ content: MypagePaymentDto[] }> => {
      const response = await privateApi.get<{ content: MypagePaymentDto[] }>(
        `${MYPAGE_API_BASE}/payment`
      );
      return response.data;
    }
  ),
  requestPaymentCancel: async (
    paymentId: number,
    reason?: string
  ): Promise<void> => {
    const payload = reason ? { reason } : {};
    await privateApi.post<void>(
      `${MYPAGE_API_BASE}/payment/${paymentId}/cancel`,
      payload
    );
  },

  // New function for locker availability status (as per swim-user.md)
  getLockerAvailabilityStatus: async (
    gender: string
  ): Promise<LockerAvailabilityDto> => {
    // This specific API endpoint for public locker availability might not need `withAuthRedirect`
    // as it can be used on public lesson listing pages before login.
    const response = await privateApi.get<LockerAvailabilityDto>(
      `${PUBLIC_API_BASE_LOCKERS}/availability/status?gender=${gender}`
    );
    return response.data;
  },
};

// Note: The spec mentions a response wrapper: { status, data, message }.
// The current client.ts setup with privateApi.get, .post, etc., directly returns the `data` part.
// So the Promise<DtoType> is appropriate here. If the wrapper was to be handled client-side for each call,
// the return types would need to be adjusted, e.g., Promise<ApiResponse<DtoType>> where ApiResponse includes status, data, message.
