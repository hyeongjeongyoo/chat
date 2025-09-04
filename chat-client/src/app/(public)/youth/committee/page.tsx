"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Box } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import InfoBoxList02 from "@/components/contents/InfoBoxList02";

export default function YouthCommitteePage() {
  const infoItems01 = [
    "청소년 스스로 청소년들의 올바른 권리와 욕구를 충족시켜 주기 위한 지역사회 청소년 자치활동으로써, 아르피나의 체험활동 및 청소년 관련 정책에 참여하는 활동입니다.",
  ];
  const infoItems02 = [
    "위원회 활동을 통하여 청소년들의 권리를 직접 찾을 수 있도록 노력합니다.",
    "봉사 및 문화활동 참여로 보다 넓은 시각과 균형된 가치관을 형성합니다..",
  ];
  const infoItems03 = [
    "모집기간 : 2025.03. ~ 모집 시까지",
    "대상 : 중학교 2학년 ~ 대학생(만 24세 미만), 학교밖청소년 (2023년 이전 아르피나 청소년운영위원회 참여 청소년 우선 선발)",
    "인원 : 10명 ~ 15명 내외",
    "활동내용 : 시설의 운영정책 제안, 모니터링, 봉사활동, 행사참여 및 지원 등",
    "혜택 : 기념품 지급/아르피나 시설이용권 (숙박권 등)/문화상품권 및 스타벅스 기프트카드 등",
    "제출처 : 아르피나유스호스텔 (051-740-3263 / mjk7189@bmc.busan.kr)",
    "신청서 : 신청서 파일 다운로드",
  ];
  const infoItems04 = ["전화 : 051-740-3263"];
  return (
    <PageContainer>
      <Box>
        <InfoBoxList01 title="청소년 운영위원회" items={infoItems01} />
      </Box>
      <Box mt={10}>
        <InfoBoxList02
          title="운영목표"
          subtitle="청소년들이 스스로 참여하고 결정하는 자치 활동입니다."
          items={infoItems02}
        />
      </Box>
      <Box mt={10}>
        <InfoBoxList01 title="모집 및 활동 내용" items={infoItems03} />
      </Box>
      <Box mt={10}>
        <InfoBoxList02
          title="문의사항"
          subtitle="궁금한점은 아르피나유스호스텔로 연락주세요"
          items={infoItems04}
        />
      </Box>
    </PageContainer>
  );
}
