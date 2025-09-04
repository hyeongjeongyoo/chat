"use client";

import {
  Box,
  Flex,
  Text,
  Link,
  Image,
  Heading,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import TransportCard from "@/components/contents/TransportCard";
import InfoDetailBox from "@/components/contents/InfoDetailBox";
import { useEffect } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

export default function ParticipantsPage() {
  const transportInfo01 = [
    {
      label: "자가용",
      content: (
        <>
          현재위치 → 아르피나
          <br />▸ 부산 해운대구 해운대로 35 (우동 1417번지)
        </>
      ),
    },
    {
      label: "버스",
      content: (
        <>
          현재위치 → 아르피나
          <br />
          ▸ 정류소: 올림픽교차로, 해강중고교
          <br />▸ 이용노선: 31, 38, 39, 100, 307 등
        </>
      ),
    },
    {
      label: "택시",
      content: (
        <>
          현재위치 → 아르피나
          <br /> ▸ 약 10~20분 소요 (지역에 따라 상이)
        </>
      ),
    },
    {
      label: "지하철",
      content: (
        <>
          현재위치 → 아르피나
          <br />▸ 2호선 벡스코역 하차, 3번 출구 → 도보 300m
        </>
      ),
    },
  ];

  const transportInfo02 = [
    {
      label: "자가용",
      content: (
        <>
          김해공항 → 아르피나
          <br />▸ 약 50~60분 소요
        </>
      ),
    },
    {
      label: "버스",
      content: (
        <>
          김해공항 → 올림픽교차로
          <br />▸ 정류소 하차 후 도보 이동
        </>
      ),
    },
    {
      label: "택시",
      content: (
        <>
          김해공항 → 아르피나
          <br />▸ 약 50~60분 소요
        </>
      ),
    },
    {
      label: "지하철",
      content: (
        <>
          김해공항역 → 서면역 환승 → 벡스코역 하차
          <br />▸ 도보 300m (약 1시간 소요)
        </>
      ),
    },
  ];

  const transportInfo03 = [
    {
      label: "자가용",
      content: (
        <>
          부산역 → 아르피나
          <br />▸ 해운대로 → 우동 진입
        </>
      ),
    },
    {
      label: "버스",
      content: (
        <>
          부산역 → 벡스코 또는 올림픽교차로 방면
          <br />▸ 정류소 하차 후 도보 이동
        </>
      ),
    },
    {
      label: "택시",
      content: (
        <>
          부산역 → 아르피나
          <br /> ▸ 약 30분 소요
        </>
      ),
    },
    {
      label: "지하철",
      content: (
        <>
          부산역(1호선) → 서면환승 → 2호선 벡스코역 하차
          <br />▸ 3번 출구 도보 300m
        </>
      ),
    },
  ];

  const transportInfo04 = [
    {
      label: "자가용",
      content: (
        <>
          자가용 (서울) : 서울 → 원동IC → 해운대로 → 아르피나
          <br />▸ 약 5시간 20분
        </>
      ),
    },
    {
      label: "자가용",
      content: (
        <>
          자가용 (원동 IC) : 원동IC → 해운대로 → 아르피나
          <br />▸ 약 30분
        </>
      ),
    },
  ];

  const transportInfo05 = [
    {
      label: "지하철",
      content: (
        <>
          2호선 벡스코역 하차 → 3번 출구
          <br />▸ 도보 약 300m
        </>
      ),
    },
    {
      label: "정류소",
      content: (
        <>
          올림픽교차로 버스 번호 : 31, 39, 40, 63, 100, 100-1, 115-1, 141, 181,
          1001, 1006, 1011
        </>
      ),
    },
    {
      label: "정류소",
      content: <>해강중고교 버스 번호 : 38, 139, 307, 1003</>,
    },
  ];

  // 반응형 값들
  const gap = useBreakpointValue({ base: 4, md: 10, lg: 20 });
  const cardGap = useBreakpointValue({ base: 2, md: 3, lg: 4 });
  const sectionGap = useBreakpointValue({ base: 6, md: 8, lg: 10 });
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl", lg: "3xl" });
  const titleSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });
  const textSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });
  const iconSize = useBreakpointValue({ base: "16px", md: "18px", lg: "20px" });
  const svgSize = useBreakpointValue({ base: "35", md: "40", lg: "45" });
  const mapHeight = useBreakpointValue({
    base: "300px",
    md: "350px",
    lg: "400px",
  });
  const flexDirection = useBreakpointValue({ base: "column", lg: "row" });

  useEffect(() => {
    // HTML 소스를 그대로 삽입
    const mapContainer = document.getElementById(
      "daumRoughmapContainer1750370314307"
    );
    if (mapContainer) {
      // 기존 내용 제거
      mapContainer.innerHTML = "";

      // HTML 소스 그대로 삽입
      const htmlContent = `
        <!-- * 카카오맵 - 지도퍼가기 -->
        <!-- 1. 지도 노드 -->
        <div id="daumRoughmapContainer1750370314307" class="root_daum_roughmap root_daum_roughmap_landing"></div>

        <!--
          2. 설치 스크립트
          * 지도 퍼가기 서비스를 2개 이상 넣을 경우, 설치 스크립트는 하나만 삽입합니다.
        -->
        <script charset="UTF-8" class="daum_roughmap_loader_script" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script>

        <!-- 3. 실행 스크립트 -->
        <script charset="UTF-8">
          new daum.roughmap.Lander({
            "timestamp" : "1750370314307",
            "key" : "3udfdiytqrx",
          }).render();
        </script>
      `;

      mapContainer.innerHTML = htmlContent;
    }
  }, []);

  return (
    <PageContainer>
      <Box className="location-map-box">
        <Flex gap={gap} alignItems="flex-start" direction={flexDirection}>
          <Box className="location-map" flex="2">
            <Box
              width="100%"
              height={mapHeight}
              borderRadius="20px"
              overflow="hidden"
              border="1px solid #e2e8f0"
            >
              <Box
                fontFamily="dotum, sans-serif"
                fontSize="12px"
                fontWeight="400"
                width="100%"
                height="100%"
                color="#333"
                position="relative"
              >
                <Box height="360px">
                  <Link
                    href="https://map.kakao.com/?urlX=987055.0000004075&urlY=468643.0000000098&itemId=23151637&q=%EB%B6%80%EC%82%B0%EB%8F%84%EC%8B%9C%EA%B3%B5%EC%82%AC%20%EC%95%84%EB%A5%B4%ED%94%BC%EB%82%98&srcid=23151637&map_type=TYPE_MAP&from=roughmap"
                    target="_blank"
                    display="block"
                    width="100%"
                    height="100%"
                  >
                    <Image
                      src="http://t1.daumcdn.net/roughmap/imgmap/259d851687562e80781809ebc9c3a4cbb72628a44759934827f970230c3a08d7"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      border="1px solid #ccc"
                      alt="카카오맵"
                    />
                  </Link>
                </Box>
                <Box
                  overflow="hidden"
                  padding="7px 11px"
                  border="1px solid rgba(0, 0, 0, 0.1)"
                  borderTop="none"
                  borderBottomRadius="2px"
                  backgroundColor="rgb(249, 249, 249)"
                >
                  <Link
                    href="https://map.kakao.com"
                    target="_blank"
                    float="left"
                  >
                    <Image
                      src="//t1.daumcdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png"
                      width="72px"
                      height="16px"
                      alt="카카오맵"
                      display="block"
                    />
                  </Link>
                  <Box
                    float="right"
                    position="relative"
                    top="1px"
                    fontSize="11px"
                  >
                    <Link
                      target="_blank"
                      href="https://map.kakao.com/?from=roughmap&eName=%EB%B6%80%EC%82%B0%EB%8F%84%EC%8B%9C%EA%B3%B5%EC%82%AC%20%EC%95%84%EB%A5%B4%ED%94%BC%EB%82%98&eX=987055.0000004075&eY=468643.0000000098"
                      float="left"
                      height="15px"
                      paddingTop="1px"
                      lineHeight="15px"
                      color="#000"
                      textDecoration="none"
                      _hover={{ textDecoration: "underline" }}
                    >
                      길찾기
                    </Link>
                    <Box
                      width="1px"
                      padding="0"
                      margin="0 8px 0 9px"
                      height="11px"
                      verticalAlign="top"
                      position="relative"
                      top="2px"
                      borderLeft="1px solid #d0d0d0"
                      float="left"
                    />
                    <Link
                      target="_blank"
                      href="https://map.kakao.com?map_type=TYPE_MAP&from=roughmap&srcid=23151637&itemId=23151637&q=%EB%B6%80%EC%82%B0%EB%8F%84%EC%8B%9C%EA%B3%B5%EC%82%AC%20%EC%95%84%EB%A5%B4%ED%94%BC%EB%82%98&urlX=987055.0000004075&urlY=468643.0000000098"
                      float="left"
                      height="15px"
                      paddingTop="1px"
                      lineHeight="15px"
                      color="#000"
                      textDecoration="none"
                      _hover={{ textDecoration: "underline" }}
                    >
                      지도 크게 보기
                    </Link>
                  </Box>
                </Box>
                <Box>
                  <Box
                    borderBottom="0px none #333333"
                    position="absolute"
                    left="-25px"
                    top="-136px"
                    width="0px"
                    height="40px"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className="location-txt" flex="1">
            <Box>
              <Heading
                as="h3"
                fontSize={titleSize}
                fontWeight="600"
                color="#373636"
                mb={useBreakpointValue({ base: 6, md: 7, lg: 8 })}
              >
                아르피나
              </Heading>
              <Box>
                <Flex
                  alignItems="flex-start"
                  gap={useBreakpointValue({ base: 3, md: 4 })}
                  mb={useBreakpointValue({ base: 6, md: 7, lg: 8 })}
                >
                  <Box mt="6px">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={iconSize}
                      height={iconSize}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 0C7.58 0 4 3.58 4 8C4 13.4 12 24 12 24C12 24 20 13.4 20 8C20 3.58 16.42 0 12 0ZM12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11Z"
                        fill="#373636"
                      />
                    </svg>
                  </Box>
                  <Box>
                    <Text
                      fontSize={textSize}
                      fontWeight="600"
                      mb={useBreakpointValue({ base: 1, md: 2 })}
                    >
                      주소
                    </Text>
                    <Text
                      color="#666"
                      fontSize={useBreakpointValue({ base: "sm", md: "md" })}
                      lineHeight="1.6"
                    >
                      부산 해운대구 해운대로 35 (우동 1417번지)
                    </Text>
                  </Box>
                </Flex>
                <Flex
                  alignItems="flex-start"
                  gap={useBreakpointValue({ base: 3, md: 4 })}
                >
                  <Box mt="6px">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={iconSize}
                      height={iconSize}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5ZM19 12H21C21 7 17 3 12 3V5C15.9 5 19 8.1 19 12ZM15 12H17C17 9.2 14.8 7 12 7V9C13.7 9 15 10.3 15 12Z"
                        fill="#373636"
                      />
                    </svg>
                  </Box>
                  <Box>
                    <Text
                      fontSize={textSize}
                      fontWeight="600"
                      mb={useBreakpointValue({ base: 1, md: 2 })}
                    >
                      연락처
                    </Text>
                    <Flex direction="column" gap={1}>
                      <Text
                        color="#666"
                        fontSize={useBreakpointValue({ base: "sm", md: "md" })}
                        lineHeight="1.6"
                      >
                        대표전화: 051-731-9800
                      </Text>
                      <Text
                        color="#666"
                        fontSize={useBreakpointValue({ base: "sm", md: "md" })}
                        lineHeight="1.6"
                      >
                        FAX: 051-740-3225
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
      <Box>
        <Box className="location-box">
          <Heading
            display="flex"
            alignItems="center"
            gap={2}
            color="#373636"
            fontSize={headingSize}
            fontWeight="600"
            mb={4}
            mt={{ base: "80px", md: "120px", lg: "180px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize}
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                d="M30.4662 2.92477L30.6208 2.91602L30.8104 2.92768L30.9417 2.95102L31.121 3.00206L31.2771 3.06914L31.4229 3.15227L31.5542 3.24997L31.6737 3.35935L31.7496 3.44539L31.8692 3.61456L31.945 3.75456C32.013 3.90039 32.0568 4.054 32.0762 4.21539L32.0835 4.36997C32.0835 4.47984 32.0719 4.58678 32.0485 4.69081L31.9975 4.87018L22.4717 31.2325C22.2911 31.6256 22.0015 31.9586 21.6373 32.1921C21.273 32.4255 20.8495 32.5495 20.4169 32.5493C20.0273 32.5502 19.6442 32.4503 19.3046 32.2594C18.965 32.0686 18.6805 31.7932 18.4787 31.46L18.3839 31.2748L13.4956 21.501L3.76853 16.636C3.40861 16.4714 3.09822 16.2152 2.86841 15.893C2.63859 15.5708 2.49739 15.1939 2.45895 14.8L2.4502 14.5827C2.4502 13.766 2.88915 13.0193 3.67665 12.5848L3.88082 12.4827L30.1556 2.99477L30.3102 2.95102L30.4662 2.92477Z"
                fill="#373636"
              />
            </svg>
            교통편 이용안내 (현재위치)
          </Heading>
          <Flex
            gap={gap}
            alignItems="flex-start"
            direction={useBreakpointValue({ base: "column", lg: "row" })}
          >
            {/* 카드 4개 */}
            <Flex
              gap={cardGap}
              flex="1 1 0"
              direction="row"
              wrap="wrap"
              width="100%"
            >
              {/* 자가용 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_car.jpg"
                title="자가용"
                borderColor="#2E3192"
                iconColor="#2E3192"
                mapUrl="https://kko.kakao.com/lmrfihL3-6"
                buttonBgColor="#2E3192"
                buttonHoverColor="#1a1b4b"
              />
              {/* 버스 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_bus.jpg"
                title="버스"
                borderColor="#0C8EA4"
                iconColor="#0C8EA4"
                mapUrl="https://kko.kakao.com/lmrfihL3-6"
                buttonBgColor="#0C8EA4"
                buttonHoverColor="#009999"
              />
              {/* 택시 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_taxi.jpg"
                title="택시"
                borderColor="#FAB20B"
                iconColor="#FAB20B"
                mapUrl="https://kko.kakao.com/lmrfihL3-6"
                buttonBgColor="#FAB20B"
                buttonHoverColor="#E4A30D"
              />
              {/* 지하철 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_subway.jpg"
                title="지하철"
                borderColor="#80D4CE"
                iconColor="#80D4CE"
                mapUrl="https://kko.kakao.com/lmrfihL3-6"
                buttonBgColor="#80D4CE"
                buttonHoverColor="#6BC3BC"
              />
            </Flex>
            {/* 오른쪽 상세 안내 박스 */}
            <InfoDetailBox
              title="- 교통편 이용안내 (현재위치 기준)"
              items={transportInfo01}
            />
          </Flex>
        </Box>
        <Box className="location-box" mt={sectionGap}>
          <Heading
            display="flex"
            alignItems="center"
            gap={2}
            color="#373636"
            fontSize={headingSize}
            fontWeight="600"
            mb={4}
            mt={{ base: "80px", md: "120px", lg: "180px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize}
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                d="M29.9836 5.70273C30.844 6.56315 30.844 7.94857 29.9836 8.7944L24.3107 14.4673L27.4023 27.8694L25.3461 29.9402L19.6878 19.1048L14.0003 24.7923L14.5253 28.3944L12.9648 29.9402L10.3982 25.3027L5.74609 22.7215L7.29193 21.1465L10.9378 21.6861L16.5815 16.0423L5.74609 10.3402L7.81693 8.28398L21.219 11.3757L26.8919 5.70273C27.7086 4.8569 29.1669 4.8569 29.9836 5.70273Z"
                fill="#373636"
              />
            </svg>
            교통편 이용안내 (김해공항)
          </Heading>
          <Flex
            gap={gap}
            alignItems="flex-start"
            direction={useBreakpointValue({ base: "column", lg: "row" })}
          >
            {/* 카드 4개 */}
            <Flex
              gap={cardGap}
              flex="1 1 0"
              direction="row"
              wrap="wrap"
              width="100%"
            >
              {/* 자가용 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_car.jpg"
                title="자가용"
                borderColor="#2E3192"
                iconColor="#2E3192"
                mapUrl="https://kko.kakao.com/w6gcqZq6H3"
                buttonBgColor="#2E3192"
                buttonHoverColor="#1a1b4b"
                fromLocation="김해공항"
              />
              {/* 버스 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_bus.jpg"
                title="버스"
                borderColor="#0C8EA4"
                iconColor="#0C8EA4"
                mapUrl="https://kko.kakao.com/bg0QhSrr-S"
                buttonBgColor="#0C8EA4"
                buttonHoverColor="#009999"
                fromLocation="김해공항"
              />
              {/* 택시 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_taxi.jpg"
                title="택시"
                borderColor="#FAB20B"
                iconColor="#FAB20B"
                mapUrl="https://kko.kakao.com/FqbdGElgsD"
                buttonBgColor="#FAB20B"
                buttonHoverColor="#E4A30D"
                fromLocation="김해공항"
              />
              {/* 지하철 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_subway.jpg"
                title="지하철"
                borderColor="#80D4CE"
                iconColor="#80D4CE"
                mapUrl="https://kko.kakao.com/Olj1NPRH3V"
                buttonBgColor="#80D4CE"
                buttonHoverColor="#6BC3BC"
                fromLocation="김해공항"
              />
            </Flex>
            {/* 오른쪽 상세 안내 박스 */}
            <InfoDetailBox
              title="- 교통편 이용안내 (김해공항)"
              items={transportInfo02}
            />
          </Flex>
        </Box>
        <Box className="location-box" mt={sectionGap}>
          <Heading
            display="flex"
            alignItems="center"
            gap={2}
            color="#373636"
            fontSize={headingSize}
            fontWeight="600"
            mb={4}
            mt={{ base: "80px", md: "120px", lg: "180px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize}
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                d="M30.6247 26.2493C31.0115 26.2493 31.3824 26.403 31.6559 26.6765C31.9294 26.95 32.083 27.3209 32.083 27.7077C32.083 28.0945 31.9294 28.4654 31.6559 28.7389C31.3824 29.0124 31.0115 29.166 30.6247 29.166H2.91635C2.52958 29.166 2.15864 29.0124 1.88515 28.7389C1.61166 28.4654 1.45802 28.0945 1.45802 27.7077C1.45802 27.3209 1.61166 26.95 1.88515 26.6765C2.15864 26.403 2.52958 26.2493 2.91635 26.2493H30.6247ZM17.4997 7.29102C22.2014 7.29102 26.1651 8.85872 28.9739 11.0666C31.7316 13.2337 33.5414 16.165 33.5414 18.9577C33.5414 20.1856 33.1651 21.2327 32.5016 22.0785C31.8555 22.9039 30.9936 23.4639 30.1157 23.8489C28.3861 24.6043 26.3284 24.791 24.7913 24.791H4.36593C3.98338 24.7908 3.60461 24.7152 3.25133 24.5684C2.89804 24.4217 2.57716 24.2067 2.30706 23.9358C2.03695 23.6649 1.82293 23.3433 1.67724 22.9896C1.53156 22.6359 1.45706 22.2569 1.45802 21.8743V10.2077C1.45802 8.60206 2.75593 7.29102 4.37177 7.29102H17.4997ZM10.208 10.2077H4.37468V14.5827H10.208V10.2077ZM17.4997 10.2077H13.1247V14.5827H18.958V10.266C18.6367 10.2401 18.3148 10.2231 17.9926 10.215L17.4997 10.2077ZM21.8747 10.7662V14.5827H28.5116C28.0973 14.1407 27.6492 13.7316 27.1714 13.3591C25.7684 12.2566 23.9776 11.3248 21.8747 10.7662Z"
                fill="#373636"
              />
            </svg>
            교통편 이용안내 (부산역)
          </Heading>
          <Flex
            gap={gap}
            alignItems="flex-start"
            direction={useBreakpointValue({ base: "column", lg: "row" })}
          >
            {/* 카드 4개 */}
            <Flex
              gap={cardGap}
              flex="1 1 0"
              direction="row"
              wrap="wrap"
              width="100%"
            >
              {/* 자가용 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_car.jpg"
                title="자가용"
                borderColor="#2E3192"
                iconColor="#2E3192"
                mapUrl="https://kko.kakao.com/lrPR0pgaiS"
                buttonBgColor="#2E3192"
                buttonHoverColor="#1a1b4b"
                fromLocation="부산역"
              />
              {/* 버스 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_bus.jpg"
                title="버스"
                borderColor="#0C8EA4"
                iconColor="#0C8EA4"
                mapUrl="https://kko.kakao.com/Zn85S31xdf"
                buttonBgColor="#0C8EA4"
                buttonHoverColor="#009999"
                fromLocation="부산역"
              />
              {/* 택시 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_taxi.jpg"
                title="택시"
                borderColor="#FAB20B"
                iconColor="#FAB20B"
                mapUrl="https://kko.kakao.com/lrPR0pgaiS"
                buttonBgColor="#FAB20B"
                buttonHoverColor="#E4A30D"
                fromLocation="부산역"
              />
              {/* 지하철 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_subway.jpg"
                title="지하철"
                borderColor="#80D4CE"
                iconColor="#80D4CE"
                mapUrl="https://kko.kakao.com/XY9LVSIDJd"
                buttonBgColor="#80D4CE"
                buttonHoverColor="#6BC3BC"
                fromLocation="부산역"
              />
            </Flex>
            {/* 오른쪽 상세 안내 박스 */}
            <InfoDetailBox
              title="- 교통편 이용안내 (부산역)"
              items={transportInfo03}
            />
          </Flex>
        </Box>
        <Box className="location-box" mt={sectionGap}>
          <Heading
            display="flex"
            alignItems="center"
            gap={2}
            color="#373636"
            fontSize={headingSize}
            fontWeight="600"
            mb={4}
            mt={{ base: "80px", md: "120px", lg: "180px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize}
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                d="M11.648 4.61358C11.6794 4.42465 11.6733 4.23139 11.63 4.04483C11.5867 3.85826 11.5071 3.68205 11.3958 3.52625C11.2844 3.37045 11.1434 3.23812 10.9809 3.1368C10.8183 3.03549 10.6375 2.96717 10.4485 2.93577C10.2596 2.90436 10.0663 2.91047 9.87978 2.95375C9.69322 2.99703 9.51701 3.07664 9.36121 3.18802C9.20541 3.2994 9.07307 3.44038 8.97176 3.60291C8.87044 3.76543 8.80213 3.94632 8.77072 4.13525L4.39572 30.3852C4.36431 30.5742 4.37042 30.7674 4.41371 30.954C4.45699 31.1406 4.53659 31.3168 4.64797 31.4726C4.75936 31.6284 4.90033 31.7607 5.06286 31.862C5.22539 31.9633 5.40627 32.0317 5.5952 32.0631C5.78413 32.0945 5.97739 32.0884 6.16395 32.0451C6.35052 32.0018 6.52673 31.9222 6.68253 31.8108C6.83833 31.6994 6.97066 31.5584 7.07198 31.3959C7.17329 31.2334 7.24161 31.0525 7.27301 30.8636L11.648 4.61358ZM26.2313 4.13525C26.1679 3.75369 25.9555 3.41297 25.6409 3.18802C25.3262 2.96307 24.9351 2.87234 24.5535 2.93577C24.172 2.9992 23.8313 3.2116 23.6063 3.52625C23.3814 3.8409 23.2906 4.23203 23.3541 4.61358L27.7291 30.8636C27.7605 31.0525 27.8288 31.2334 27.9301 31.3959C28.0314 31.5584 28.1637 31.6994 28.3195 31.8108C28.4753 31.9222 28.6516 32.0018 28.8381 32.0451C29.0247 32.0884 29.2179 32.0945 29.4069 32.0631C29.5958 32.0317 29.7767 31.9633 29.9392 31.862C30.1017 31.7607 30.2427 31.6284 30.3541 31.4726C30.4655 31.3168 30.5451 31.1406 30.5884 30.954C30.6316 30.7674 30.6378 30.5742 30.6063 30.3852L26.2313 4.13525ZM18.9586 4.37441C18.9586 3.98764 18.805 3.61671 18.5315 3.34321C18.258 3.06972 17.8871 2.91608 17.5003 2.91608C17.1135 2.91608 16.7426 3.06972 16.4691 3.34321C16.1956 3.61671 16.042 3.98764 16.042 4.37441V8.74941C16.042 9.13619 16.1956 9.50712 16.4691 9.78061C16.7426 10.0541 17.1135 10.2077 17.5003 10.2077C17.8871 10.2077 18.258 10.0541 18.5315 9.78061C18.805 9.50712 18.9586 9.13619 18.9586 8.74941V4.37441ZM16.042 19.6869C16.042 20.0737 16.1956 20.4446 16.4691 20.7181C16.7426 20.9916 17.1135 21.1452 17.5003 21.1452C17.8871 21.1452 18.258 20.9916 18.5315 20.7181C18.805 20.4446 18.9586 20.0737 18.9586 19.6869V15.3119C18.9586 14.9251 18.805 14.5542 18.5315 14.2807C18.258 14.0072 17.8871 13.8536 17.5003 13.8536C17.1135 13.8536 16.7426 14.0072 16.4691 14.2807C16.1956 14.5542 16.042 14.9251 16.042 15.3119V19.6869ZM16.042 26.2494C16.042 25.8626 16.1956 25.4917 16.4691 25.2182C16.7426 24.9447 17.1135 24.7911 17.5003 24.7911C17.8871 24.7911 18.258 24.9447 18.5315 25.2182C18.805 25.4917 18.9586 25.8626 18.9586 26.2494V30.6244C18.9586 31.0112 18.805 31.3821 18.5315 31.6556C18.258 31.9291 17.8871 32.0827 17.5003 32.0827C17.1135 32.0827 16.7426 31.9291 16.4691 31.6556C16.1956 31.3821 16.042 31.0112 16.042 30.6244V26.2494Z"
                fill="black"
              />
            </svg>
            교통편 이용안내 (고속도로)
          </Heading>
          <Flex
            gap={gap}
            alignItems="flex-start"
            direction={useBreakpointValue({ base: "column", lg: "row" })}
          >
            {/* 카드 4개 */}
            <Flex
              gap={cardGap}
              flex="1 1 0"
              direction="row"
              wrap="wrap"
              width="100%"
            >
              {/* 자가용 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_car.jpg"
                title="자가용"
                borderColor="#2E3192"
                iconColor="#2E3192"
                mapUrl="https://kko.kakao.com/xbUw41ZOYC"
                buttonBgColor="#2E3192"
                buttonHoverColor="#1a1b4b"
                fromLocation="서울 (한남 IC)"
              />
              <TransportCard
                iconSrc="/images/contents/location_ico_car.jpg"
                title="자가용"
                borderColor="#2E3192"
                iconColor="#2E3192"
                mapUrl="https://kko.kakao.com/aP154rz_Hl"
                buttonBgColor="#2E3192"
                buttonHoverColor="#1a1b4b"
                fromLocation="부산 (원동 IC)"
              />
            </Flex>
            {/* 오른쪽 상세 안내 박스 */}
            <InfoDetailBox
              title="- 교통편 이용안내 (고속도로)"
              items={transportInfo04}
            />
          </Flex>
        </Box>
        <Box className="location-box" mt={sectionGap}>
          <Heading
            display="flex"
            alignItems="center"
            gap={2}
            color="#373636"
            fontSize={headingSize}
            fontWeight="600"
            mb={4}
            mt={{ base: "80px", md: "120px", lg: "180px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize}
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                d="M11.1086 12.705L15.7826 9.31C16.3075 8.92654 16.9455 8.72944 17.5953 8.75C18.3877 8.77062 19.154 9.03717 19.7882 9.51272C20.4223 9.98827 20.8929 10.6493 21.1346 11.4042C21.4059 12.2549 21.6538 12.829 21.8784 13.1265C22.5575 14.0314 23.4378 14.7659 24.4497 15.2719C25.4616 15.7778 26.5774 16.0414 27.7088 16.0417V18.9583C26.2031 18.9593 24.7159 18.6268 23.354 17.9846C21.9921 17.3423 20.7894 16.4064 19.8324 15.244L18.8144 21.0131L21.8201 23.5346L25.0619 32.4421L22.3203 33.4396L19.3467 25.2671L14.403 21.1181C13.997 20.7907 13.6863 20.3604 13.5031 19.872C13.32 19.3836 13.2712 18.8551 13.3617 18.3415L14.104 14.1342L13.1167 14.8517L10.0149 19.1217L7.65527 17.4067L11.0838 12.6875L11.1086 12.705ZM19.688 8.02083C18.9144 8.02083 18.1726 7.71354 17.6256 7.16656C17.0786 6.61958 16.7713 5.87771 16.7713 5.10417C16.7713 4.33062 17.0786 3.58875 17.6256 3.04177C18.1726 2.49479 18.9144 2.1875 19.688 2.1875C20.4615 2.1875 21.2034 2.49479 21.7504 3.04177C22.2974 3.58875 22.6046 4.33062 22.6046 5.10417C22.6046 5.87771 22.2974 6.61958 21.7504 7.16656C21.2034 7.71354 20.4615 8.02083 19.688 8.02083ZM15.3567 27.2431L10.6696 32.8285L8.43548 30.9546L12.774 25.7833L13.8619 22.6042L16.4738 24.7917L15.3567 27.2431Z"
                fill="black"
              />
            </svg>
            교통편 이용안내 (도보)
          </Heading>
          <Flex
            gap={gap}
            alignItems="flex-start"
            direction={useBreakpointValue({ base: "column", lg: "row" })}
          >
            {/* 카드 4개 */}
            <Flex
              gap={cardGap}
              flex="1 1 0"
              direction="row"
              wrap="wrap"
              width="100%"
            >
              {/* 지하철 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_subway.jpg"
                title="지하철"
                borderColor="#80D4CE"
                iconColor="#80D4CE"
                mapUrl="https://kko.kakao.com/XY9LVSIDJd"
                buttonBgColor="#80D4CE"
                buttonHoverColor="#6BC3BC"
                fromLocation="2호선 벡스코역"
              />
              {/* 버스 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_bus.jpg"
                title="버스"
                borderColor="#0C8EA4"
                iconColor="#0C8EA4"
                mapUrl="https://kko.kakao.com/Zn85S31xdf"
                buttonBgColor="#0C8EA4"
                buttonHoverColor="#009999"
                fromLocation="올림픽 교차로"
              />
              {/* 버스 */}
              <TransportCard
                iconSrc="/images/contents/location_ico_bus.jpg"
                title="버스"
                borderColor="#0C8EA4"
                iconColor="#0C8EA4"
                mapUrl="https://kko.kakao.com/Zn85S31xdf"
                buttonBgColor="#0C8EA4"
                buttonHoverColor="#009999"
                fromLocation="해강중고교"
              />
            </Flex>
            {/* 오른쪽 상세 안내 박스 */}
            <InfoDetailBox
              title="- 교통편 이용안내 (도보)"
              items={transportInfo05}
            />
          </Flex>
        </Box>
      </Box>
    </PageContainer>
  );
}
