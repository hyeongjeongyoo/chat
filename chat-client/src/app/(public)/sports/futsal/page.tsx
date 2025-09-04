"use client";

import { Box, List } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/futsal_img01.jpg",
    "/images/contents/futsal_img02.jpg",
    "/images/contents/futsal_img03.jpg",
  ];

  const tableRows01 = [
    {
      header: "위치",
      content: "부산도시공사 아르피나",
    },
    {
      header: "시설규모",
      content: <>야외운동장: 1,350㎡ (약 408평)</>,
    },
    {
      header: "운영시간",
      content: (
        <>
          하계(3월~10월): 07:00 ~ 22:00 (야간 기준 19시 이후) <br />
          동계(11월~2월): 08:00 ~ 22:00 (야간 기준 18시 이후)
        </>
      ),
    },
    {
      header: "휴관일",
      content: "스포츠센터 휴관일(월1회), 명절연휴",
    },
  ];

  const tableRows02 = [
    {
      header: "차량등록",
      content: "차량 출차 전 반드시 차량번호 등록 필수",
    },
    {
      header: "등록 위치 및 시간",
      content: (
        <>
          07:00 ~ 18:00 → 2층 스포츠센터 프런트 <br />
          22:00 이후 → 1층 객실 프런트
        </>
      ),
    },
    {
      header: "진입 제한 안내",
      content: "행사·공연 등 특별 상황 시 차량 진입이 제한될 수 있음",
    },
  ];

  const tableRows03 = [
    {
      columns: [
        { header: "이용장소", content: "풋살장(야외운동장)" },
        { header: "기본요금", content: "50,000원 / 시간당" },
        { header: "야간조명 이용료", content: "10,000원 / 시간당 (초과 시)" },
      ],
    },
  ];

  const tableRows04 = [
    {
      columns: [
        { header: "취소기준", content: "사용일 4일 이전" },
        { header: "취소 가능여부", content: "취소 가능" },
        { header: "취소 수수료", content: "0%" },
      ],
    },
    {
      columns: [
        { header: "취소기준", content: "사용일 3일 이내" },
        { header: "취소 가능여부", content: "수수료부과" },
        { header: "취소 수수료", content: "20%" },
      ],
    },
    {
      columns: [
        { header: "취소기준", content: "사용일 당일" },
        { header: "취소 가능여부", content: "취소불가능" },
        { header: "취소 수수료", content: "100%" },
      ],
    },
  ];

  const infoItems01 = [
    "주중, 주말 상관없이 시간당 요금이 부과되며, 예약시간 30분 전·후 운동장을 개방·폐쇄함",
    "예약은 전화로만 가능 (☎ 051-740-3271)",
    "당일(연장 포함) 예약은 불가합니다.",
    "사용일 30일전부터 ~ 1일전까지 예약신청 가능 (단, 1개월 이상의 장기 예약의 경우 6개월 전부터 예약 가능하며, 장기 예약의 경우 별도의 계약서를 작성하여야 합니다.)",
    "현금 또는 신용(체크)카드 결제 (사용료 납부까지 완료하여야 예약 확정됩니다.)",
    "취소 및 환불 : 아르피나 운동장(풋살장) 환불정책에 따름.",
  ];

  const infoItems02 = [
    "천재지변 등 불가항력적인 사유료 시설 사용이 불가능할 경우, 또는 관리·운영에 따라 사용이 불가능할 경우 100% 환급",
    "당일, 우천 등으로 인한 사용일 당일 취소 시 아르피나 스포츠센터(740-3271)로 전화 문의 바랍니다.",
  ];

  const infoItems03 = [
    "흡연, 음주 금지 및 반려(애완)동물 입장 금지",
    "운동장(풋살장) 내 음식물 반입 및 취사행위 금지",
    "용도에 맞는 운동화(인조잔디 전용) 착용 권장",
    "이용시간 준수 및 운동 전 충분한 준비운동",
    "시설물 임의 이동, 설치 및 파손 금지(원상회복 및 변상책임)",
    "사용 용도 이외의 사용 금지",
    "시설물 사용 후 주변 환경 정리 (경기장 내· 외부, 배출된 쓰레기는 신속히 자체 수거 처리)",
    "안전사고 발생 방지 조치(이용자의 부주의로 인한 안전사고에 대한 민·형사상 책임은 이용자 책임)",
    "시설물 사용시 순찰근무자가 예약 확인을 요구할 수 있습니다.",
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="풋살장 대관안내 Futsal"
        titleHighlight="풋살장 대관안내"
        description="부산도시공사 아르피나에서는 시민들의 건강과 편익 증진을 도모 하고자 풋살장 대관을 다음과 같이 운영하고 있습니다."
        images={images}
        showReservation={false}
        downloadInfo={{
          text: "풋살장 이용규정 다운로드",
          url: "/files/futsal_regulations.pdf",
          fileName: "futsal_regulations.pdf",
        }}
        descriptionStyle={{ textAlign: "justify" }}
      />
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>현황안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>이용시 유의사항</HeadingH4>
        <ApTable01 rows={tableRows02} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>이용요금 예약 및 절차</HeadingH4>
        <ApTable02 rows={tableRows03} />
        <InfoBoxList01 items={infoItems01} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>예약 취소 및 환불규정</HeadingH4>
        <ApTable02 rows={tableRows04} />
        <InfoBoxList01 items={infoItems02} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>승인조건 및 유의사항</HeadingH4>
        <InfoBoxList01 items={infoItems03} />
      </Box>
    </PageContainer>
  );
}
