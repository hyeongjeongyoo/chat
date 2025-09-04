
/**
 * Validates a phone number.
 * Accepts formats like 010-1234-5678, 01012345678, 02-123-4567.
 * @param phone The phone number string to validate.
 * @returns `true` if the phone number is valid, `false` otherwise.
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // This regex allows for optional hyphens and covers standard Korean mobile and landline formats.
  const phoneRegex = /^\d{2,3}-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone);
} 


export const validateUsername = (username: string): string => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return "사용자 ID를 입력해주세요.";
    if (trimmedUsername.length < 4) return "사용자 ID는 4자 이상이어야 합니다.";
    if (trimmedUsername.length > 16) return "사용자 ID는 50자 이하여야 합니다.";
    return "";
  };
  
  export  const validateEmail = (email: string): string => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "이메일을 입력해주세요.";
    // RFC 5322 standard-ish regex
    const emailPattern =
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    if (!emailPattern.test(trimmedEmail)) return "유효한 이메일 형식이 아닙니다.";
    if (trimmedEmail.length > 100) return "이메일은 100자 이하여야 합니다.";
    return "";
  };
  
  export  const validateCarNumber = (carNumber: string): string => {
    const trimmedCarNumber = carNumber.trim();
    if (!trimmedCarNumber) return ""; // Car number is optional
  
    // Regex to check parts: 2-3 digits, 1 Hangul, 4 digits. Allows for no space during validation.
    // The blur event will try to format it with a space.
    const carPattern = /^\d{2,3}[가-힣]{1}\d{4}$/;
    // Remove existing spaces for validation check, as blur will re-insert it correctly.
    const carNumberWithoutSpaces = trimmedCarNumber.replace(/\s/g, "");
  
    if (!carPattern.test(carNumberWithoutSpaces)) {
      return "차량번호 형식이 올바르지 않습니다. (예: 12가 1234 또는 123가 1234)";
    }
    return "";
  };