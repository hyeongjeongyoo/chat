"use client";

import { Box, Flex, Text, Image, useBreakpointValue } from "@chakra-ui/react";

const guideTitleStyleBase = {
  fontFamily: "'Paperlogy', sans-serif",
  fontStyle: "normal",
  fontWeight: "700",
  letterSpacing: "-0.05em",
  color: "#00636F",
};

const guideItemTextStyleBase = {
  fontFamily: "'Paperlogy', sans-serif",
  fontStyle: "normal",
  fontWeight: "500",
  letterSpacing: "-0.05em",
  color: "#373636",
  width: "100%",
};

export const SwimmingGuide = () => {
  const guideTitleStyle = {
    ...guideTitleStyleBase,
    fontSize: useBreakpointValue({ base: "24px", md: "28px", lg: "30px" }),
    lineHeight: useBreakpointValue({ base: "28px", md: "32px", lg: "35px" }),
  };

  const guideItemTextStyle = {
    ...guideItemTextStyleBase,
    fontSize: useBreakpointValue({ base: "13px", md: "14px" }),
    lineHeight: useBreakpointValue({ base: "18px", md: "20px" }), // Increased line height for readability
  };

  // Determine if the image should be shown based on breakpoint
  const showImage = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      align="flex-start"
      padding={{ base: "20px", md: "0px" }} // Add padding on mobile
      gap={{ base: "30px", lg: "60px" }}
      maxW="1600px"
      w="100%" // Use full width
      mx="auto" // Center the component if maxW is hit
      mb={10}
    >
      {/* Left side image - Conditionally rendered */}
      {showImage && (
        <Box
          width={{ lg: "235.88px" }} // Fixed width on large screens
          height={{ lg: "374px" }}
          flexShrink={0} // Prevent shrinking on flex layouts
          position="relative"
          display={{ base: "none", lg: "block" }} // Hide on base, show on lg
        >
          <Image
            src="/images/swimming/guide-image.png"
            alt="수영장 가이드 이미지"
            objectFit="contain" // Ensures image scales nicely
            width="100%"
            height="100%"
          />
        </Box>
      )}

      {/* Right side content */}
      <Flex
        direction="column"
        align="flex-start"
        gap="20px" // Adjusted gap
        w="100%" // Take full width available
        flex="1" // Allow this to grow if image is present
      >
        {/* 수영장 온라인 신청 순서 - Title */}
        <Text {...guideTitleStyle}>수영장 온라인 신청 순서</Text>

        {/* 수영장 온라인 신청 순서 - Content Box */}
        <Flex
          direction="column"
          align="flex-start"
          padding={{ base: "15px", md: "20px" }}
          gap="10px" // Adjusted gap for items
          w="100%" // Full width
          bg="#F7F8FB"
          borderRadius="10px"
        >
          <Text {...guideItemTextStyle}>
            1. 신청시각이 되면, 신청하기 버튼이 활성화 됩니다
          </Text>
          <Text {...guideItemTextStyle}>
            2. 원하는 강습 일정과 시간을 확인 후 신청해 주세요
          </Text>
          <Text {...guideItemTextStyle}>
            3. 사물함 신청시 추가 옵션을 확인 해주세요 (추가 : 5,000원)
          </Text>
          <Text {...guideItemTextStyle}>
            4. 신청 후 1시간 내에 마이페이지에서 결제 후 확정 됩니다
          </Text>
        </Flex>

        {/* 수영장 온라인 신청 가이드 - Title */}
        <Text {...guideTitleStyle}>수영장 온라인 신청 가이드</Text>

        {/* 수영장 온라인 신청 가이드 - Content Box */}
        <Flex
          direction="column"
          align="flex-start"
          padding={{ base: "15px", md: "20px" }}
          gap="10px" // Adjusted gap for items
          w="100%" // Full width
          bg="#F7F8FB"
          borderRadius="10px"
        >
          <Text {...guideItemTextStyle}>
            • 원하는 강습 일정과 시간을 확인 후 신청해 주세요 (금액 : 105,000원)
          </Text>
          <Text {...guideItemTextStyle}>
            • 수영장 온라인 신규 신청은 회원가입 후 신청 가능합니다
          </Text>
          <Text {...guideItemTextStyle}>
            • 만 19세 이상만 온라인 신청 가능합니다
          </Text>
          <Text {...guideItemTextStyle}>
            • 다자녀, 다문화 (부모) 등록 시 10% 할인 <br />
            <Box as="span" color="#FAB20B">
              ※ 다자녀 할인 : 3인 이상으로 자녀 중 한 명이 미성년자일 경우에
              할인 가능
            </Box>
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
