"use client";

import { Box, List } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import Image from "next/image";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/golf_img01.jpg",
    "/images/contents/golf_img03.jpg",
    "/images/contents/golf_img02.jpg",
  ];

  const tableRows01 = [
    {
      header: "연습장",
      content: "2층부터 4층까지 총 48타석의 연습장",
    },
    {
      header: "드라이버레인지",
      content: "90미터 비거리 드라이버레인지",
    },
    {
      header: "특징",
      content:"부산 최고의 어프로치, 퍼팅 실전 연습장",
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
        { header: "종목", content: "골프 연습장" },
        { header: "1개월", content: "200,000원" },
        { header: "3개월(5% DC)", content: "570,000원" },
        {
          header: "비 고",
          content: (
            <Box lineHeight={1.5}>
              휴회 규정 <br />
              1개월 등록시(7일/1회) <br />
              3개월 등록시(7~30일) <br />
              <Box as="span" color="red.500" fontSize="sm">
                매월 두 번째 화요일은 휴관입니다.
              </Box>
            </Box>
          ),
        },
      ],
    },
  ];

  const tableRows04 = [
    {
      columns: [
        { header: "구분", content: "성인" },
        { header: "70분", content: "17,000원" },
        { header: "90분", content: "20,000원" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "초 중 고" },
        { header: "70분", content: "12,000원" },
        { header: "90분", content: "-" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "(객실 투숙객) 성인" },
        { header: "70분분", content: "13,000원" },
        { header: "90분", content: "-" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "(객실 투숙객) 초 중 고" },
        { header: "70분분", content: "10,000원" },
        { header: "90분", content: "-" },
      ],
    },
  ];

  const infoItems01 = [
    <>국가유공자(본인) 10%</>,
    <Box>
      다자녀, 다문화 가정(성인) 등록 시 10%
      <Box color="red.500" fontSize="sm">
        ※ 증빙서류 제출해주셔야 할인 가능합니다.
      </Box>
    </Box>,
    <>휴회·탈회 신청은 방문하여 신청서 작성 및 회원카드 반납하셔야 합니다.</>,
  ];

  const infoItems02 = [
    "천재지변 등 불가항력적인 사유료 시설 사용이 불가능할 경우, 또는 관리·운영에 따라 사용이 불가능할 경우 100% 환급",
    "당일, 우천 등으로 인한 사용일 당일 취소 시 아르피나 스포츠센터(740-3271)로 전화 문의 바랍니다.",
  ];

  const infoItems03 = [
    "흡연, 음주 금지 및 반려(애완)동물 입장 금지",
    "운동장(골프장) 내 음식물 반입 및 취사행위 금지",
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
        title="골프장 Golf"
        titleHighlight="골프장"
        description={`푸른 창공을 향해 쏘아올리는 상쾌한 샷!

        해운대 바닷바람이 스치는 전망 좋은 아르피나 골프연습장은 쾌적한 환경 속에서 골프 연습의 즐거움을 누릴 수 있는 공간입니다.
        `}
        images={images}
        showReservation={false}
        // downloadInfo={{
        //   text: "골프장 이용규정 다운로드",
        //   url: "/files/futsal_regulations.pdf",
        //   fileName: "futsal_regulations.pdf",
        // }}
      />
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>골프 시설 안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>골프연습장 이용 요금표</HeadingH4>
        <ApTable02 rows={tableRows03} />
        <InfoBoxList01 items={infoItems01} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>1회 입장 이용요금표</HeadingH4>
        <ApTable02 rows={tableRows04} />
      </Box>
    </PageContainer>
  );
}
