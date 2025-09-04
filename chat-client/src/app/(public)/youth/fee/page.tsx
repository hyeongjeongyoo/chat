"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Box } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import ApTable03 from "@/components/contents/ApTable03";

export default function YouthFeePage() {
  const infoItems01 = [
    "수련활동은 최소인원 50인 이상 이용 가능 (50명 이하 인원은 정액교육비로 진행 가능)",
    "스포츠체험의 경우 100명 미만은 3체험, 100명 이상은 4체험 가능",
    "모든 수련활동의 야간 생활지도는 학교에서 실시",
  ];

  // 청소년문화센터 이용요금 테이블 데이터
  const tableRows01 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "구 분", width: "25%" },
        { header: "1일", width: "25%" },
        { header: "1박 2일", width: "25%" },
        { header: "2박 3일", width: "25%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        {
          content: "숙박비<br>(유스룸 이용)",
          style: { textAlign: "center" as const },
        },
        { content: "-", style: { textAlign: "center" as const } },
        { content: "15,000원", style: { textAlign: "center" as const } },
        {
          content: "15,000원 x 2일 = 30,000원",
          style: { textAlign: "center" as const },
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "프로그램 진행비", style: { textAlign: "center" as const } },
        { content: "13,000원", style: { textAlign: "center" as const } },
        { content: "25,000원", style: { textAlign: "center" as const } },
        { content: "47,000원", style: { textAlign: "center" as const } },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "합 계", style: { textAlign: "center" as const } },
        { content: "13,000원", style: { textAlign: "center" as const } },
        { content: "40,000원", style: { textAlign: "center" as const } },
        { content: "77,000원", style: { textAlign: "center" as const } },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "식 비", style: { textAlign: "center" as const } },
        {
          content:
            "1식= 청소년(초·중·고) 11,000원 / 성인 14,000원<span style='color: red; font-size: 0.8em; display: block; margin-top: 15px;'>※ 식당은 외주업체가 운영하는 관계로 별도 예약 및 결제가 필요합니다.</span>",
          colSpan: 3,
          style: { textAlign: "center" as const },
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <Box>
        <ApTable03
          rows={tableRows01}
          className="ap-table03"
          visuallyHiddenText="청소년문화센터 이용요금으로 구분, 1일, 1박2일, 2박3일 정보 제공"
        />
        <InfoBoxList01 items={infoItems01} />
      </Box>
    </PageContainer>
  );
}
