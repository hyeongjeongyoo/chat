"use client";

import { Box, Text } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import ApTable01 from "@/components/contents/ApTable01";
import HeadingH4 from "@/components/contents/HeadingH4";

export default function ParticipantsPage() {
  const images = [
    "/images/contents/seven_img01.jpg",
    "/images/contents/seven_img02.jpg",
    "/images/contents/seven_img03.jpg",
  ];

  const tableRows01 = [
    {
      header: "위치",
      content: "아르피나 건물 지하 1층",
    },
    {
      header: "운영시간",
      content: "오전 7시 ~ 오후 11시 30분까지(연중무휴)",
    },
  ];

  const tableRows02 = [
    {
      header: "간편 식사류",
      content: "도시락, 김밥, 샌드위치 등 간편 식사류",
    },
    {
      header: "음료",
      content: "커피, 생수, 탄산음료 등 각종 음료",
    },
    {
      header: "스낵류",
      content: "과자, 아이스크림 등 스낵류",
    },
    {
      header: "생활필수품",
      content: "휴지, 세면용품, 마스크 등 생활필수품",
    },
  ];

  const usageGuides = [
    "• 쓰레기는 지정된 장소에 분리배출 부탁드립니다.",
    "• 음식을 드신 후 자리를 정돈해 주세요.",
    "• 미성년자는 주류ㆍ담배를 구매하실 수 없습니다.",
    "• 반려동물 출입은 제한됩니다.",
  ];

  return (
    <PageContainer>
      <InfoTopBox
        title="편의점 세븐일레븐 SEVEN ELEVEN"
        titleHighlight="편의점 세븐일레븐"
        description="아르피나를 방문하신 고객들의 편의를 위해 세븐일레븐이 함께합니다. 간편한 식사부터 생활용품, 음료 등 다양한 상품을 구매하실 수 있습니다."
        images={images}
        showReservation={false}
        descriptionStyle={{
          textAlign: "justify",
          lineHeight: "1.3",
        }}
      />
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>세븐일레븐 공간 안내</HeadingH4>
        <ApTable01 rows={tableRows01} />
      </Box>
      <Box mt={{ base: "80px", md: "120px", lg: "180px" }}>
        <HeadingH4>주요 취급 품목</HeadingH4>
        <ApTable01 rows={tableRows02} />
      </Box>
      <Box mt={{ base: "30px", md: "80px", lg: "100px" }}>
        <Box
          className="oper-guide"
          p={{ base: 5, md: 7, lg: 10 }}
          style={{
            backgroundColor: "#F7F8FB",
            borderRadius: "20px",
          }}
        >
          <Text
            color="#393939"
            fontWeight="medium"
            fontSize={{ base: "18px", lg: "24px" }}
            mb={2}
          >
            - 이용안내
          </Text>
          {usageGuides.map((guide, index) => (
            <Text
              key={index}
              mt={index === 0 ? 0 : 2}
              fontSize={{ base: "14px", lg: "18px" }}
              fontWeight="300"
            >
              {guide}
            </Text>
          ))}
        </Box>
      </Box>
    </PageContainer>
  );
}
