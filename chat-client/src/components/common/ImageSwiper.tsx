import React from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Image {
  src: string;
}

interface ImageSwiperProps {
  images: Image[];
  name: string;
  width?: object | string;
  height?: object | string;
}

export const ImageSwiper = ({
  images,
  name,
  width = { base: "80vw", sm: "90vw", lg: "80vh", xl: "210px" },
  height = {
    base: "200px",
    sm: "400px",
    md: "300px",
    xl: "210px",
  },
}: ImageSwiperProps) => {
  const swiperRef = React.useRef<any>(null);

  return (
    <Box
      flexShrink={0}
      w={width}
      h={height}
      overflow="hidden"
      position="relative"
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: `.swiper-prev-${name}`,
          nextEl: `.swiper-next-${name}`,
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={image.src}
              alt={`${name} ${index + 1}`}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Flex
        position="absolute"
        bottom={{ base: "10px", lg: "10px", xl: "60px" }}
        right={{ base: "10px", lg: "10px", xl: "20px" }}
        zIndex={2}
        gap={2}
      >
        <Box
          as="button"
          className={`swiper-prev-${name}`}
          w="32px"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bg="rgba(0,0,0,0.35)"
          boxShadow="0 2px 8px rgba(0,0,0,0.18)"
          _hover={{ bg: "rgba(0,0,0,0.55)" }}
          border="none"
          cursor="pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10.5 13L6 8L10.5 3"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
        <Box
          as="button"
          className={`swiper-next-${name}`}
          w="32px"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bg="rgba(0,0,0,0.35)"
          boxShadow="0 2px 8px rgba(0,0,0,0.18)"
          _hover={{ bg: "rgba(0,0,0,0.55)" }}
          border="none"
          cursor="pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M5.5 3L10 8L5.5 13"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </Flex>
    </Box>
  );
};
