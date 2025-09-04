"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Flex, Text, Image, Button, Heading } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export const MainHeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const [progressKey, setProgressKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [totalSlides, setTotalSlides] = useState(1);

  // Progress bar 제어
  useEffect(() => {
    // 슬라이드가 1개 이하면 progress bar를 정지
    if (totalSlides <= 1) {
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const startProgress = () => {
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      let currentProgress = 0;
      intervalRef.current = setInterval(() => {
        currentProgress += 100 / 30; // 3초(3000ms) / 100ms = 30번 업데이트
        if (currentProgress >= 100) {
          currentProgress = 100;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
        setProgress(currentProgress);
      }, 100);
    };

    startProgress();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSlide, totalSlides]);

  return (
    <Box
      className="msec01"
      mb={{ base: "15px", md: "20px", lg: "45px" }}
    >
      <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
        <Heading
          as="h3"
          mb={{ base: 5, md: 6, lg: 7 }}
          fontSize={{ base: "24px", md: "32px", lg: "40px" }}
          fontWeight="bold"
          color={"#444445"}
          lineHeight={"1"}
          fontFamily="'Paperlogy', sans-serif"
        >
          광안리 · 해운대 · 센텀시티를 잇는 이상적인 허브
        </Heading>
        <Flex
          className="msec01-box"
          gap={{ base: 4, md: 5, lg: 5 }}
          direction={{ base: "column", md: "column", lg: "row" }}
        >
          <Box
            flex={{ base: "none", lg: "1 1 0" }}
            position="relative"
            overflow="hidden"
            className="swiper-container"
            order={{ base: 1, lg: 1 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: ".msec01-swiper-button-prev",
                nextEl: ".msec01-swiper-button-next",
              }}
              pagination={false}
              autoplay={
                totalSlides > 1
                  ? { delay: 3000, disableOnInteraction: false }
                  : false
              }
              loop={totalSlides > 1}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setTotalSlides(swiper.slides.length);
              }}
              onSlideChangeTransitionStart={(swiper) => {
                setActiveSlide(swiper.realIndex);
              }}
              onSlideChange={(swiper) => {
                const allContents = document.querySelectorAll(".slide-content");
                allContents.forEach((content) => {
                  content.classList.remove("active");
                });

                setTimeout(() => {
                  const activeContents = document.querySelectorAll(
                    `.swiper-slide-active .slide-content`
                  );
                  activeContents.forEach((content) => {
                    content.classList.add("active");
                  });
                }, 50);
              }}
            >
              <SwiperSlide>
                <Box position="relative" w="100%">
                  <Box
                    className={`slide-content ${
                      activeSlide === 0 ? "active" : ""
                    }`}
                    position="absolute"
                    bottom="0"
                    left="0"
                    zIndex="1"
                    pr={{ base: 4, md: 5, lg: 6 }}
                    pl={0}
                    display={{ base: "none", md: "block" }}
                  >
                    <Text
                      py={{ base: 4, md: 5, lg: 6 }}
                      fontSize={{
                        base: "16px",
                        sm: "18px",
                        md: "20px",
                        lg: "24px",
                        xl: "30px",
                      }}
                      fontWeight="600"
                      color="#1F2732"
                    >
                      도심 속 합리적인 컨벤션 & 스테이
                    </Text>
                  </Box>
                  <Box
                    position="relative"
                    w="100%"
                    className="msec01-image-wrapper"
                    pb="56.25%"
                  >
                    <Image
                      src="/images/contents/msec01_sld_img02.png"
                      alt="새로운 여정의 시작"
                      position="absolute"
                      top="0"
                      left="0"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                </Box>
              </SwiperSlide>
            </Swiper>

            {/* 커스텀 네비게이션 */}
            <Flex
              position="absolute"
              top={{ base: "8px", md: "10px", lg: "10px" }}
              right={{ base: "8px", md: "16px", lg: "0" }}
              zIndex="10"
              alignItems="center"
              gap={{ base: 0.5, md: 1, lg: 1 }}
              className="msec01-nav-wrapper"
            >
              <Text
                fontSize={{
                  base: "14px",
                  md: "16px",
                  lg: "18px",
                  xl: "24px",
                }}
                fontWeight="600"
                color="#333"
              >
                {activeSlide + 1}
              </Text>

              <Box
                position="relative"
                width={{
                  base: "60px",
                  md: "80px",
                  lg: "100px",
                  xl: "140px",
                }}
                height={{ base: "2px", md: "3px", lg: "4px", xl: "5px" }}
                mx={{ base: 1, md: 1.5, lg: 2 }}
              >
                <Box width="100%" height="100%" bg="#D9D9D9" />
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  height="100%"
                  bg="#343434"
                  width={`${progress}%`}
                  transition="none"
                />
              </Box>

              <Text
                fontSize={{
                  base: "14px",
                  md: "16px",
                  lg: "18px",
                  xl: "24px",
                }}
                fontWeight="600"
                color="#333"
              >
                {totalSlides}
              </Text>

              <Button
                className="msec01-swiper-button-prev"
                size={{ base: "sm", md: "md", lg: "lg" }}
                width={{ base: "32px", md: "40px", lg: "52px", xl: "64px" }}
                height={{
                  base: "32px",
                  md: "40px",
                  lg: "52px",
                  xl: "64px",
                }}
                borderRadius="full"
                variant="outline"
                borderColor={totalSlides <= 1 ? "#D1D5DB" : "#333"}
                bg="white"
                _hover={
                  totalSlides <= 1
                    ? {}
                    : {
                        bg: "#333",
                        borderColor: "#333",
                      }
                }
                p={0}
                minW={{ base: "32px", md: "40px", lg: "52px", xl: "64px" }}
                ml={{ base: 1, md: 1.5, lg: 2 }}
                disabled={totalSlides <= 1}
                cursor={totalSlides <= 1 ? "not-allowed" : "pointer"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="21"
                  viewBox="0 0 24 21"
                  fill="none"
                  style={{
                    width: "clamp(12px, 3vw, 24px)",
                    height: "clamp(10px, 2.5vw, 21px)",
                  }}
                >
                  <g clipPath="url(#clip0_2147_21)">
                    <path
                      d="M1.11644 11.3834C0.883574 11.1484 0.752929 10.8309 0.752929 10.5001C0.752929 10.1692 0.883574 9.85178 1.11644 9.61676L9.44978 1.28343C9.56421 1.16061 9.70221 1.06211 9.85555 0.993791C10.0089 0.925472 10.1744 0.888736 10.3422 0.885774C10.5101 0.882814 10.6768 0.913686 10.8324 0.976554C10.9881 1.03942 11.1295 1.133 11.2482 1.2517C11.3669 1.3704 11.4604 1.51179 11.5233 1.66743C11.5862 1.82308 11.6171 1.98979 11.6141 2.15763C11.6111 2.32547 11.5744 2.49099 11.5061 2.64432C11.4378 2.79766 11.3393 2.93566 11.2164 3.05009L5.01644 9.25009L21.9998 9.25009C22.3313 9.25009 22.6492 9.38179 22.8837 9.61621C23.1181 9.85063 23.2498 10.1686 23.2498 10.5001C23.2498 10.8316 23.1181 11.1496 22.8837 11.384C22.6492 11.6184 22.3313 11.7501 21.9998 11.7501L5.01644 11.7501L11.2164 17.9501C11.4372 18.1871 11.5575 18.5005 11.5517 18.8243C11.546 19.1481 11.4148 19.4571 11.1858 19.6861C10.9568 19.9152 10.6478 20.0463 10.324 20.0521C10.0001 20.0578 9.68674 19.9376 9.44978 19.7168L1.11644 11.3834Z"
                      fill={totalSlides <= 1 ? "#D1D5DB" : "#333333"}
                      className="button-icon"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2147_21">
                      <rect
                        width="20"
                        height="24"
                        fill="white"
                        transform="translate(0 20.5) rotate(-90)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </Button>

              <Button
                className="msec01-swiper-button-next"
                size={{ base: "sm", md: "md", lg: "lg" }}
                width={{ base: "32px", md: "40px", lg: "52px", xl: "64px" }}
                height={{
                  base: "32px",
                  md: "40px",
                  lg: "52px",
                  xl: "64px",
                }}
                borderRadius="full"
                variant="outline"
                borderColor={totalSlides <= 1 ? "#D1D5DB" : "#333"}
                bg="white"
                _hover={
                  totalSlides <= 1
                    ? {}
                    : {
                        bg: "#333",
                      }
                }
                p={0}
                minW={{ base: "32px", md: "40px", lg: "52px", xl: "64px" }}
                disabled={totalSlides <= 1}
                cursor={totalSlides <= 1 ? "not-allowed" : "pointer"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="21"
                  viewBox="0 0 24 21"
                  fill="none"
                  style={{
                    width: "clamp(12px, 3vw, 24px)",
                    height: "clamp(10px, 2.5vw, 21px)",
                  }}
                >
                  <g clipPath="url(#clip0_2147_25)">
                    <path
                      d="M22.8836 11.3834C23.1164 11.1484 23.2471 10.8309 23.2471 10.5001C23.2471 10.1692 23.1164 9.85178 22.8836 9.61676L14.5502 1.28343C14.4358 1.16061 14.2978 1.06211 14.1445 0.993791C13.9911 0.925472 13.8256 0.888736 13.6578 0.885774C13.4899 0.882814 13.3232 0.913686 13.1676 0.976554C13.0119 1.03942 12.8705 1.133 12.7518 1.2517C12.6331 1.3704 12.5396 1.51179 12.4767 1.66743C12.4138 1.82308 12.3829 1.98979 12.3859 2.15763C12.3889 2.32547 12.4256 2.49099 12.4939 2.64432C12.5622 2.79766 12.6607 2.93566 12.7836 3.05009L18.9836 9.25009L2.00022 9.25009C1.6687 9.25009 1.35076 9.38179 1.11634 9.61621C0.881918 9.85063 0.750224 10.1686 0.750224 10.5001C0.750224 10.8316 0.881918 11.1496 1.11634 11.384C1.35076 11.6184 1.6687 11.7501 2.00022 11.7501L18.9836 11.7501L12.7836 17.9501C12.5628 18.1871 12.4425 18.5005 12.4483 18.8243C12.454 19.1481 12.5852 19.4571 12.8142 19.6861C13.0432 19.9152 13.3522 20.0463 13.676 20.0521C13.9999 20.0578 14.3133 19.9376 14.5502 19.7168L22.8836 11.3834Z"
                      fill={totalSlides <= 1 ? "#D1D5DB" : "#333333"}
                      className="button-icon"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2147_25">
                      <rect
                        width="20"
                        height="24"
                        fill="white"
                        transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 24 20.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </Button>
            </Flex>
          </Box>
          <Box
            backgroundColor="#2E3192"
            borderRadius={{ base: "10px", md: "15px", lg: "20px" }}
            w={{ base: "100%", md: "100%", lg: "30%", xl: "480px" }}
            overflow="hidden"
            order={{ base: 2, lg: 2 }}
            flexShrink={0}
          >
            <Box w="100%" h="100%">
              <Image
                src="/images/main/main_3.png"
                alt="7월 아르피나 수영장 강습안내"
                w="100%"
                h="100%"
                objectFit="cover"
                cursor="pointer"
                onClick={() => {
                  window.open("/bbs/notices/read/179", "_blank");
                }}
              />
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
