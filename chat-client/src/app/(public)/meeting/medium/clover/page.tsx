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
    "/images/contents/clover_img01.jpg",
    "/images/contents/clover_img02.jpg",
    "/images/contents/clover_img03.jpg",
  ];

  const meetingRoomRows = [
    {
      columns: [
        { header: "규모", content: "173㎡" },
        { header: "사이즈", content: "가로 7.9m * 세로 21.9m * 높이 2.7m" },
        { header: "스크린", content: "100Inch" },
        { header: "정원", content: "80명" },
        { header: "표준요금", content: "770,000원" },
      ],
    },
  ];

  const floorImage = {
    src: "/images/contents/clover_floor_img.jpg",
    alt: "클로버 평면도",
  };

  const floorInfoItems = [
    {
      label: "위치",
      value: "클로버 (8층)",
    },
    {
      label: "면적",
      value: "173㎡",
    },
    {
      label: "사이즈",
      value: "가로 7.9m * 세로 21.9m * 높이 2.7m",
    },
    {
      label: "문의",
      value: "051-731-9800",
    },
  ];

  // 클로버 전용 좌석배치 정보 (ㄷ자, H자 제외)
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
        title="클로버 Clover"
        titleHighlight="클로버"
        description={
          <>
            클로버룸은 아늑하고 모던한 인테리어에 최대 80명까지 수용 가능한
            규모를 갖춘 회의실로, 기업 간담회, 워크숍, 소규모 국제회의 등 다양한
            비즈니스 행사를 안정적으로 운영하실 수 있습니다.
            <Box
              as="span"
              display="block"
              mt={{ base: "10px", md: "20px", lg: "30px" }}
              fontSize={{ base: "12px", md: "16px", xl: "20px" }}
              color="#FAB20B"
            >
              ※ 8층 야외 옥상정원에서는 회의 중간 여유로운 휴식과 함께, 도심과
              바다를 아우르는 조망을 경험하실 수 있습니다.
            </Box>
          </>
        }
        images={images}
        showReservation={true}
        buttonOnClick={() => router.push("/meeting/estimate")}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>회의실안내 (8층 클로버)</HeadingH4>
        <ApTable02 rows={meetingRoomRows} />
      </Box>
      <Box
        mt={{ base: "80px", md: "120px", lg: "180px" }}
        css={{
          "& .mr-floor-box": {
            marginTop: "0 !important",
          },
        }}
      >
        <MeetingSeatInfo seats={customSeats} />
      </Box>
      <Box
        mt={{ base: "80px", md: "120px", lg: "180px" }}
        css={{
          "& .mr-floor-box": {
            marginTop: "0 !important",
          },
        }}
      >
        {/* 평면도 섹션 */}
        <HeadingH4>클로버 평면도</HeadingH4>

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
              • 현수막 사이즈는 5,000*700mm{"\n"}• 실외 현수막 사이즈
              6,200*700mm
              {"\n"}• 유선마이크 1, 무선마이크 2{"\n"}• 빔 프로젝터, 와이파이,
              냉온수기{"\n"}• 출장뷔페 및 외부 음식물 반입 불가
            </Text>
          </Box>
        </Flex>
      </Box>
    </PageContainer>
  );
}
