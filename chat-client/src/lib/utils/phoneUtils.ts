/**
 * 전화번호 형식 변환 유틸리티
 */

/**
 * 한국 전화번호를 하이픈(-) 포함 형식으로 변환
 * @param phoneNumber - 변환할 전화번호 (숫자만 또는 하이픈 포함)
 * @returns 형식화된 전화번호 (예: 010-1234-5678) 또는 원본 문자열
 */
export const formatPhoneNumberWithHyphen = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, ""); // Remove non-digits

  if (cleaned.length === 11) {
    // Common mobile format e.g., 01012345678 -> 010-1234-5678
    return `${cleaned.substring(0, 3)}-${cleaned.substring(
      3,
      7
    )}-${cleaned.substring(7, 11)}`;
  }

  if (cleaned.length === 10 && cleaned.startsWith("02")) {
    // Seoul landline e.g., 021234567 -> 02-1234-5678
    return `${cleaned.substring(0, 2)}-${cleaned.substring(
      2,
      6
    )}-${cleaned.substring(6, 10)}`;
  }

  if (cleaned.length === 10) {
    // Other 10-digit landlines e.g., 0311234567 -> 031-123-4567
    return `${cleaned.substring(0, 3)}-${cleaned.substring(
      3,
      6
    )}-${cleaned.substring(6, 10)}`;
  }

  // For other cases or if it's not a recognized Korean format, return cleaned or original.
  return phoneNumber;
};

/**
 * KISPG 결제용 전화번호 형식 변환 (숫자만)
 * @param phone - 변환할 전화번호
 * @returns 숫자만 포함된 전화번호 (예: 01012345678) 또는 기본값
 */
export const formatPhoneNumberForKISPG = (phone: string): string => {
  if (!phone) return "01000000000"; // KISPG 기본값

  const numbers = phone.replace(/[^0-9]/g, "");

  // 국제번호 형식 처리 (82로 시작하는 경우)
  if (numbers.startsWith("82")) {
    return "0" + numbers.substring(2);
  }

  // 휴대폰 번호 형식 검증
  if (
    numbers.startsWith("010") ||
    numbers.startsWith("011") ||
    numbers.startsWith("016") ||
    numbers.startsWith("017") ||
    numbers.startsWith("018") ||
    numbers.startsWith("019")
  ) {
    return numbers;
  }

  // 010 없이 8자리로 시작하는 경우 (10-1234-5678 형태)
  if (
    numbers.length === 8 &&
    (numbers.startsWith("10") ||
      numbers.startsWith("11") ||
      numbers.startsWith("16") ||
      numbers.startsWith("17") ||
      numbers.startsWith("18") ||
      numbers.startsWith("19"))
  ) {
    return "0" + numbers;
  }

  console.warn("Invalid phone number format for KISPG:", phone);
  return "01000000000"; // KISPG 기본값
};

/**
 * 전화번호 유효성 검증
 * @param phoneNumber - 검증할 전화번호
 * @returns 유효한 한국 전화번호인지 여부
 */
export const isValidKoreanPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;

  const cleaned = phoneNumber.replace(/\D/g, "");

  // 휴대폰 번호 (11자리)
  if (cleaned.length === 11) {
    return /^01[0-9]{9}$/.test(cleaned);
  }

  // 서울 지역번호 (10자리)
  if (cleaned.length === 10 && cleaned.startsWith("02")) {
    return true;
  }

  // 기타 지역번호 (10자리)
  if (cleaned.length === 10) {
    return /^0[3-9][0-9]{8}$/.test(cleaned);
  }

  return false;
};

/**
 * 전화번호에서 숫자만 추출
 * @param phoneNumber - 원본 전화번호
 * @returns 숫자만 포함된 문자열
 */
export const extractDigitsFromPhone = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};
