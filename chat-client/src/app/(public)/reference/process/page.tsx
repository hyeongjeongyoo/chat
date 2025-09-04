"use client";

import ContentsHeading from "@/components/layout/ContentsHeading";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Icon,
  Flex,
  Highlight,
  Image,
  Table,
} from "@chakra-ui/react";
//import { FaBuilding, FaLightbulb, FaStar, FaChartLine } from "react-icons/fa";
// import { IconType } from "react-icons/lib";
// interface CompanyInfo {
//   id: number;
//   name: string;
//   keywords: string[];
//   business: string;
//   features: string;
//   vision: string;
//   icon: IconType;
//   color: string;
// }

// const companies: CompanyInfo[] = [
//   {
//     id: 1,
//     name: "오늘의 이야기 (주)",
//     keywords: ["외국인 관광객", "디지털 사이니지", "AI 맞춤 추천"],
//     business: "호텔·랜드마크 디지털 광고, 관광상품 자사몰(TRIT)",
//     features: "크리에이터 협업, 온·오프라인 연계, 데이터 기반 마케팅",
//     vision: "국내 주요 관광도시 확장, 글로벌 진출",
//     icon: FaBuilding,
//     color: "blue",
//   },
//   {
//     id: 2,
//     name: "주식회사 유니마스(UniMAS)",
//     keywords: ["크로스보더 셀링", "AI 번역·통관", "해외 이커머스"],
//     business: "통합 마켓 관리, 자동 번역 & CS, 해외 물류·통관 자동화",
//     features: "도쿄 물류창고 운영, 25년 이커머스 노하우, 맞춤 요금제",
//     vision: "글로벌 플랫폼 확장(중국·동남아), AI 고도화",
//     icon: FaChartLine,
//     color: "green",
//   },
//   {
//     id: 3,
//     name: "삼선텍(SANSUNTECH)",
//     keywords: ["AI·특허 기반", "모바일 키보드 앱(SSKboard)", "생산성"],
//     business: "GPT 연동 AI 문장 생성, 스와이프 입력 & 단축어",
//     features: "특허 3건 보유, 광고·구독 모델 병행, 시간 절약·효율 극대화",
//     vision: "다양한 AI·특허 활용 앱 확장, 선한 가치 실현",
//     icon: FaLightbulb,
//     color: "purple",
//   },
//   {
//     id: 4,
//     name: "세로라 (SEROLA)",
//     keywords: ["실리카 나노 기술", "친환경·저자극 탈취", "ESG 경영"],
//     business: "실리카 나노 탈취 방향제, B2C(온라인·오프라인) & B2B 채널",
//     features: "무독성·저자극 포뮬러, 장기간 탈취 효과, 웰니스 향기",
//     vision: "ESG 브랜드 성장, 해외 진출, 토털 웰니스 솔루션 제공",
//     icon: FaStar,
//     color: "orange",
//   },
// ];
const processInfo = [
  {
    title: "사업개요",
    content: ["해운대 도심형 청년 창업·주거 복합공간 입주기업 모집"],
  },
  {
    title: "모집분야",
    content: ["기술 기반 창업, 디자인, 크리에이터 창업"],
  },
  {
    title: "모집기간",
    content: ["2025년 02월 13일 ~ 2025년 12월 (10개월)"],
  },
  {
    title: "접수방법",
    content: ["이메일 접수: buvakim@naver.com"],
  },
  {
    title: "입주 계약 기간",
    content: [
      "최초 10개월, 1년 단위로 연장심사 후 계약기간 연장 가능 (총 계약기간 2년 이내)",
    ],
  },
  {
    title: "지원내용",
    content: ["창업공간, 시제품 제작, 교육 및 컨설팅, 마케팅, 홍보 지원"],
  },
  {
    title: "문의처",
    content: ["부산해운대지역 특화사업팀 ☎ 051-343-0109"],
  },
];
const enterSelect = [
  {
    name: "공유오피스",
    deposit: "120만원",
    fee: "10만원",
    mtfees: "포함",
  },
  {
    name: "주거공간",
    deposit: "100만원",
    fee: "10만원",
    mtfees: "포함",
  },
];

// 테이블 셀 스타일 객체 정의
const tableStyles = {
  headerCell: {
    color: "#2C65FD",
    fontWeight: "600",
    fontSize: "2xl",
    borderBottom: "2px solid #D0D0D0",
    py: 5,
  },
  nameCell: {
    color: "#4B4B4B",
    fontWeight: "600",
    fontSize: "2xl",
    borderBottom: "2px solid #D0D0D0",
    py: 5,
  },
  contentCell: {
    color: "#4B4B4B",
    fontWeight: "500",
    fontSize: "lg",
    borderBottom: "2px solid #D0D0D0",
    py: 5,
  },
};
const enterInfo = [
  {
    title: "시설소개",
    content: [
      "1층 미디어 카페 / 2층 A 여성주공용공간 / 2층 B 공유오피스 / 3층 남성주거공용공간",
    ],
  },
  {
    title: "입주 우대사항",
    content: [
      "(1순위) 해운대구 거주자",
      "(2순위) 공유오피스 주거 동시 계약자",
      "(3순위) 지역자원 활용(해운대구 반송동) 창업아이템이나 활동이 가능한 자",
    ],
  },
  {
    title: "신청대상 자격 요건",
    content: [
      "입주기업 대표자는 만 18세 이상 39세 이하 (2025.02.13 기준)",
      "입주기업 대표자의 주민등록 주소지가 “해운대구”이거나 법인 또는 개인사업자의 사업장 소재지가 “해운대구”인 경우 입주신청 자격을 인정하며 중복 인정",
    ],
  },
  {
    title: "신청 제외대상",
    content: [
      "사치향락, 도박, 유흥업소 관련 사업자",
      "중소벤처기업부 ‘중소기업창업지원법시행령상 창업지원공간 사업’ 선정된 기업 (중복수혜 불가)",
      "휴·폐업 및 타 기관 입주중인 기업",
      "금융기관 등으로부터 채무불이행으로 규제중인 자",
      "국세 및 지방세 체납 중인 개인 또는 법인 (미납 금액 존재 시)",
      "타인의 특허권, 실용신안권 등을 침해하거나 침해할 우려가 있는 사업자",
      "노숙인 복지법에 따른 노숙인 및 기초생활수급자",
      "군인복무 중인 자(단, 3434창업대 관련 훈련 등 일시적 예외에 해당이 있을 경우 신청 가능)",
      "기타 자치단체의 사업 목적과 적합하지 않다고 판단하는 경우",
    ],
  },
];

export default function CompanyListPage() {
  return (
    <Container maxW="1600px">
      <Box mb={10}>
        <ContentsHeading title="입주신청절차" />
        <Flex
          id="prgTItle"
          direction={{ base: "column", lg: "row" }}
          wrap="wrap"
          align="center"
          justify="center"
          gap={{ base: 5, lg: 8 }}
          mb="60px"
          bg="#F4F7FF"
          p={{ base: 4, lg: 8 }}
          borderRadius="3xl"
        >
          <Flex
            flex="1"
            display={{ base: "none", lg: "flex" }}
            width={{ lg: "300px" }}
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src="/images/contents/process_img01.png"
              alt="입주신청절차 이미지"
              width="auto"
              maxWidth="100%"
              height="auto"
              objectFit="cover"
            />
          </Flex>

          <Box width={{ base: "100%", lg: "calc(100% - 350px)" }}>
            <Text fontSize="xl" color="#424242">
              청년 창업의 든든한 지원자
            </Text>
            <Heading as="h3" size="4xl" mb={4}>
              <Highlight
                query="부산창업가꿈 4호점"
                styles={{ color: "#4CCEC6" }}
              >
                해운대 부산창업가꿈 4호점
              </Highlight>
            </Heading>
            <Text fontSize="xl" color="#424242">
              청년 창업가를 위한 무료 사무공간과 창업 지원 프로그램을
              제공합니다. 회의실, 미디어실 등 인프라와 함께 컨설팅, 교육,
              네트워킹 기회를 통해 청년들의 지속 가능한 창업과 성장을
              지원합니다.
            </Text>
          </Box>
        </Flex>

        <Box mb={10}>
          <Heading as="h4" mb={5} size="4xl" color="#444" fontWeight="600">
            창업가꿈 4호점 추진체계
          </Heading>
          <Box className="process-wr" mb={10}>
            <Flex
              as="ol"
              className="process-list"
              listStyleType="none"
              p={0}
              m={0}
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              gap={{ base: 4, md: 2.5 }}
              flexWrap="wrap"
            >
              <Box
                as="li"
                className="tit-box"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                border="1px solid"
                borderColor="#9E9E9E"
                borderRadius="md"
                width={{ base: "100%", md: "auto" }}
                mb={{ base: 4, md: 0 }}
              >
                <Text
                  className="tit"
                  fontWeight="600"
                  fontSize="2xl"
                  color="#2C65FD"
                  padding="10px 40px"
                >
                  추진체계
                </Text>
              </Box>

              {[
                {
                  step: "STEP1",
                  text: "입주자공고<br>(2025.02월)",
                  showArrow: true,
                },
                {
                  step: "STEP2",
                  text: "입주자 선발<br>(2025.02월)",
                  showArrow: true,
                },
                {
                  step: "STEP3",
                  text: "사업추진 및 모니터링<br>(2025.03월 ~ 2025.12월)",
                  showArrow: true,
                },
                {
                  step: "STEP4",
                  text: "사업평가<br>(2025.12월)",
                  showArrow: false,
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  as="li"
                  border="1px solid"
                  borderColor="#9E9E9E"
                  borderRadius="md"
                  position="relative"
                  padding="10px 40px"
                >
                  <Text
                    as="span"
                    display="block"
                    color="#2C65FD"
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {item.step}
                  </Text>
                  <Text
                    className="tit"
                    fontWeight="700"
                    fontSize="xl"
                    color="#05140E"
                    display="flex"
                    alignItems="center"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                    position="relative"
                    _after={
                      item.showArrow
                        ? {
                            content: '""',
                            display: "inline-block",
                            bgImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='23' viewBox='0 0 24 23' fill='none'%3E%3Ccircle cx='12' cy='11.5' r='11.5' fill='%232C65FD'/%3E%3Cpath d='M12.8523 11.8211L8.47363 7.44244L9.72467 6.19141L15.3543 11.8211L9.72467 17.4507L8.47363 16.1997L12.8523 11.8211Z' fill='%23FFFAE4'/%3E%3C/svg%3E")`,
                            width: "23px",
                            height: "23px",
                            ml: "20px",
                            verticalAlign: "middle",
                          }
                        : {}
                    }
                  />
                </Box>
              ))}
            </Flex>
          </Box>
          <Box className="prg-info-box" mb="60px">
            <Box as="ul" className="prg-info-list" listStyleType="none" p={0}>
              {processInfo.map((item, index) => (
                <Box
                  as="li"
                  key={index}
                  mb={index < processInfo.length - 1 ? 5 : 0}
                >
                  <Text
                    as="p"
                    fontWeight="600"
                    fontSize="2xl"
                    mb={5}
                    color="#0D344E"
                    className="tit"
                  >
                    {item.title}
                  </Text>
                  <Box className="txt" fontSize="lg" color="#424242">
                    {Array.isArray(item.content) ? (
                      <Box as="ul" listStyleType="none">
                        {item.content.map((contentItem, contentIndex) => (
                          <Box
                            as="li"
                            key={contentIndex}
                            mb={
                              item.content.length > 1 &&
                              contentIndex < item.content.length - 1
                                ? 1
                                : 0
                            }
                            position="relative"
                            pl={4}
                            _before={{
                              content: '""',
                              display: "block",
                              position: "absolute",
                              left: 0,
                              top: "12px",
                              width: "4px",
                              height: "4px",
                              bg: "#4CCEC6",
                            }}
                          >
                            {contentItem}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      item.content
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box mb={10}>
          <Heading as="h4" mb={5} size="4xl" color="#444" fontWeight="600">
            입주기업 선정방법
          </Heading>
          <Box className="process-wr" mb={10}>
            <Flex
              as="ol"
              className="process-list"
              listStyleType="none"
              p={0}
              m={0}
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              gap={{ base: 4, md: 2.5 }}
              flexWrap="wrap"
            >
              <Box
                as="li"
                className="tit-box"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                border="1px solid"
                borderColor="#9E9E9E"
                borderRadius="md"
                width={{ base: "100%", md: "auto" }}
                mb={{ base: 4, md: 0 }}
              >
                <Text
                  className="tit"
                  fontWeight="600"
                  fontSize="2xl"
                  color="#2C65FD"
                  padding="10px 40px"
                >
                  선정방법
                </Text>
              </Box>

              {[
                {
                  step: "1차 서면심사",
                  text: "부적격자 확인 및서류 보완 <br>(25.02.20)",
                  showArrow: true,
                },
                {
                  step: "서류접수 마감",
                  text: "서류접수자 및발표심사 안내 <br>(25.02.20)",
                  showArrow: true,
                },
                {
                  step: "2차 발표심사",
                  text: "심사위원회 운영 <br>(25.02.21)",
                  showArrow: true,
                },
                {
                  step: "최종선정 공지",
                  text: "개별통보 <br>(25.02.24)",
                  showArrow: false,
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  as="li"
                  border="1px solid"
                  borderColor="#9E9E9E"
                  borderRadius="md"
                  position="relative"
                  padding="10px 40px"
                >
                  <Text
                    as="span"
                    display="block"
                    color="#2C65FD"
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {item.step}
                  </Text>
                  <Text
                    className="tit"
                    fontWeight="700"
                    fontSize="xl"
                    color="#05140E"
                    display="flex"
                    alignItems="center"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                    position="relative"
                    _after={
                      item.showArrow
                        ? {
                            content: '""',
                            display: "inline-block",
                            bgImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='23' viewBox='0 0 24 23' fill='none'%3E%3Ccircle cx='12' cy='11.5' r='11.5' fill='%232C65FD'/%3E%3Cpath d='M12.8523 11.8211L8.47363 7.44244L9.72467 6.19141L15.3543 11.8211L9.72467 17.4507L8.47363 16.1997L12.8523 11.8211Z' fill='%23FFFAE4'/%3E%3C/svg%3E")`,
                            width: "23px",
                            height: "23px",
                            ml: "20px",
                            verticalAlign: "middle",
                          }
                        : {}
                    }
                  />
                </Box>
              ))}
            </Flex>
          </Box>

          <Box overflowX="auto" mb={5}>
            <Flex
              as="p"
              fontWeight="600"
              fontSize="2xl"
              mb={4}
              color="#000"
              className="prg-comp-tit"
              flexFlow="row wrap"
              alignItems="center"
              gap={3}
              _before={{
                content: '""',
                width: "30px",
                height: "30px",
                backgroundImage: "url('/images/contents/oper_pgr_ico01.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              입주조건
            </Flex>
            <Table.Root
              size="lg"
              className="prg-comp-tbl"
              borderTop="2px solid #0D344E"
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    구분
                  </Table.ColumnHeader>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    보증금
                  </Table.ColumnHeader>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    월 임대료
                  </Table.ColumnHeader>
                  <Table.ColumnHeader {...tableStyles.headerCell}>
                    관리비
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {enterSelect.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell {...tableStyles.nameCell}>
                      {item.name}
                    </Table.Cell>
                    <Table.Cell {...tableStyles.nameCell}>
                      {item.deposit}
                    </Table.Cell>
                    <Table.Cell {...tableStyles.nameCell}>
                      {item.fee}
                    </Table.Cell>
                    <Table.Cell {...tableStyles.nameCell}>
                      {item.mtfees}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Box className="prg-info-box" mb="60px">
            <Box as="ul" className="prg-info-list" listStyleType="none" p={0}>
              {enterInfo.map((item, index) => (
                <Box
                  as="li"
                  key={index}
                  mb={index < enterInfo.length - 1 ? 5 : 0}
                >
                  <Text
                    as="p"
                    fontWeight="600"
                    fontSize="2xl"
                    mb={5}
                    color="#0D344E"
                    className="tit"
                  >
                    {item.title}
                  </Text>
                  <Box className="txt" fontSize="lg" color="#424242">
                    {Array.isArray(item.content) ? (
                      <Box as="ul" listStyleType="none">
                        {item.content.map((contentItem, contentIndex) => (
                          <Box
                            as="li"
                            key={contentIndex}
                            mb={
                              item.content.length > 1 &&
                              contentIndex < item.content.length - 1
                                ? 1
                                : 0
                            }
                            position="relative"
                            pl={4}
                            _before={{
                              content: '""',
                              display: "block",
                              position: "absolute",
                              left: 0,
                              top: "12px",
                              width: "4px",
                              height: "4px",
                              bg: "#4CCEC6",
                            }}
                          >
                            {contentItem}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      item.content
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
