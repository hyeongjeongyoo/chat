"use client";

import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/jj_img01.jpg",
    "/images/contents/jj_img02.jpg",
    "/images/contents/jj_img03.jpg",
    "/images/contents/jj_img04.jpg",
    "/images/contents/jj_img05.jpg",
    "/images/contents/jj_img06.jpg",
  ];

  // 링크이동 버튼 클릭 핸들러
  const handleLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const tableRows01 = [
    {
      header: "위치",
      content: "아르피나 프론트 맞은편 오른쪽 끝",
    },
    {
      header: "면적",
      content: "약 120평",
    },
    {
      header: "좌석 수",
      content: "총 240석",
    },
    {
      header: "동시 수용 인원",
      content: "회차별 식사 로테이션(3,4회 기준), 약 700 ~ 800명 수용 가능",
    },
    {
      header: "식사 안내",
      content: (
        <Flex gap={3} align="center" wrap="wrap">
          <Button
            size="sm"
            rounded="xl"
            variant="solid"
            px={4}
            py={2}
            fontWeight="bold"
            fontSize="sm"
            onClick={() =>
              handleLink(
                "https://m.blog.naver.com/3chonbapcha/223202325368"
              )
            }
            backgroundColor="#FAB20B"
            color="white"
            _hover={{
              backgroundColor: "#E4A30D",
            }}
          >
            조식 안내
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: "8px" }}
            >
              <path
                d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z"
                fill="white"
              />
            </svg>
          </Button>
          <Button
            size="sm"
            rounded="xl"
            variant="solid"
            px={4}
            py={2}
            fontWeight="bold"
            fontSize="sm"
            onClick={() =>
              handleLink(
                "https://m.blog.naver.com/3chonbapcha/223299526344"
              )
            }
            backgroundColor="#FAB20B"
            color="white"
            _hover={{
              backgroundColor: "#E4A30D",
            }}
          >
            식사 구성
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: "8px" }}
            >
              <path
                d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z"
                fill="white"
              />
            </svg>
          </Button>
        </Flex>
      ),
    },
    {
      header: "운영시간",
      content: (
        <>
          고출력 음향기기를 사용하지 않는 간단한 연회행사가 가능 (배식대 사이의
          공간을 행사진행 공간으로 이용가능) <br />
          고정 뷔페 베이 4곳 구성
        </>
      ),
    },
  ];

  const tableRows02 = [
    {
      columns: [
        { header: "구분", content: "성인" },
        { header: "요금", content: "14,000원 (부가세 포함)" },
        { header: "비고", content: "기본 요금" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "초·중·고등학생" },
        { header: "요금", content: "11,000원" },
        { header: "비고", content: "할인 적용" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "미취학 아동" },
        { header: "요금", content: "5,500원" },
        { header: "비고", content: "" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "영유아" },
        { header: "요금", content: "무료" },
        { header: "비고", content: "" },
      ],
    },
    {
      columns: [
        { header: "구분", content: "외국인 (영유아 제외)" },
        { header: "요금", content: "14,000원 (부가세 포함)" },
        { header: "비고", content: "동일 요금 적용" },
      ],
    },
  ];

  const tableRows03 = [
    {
      header: "1베이",
      content: "메인 식사 메뉴 (단체 맞춤식단 포함)",
    },
    {
      header: "2베이",
      content: "샐러드, 과일 / 아침엔 빵, 잼, 토스터",
    },
    {
      header: "3베이",
      content: "커피, 차, 쿠키, 정수대",
    },
    {
      header: "4베이",
      content: "고기류 한식 또는 중식",
    },
    {
      header: "식기/위생 관리",
      content: "모든 그릇은 전용 타올로 깨끗이 정리 후 셋업",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="대식당(제이엔제이) J&J"
        titleHighlight="대식당(제이엔제이)"
        description="아르피나 프론트 오른편 끝에 위치한 대식당 '제이앤제이'는 총 240석 규모의 뷔페형 식당으로, 사전 예약제로 운영됩니다. 단체 손님과 행사 진행에 적합한 쾌적하고 편안한 식사 공간을 제공합니다."
        images={images}
        showReservation={false}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>제이엔제이 공간 안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
      </Box>
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>이용요금 안내 (2025년 1월 1일 기준)</HeadingH4>
        <ApTable02 rows={tableRows02} />
      </Box>
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>메뉴 및 베이 구성</HeadingH4>
        <ApTable01 rows={tableRows03} />
        <Flex
          flexDir={{ base: "column", lg: "row" }}
          align="center"
          justify="center"
          gap={{ base: 10, lg: 20 }}
          mt="60px"
        >
          {/* 첫 번째 이미지와 텍스트 */}
          <Flex flexDir="column" align="center" gap={5}>
            <Image
              src="/images/contents/jj_work_img.jpg"
              alt="제이엔제이 샌드위치 박스"
              maxW="100%"
              fit="contain"
            />
            <Text
              fontSize={{ base: "14px", md: "18px", lg: "24px" }}
              textAlign="center"
            >
              제이엔제이 샌드위치 박스
            </Text>
          </Flex>

          {/* 두 번째 이미지와 텍스트 */}
          <Flex flexDir="column" align="center" gap={5}>
            <Image
              src="/images/contents/jj_work_img02.jpg"
              alt="제이엔제이 한방삼계탕"
              maxW="100%"
              fit="contain"
            />
            <Text
              fontSize={{ base: "14px", md: "18px", lg: "24px" }}
              textAlign="center"
            >
              제이엔제이 한방삼계탕
            </Text>
          </Flex>
        </Flex>
      </Box>
    </PageContainer>
  );
}
