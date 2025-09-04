"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Box, Link, Text } from "@chakra-ui/react";
import InfoBoxList01 from "@/components/contents/InfoBoxList01";
import InfoBoxList02 from "@/components/contents/InfoBoxList02";
import ApTable03 from "@/components/contents/ApTable03";
import HeadingH401 from "@/components/contents/HeadingH401";

// 다운로드 링크 컴포넌트
const DownloadLink = ({ href, title }: { href: string; title: string }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    color="blue.500"
    textDecoration="underline"
  >
    다운로드
  </Link>
);

export default function YouthActivityPage() {
  const infoItems01 = [
    "관련근거 : 청소년활동진흥법 제35조(청소년수련활동인증제도의 운영)",
    "인증마크 : 안전하고 신뢰할 수 있는 프로그램을 선택하기 위해 국가인증제도인 청소년 수련 활동 인증제 마크를 확인하세요!",
  ];
  const infoItems02 = [
    "맞춤형 참여 : 청소년의 눈높이에 맞는 다양하고 재미있는 인증수련활동에 참여합니다.",
    "안전과 전문성 : 안전한 활동 환경을 갖추고, 전문성을 지닌 지도자와 함께합니다.",
    "체계적 관리 : 인증신청, 수시점검, 사후관리 등 꼼꼼하게 관리된 프로그램에 참여합니다.",
    "경험의 활용 : 인증수련활동 참여 후 여성가족부장관 명의의 참여기록확인서를 발급받을 수 있고 포트폴리오를 작성하여 관리 및 활용할 수 있습니다. ",
  ];
  const infoItems03 = [
    "안전한 수련활동을 위해 수련시설 종합평가결과 '적정' 이상을 받은 수련 시설인지 확인합니다.",
    "참가인원이 150명 이상시 꼭 인증프로그램 진행합니다.",
  ];
  const infoItems04 = ["전화 : 051-740-3263", "이메일 : mjk7189@bmc.busan.kr"];
  // 청소년 수련활동 인증프로그램 테이블 데이터
  const tableRows01 = [
    // 헤더 행
    {
      isHeader: true,
      columns: [
        { header: "NO", width: "5%" },
        { header: "기간", width: "10%" },
        { header: "인증번호", width: "10%" },
        { header: "프로그램명", width: "20%" },
        { header: "인증기간", width: "15%" },
        { header: "대상", width: "10%" },
        { header: "인원", width: "10%" },
        { header: "영역", width: "10%" },
        { header: "일정표", width: "10%" },
      ],
    },
    // 1일 프로그램
    {
      isHeader: false,
      columns: [
        { content: "1" },
        { content: "1일", rowSpan: 8 },
        { content: "7586" },
        { content: "레저스포츠 체험활동" },
        { content: "~ 2023-05-29" },
        { content: "초등" },
        { content: "200" },
        { content: "스포츠" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7586]-레저스포츠체험-초등-일정표.pdf"
              title="레저스포츠 체험활동 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "2" },
        { content: "1731" },
        { content: "레저스포츠 체험활동" },
        { content: "~ 2027-12-05" },
        { content: "중등" },
        { content: "200" },
        { content: "스포츠" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7525]-레저스포츠체험-중등-일정표.pdf"
              title="레저스포츠 체험활동 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "3" },
        { content: "9302" },
        { content: "R고보면 우리는 친구" },
        { content: "~ 2025-04-28" },
        { content: "고등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9302]-R고보면-우리는-친구-일정표.pdf"
              title="R고보면 우리는 친구 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "4" },
        { content: "9685" },
        { content: "꿈을 향해 도전! 도전!" },
        { content: "~ 2025-10-13" },
        { content: "중등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9685]-꿈을-향해-도전!-도전!-일정표.pdf"
              title="꿈을 향해 도전! 도전! 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "5" },
        { content: "9301" },
        { content: "안녕! 친구야" },
        { content: "~ 2025-04-28" },
        { content: "초등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9301]-안녕!-친구야-일정표.pdf"
              title="안녕! 친구야 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "6" },
        { content: "9452" },
        { content: "주인공은 나야~나!" },
        { content: "~ 2025-06-23" },
        { content: "중등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9452]-주인공은-나야~나!-일정표.pdf"
              title="주인공은 나야~나! 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "7" },
        { content: "8693" },
        { content: "함께가자 친구야" },
        { content: "~ 2024-10-14" },
        { content: "중등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[8693]-함께가자-친구야-일정표.pdf"
              title="함께가자 친구야 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "8" },
        { content: "8617" },
        { content: "창의력 날개달기" },
        { content: "~ 2024-07-22" },
        { content: "초등" },
        { content: "40" },
        { content: "창의성" },
        {
          content: (
            <DownloadLink
              href="/public/files/[8617]-창의력-날개달기-일정표.pdf"
              title="창의력 날개달기 일정표"
            />
          ),
        },
      ],
    },
    // 1박 2일 프로그램
    {
      isHeader: false,
      columns: [
        { content: "9" },
        { content: "1박 2일", rowSpan: 10 },
        { content: "7794" },
        { content: "도전하는리더" },
        { content: "~ 2023-08-21" },
        { content: "초등" },
        { content: "150" },
        { content: "간부" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7794]-도전하는-리더(초등)-일정표.pdf"
              title="도전하는리더 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "10" },
        { content: "7585" },
        { content: "도전하는리더" },
        { content: "~ 2023-05-29" },
        { content: "중등" },
        { content: "150" },
        { content: "간부" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7585]-도전하는-리더(중등)-일정표.pdf"
              title="도전하는리더 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "11" },
        { content: "7663" },
        { content: "도전하는리더" },
        { content: "~ 2023-06-26" },
        { content: "고등" },
        { content: "150" },
        { content: "간부" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7663]-도전하는-리더(고등)-일정표.pdf"
              title="도전하는리더 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "12" },
        { content: "9204" },
        { content: "리더가 리더에게" },
        { content: "~ 2025-03-31" },
        { content: "초등" },
        { content: "150" },
        { content: "간부(오후)" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9204]-리더가-리더에게-일정표.pdf"
              title="리더가 리더에게 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "13" },
        { content: "9341" },
        { content: "리더의 품격" },
        { content: "~ 2025-05-26" },
        { content: "고등" },
        { content: "150" },
        { content: "간부(오후)" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9341]-리더의-품격-일정표.pdf"
              title="리더의 품격 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "14" },
        { content: "9154" },
        { content: "자신감 UP 인성Up 리더십" },
        { content: "~ 2025-03-31" },
        { content: "중등" },
        { content: "150" },
        { content: "간부(오후)" },
        {
          content: (
            <DownloadLink
              href="/public/files/[9154]-자신감UP-인성UP-리더십-일정표.pdf"
              title="자신감 UP 인성Up 리더십 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "15" },
        { content: "1812" },
        { content: "친구야 함께가자" },
        { content: "~ 2028-01-30" },
        { content: "중등" },
        { content: "200" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7021]-친구야-함께가자-일정표.pdf"
              title="친구야 함께가자 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "16" },
        { content: "8571" },
        { content: "하나되는 우리" },
        { content: "~ 2024-06-24" },
        { content: "중등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[8571]-하나되는-우리-일정표.pdf"
              title="하나되는 우리 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "17" },
        { content: "8631" },
        { content: "하나된 열정, 하나된 우리" },
        { content: "~ 2024-08-19" },
        { content: "고등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[8631]-하나된-열정,-하나된-우리-일정표.pdf"
              title="하나된 열정, 하나된 우리 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "18" },
        { content: "8572" },
        { content: "함께가는 우리" },
        { content: "~ 2024-06-24" },
        { content: "초등" },
        { content: "150" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[8572]-함께가는-우리-일정표.pdf"
              title="함께가는 우리 일정표"
            />
          ),
        },
      ],
    },
    // 2박 3일 프로그램
    {
      isHeader: false,
      columns: [
        { content: "19" },
        { content: "2박 3일", rowSpan: 2 },
        { content: "1813" },
        { content: "반갑다친구야" },
        { content: "~ 2028-01-30" },
        { content: "중등" },
        { content: "240" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7020]-반갑다-친구야-일정표.pdf"
              title="반갑다친구야 일정표"
            />
          ),
        },
      ],
    },
    {
      isHeader: false,
      columns: [
        { content: "20" },
        { content: "1814" },
        { content: "위아더프렌드" },
        { content: "~ 2028-01-30" },
        { content: "중등" },
        { content: "240" },
        { content: "학년" },
        {
          content: (
            <DownloadLink
              href="/public/files/[7618]-위아더-프렌드-일정표.pdf"
              title="위아더프렌드 일정표"
            />
          ),
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <Box>
        <InfoBoxList01 title="청소년 수련활동동" items={infoItems01} />
      </Box>
      <Box mt={10}>
        <InfoBoxList02
          title="인증 받은 수련활동의 좋은점"
          subtitle="인증 받는 수련활동에 참가하면 어떤 점이 좋을까요?"
          items={infoItems02}
        />
      </Box>
      <Box mt={10}>
        <InfoBoxList01
          title="확인사항"
          subtitle="수련활동 참가 전 꼭 확인해야 할 사항이 있나요?"
          items={infoItems03}
        />
      </Box>
      <Box mt={10}>
        <HeadingH401>청소년 수련활동 인증프로그램</HeadingH401>
        <ApTable03
          rows={tableRows01}
          className="ap-table03"
          visuallyHiddenText="청소년 수련활동 인증프로그램표로 No, 기간, 인증번호, 프로그램명, 인증기간, 대상, 인원, 영역, 일정표 정보 제공"
        />
      </Box>
      <Box mt={10}>
        <InfoBoxList02
          title="문의사항"
          subtitle="궁금한 점이 있으시다면 청소년문화센터로 문의하시길 바랍니다."
          items={infoItems04}
        />
      </Box>
    </PageContainer>
  );
}
