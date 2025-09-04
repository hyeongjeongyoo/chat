"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Box, Heading, Link, Text } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import InfoBoxList02 from "@/components/contents/InfoBoxList02";
import ApTable03 from "@/components/contents/ApTable03";
import HeadingH401 from "@/components/contents/HeadingH401";

export default function YouthTrainingPage() {
  const infoItems01 = [
    "청소년수련활동이란 청소년이 청소년활동에 자발적으로 참여하여 청소년 시기에 필요한 기량과 품성을 함양하는 교육적 활동으로서「청소년기본법」 제3조제7호에 따른 청소년지도자와 함께 청소년수련거리에 참여하여 배움을 실천하는 체험활동 (「청소년활동 진흥법」제2조3항)",
  ];

  // 1일 스포츠체험 일정표 데이터
  const tableRows01 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "시간", width: "30%" },
        { header: "소요시간", width: "20%" },
        { header: "단위프로그램명", width: "50%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        { content: "09:30" },
        { content: "-" },
        { content: "아르피나 도착 및 인원점검 / 활동안내 및 안전교육" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "09:30~10:20" },
        { content: "50분" },
        { content: "스포츠체험 1교시 (암벽등반, 양궁, 펜싱, 창작도미노 등)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "10:20~11:10" },
        { content: "50분" },
        { content: "스포츠체험 2교시(암벽등반, 양궁, 펜싱, 창작도미노 등)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "11:10~12:00" },
        { content: "50분" },
        { content: "스포츠체험 3교시(암벽등반, 양궁, 펜싱, 창작도미노 등)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12:00~13:00" },
        { content: "60분" },
        { content: "점심 식사" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:00~13:50" },
        { content: "50분" },
        { content: "스포츠체험 4교시(암벽등반, 양궁, 펜싱, 창작도미노 등)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:50" },
        { content: "" },
        { content: "정리 및 귀가" },
      ],
    },
  ];

  // 1일 청소년수련활동 일정표 데이터
  const tableRows02 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "시간", width: "20%" },
        { header: "소요시간", width: "15%" },
        { header: "단위프로그램명", width: "30%" },
        { header: "활동 프로그램", width: "35%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        { content: "~10:00" },
        { content: "" },
        { content: "아르피나 도착 및 인원점검" },
        {
          content:
            "• 청소년 꿈과 비젼\n• 올바른 회의진행법 & 토의\n• 도전! 하이파이브\n• 유토피아 만들기\n• 창의력 쑥쑥",
          rowSpan: 6,
          style: {
            textAlign: "center" as const,
            whiteSpace: "pre-line",
            lineHeight: "1.5",
          },
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "10:00~10:30" },
        { content: "30분" },
        { content: "여는 마당/안전교육" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "10:30~12:00" },
        { content: "90분" },
        { content: "청소년활동 1 (택1)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12:00~13:30" },
        { content: "90분" },
        { content: "점심식사" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:30~15:00" },
        { content: "90분" },
        { content: "청소년활동 2 (택1)" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "15:00" },
        { content: "" },
        { content: "정리 및 귀가" },
      ],
    },
  ];

  // 1박2일 청소년수련활동 일정표 데이터
  const tableRows03 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "시간", width: "15%" },
        { header: "소요시간", width: "10%" },
        { header: "1일차", width: "25%" },
        { header: "시간", width: "15%" },
        { header: "소요시간", width: "10%" },
        { header: "2일차", width: "25%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        { content: "~11:00" },
        { content: "" },
        { content: "아르피나 도착 및 인원점검" },
        { content: "07:00~08:00" },
        { content: "60분" },
        { content: "기상/침구정리/세면" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "11:00~12:00" },
        { content: "60분" },
        { content: "여는 마당(안전교육)" },
        { content: "08:00~09:30" },
        { content: "90분" },
        { content: "아침식사" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12:00~13:30" },
        { content: "90분" },
        { content: "점심식사" },
        { content: "09:30~11:00" },
        { content: "90분" },
        { content: "협동심 프로그램" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:30~15:00" },
        { content: "90분" },
        { content: "우리반이 최고" },
        { content: "11:00" },
        { content: "" },
        { content: "정리 및 귀가" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "15:00~17:00" },
        { content: "120분" },
        { content: "도전! 하이파이브" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [],
    },
    {
      isHeader: false,
      columns: [
        { content: "17:00~18:00" },
        { content: "60분" },
        { content: "방 배정 및 휴식" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "18:00~19:30" },
        { content: "90분" },
        { content: "저녁식사" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "19:30~21:00" },
        { content: "90분" },
        { content: "우리들의 자랑<br>(레크리에이션)" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "21:00~23:00" },
        { content: "120분" },
        { content: "자유시간/취침준비/세면" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "23:00~" },
        { content: "" },
        { content: "취침" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
  ];

  // 간부수련활동 일정표 데이터
  const tableRows04 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "시간", width: "15%" },
        { header: "소요시간", width: "10%" },
        { header: "1일차", width: "25%" },
        { header: "시간", width: "15%" },
        { header: "소요시간", width: "10%" },
        { header: "2일차", width: "25%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        { content: "~11:00" },
        { content: "" },
        { content: "아르피나 도착 및 인원점검" },
        { content: "07:00~08:00" },
        { content: "60분" },
        { content: "기상/침구정리/세면" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "11:00~12:00" },
        { content: "60분" },
        { content: "여는 마당(안전교육)" },
        { content: "08:00~09:30" },
        { content: "90분" },
        { content: "아침식사" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12:00~13:30" },
        { content: "90분" },
        { content: "점심식사" },
        { content: "09:30~11:00" },
        { content: "90분" },
        { content: "올바른 회의진행법<br>및 분임토의" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:30~14:30" },
        { content: "60분" },
        { content: "나를 소개합니다" },
        { content: "11:00" },
        { content: "" },
        { content: "정리 및 귀가" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "14:30~15:30" },
        { content: "60분" },
        { content: "행동유형별 리더찾기" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "15:30~17:00" },
        { content: "90분" },
        { content: "도전! 하이파이브" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "17:00~18:00" },
        { content: "60분" },
        { content: "방 배정 및 휴식" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "18:00~19:30" },
        { content: "90분" },
        { content: "저녁식사" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "19:30~21:00" },
        { content: "90분" },
        { content: "우리들의 자랑<br>(레크리에이션)" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "21:00~23:00" },
        { content: "120분" },
        { content: "자유시간/취침준비/세면" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "23:00~" },
        { content: "" },
        { content: "취침" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
  ];

  // 2박3일 청소년수련활동 일정표 데이터
  const tableRows05 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "시간", width: "10%" },
        { header: "소요시간", width: "8%" },
        { header: "1일차", width: "15%" },
        { header: "시간", width: "10%" },
        { header: "소요시간", width: "8%" },
        { header: "2일차", width: "15%" },
        { header: "시간", width: "10%" },
        { header: "소요시간", width: "8%" },
        { header: "3일차", width: "16%" },
      ],
    },
    // 데이터 행
    {
      isHeader: false,
      columns: [
        { content: "~11:00", rowSpan: 2 },
        { content: "", rowSpan: 2 },
        { content: "아르피나 도착<br>및 인원점검", rowSpan: 2 },
        { content: "07:00~08:00" },
        { content: "60분" },
        { content: "기상/침구정리/세면" },
        { content: "07:00~08:00" },
        { content: "60분" },
        { content: "기상/침구정리/세면" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "08:00~09:30" },
        { content: "90분" },
        { content: "아침식사" },
        { content: "08:00~09:30" },
        { content: "90분" },
        { content: "아침식사" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "11:00~12:00" },
        { content: "60분" },
        { content: "여는 마당<br>(안전교육)" },
        { content: "09:30~12:00" },
        { content: "150분" },
        { content: "놀이미션" },
        { content: "09:30~11:00" },
        { content: "90분" },
        { content: "창의력, 집중력 쑥쑥" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12:00~13:30" },
        { content: "90분" },
        { content: "점심식사" },
        { content: "12:00~13:30" },
        { content: "90분" },
        { content: "점심식사" },
        { content: "11:00" },
        { content: "" },
        { content: "정리 및 귀가" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13:30~15:00" },
        { content: "90분" },
        { content: "우리반이 최고" },
        { content: "13:30~17:00", rowSpan: 2 },
        { content: "210분", rowSpan: 2 },
        { content: "스포츠체험활동", rowSpan: 2 },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "15:00~17:00" },
        { content: "120분" },
        { content: "도전! 하이파이브" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "17:00~18:00" },
        { content: "60분" },
        { content: "방 배정 및 휴식" },
        { content: "17:00~18:00" },
        { content: "60분" },
        { content: "휴식시간" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "18:00~19:30" },
        { content: "90분" },
        { content: "저녁식사" },
        { content: "18:00~19:30" },
        { content: "90분" },
        { content: "저녁식사" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "19:30~21:00" },
        { content: "90분" },
        { content: "유토피아 만들기" },
        { content: "19:30~21:00" },
        { content: "90분" },
        { content: "우리들의 자랑<br>(레크리에이션)" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "21:00~23:00" },
        { content: "120분" },
        { content: "자유시간/<br>취침준비/세면" },
        { content: "21:00~23:00" },
        { content: "120분" },
        { content: "자유시간/<br>취침준비/세면" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "23:00~" },
        { content: "" },
        { content: "취침" },
        { content: "23:00~" },
        { content: "" },
        { content: "취침" },
        { content: "" },
        { content: "" },
        { content: "" },
      ],
    },
  ];

  return (
    <PageContainer>
      <Box>
        <InfoBoxList01 title="청소년 수련활동" items={infoItems01} />
      </Box>

      <Box mt={10}>
        <HeadingH401>일정표</HeadingH401>
        <Box>
          <Heading as="h5" fontSize="2xl" fontWeight="bold" mb={4}>
            1일 스포츠체험
          </Heading>
          <ApTable03
            rows={tableRows01}
            className="ap-table03"
            visuallyHiddenText="1일 스포츠체험 표로 시간, 소요시간, 단위프로그램명 정보 제공"
          />
        </Box>
        <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
          <Heading as="h5" fontSize="2xl" fontWeight="bold" mb={4}>
            1일 청소년수련활동
          </Heading>
          <ApTable03
            rows={tableRows02}
            className="ap-table03"
            visuallyHiddenText="1일 청소년수련활동 표로 시간, 소요시간, 단위프로그램명 정보 제공"
          />
        </Box>
        <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
          <Heading as="h5" fontSize="2xl" fontWeight="bold" mb={4}>
            1박2일 청소년수련활동
          </Heading>
          <ApTable03
            rows={tableRows03}
            className="ap-table03"
            visuallyHiddenText="1박2일 청소년수련활동 표로 시간, 소요시간, 1일차, 2일차 정보 제공"
          />
        </Box>
        <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
          <Heading as="h5" fontSize="2xl" fontWeight="bold" mb={4}>
            간부수련활동
          </Heading>
          <ApTable03
            rows={tableRows04}
            className="ap-table03"
            visuallyHiddenText="간부수련활동 표로 시간, 소요시간, 1일차, 2일차 정보 제공"
          />
        </Box>
        <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
          <Heading as="h5" fontSize="2xl" fontWeight="bold" mb={4}>
            2박3일 청소년수련활동
          </Heading>
          <ApTable03
            rows={tableRows05}
            className="ap-table03"
            visuallyHiddenText="2박3일 청소년수련활동 표로 시간, 소요시간, 1일차, 2일차, 3일차 정보 제공"
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
