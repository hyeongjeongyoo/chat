"use client";

import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/ediya_img01.jpg",
    "/images/contents/ediya_img02.jpg",
    "/images/contents/ediya_img03.jpg",
    "/images/contents/ediya_img04.jpg",
  ];
  const tableRows01 = [
    {
      header: "제공 품목",
      content: "제조 음료 (HOT/ICED), RTD 음료, 스낵, 패키지 세트",
    },
    {
      header: "행사 예시",
      content: "워크숍, 학교행사, 세미나, 대규모 회의 등",
    },
    {
      header: "세팅 방식",
      content: "전용 보온/보냉 디스펜서, 컵 및 스트로우 일괄 제공",
    },
    {
      header: "맞춤 제공",
      content: "사전 협의 시 아이템 구성 및 수량 조정 가능",
    },
    {
      header: "제공 사례",
      content: "경찰대학교, 각종 공공기관 행사 외 다수 운영",
    },
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="이디야 커피 EDIYA COFFEE"
        titleHighlight="이디야 커피"
        description="아르피나 1층에서는 이용객 및 시민 편의를 위한 이디야커피 매장이 마련되어 있습니다. 쾌적한 공간에서 커피와 음료를 즐기며 여유로운 시간을 보내보세요. 세미나 전후 휴식이나 간단한 미팅 장소로도 이용하실 수 있습니다."
        images={images}
        showReservation={false}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>이디야 케이터링 서비스안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
        <Flex flexDir="column" align="center" gap={10} mt="60px">
          <Image
            src="/images/contents/ediya_work_img.jpg"
            alt="워크샵 케이터링 참고 사진"
            maxW="100%"
            fit="contain"
          />
          <Text fontSize={{ base: "14px", md: "18px", lg: "24px" }}>
            워크샵 케이터링 참고 사진
          </Text>
        </Flex>
      </Box>
    </PageContainer>
  );
}
