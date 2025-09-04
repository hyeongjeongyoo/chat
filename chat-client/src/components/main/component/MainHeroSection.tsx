"use client";

import {
  Box,
  Flex,
  Image,
  Link,
  Text,
  useBreakpointValue,
  AspectRatio,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { useState, useRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { ContentBlock } from "@/types/api/content";

interface MainHeroSectionProps {
  data: ContentBlock[];
}

export function MainHeroSection({ data }: MainHeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const flexDirection = useBreakpointValue<"row" | "column">({
    base: "column",
    lg: "row",
  });
  const heroBoxWidth = useBreakpointValue({ base: "100%", lg: "30%" });
  const imageBoxWidth = useBreakpointValue({ base: "100%", lg: "69%" });

  // 1. 명확한 순서에 따라 각 영역의 데이터를 할당합니다.
  // - data[0]: 슬라이더에 사용될 이미지 블록
  // - data[1]: 우측 고정 배너에 사용될 이미지 블록
  // - data[2]: 슬라이더에 오버레이될 텍스트 블록
  const sliderBlock = data?.[0];
  const staticImageBlock = data?.[1];
  const textBlock = data?.[2];

  // 2. 각 영역에 필요한 데이터를 추출합니다.
  const swiperFiles = sliderBlock?.files ?? [];
  const textContent = textBlock?.content;
  const staticImageSrc = staticImageBlock?.files?.[0]?.fileId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/view/${staticImageBlock.files[0].fileId}`
    : "/images/contents/main_3.png"; // 기본 이미지

  // 슬라이드할 이미지가 없으면 컴포넌트를 렌더링하지 않습니다.
  if (swiperFiles.length === 0) {
    return null;
  }

  return (
    <>
      <Global
        styles={{
          "@keyframes slideUp": {
            "0%": {
              opacity: 0,
              transform: "translateY(50px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
          ".slide-content": {
            opacity: 1,
            transform: "translateY(0)",
          },
          ".slide-content.active": {
            animation: "slideUp 0.8s ease-out forwards",
          },
          ".swiper-pagination": {
            display: "none !important",
          },
          ".swiper-button-prev, .swiper-button-next": {
            top: "50px",
            width: "50px !important",
            height: "50px !important",
            border: "1px solid #666666",
            backgroundColor: "#fff",
          },
          ".swiper-button-prev:after, .swiper-button-next:after": {
            color: "#666",
          },
          ".swiper-button-prev": {
            right: "80px !important",
            left: "auto !important",
          },
          ".swiper-button-next": {
            right: "10px",
          },
          "@keyframes progressBar": {
            "0%": { width: "0%" },
            "100%": { width: "100%" },
          },
          "@media (max-width: 1500px)": {
            ".swiper-button-prev, .swiper-button-next": {
              width: "35px !important",
              height: "35px !important",
            },
            ".swiper-button-prev": {
              right: "70px !important",
            },
            ".progress-bar-container": {
              top: "23px !important",
              right: "120px !important",
            },
          },
          "@media (max-width: 1360px)": {
            ".progress-bar-container": {
              right: "100px !important",
            },
          },
          "@media (max-width: 1170px)": {
            ".progress-bar-container": {
              top: "23px !important",
              right: "100px !important",
            },
          },
          "@media (max-width: 768px)": {
            ".swiper-button-prev, .swiper-button-next": {
              display: "none !important",
            },
            ".swiper-button-prev": {
              right: "auto !important",
              left: "10px !important",
            },
            ".progress-bar-container": {
              top: "auto !important",
              bottom: "0 !important",
              right: "0 !important",
              height: "40px !important",
              backgroundColor: "rgba(255, 255, 255, 0.6) !important",
            },
            ".progress-bar-container p": {
              fontSize: "12px !important",
            },
          },
        }}
      />
      <Box className="msec01" mb={{ base: "25px", md: "45px" }}>
        <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
          <Flex
            className="msec01-box"
            gap={5}
            direction={flexDirection}
            justifyContent="space-between"
          >
            <Box
              w={imageBoxWidth}
              position="relative"
              overflow="hidden"
              className="swiper-container"
            >
              <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={
                  swiperFiles.length > 1
                    ? {
                        delay: 3000,
                        disableOnInteraction: false,
                      }
                    : false
                }
                loop={swiperFiles.length > 1}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1500}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChangeTransitionStart={(swiper) => {
                  setActiveSlide(swiper.realIndex);
                }}
              >
                {swiperFiles.map((slide) => {
                  const heroImageSrc =
                    process.env.NEXT_PUBLIC_API_URL +
                    "/api/v1/cms/file/public/view/" +
                    slide.fileId;
                  return (
                    <SwiperSlide key={slide.fileId}>
                      <Box
                        w="100%"
                        position="relative"
                        display="block"
                        h={{ base: "400px", md: "auto" }}
                        borderRadius={{ base: "15px", md: "0" }}
                        mt={{ base: "10px" }}
                        overflow="hidden"
                      >
                        <AspectRatio ratio={1088 / 620} w="100%" h="100%">
                          <Image
                            src={heroImageSrc}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        </AspectRatio>
                      </Box>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <Box
                className={`slide-content`}
                position="absolute"
                bottom="0"
                left="0"
                zIndex="2"
              >
                <Box bg="transparent" pt={6} pr={6} pb={6} pl={0}>
                  <Text
                    fontSize={{
                      base: "14px",
                      md: "20px",
                      lg: "28px",
                    }}
                    fontWeight="semibold"
                    color="#1F2732"
                    display={{ base: "none", md: "block" }}
                  >
                    {textContent}
                  </Text>
                </Box>
              </Box>
              <Flex
                className="progress-bar-container"
                position="absolute"
                top="30px"
                right="150px"
                zIndex="10"
                p="2"
                alignItems="center"
                gap="3"
                height="50px"
              >
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  minW="20px"
                  textAlign="center"
                >
                  {activeSlide + 1}
                </Text>
                <Box
                  w={{
                    base: "140px",
                    md: "100px",
                    lg: "80px",
                    xl: "100px",
                    "2xl": "150px",
                  }}
                  h="4px"
                  bg="gray.200"
                  overflow="hidden"
                >
                  <Box
                    key={activeSlide}
                    h="4px"
                    bg="black"
                    animation={`progressBar 3s linear`}
                  />
                </Box>
                <Text
                  fontSize="lg"
                  color="gray.500"
                  minW="20px"
                  textAlign="center"
                >
                  {swiperFiles.length}
                </Text>
              </Flex>
            </Box>
            <Box
              backgroundColor="#2E3192"
              borderRadius="20px"
              w={heroBoxWidth}
              overflow="hidden"
            >
              <Box>
                <Link href="https://hub.hotelstory.com/aG90ZWxzdG9yeQ/rooms?v_Use=MTAwMTg5MA">
                  <Image
                    src={staticImageSrc}
                    alt="호텔 실시간 예약"
                    w="100%"
                    h="auto"
                    objectFit="cover"
                    cursor="pointer"
                    margin="auto"
                  />
                </Link>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
