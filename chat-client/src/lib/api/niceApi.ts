import { publicApi } from "./client"; // Assuming this is the correct path to your API client

export interface NiceInitiateResponse {
  encodeData: string;
  reqSeq: string;
  // Add any other fields your backend might return for this initiation call
}

// As per new docs: Section 2.3 (Response for serviceType=REGISTER)
export interface NiceRegisteredUserDataDto {
  reqSeq?: string; // Optional as per example
  resSeq?: string; // Optional as per example
  authType?: string; // Optional as per example
  name: string;
  utf8Name?: string; // Optional as per example
  birthDate: string; // YYYYMMDD
  gender: string;
  nationalInfo?: string;
  mobileCo?: string;
  mobileNo: string;
  ci?: string;
  di?: string;
}

// General result DTO for /api/v1/nice/checkplus/result/{key}
// This will encapsulate various outcomes based on serviceType and status.
export interface NiceCallbackResultDto {
  status:
    | "SUCCESS"
    | "ID_SENT"
    | "PASSWORD_RESET_SENT"
    | "ACCOUNT_NOT_FOUND"
    | "ERROR"
    | "FAIL"; // From docs section 2.2
  serviceType: "REGISTER" | "FIND_ID" | "RESET_PASSWORD" | "UNKNOWN"; // From docs
  userData?: NiceRegisteredUserDataDto; // For REGISTER success
  message?: string;
  errorCode?: string;
  userEmail?: string; // For ID_SENT, PASSWORD_RESET_SENT
  identifiedName?: string; // Common field as per docs example
  key?: string; // The key used for the request
  // Fields for REGISTER existing user, from redirect params (not strictly part of /result/{key} userData but useful context)
  isJoined?: boolean; // Should match 'joined' query param (true/false)
  existingUsername?: string; // Should match 'username' query param
}

// Type for the body of initiateVerification
interface InitiateVerificationPayload {
  serviceType: "REGISTER" | "FIND_ID" | "RESET_PASSWORD";
}

// DTO for successful NICE verification data relevant for public/signup purposes
export interface NicePublicUserDataDto {
  name: string; // Or utf8Name, ensure it matches backend response
  birthDate: string; // e.g., YYYYMMDD
  gender: string; // e.g., "1" for male, "0" for female
  mobileNo: string; // Phone number
  ci?: string; // Optional: Client Identifier
  di?: string; // Optional: Duplicate Information
  nationalInfo?: string; // 내/외국인 구분 (Korean/Foreigner)
  // Add any other fields the backend provides for pre-filling signup
}

// DTO for structured error details from NICE or backend processing
export interface NiceErrorDataDto {
  errorCode?: string; // NICE specific error code or backend error code
  errorMessage?: string;
  // any other structured error details
}

// DTO for the result of NICE authentication
export interface NiceAuthResultDto {
  success: boolean;
  data?: NicePublicUserDataDto;
  error?: NiceErrorDataDto;
  key?: string;
}

export const niceApi = {
  /**
   * Initiates the NICE self-identification process.
   * Calls the backend to get encrypted data for the NICE popup.
   */
  initiateVerification: async (
    payload: InitiateVerificationPayload
  ): Promise<NiceInitiateResponse> => {
    const endpoint = "/nice/checkplus/initiate";
    const response = await publicApi.post<NiceInitiateResponse, any>(
      endpoint,
      payload // Send serviceType in body
    );
    // Assuming publicApi.post might return the data directly OR wrapped in a .data property.
    // If response.data exists and is the expected object, use it. Otherwise, assume response is the data.
    if (
      response &&
      typeof response === "object" &&
      "encodeData" in response &&
      "reqSeq" in response &&
      !response.data
    ) {
      return response as NiceInitiateResponse;
    }
    return response.data; // Default to Axios-like behavior
  },

  /**
   * Fetches the result of the NICE self-identification process.
   * @param key The key received from the NICE callback.
   */
  getNiceAuthResult: async (key: string): Promise<NiceCallbackResultDto> => {
    const endpoint = `/nice/checkplus/result/${key}`; // Updated endpoint
    try {
      const response = await publicApi.get<NiceCallbackResultDto>(endpoint);
      // The backend should ideally return a structure that fits NiceCallbackResultDto directly.
      // If it might sometimes return raw user data or a different error structure, transformations might be needed here.
      // For now, assume it matches NiceCallbackResultDto.
      return response.data;
    } catch (error) {
      console.error("[NICE_API] Error fetching result:", error);
      // Construct a more detailed error based on NiceCallbackResultDto
      const errorResponse: NiceCallbackResultDto = {
        status: "ERROR", // Or "FAIL" depending on context
        serviceType: "UNKNOWN", // Cannot know serviceType from key alone in error case here
        message:
          error instanceof Error
            ? error.message
            : "Unknown error fetching result",
        errorCode: "API_CLIENT_ERROR",
        key: key,
      };
      return errorResponse;
    }
  },
};
