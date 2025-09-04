"use client";

import { Box, Text, VStack, Grid, GridItem } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/sections/HeroSection";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import HeadingH4 from "@/components/contents/HeadingH4";
import React from "react";

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
              영상정보처리기기 운영·관리 방침
            </Text>
          </HeadingH4>
          <Box
            p={8}
            border="1px solid"
            borderColor="gray.200"
            mt={4}
            borderRadius="md"
          >
            <Text fontSize={{ base: "14px", xl: "18px" }} textAlign="justify">
              부산도시공사(이하 본 기관이라 함)는 고정형 영상정보처리기기
              운영·관리 방침을 통해 본 기관에서 처리하는 영상정보가 어떠한
              용도와 방식으로 이용·관리되고 있는지 알려드립니다.
            </Text>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                1. 영상정보처리기기의 설치 근거 및 설치 목적
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
                <Text>
                  본 기관은 「개인정보보호법」 제25조제1항 및 제25조의2제1항에
                  따라 다음과 같은 목적으로 고정형·이동형 영상정보처리기기를
                  설치·운영 합니다.
                </Text>

                <VStack align="stretch" mt={6}>
                  <Text fontWeight="bold">
                    (1) 고정형 영상정보처리기기의 설치 목적
                  </Text>
                  <VStack as="ul" align="stretch" pl={4} mt={2}>
                    <Text as="li" style={{ listStyleType: "'· '" }}>
                      시설안전 및 화재 예방
                    </Text>
                    <Text as="li" style={{ listStyleType: "'· '" }} mt={1}>
                      고객의 안전을 위한 범죄 예방
                    </Text>
                  </VStack>
                </VStack>

                <VStack align="stretch" pl={4} mt={6}>
                  <Text color="blue.500">※주차장에 설치하는 경우</Text>
                  <VStack as="ul" align="stretch" pl={4} mt={2}>
                    <Text as="li" style={{ listStyleType: "'· '" }}>
                      차량도난 및 파손방지
                    </Text>
                    <Text as="li" style={{ listStyleType: "'→ '" }} mt={1}>
                      주차대수 30대를 초과하는 규모의 경우 「주차장법 시행규칙」
                      제6조제1항을 근거로 설치·운영 가능
                    </Text>
                  </VStack>
                </VStack>

                <VStack align="stretch" mt={6}>
                  <Text fontWeight="bold">
                    (2) 이동형 영상정보처리기기의 설치 목적
                  </Text>
                  <VStack as="ul" align="stretch" pl={4} mt={2}>
                    <Text as="li" style={{ listStyleType: "'· '" }}>
                      「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」에
                      따른 보상 물건 조사
                    </Text>
                    <Text as="li" style={{ listStyleType: "'· '" }} mt={1}>
                      출자토지, 잔여지 등 소유토지 관리 및 실태조사
                    </Text>
                    <Text as="li" style={{ listStyleType: "'· '" }} mt={1}>
                      시설물 점검 등 기타 공사 소관 업무 수행에 필요한 경우
                    </Text>
                  </VStack>
                </VStack>
              </VStack>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                2. 설치 및 운영 대수, 설치·운영 위치 및 촬영 범위
              </Text>
            </HeadingH4>
            <Box
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.200"
              mt={4}
              borderRadius="md"
            >
              <Grid
                templateColumns="1fr 1fr 2fr"
                border="1px solid"
                borderColor="gray.200"
                borderTop="3px solid"
                borderTopColor="blue.500"
                fontSize={{ base: "14px", xl: "18px" }}
                textAlign="center"
              >
                {[
                  "구분",
                  "설치(운영) 대수",
                  "설치(운영) 위치 및 촬영 범위",
                ].map((header) => (
                  <GridItem
                    key={header}
                    py={3}
                    bg="gray.50"
                    fontWeight="bold"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    borderRight="1px solid"
                    borderRightColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {header}
                  </GridItem>
                ))}
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  고정형 영상정보처리기기
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  33대
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  건물 로비, 지하주차장, 승강기 및 전산실 내부
                </GridItem>
                <GridItem
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  이동형 영상정보처리기기
                </GridItem>
                <GridItem
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  1대
                </GridItem>
                <GridItem
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  보상 사업지구 내, 훼손토지 및 주변지역(인지지 포함)
                </GridItem>
              </Grid>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                3. 관리책임자 및 접근권한자
              </Text>
            </HeadingH4>
            <Box
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.200"
              mt={4}
              borderRadius="md"
            >
              <Text fontSize={{ base: "14px", xl: "18px" }}>
                귀하의 영상정보를 보호하고 개인영상정보와 관련한 불만을 처리하기
                위하여 아래와 같이 개인영상정보 보호책임자를 두고 있습니다.
              </Text>
              <Grid
                templateColumns="1.5fr 1fr 1fr 1fr 1fr"
                border="1px solid"
                borderColor="gray.200"
                borderTop="3px solid"
                borderTopColor="blue.500"
                mt={4}
                fontSize={{ base: "14px", xl: "18px" }}
                textAlign="center"
              >
                {["구분", "", "직위", "소속", "연락처"].map((header, index) => (
                  <GridItem
                    key={`${header}-${index}`}
                    py={3}
                    bg="gray.50"
                    fontWeight="bold"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    borderRight="1px solid"
                    borderRightColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {header}
                  </GridItem>
                ))}
                {/* 고정형 */}
                <GridItem
                  rowSpan={3}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Text>고정형 영상정보처리기기</Text>
                  <Text fontSize="sm" color="gray.500">
                    (지하주차장, 승강기, 로비, 전산실)
                  </Text>
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  관리책임자(정)
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  자산관리처장
                </GridItem>
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  자산관리처
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  051-810-1220
                </GridItem>

                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  접근권한자
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  차장
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  051-810-8585
                </GridItem>

                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  접근권한자
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  과장
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  경영지원실
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  051-810-1297
                </GridItem>

                {/* 이동형 */}
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Text>이동형 영상정보처리기기</Text>
                  <Text fontSize="sm" color="gray.500">
                    (보상 사업지구 내, 출자토지 및 잔여지(인지지 포함))
                  </Text>
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  관리책임자(정)
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  자산관리처장
                </GridItem>
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  자산관리처
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  051-810-1220
                </GridItem>

                <GridItem
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  접근권한자
                </GridItem>
                <GridItem
                  p={4}
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  차장
                </GridItem>
                <GridItem
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  051-810-8585
                </GridItem>
              </Grid>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                4. 영상정보의 촬영시간, 보관기간, 보관장소 및 처리방법
              </Text>
            </HeadingH4>
            <Box
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.200"
              mt={4}
              borderRadius="md"
            >
              <Grid
                templateColumns="1.5fr 1fr 1.5fr 1.5fr 1fr 1fr"
                border="1px solid"
                borderColor="gray.200"
                borderTop="3px solid"
                borderTopColor="blue.500"
                fontSize={{ base: "14px", xl: "18px" }}
                textAlign="center"
              >
                {[
                  "구분",
                  "촬영시간",
                  "보관기간",
                  "촬영범위",
                  "보관장소",
                  "비고",
                ].map((header) => (
                  <GridItem
                    key={header}
                    py={3}
                    bg="gray.50"
                    fontWeight="bold"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    borderRight="1px solid"
                    borderRightColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {header}
                  </GridItem>
                ))}
                {/* 고정형 */}
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  고정형 영상정보처리기기
                </GridItem>
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  24시간
                </GridItem>
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  촬영일로부터 30일
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  건물로비, 지하주차장, 승강기 등
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  로비 안내데스크
                </GridItem>
                <GridItem
                  rowSpan={2}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  접근방지, 시건장치
                </GridItem>

                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  전산실 내부
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  전산실 내부
                </GridItem>

                {/* 이동형 */}
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  이동형 영상정보처리기기
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  필요시
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Text>촬영일로부터 30일</Text>
                  <Text fontSize="sm" color="gray.500">
                    (개인정보 무관 또는 식별 불가능 처리 자료는 소관 업무 종료
                    시)
                  </Text>
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  토지, 보상 관련 지역 등
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  borderRight="1px solid"
                  borderRightColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  자산관리처
                </GridItem>
                <GridItem
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                ></GridItem>
              </Grid>
              <Text
                mt={6}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "16px" }}
              >
                - 처리방법 : 개인영상정보의 목적 외 이용, 제3자 제공, 파기, 열람
                등 요구에 관한 사항을 기록·관리하고, 보관기간 만료 시 복원이
                불가능한 방법으로 영구 삭제(출력물의 경우 파쇄 또는 소각)합니다.
                이동형 영상정보처리기기의 촬영 사진 및 영상은 업무자료 가공
                과정에서 개인정보 식별이 불가능하도록 처리합니다.
              </Text>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                5. 개인영상정보의 확인 방법 및 장소에 관한 사항
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
                <VStack align="stretch">
                  <Text fontWeight="bold" color="blue.500">
                    확인 방법
                  </Text>
                  <Text
                    as="li"
                    style={{ listStyleType: "'· '" }}
                    pl={2}
                    textAlign="justify"
                  >
                    영상정보 관리책임자 또는 접근권한자에게 미리 연락하고
                    방문하시면 확인 가능하며, 열람 등을 요구할 경우에는
                    개인영상정보 열람·존재확인 청구서를 작성하여 담당부서에
                    제출하여야 합니다.
                  </Text>
                </VStack>
                <VStack align="stretch" mt={6}>
                  <Text fontWeight="bold" color="blue.500">
                    확인 장소
                  </Text>
                  <Text as="li" style={{ listStyleType: "'· '" }} pl={2}>
                    부산도시공사 로비안내데스크 / 전산실 내부 / 자산관리처
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                6. 정보주체의 개인영상정보 열람 등 요구에 대한 조치
              </Text>
            </HeadingH4>
            <Box
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.200"
              mt={4}
              borderRadius="md"
              fontSize={{ base: "14px", xl: "18px" }}
              textAlign="justify"
            >
              <VStack align="stretch">
                <Text>
                  정보주체가 개인영상정보에 관하여 열람 또는 존재확인·파기(이하
                  “열람 등”)를 원하는 경우 언제든지 영상정보처리기기 운영자에게
                  요구하실 수 있습니다.단, 정보주체가 촬영된 개인영상정보 및
                  명백히 정보주체의 급박한 생명, 신체, 재산의 이익을 위하여
                  필요한 개인영상정보에 한정됩니다.
                </Text>
                <Text>
                  정보주체는 열람 등 요구를 하는 경우 부산도시공사장에게 [별지1]
                  개인영상정보 청구서(전자문서를 포함한다)에 따라 개인영상정보
                  열람·존재확인 청구를 해야합니다.
                </Text>
                <Text mt={4}>
                  본 기관은 정보주체의 열람 등의 요구를 받았을 때에는 지체없이
                  필요한 조치를 취할 것이며, 이 경우, 열람 등 요구를 한 자가
                  본인이거나 정당한 대리인인지 주민등록증, 운전면허증, 여권 등의
                  신분 증명서를 제출받아 확인하여야 합니다.
                </Text>
                <Text>
                  상기의 규정에도 불구하고 다음에 해당하는 경우에는 정보주체의
                  개인영상정보 열람 등 요구를 거부할 수 있습니다. 이 경우 10일
                  이내에 서면 등으로 거부사유를 정보주체에게 통지하도록
                  하겠습니다.
                </Text>
                <VStack as="ul" align="stretch" pl={4} mt={4}>
                  <Text as="li" style={{ listStyleType: "'가. '" }}>
                    범죄수사·공소유지·재판수행에 중대한 지장을 초래하는 경우
                  </Text>
                  <Text as="li" style={{ listStyleType: "'나. '" }} mt={2}>
                    개인영상정보의 보관기간이 경과하여 파기한 경우
                  </Text>
                  <Text as="li" style={{ listStyleType: "'다. '" }} mt={2}>
                    기타 정보주체의 열람 등 요구를 거부할 만한 정당한 사유가
                    존재하는 경우
                  </Text>
                </VStack>
                <Text mt={4}>
                  본 기관은 이동형 영상정보처리기기의 영상정보를 업무자료로
                  가공하는 과정에서 개인영상정보는 식별이 불가능하게 처리합니다.
                </Text>
                <Text mt={4}>
                  본 기관은 개인영상정보에 관하여 열람 또는 존재확인·삭제를
                  요구한 경우 지체없이 필요한 조치를 하겠습니다.
                </Text>
              </VStack>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                7. 영상정보의 안전성 확보조치
              </Text>
            </HeadingH4>
            <Box
              p={{ base: 6, md: 8 }}
              border="1px solid"
              borderColor="gray.200"
              mt={4}
              borderRadius="md"
              fontSize={{ base: "14px", xl: "18px" }}
              textAlign="justify"
            >
              <VStack align="stretch">
                <Text>
                  본 기관은 개인영상정보가 분실·도난·유출·변조 또는 훼손되지
                  아니하도록 「개인정보 보호법」 제29조 및 시행령 제30조제1항에
                  따라 안전성 확보를 위하여 다음의 조치를 하고 있습니다.
                </Text>
                <VStack as="ul" align="stretch" pl={4} mt={4}>
                  <Text as="li" style={{ listStyleType: "'가. '" }}>
                    개인영상정보의 안전한 처리를 위한 내부 관리계획의 수립·시행
                  </Text>
                  <Text as="li" style={{ listStyleType: "'나. '" }} mt={2}>
                    개인영상정보에 대한 접근통제 및 접근권한의 제한 조치
                  </Text>
                  <Text as="li" style={{ listStyleType: "'다. '" }} mt={2}>
                    개인영상정보를 안전하게 저장·전송할 수 있는 기술의 적용
                  </Text>
                  <Text as="li" style={{ listStyleType: "'라. '" }} mt={2}>
                    처리기록의 보관 및 위·변조 방지를 위한 조치(개인영상정보의
                    생성일시 및 열람할 경우에 열람 목적·열람자·열람 일시 등
                    기록·관리 조치 등)
                  </Text>
                  <Text as="li" style={{ listStyleType: "'마. '" }} mt={2}>
                    개인영상정보의 안전한 물리적 보관을 위한 보관시설 마련 또는
                    잠금장치 설치
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>

          <Box mt={{ base: "80px", lg: "160px", xl: "180px" }}>
            <HeadingH4>
              <Text
                as="span"
                fontSize={{
                  base: "16px",
                  md: "20px",
                  lg: "28px",
                  xl: "36px",
                }}
              >
                8. 영상정보처리기기 운영·관리 방침 변경에 관한 사항
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
                <Text textAlign="justify">
                  이 고정형·이동형 영상정보처리기기 운영·관리방침은 2025년 4월
                  23일부터 적용되며, 법령·정책 또는 보안기술의 변경에 따라
                  내용의 추가·삭제 및 수정이 있을 시에는 시행하기 최소 7일전에
                  본 기관 홈페이지를 통해 변경사유 및 내용 등을 공지하도록
                  하겠습니다.
                </Text>
                <Text mt={4}>
                  · 공고일자 : 2025년 04월 23일 / 시행일자 : 2025년 04월 23일
                </Text>
              </VStack>
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
}
