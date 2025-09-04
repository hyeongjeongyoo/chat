"use client";

import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { List } from "@chakra-ui/react";

// 타입 정의
interface FloorImageBoxProps {
  src: string;
  alt: string;
  description: string;
  marginStart?: string;
}

interface IntroSectionProps {
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

interface FacilityInfoProps {
  title: string;
  items: string[];
}

// 층별 안내 이미지 컴포넌트
const FloorImageBox = ({
  src,
  alt,
  description,
  marginStart,
}: FloorImageBoxProps) => (
  <Flex
    direction="column"
    w={{ base: "48%", md: "17%" }}
    maxW={{ base: "48%", md: "275px" }}
    marginStart={marginStart}
    flex={{ base: "none", md: "none" }}
  >
    <Image src={src} alt={alt} objectFit="cover" flex="1" />
    <Text
      mt={{ base: 3.4, md: 4, lg: 4 }}
      color="#5B5B5B"
      fontSize={{ base: "14px", md: "xl", lg: "xl" }}
      fontWeight="400"
      textAlign={"center"}
    >
      {description}
    </Text>
  </Flex>
);

// 소개 섹션 컴포넌트
const IntroSection = ({
  number,
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
}: IntroSectionProps) => (
  <Box className="intro-box" mb={{ base: 10, md: 15, lg: 20 }}>
    <Flex
      direction={{ base: "column", lg: reverse ? "row-reverse" : "row" }}
      gap={{ base: 1, md: 2, lg: 2 }}
      align="center"
      justifyContent="space-between"
    >
      <Box
        className="image-box"
        w={{ base: "100%", lg: "48%" }}
        overflow="hidden"
      >
        <Image src={imageSrc} alt={imageAlt} objectFit="cover" />
      </Box>
      <Box className="text-box" w={{ base: "100%", lg: "48%" }} p={4}>
        <Text
          color="#FAB20B"
          fontSize={{ base: "sm", md: "md", lg: "md" }}
          fontWeight="700"
          mb={{ base: 3, md: 4, lg: 5 }}
        >
          {number}
        </Text>
        <Text
          color="#373636"
          fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
          fontWeight="700"
          mb={{ base: 5, md: 6, lg: 7 }}
          display="flex"
          alignItems="center"
          gap={{ base: 3, md: 5, lg: 5 }}
          _after={{
            content: '""',
            display: "block",
            width: "60px",
            height: "1px",
            backgroundColor: "#2E3192",
          }}
        >
          {title}
        </Text>
        <Text
          color="#373636"
          fontSize={{ base: "14px", md: "2xl", lg: "2xl" }}
          whiteSpace="pre-line"
          textAlign="justify"
        >
          {description}
        </Text>
      </Box>
    </Flex>
  </Box>
);

// 시설 정보 컴포넌트
const FacilityInfo = ({ title, items }: FacilityInfoProps) => (
  <Box flex={"1 1 0"}>
    <Text
      color="#0C8EA4"
      fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
      fontWeight="700"
      mb={{ base: 1, md: 2, lg: 2 }}
    >
      {title}
    </Text>
    <List.Root backgroundColor={"#F7F8FB"} p={5} borderRadius={"10px"}>
      {items.map((item, index) => (
        <List.Item
          key={index}
          color="#373636"
          fontSize={{ base: "14px", md: "xl", lg: "xl" }}
          fontWeight="400"
          listStyleType="none"
        >
          {item}
        </List.Item>
      ))}
    </List.Root>
  </Box>
);

export default function ParticipantsPage() {
  // 시설 규모 데이터
  const facilityScaleItems = [
    "객실 : 110실(3~7F)",
    "회의실 : 그랜드볼룸 1실, 중회의실 3실, 소회의실 3실",
    "주차 : 지하 209대, 지상 88대 (대형버스 주차 가능) 각종 편의시설",
  ];

  // 부서 안내 데이터
  const departmentItems = [
    "객실·단체 예약 : 051-731-9800",
    "스포츠센터 : 051-740-3271(3272)",
    "청소년문화센터 : 051)740-3281",
  ];

  // 층별 안내 데이터
  const floorImages = [
    {
      src: "/images/contents/intro_floor_img01.jpg",
      description: "야외잔디공원, 청소년문화센터, 로비, 커피라운지, 레스토랑",
    },
    {
      src: "/images/contents/intro_floor_img02.jpg",
      description: "골프연습장, 스포츠센터, 오션, 그랜드 볼룸",
    },
    { src: "/images/contents/intro_floor_img03.jpg", description: "객실" },
    { src: "/images/contents/intro_floor_img04.jpg", description: "객실" },
    { src: "/images/contents/intro_floor_img05.jpg", description: "객실" },
    { src: "/images/contents/intro_floor_img06.jpg", description: "객실" },
    { src: "/images/contents/intro_floor_img07.jpg", description: "객실" },
    {
      src: "/images/contents/intro_floor_img08.jpg",
      description: "클로버, 자스민, 시걸, 마리나",
    },
    {
      src: "/images/contents/intro_floor_img09.png",
      description: "편의점",
    },
    { src: "/images/contents/intro_floor_img10.jpg", description: "주차장" },
    { src: "/images/contents/intro_floor_img11.jpg", description: "주차장" },
  ];

  return (
    <PageContainer>
      <IntroSection
        number="01"
        title="아르피나 소개"
        description={`광안리 · 해운대 · 센텀시티를 잇는 이상적인 허브
        도심 속 합리적인 컨벤션 & 스테이
        
        '아름답게 피어나다'라는 뜻을 지닌 아르피나는 광안리, 해운대, 부산전시컨벤션센터(BEXCO), 센텀시티, 마린시티의 중앙에 위치하고 있어 관광과 해양 레저, 고품격 쇼핑은물론 비즈니스와 워케이션까지 진행할 수 있는 최적의 공간입니다. 다양한 타입의 객실과 회의실, 스포츠센터를 갖춘 아르피나에서 여유로운 시간을 즐겨보시기 바랍니다.
        `}
        imageSrc="/images/contents/intro_img01.jpg"
        imageAlt="아르피나 소개 이미지"
      />
      <Box mt={{ base: "50px", md: "100px", lg: "120px" }}>
        <IntroSection
          number="02"
          title="아르피나 시설"
          description="부산도시공사 아르피나는 고객의 편의를 위해 다양한 객실과 회의실은 물론, 스포츠센터,
          커피라운지, 편의점, 예약제 대식당 등을 운영하고 있습니다. 청소년 문화센터에서는 청소년
          들이 참여할 수 있는 다양한 수련 및 체험 활동도 마련되어 있습니다.
          "
          imageSrc="/images/contents/intro_img02.jpg"
          imageAlt="아르피나 시설 이미지"
          reverse={true}
        />
      </Box>
      <Box mt={{ base: "50px", md: "100px", lg: "120px" }}>
        <IntroSection
          number="03"
          title="아르피나 입지"
          description="수영만 요트경기장, 광안리, 해운대에 인접한 아르피나는 부산의 풍요로운 자연을
          만끽하기에 최적의 공간입니다. 벡스코, 시립미술관, 센텀시티 대형 백화점 등 주요 문화·상업
          시설과도 가까워 자연과 도심의 조화를 동시에 누릴 수 있습니다. 아르피나에서 여유롭고 특
          별한 시간을 경험해보시기 바랍니다.
          "
          imageSrc="/images/contents/intro_img03.jpg"
          imageAlt="아르피나 입지 이미지"
        />
      </Box>
      <Box
        className="intro-box"
        mb={{ base: "80px", md: "120px", lg: "180px" }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 5, md: 8, lg: 10 }}
          mt={{ base: 8, md: 10, lg: 12 }}
        >
          <FacilityInfo title="시설규모" items={facilityScaleItems} />
          <FacilityInfo title="부서안내" items={departmentItems} />
        </Flex>
      </Box>

      <Box className="intro-box">
        <Box>
          {/* 제목 섹션 */}
          <Box className="text-box" mb={{ base: 5, md: 6, lg: 7 }}>
            <Text
              color="#FAB20B"
              fontSize={{ base: "sm", md: "md", lg: "md" }}
              fontWeight="700"
              mb={{ base: 3, md: 4, lg: 5 }}
            >
              04
            </Text>
            <Text
              color="#373636"
              fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
              fontWeight="700"
              mb={{ base: 5, md: 6, lg: 7 }}
              display="flex"
              alignItems="center"
              gap={{ base: 5, md: 5, lg: 5 }}
              _after={{
                content: '""',
                display: "block",
                width: "60px",
                height: "1px",
                backgroundColor: "#2E3192",
              }}
            >
              아르피나 시설 층별안내
            </Text>
          </Box>

          {/* 층별 안내 이미지 */}
          <Flex
            direction={{ base: "row", md: "row" }}
            wrap="wrap"
            justifyContent={{ base: "space-between", lg: "flex-start" }}
            gap={{ base: 3, md: 8, lg: 10 }}
          >
            {floorImages.map((item, index) => (
              <FloorImageBox
                key={index}
                src={item.src}
                alt={`층별 안내 이미지 ${index + 1}`}
                description={item.description}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </PageContainer>
  );
}
