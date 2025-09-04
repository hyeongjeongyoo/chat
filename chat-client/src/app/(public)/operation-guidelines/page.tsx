"use client";

import { Box, Text, Button, Icon } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/sections/HeroSection";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import HeadingH4 from "@/components/contents/HeadingH4";
import { FiDownload } from "react-icons/fi";
import GuidelinesViewer from "@/components/contents/GuidelinesViewer";
import { operationGuidelinesData } from "@/data/guidelines";

export default function OperationGuidelinesPage() {
  const heroData = useHeroSectionData();

  if (!heroData) {
    return null; // or a loading indicator
  }

  return (
    <Box>
      <HeroSection slideContents={[heroData]} />
      <PageContainer>
        <Box>
          <HeadingH4>
            <Text
              as="span"
              fontSize={{ base: "20px", md: "24px", lg: "30px", xl: "48px" }}
            >
              아르피나 영업관리 운영지침
            </Text>
          </HeadingH4>

          <GuidelinesViewer
            revisions={operationGuidelinesData.revisions}
            chapters={operationGuidelinesData.chapters}
          />

          <Box textAlign="center" mt={10}>
            <a href="/files/OperationGuidelines.pdf" download>
              <Button
                size="lg"
                bgColor="#FAB20B"
                color="white"
                _hover={{
                  bgColor: "#E4A30D",
                }}
              >
                <Text>운영지침 전체 다운로드</Text>
                <Icon as={FiDownload} ml={2} />
              </Button>
            </a>
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
}
