"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import { Box, Text, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ParticipantsPage() {
  const router = useRouter();

  // 모바일과 데스크톱에서 다른 표준요금 표시
  const standardFeeContent = useBreakpointValue({
    base: (
      <>
        1,980,
        <br />
        000원
      </>
    ),
    md: "1,980,000원",
  });

  const images = [
    "/images/contents/grand_img01.jpg",
    "/images/contents/grand_img02.jpg",
    "/images/contents/grand_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "543.15㎡" },
        { header: "사이즈", content: "가로 20.715m * 세로 26.22.m * 높이 4m" },
        { header: "스크린", content: "200Inch" },
        { header: "정원", content: "250명" },
        { header: "표준요금", content: standardFeeContent },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/grand_floor_img.jpg",
    alt: "그랜드 볼룸 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "그랜드볼륨(2층-국제회의실)",
    },
    {
      label: "면적",
      value: "543.15㎡",
    },
    {
      label: "사이즈",
      value: "가로 20.715m * 세로 26.22.m * 높이 4m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  // 그랜드 볼룸 전용 좌석배치 정보 (ㄷ자, H자 제외)
  const customSeats = [
    {
      imageSrc: "/images/contents/seat_img01.jpg",
      alt: "강의식",
      title: "강의식",
    },
    {
      imageSrc: "/images/contents/seat_img02.jpg",
      alt: "극장식",
      title: "극장식",
    },
    {
      imageSrc: "/images/contents/seat_img05.jpg",
      alt: "좌석배치 정보",
      title: "T자",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="그랜드 볼룸 Grand Ballroom"
        titleHighlight="그랜드 볼룸"
        description="그랜드볼룸은 아르피나 최대 규모로 250명까지 수용 가능한 규모를 갖춘 회의실로 대규모 국
          제회의와 학회, 기업 연수까지 다양한 형태의 행사가 가능한 회의실로, 음향·조명·빔프로젝터
          등 고급 기자재를 완비해 품격 있는 행사를 연출하실 수 있습니다."
        images={images}
        showReservation={true}
        buttonOnClick={() => router.push("/meeting/estimate")}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>회의실안내 (2층 그랜드 볼룸)</HeadingH4>
        <ApTable02 rows={meetingRoomRows} />
      </Box>
      <Box
        mt={{ base: "80px", md: "120px", lg: "180px" }}
        gap={{ base: 8, md: 15, lg: 20 }}
      >
        <MeetingSeatInfo seats={customSeats} />
      </Box>
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        {/* 평면도 섹션 */}
        <HeadingH4>그랜드 볼룸 평면도</HeadingH4>

        {/* 평면도 이미지와 이용안내 박스를 나란히 배치 */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 5, md: 10, lg: 20 }}
          align={{ base: "center", lg: "flex-start" }}
          mt={{ base: "15px", md: "20px", lg: "25px" }}
        >
          {/* 평면도 이미지 */}
          <Box
            borderRadius="10px"
            overflow="hidden"
            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
            maxW={{ base: "100%", md: "80%", lg: "40%" }}
            flex={{ base: "none", lg: "0 0 40%" }}
          >
            <img
              src={floorImage.src}
              alt={floorImage.alt}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>

          {/* 이용안내 텍스트 박스 */}
          <Box
            p={{ base: "20px", md: "30px", lg: "40px" }}
            bg="#F7F8FB"
            borderRadius="20px"
            flex={{ base: "none", lg: "1" }}
            w={{ base: "100%", lg: "auto" }}
          >
            <Text
              fontSize={{ base: "16px", md: "20px", lg: "24px" }}
              color="#393939"
              lineHeight="1.8"
              fontWeight="medium"
              mb={{ base: "15px", md: "20px" }}
            >
              - 이용안내
            </Text>
            <Text
              fontSize={{ base: "14px", md: "18px", lg: "20px" }}
              color="#393939"
              lineHeight="1.6"
              whiteSpace="pre-line"
            >
              • 실내 현수막 사이즈는 11,000*900mm{"\n"}• 실외 현수막 사이즈
              6,200*700mm{"\n"}• 유선마이크 2, 무선마이크 3{"\n"}• 빔 프로젝터,
              와이파이, 냉온수기, 대기실{"\n"}• 출장뷔페 및 외부 음식물 반입
              불가
            </Text>
          </Box>
        </Flex>
      </Box>
    </PageContainer>
  );
}
