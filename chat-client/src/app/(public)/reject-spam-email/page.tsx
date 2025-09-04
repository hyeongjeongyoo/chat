"use client";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/sections/HeroSection";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import HeadingH4 from "@/components/contents/HeadingH4";

const RejectSpamEmailPage = () => {
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
            이메일무단수집거부
          </Text>
        </HeadingH4>
        <Box
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="gray.200"
          mt={4}
          borderRadius="md"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          <VStack align="stretch">
            <Text fontWeight="bold">이메일 주소 무단수집을 거부합니다.</Text>
            <Text whiteSpace="pre-wrap" textAlign="justify">
              아르피나 웹사이트에 게시된 이메일 주소가 전자우편수집프로그램이나
              그 밖의 기술적 장치를 이용하여 무단으로 수집되는것을 거부하며 이를
              위반시, 정보통신망법에 의해 형사처벌됨을 유념하시기 바랍니다.
            </Text>
            <Text fontWeight="bold" mt={6}>
              정보통신망법 제 50조의 2 (전자우편주소의 무단 수집행위 등 금지)
            </Text>
            <VStack as="ul" align="stretch" pl={4} mt={2} textAlign="justify">
              <Text as="li" style={{ listStyleType: "'· '" }}>
                누구든지 전자우편주소의 수집을 거부하는 의가사 명시된 인터넷
                홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의
                기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니된다.
              </Text>
              <Text as="li" style={{ listStyleType: "'· '" }} mt={1}>
                누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를
                판매·유통하여서는 아니된다.
              </Text>
              <Text as="li" style={{ listStyleType: "'· '" }} mt={1}>
                누구든지 제1항 및 제2항의 규정에 의하여 수집·판매 및 유통이
                금지된 전자우편주소임을 알고 이를 정보 전송에 이용하여서는
                아니된다.
              </Text>
            </VStack>
            <Text mt={4}>게시일 : 2019년 10월 01일</Text>
          </VStack>
        </Box>
      </PageContainer>
    </Box>
  );
};

export default RejectSpamEmailPage;
