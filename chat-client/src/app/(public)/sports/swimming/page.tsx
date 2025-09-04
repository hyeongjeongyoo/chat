"use client";

import { Box, List } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/swim_img01.jpg",
    "/images/contents/swim_img02.jpg",
    "/images/contents/swim_img03.jpg",
  ];

  const tableRows03 = [
    {
      columns: [
        {
          header: "종목",
          content: (
            <Box lineHeight={1.5}>
              수영 강습 <br />
              (월, 화, 수, 목, 금)
            </Box>
          ),
        },
        { header: "1개월 이용료", content: "105,000원" },
        { header: "사물함 이용료", content: "5,000원" },
        {
          header: "비 고",
          content: (
            <Box lineHeight={1.5}>
              ★ 아르피나 홈페이지를 통한 온라인 접수 ★ <br />
              기존회원(매월20일~24일) <br />
              신규회원은(매월25일~선착순마감) <br />
              <Box as="span" color="#FAB20B">
                ※ 개인 수건 사용 / 수건 미지급
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
        { header: "시간", content: "06:00 / 07:00 / 08:00" },
        {
          header: "강습일",
          content: (
            <Box lineHeight={1.5}>
              월요일 ~ 금요일 <br />주 5회
            </Box>
          ),
          rowSpan: 5,
        },
        {
          header: "1개월 이용료",
          content: <Box lineHeight={1.5}>105,000원</Box>,
          rowSpan: 5,
        },
        {
          header: "비 고",
          content: (
            <Box lineHeight={1.5}>
              자유수영 가능시간 <br />
              (평일 12 ~ 14시)
              <br />
              (토.공휴일 09 ~ 17시) <br />
              <Box as="span" color="red.500" fontSize="sm">
                매월 두 번째 화요일 및 <></>
                매주 일요일은 휴관입니다
              </Box>
            </Box>
          ),
          rowSpan: 5,
        },
      ],
    },
    {
      columns: [
        { header: "시간", content: "09:00 / 10:00 / 11:00" },
        { header: "강습일", content: null },
        { header: "1개월 이용료", content: null },
        { header: "비 고", content: null },
      ],
    },
    {
      columns: [
        { header: "시간", content: "14:00 / 15:00 / 16:00" },
        { header: "강습일", content: null },
        { header: "1개월 이용료", content: null },
        { header: "비 고", content: null },
      ],
    },
    {
      columns: [
        { header: "시간", content: "17:00 / 18:00" },
        { header: "강습일", content: null },
        { header: "1개월 이용료", content: null },
        { header: "비 고", content: null },
      ],
    },
    {
      columns: [
        { header: "시간", content: "19:00 / 20:00" },
        { header: "강습일", content: null },
        { header: "1개월 이용료", content: null },
        { header: "비 고", content: null },
      ],
    },
  ];

  const oneTimeFeeRows = [
    {
      columns: [
        { header: "구분", content: "성인" },
        { header: "자유수영 이용요금", content: "8,000원" },
        {
          header: "비고",
          content: (
            <Box lineHeight={1.5}>
              자유수영 가능시간 <br />
              평일 12:00 ~ 14:00 <br />
              토, 공휴일 09:00 ~ 17:00
            </Box>
          ),
          rowSpan: 6,
        },
      ],
    },
    {
      columns: [
        { header: "구분", content: "초 중 고" },
        { header: "자유수영 이용요금", content: "6,000원" },
        { header: "비고", content: null },
      ],
    },
    {
      columns: [
        { header: "구분", content: "유아" },
        { header: "자유수영 이용요금", content: "4,500원" },
        { header: "비고", content: null },
      ],
    },
    {
      columns: [
        { header: "구분", content: "(객실투숙객)성인" },
        { header: "자유수영 이용요금", content: "5,000원" },
        { header: "비고", content: null },
      ],
    },
    {
      columns: [
        { header: "구분", content: "(객실투숙객)초 중 고" },
        { header: "자유수영 이용요금", content: "4,000원" },
        { header: "비고", content: null },
      ],
    },
    {
      columns: [
        { header: "구분", content: "(객실투숙객)유아" },
        { header: "자유수영 이용요금", content: "3,500원" },
        { header: "비고", content: null },
      ],
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="수영장 Swimming"
        titleHighlight="수영장"
        description="쾌적한 실내환경과 철저한 수질 관리, 전문 강사의 체계적인 강습이 어우러진 아르피나 수영장은 다양한 프로그램으로 건강한 일상을 함께합니다."
        images={images}
        showReservation={false}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
        // downloadInfo={{
        //   text: "수영장 이용규정 다운로드",
        //   url: "/files/futsal_regulations.pdf",
        //   fileName: "futsal_regulations.pdf",
        // }}
      />
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>수영강습 이용 요금표</HeadingH4>
        <ApTable02 rows={tableRows03} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>수영 프로그램 시간표(성인반 / 50분 수업진행)</HeadingH4>
        <ApTable02 rows={tableRows04} />
      </Box>
      <Box mt={{ base: "80px", md: "100px", lg: "120px", "2xl": "180px" }}>
        <HeadingH4>1회 입장 이용요금표 </HeadingH4>
        <ApTable02 rows={oneTimeFeeRows} />
      </Box>
    </PageContainer>
  );
}
