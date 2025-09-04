export const InquiryStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

export type InquiryStatusType = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export const STATUS_MAP: {
  [key in InquiryStatusType]?: { label: string; colorPalette: string };
} = {
  [InquiryStatus.PENDING]: { label: "대기", colorPalette: "yellow" },
  [InquiryStatus.CONFIRMED]: { label: "확인", colorPalette: "blue" },
  [InquiryStatus.COMPLETED]: { label: "완료", colorPalette: "green" },
  [InquiryStatus.CANCELED]: { label: "취소", colorPalette: "red" },
}; 