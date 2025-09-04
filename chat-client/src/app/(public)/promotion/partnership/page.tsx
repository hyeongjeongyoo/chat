"use client";
import { Box, Spinner } from "@chakra-ui/react";

import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/sections/HeroSection";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import HeadingH4 from "@/components/contents/HeadingH4";
import PartnershipGrid from "@/components/contents/PartnershipGrid";
import { Text } from "@chakra-ui/react";

const PartnershipPage = () => {
  const heroData = useHeroSectionData();

  if (!heroData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <HeroSection slideContents={heroData ? [heroData] : []} />
      <PageContainer>
        <HeadingH4>
          <Text
            as="span"
            fontSize={{ base: "20px", md: "24px", lg: "30px", xl: "48px" }}
          >
            할인제휴 기관별 아르피나 이용고객 혜택
          </Text>
        </HeadingH4>
        <Box mt={{ base: 4, md: 8 }}>
          <PartnershipGrid />
        </Box>
      </PageContainer>
    </Box>
  );
};

export default PartnershipPage;
