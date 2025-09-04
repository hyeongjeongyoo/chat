"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import MeetingSeatInfo from "@/components/contents/MeetingSeatInfo";
import MeetingFloorInfo from "@/components/contents/MeetingFloorInfo";
import HeadingH4 from "@/components/contents/HeadingH4";
import ApTable02 from "@/components/contents/ApTable02";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ParticipantsPage() {
  const router = useRouter();
  const images = [
    "/images/contents/ocean_img01.jpg",
    "/images/contents/ocean_img02.jpg",
    "/images/contents/ocean_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "59.28㎡" },
        { header: "사이즈", content: "가로 7.8m * 세로 7.8m * 높이 2.7m" },
        { header: "스크린", content: "80Inch" },
        { header: "정원", content: "20명" },
        { header: "표준요금", content: "220,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/ocean_floor_img.jpg",
    alt: "오션 평면도",
  };

  const floorInfoItems = [
    {
      text: "• 현수막 사이즈는 4,000*600mm",
    },
    {
      text: "• 실외 현수막 사이즈 6,200*700mm",
    },
    {
      text: "• 전자칠판, 와이파이, 냉온수기",
    },
    {
      text: "• 출장뷔페 및 외부 음식물 반입 불가",
    },
  ];

  // 오션 전용 좌석배치 정보 (I자 사용)
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
      imageSrc: "/images/contents/seat_img03.jpg",
      alt: "좌석배치 정보",
      title: "ㄷ자",
    },
    {
      imageSrc: "/images/contents/seat_img07.jpg",
      alt: "좌석배치 정보",
      title: "I자",
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
        title="오션 Ocean"
        titleHighlight="오션"
        description="오션룸은 2층에 위치한 회의실로 최대20명 까지 수용 가능한 규모로, 소규모 기업 간담회, 워크숍, 
        세미나 등 다양한 비즈니스 행사를 안정적으로 운영하실 수 있습니다."
        images={images}
        showReservation={true}
        buttonOnClick={() => router.push("/meeting/estimate")}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>회의실안내 (2층 오션)</HeadingH4>
        <ApTable02 rows={meetingRoomRows} />
      </Box>
      <Box
        mt={{ base: "80px", md: "120px", lg: "180px" }}
        css={{
          "& .mr-seat-box": {
            marginTop: "0 !important",
          },
          "& .mr-seat-list": {
            "@media (min-width: 1024px)": {
              justifyContent: "space-between !important",
              gap: "0 !important",
            },
          },
        }}
      >
        <MeetingSeatInfo seats={customSeats} />
      </Box>

      {/* 평면도 및 시설정보 */}
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>오션 평면도</HeadingH4>

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
              mb={{ base: "15px", md: "30px", lg: "50px" }}
            >
              - 이용안내
            </Text>
            <Text
              fontSize={{ base: "14px", md: "18px", lg: "20px" }}
              color="#393939"
              lineHeight="1.6"
              whiteSpace="pre-line"
            >
              {floorInfoItems.map((item, index) => item.text).join("\n")}
            </Text>
          </Box>
        </Flex>
      </Box>
    </PageContainer>
  );
}
