"use client";

import {
  Box,
  Flex,
  Link,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ContentBlock } from "@/types/api/content";

interface ApplySectionProps {
  data: ContentBlock;
}

export function ApplySection({ data }: ApplySectionProps) {
  const sectionMarginBottom = useBreakpointValue({ base: "40px", md: "80px" });
  const headingFontSize = useBreakpointValue({ base: "30px", md: "40px" });
  const linkFontSize = useBreakpointValue({ base: "16px", md: "30px" });
  const linkPadding = useBreakpointValue({
    base: { px: 2, py: 0 },
    md: { px: 8, py: 4 },
  });
  const flexContainerDirection = useBreakpointValue<"row" | "column">({
    base: "row",
    md: "row",
  });
  const flexAlignItems = useBreakpointValue({
    base: "flex-start",
    md: "center",
  });
  const flexJustifyContent = useBreakpointValue({
    base: "space-between",
    md: "space-between",
  });
  const flexGap = useBreakpointValue({ base: 4, md: 0 });

  const image01 = data?.files[0];
  const imageSrc =
    process.env.NEXT_PUBLIC_API_URL +
    "/api/v1/cms/file/public/view/" +
    image01?.fileId;

  return (
    <Box className="msec03" mb={sectionMarginBottom}>
      <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
        <Box className="mapply-box">
          <Box position="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
            >
              <SwiperSlide>
                <Box>
                  <Flex
                    alignItems={flexAlignItems}
                    justifyContent={flexJustifyContent}
                    mb={4}
                    direction={flexContainerDirection}
                    gap={flexGap}
                  >
                    <Text
                      color={"#444445"}
                      fontSize={headingFontSize}
                      fontWeight="800"
                    >
                      수영
                    </Text>
                    <Link
                      href="/sports/swimming/lesson"
                      display={"flex"}
                      alignItems={"center"}
                      gap={2}
                      bg={"#F1F2F3"}
                      border={"1px solid #F1F2F3"}
                      borderRadius={"20px"}
                      px={linkPadding?.px}
                      py={linkPadding?.py}
                      color={"#333"}
                      fontSize={linkFontSize}
                      fontWeight="500"
                      _hover={{
                        backgroundColor: "#fff",
                        borderColor: "#333",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      수영장 신청 바로가기
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        viewBox="0 0 35 35"
                        fill="none"
                      >
                        <path
                          d="M17.4984 2.91748C25.5484 2.91748 32.0817 9.45081 32.0817 17.5008C32.0817 25.5508 25.5484 32.0841 17.4984 32.0841C9.44837 32.0841 2.91504 25.5508 2.91504 17.5008C2.91504 9.45081 9.44837 2.91748 17.4984 2.91748ZM17.4984 16.0425H11.665V18.9591H17.4984V23.3341L23.3317 17.5008L17.4984 11.6675V16.0425Z"
                          fill="#333333"
                        />
                      </svg>
                    </Link>
                  </Flex>
                  <Box>
                    <Image
                      borderRadius="20px"
                      overflow="hidden"
                      src={imageSrc}
                      alt="수영장이미지"
                      w="100%"
                      height={{ base: "300px", md: "auto" }}
                      objectFit="cover"
                    />
                  </Box>
                </Box>
              </SwiperSlide>
            </Swiper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
