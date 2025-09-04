export const membershipTypeLabels: { [key: string]: string } = {
  general: "-",
  merit: "국가 유공자",
  "multi-child": "다자녀 (3인 이상)",
  multicultural: "다문화 가정",
};

export const getMembershipLabel = (
  typeKey: string | undefined | null
): string => {
  if (!typeKey) return "정보 없음"; // Handle null or undefined explicitly
  const normalizedKey = typeKey.toLowerCase().replace(/_/g, "-");
  return membershipTypeLabels[normalizedKey] || typeKey; // typeKey를 fallback으로 사용
};

// 날짜/시간 포맷팅, 가격 포맷팅 등 다른 공용 디스플레이 유틸리티도 여기에 추가할 수 있습니다.
