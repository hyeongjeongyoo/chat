"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import ApTable03 from "@/components/contents/ApTable03";
import { Box } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import InfoBoxList02 from "@/components/contents/InfoBoxList02";
import HeadingH401 from "@/components/contents/HeadingH401";

export default function SportsFeePage() {
  const tableRows01 = [
    // Header rows
    {
      isHeader: true,
      columns: [
        { header: "구 분", rowSpan: 2, width: "11%" },
        { header: "종 목", rowSpan: 2, colSpan: 2, width: "22%" },
        { header: "이 용 기 간", colSpan: 4, width: "44%" },
        { header: "비 고", rowSpan: 2, width: "auto" },
      ],
    },
    {
      isHeader: true,
      columns: [
        { header: "1개월", width: "11%" },
        { header: "3개월(10% DC)", width: "11%" },
        { header: "6개월(15% DC)", width: "11%" },
        { header: "12개월(20% DC)", width: "11%" },
      ],
    },
    // Body rows
    {
      isHeader: false,
      columns: [
        { content: "단일<br/>종목", rowSpan: 3 },
        { content: "수영", rowSpan: 2 },
        { content: "매일강습" },
        { content: "115,000" },
        { content: "310,000" },
        { content: "586,000" },
        { content: "1,104,000" },
        {
          content:
            "06시~22시<br/>* 평일 자유수영 제한 09~12시<br/>* 주말 운영시간 07~17시<br/>(제한 시간대 없음)",
          rowSpan: 2,
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "자유수영" },
        { content: "95,000" },
        { content: "256,000" },
        { content: "484,000" },
        { content: "912,000" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "골프" },
        { content: "연습장" },
        { content: "200,000" },
        { content: "570,000" },
        { content: "1,080,000" },
        { content: "2,040,000" },
        { content: "이용시간(회원대상)<br/>15시 이전(100분) / 이후(80분)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "부대<br/>시설" },
        { content: "사물함" },
        { content: "골프" },
        { content: "10,000" },
        { content: "30,000" },
        { content: "60,000" },
        { content: "100,000" },
        { content: " " },
      ],
    },
  ];
  const tableRows02 = [
    {
      isHeader: true,
      columns: [{ header: "자유수영", colSpan: 3 }],
    },
    {
      isHeader: true,
      columns: [{ header: "성인" }, { header: "초·중·고" }, { header: "-" }],
    },
    {
      isHeader: false,
      columns: [{ content: "8,000" }, { content: "6,000" }, { content: "-" }],
    },
  ];
  const tableRows03 = [
    {
      isHeader: true,
      columns: [{ header: "골프" }, { header: "70분" }, { header: "90분" }],
    },
    {
      isHeader: false,
      columns: [
        { content: "성인" },
        { content: "17,000" },
        { content: "20,000" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "초,중,고" },
        { content: "12,000" },
        { content: "-" },
      ],
    },
  ];
  const tableRows04 = [
    {
      isHeader: true,
      columns: [
        { header: "구분" },
        { header: "자유수영" },
        { header: "골프(70분)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "성인" },
        { content: "5,000" },
        { content: "13,000" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "초·중·고" },
        { content: "4,000" },
        { content: "10,000" },
      ],
    },
    {
      isHeader: false,
      columns: [{ content: "유아" }, { content: "-" }, { content: "-" }],
    },
  ];

  const infoItems01 = [
    "할인율의 경우 단일종목 골프(연습장)는 3개월 5%, 6개월 10%, 12개월 15%의 할인이 적용됩니다.",
    "환불은 탈회신청서 제출일을 기준으로 환불 처리되며, 위약금은 이용 개시일 전후 회원의 귀책 사유로 계약 해지시 총 결제금액(전체금액)의 10% 및 고객께서 이용하신 일 수에 해당하는 금액을 공제한 후 환불 처리됩니다.",
  ];
  const infoItems02 = [
    "스포츠회원 또는 가족(성인) 2인 등록 시 1인 5% 추가할인",
    "국가유공자(본인만 해당) 10% 추가할인",
    "다자녀, 다문화 가정(성인) 등록 시 10% 추가할인",
    "휴회·탈회 신청시 프런트에 회원 카드를 반드시 반납해주시기 바랍니다.",
  ];
  return (
    <PageContainer>
      <Box>
        <ApTable03
          rows={tableRows01}
          className="ap-table03"
          visuallyHiddenText="스포츠 요금표로 구분,종목,이용기간(1개월,3개월(10% DC),6개월(15% DC),12개월(20% DC)),비고 정보제공"
        />
        <InfoBoxList01 items={infoItems01} />
      </Box>
      <Box mt={"100px"}>
        <HeadingH401>1회 입장 이용요금표</HeadingH401>

        <ApTable03
          rows={tableRows02}
          className="ap-table03"
          visuallyHiddenText="1회 입장 이용요금표로 자유수영,사우나 정보제공"
        />

        <Box mt="50px">
          <ApTable03
            rows={tableRows03}
            className="ap-table03"
            visuallyHiddenText="골프 이용요금표로 골프, 70분, 90분 정보제공"
          />
        </Box>
      </Box>

      <Box mt={"100px"}>
        <HeadingH401>객실투숙객 1회 입장 이용요금표</HeadingH401>

        <ApTable03
          rows={tableRows04}
          className="ap-table03"
          visuallyHiddenText="객실투숙객 1회 입장 이용요금표로 구분, 자유수영, 헬스, 사우나, 골프(70분), 정보제공"
        />
      </Box>
      <Box mt={10}>
        <InfoBoxList02
          title="할인 적용대상 참고사항"
          subtitle="중복할인 불가, 월 회원이상"
          items={infoItems02}
        />
      </Box>
    </PageContainer>
  );
}
