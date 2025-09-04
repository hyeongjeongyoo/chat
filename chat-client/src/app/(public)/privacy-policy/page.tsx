"use client";

import {
  Box,
  Text,
  Heading,
  Link as ChakraLink,
  Icon,
  Grid,
  GridItem,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/sections/HeroSection";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import InfoBoxList02 from "@/components/contents/InfoBoxList02";
import HeadingH4 from "@/components/contents/HeadingH4";
import {
  privacyInfoData,
  privacyProcessingInfo1,
  privacyProcessingInfo2,
  privacyImpactAssessmentData,
  privacyThirdPartyData,
  privacyConsignmentData,
} from "@/data/privacyPolicy";
import PrivacyInfoGrid from "@/components/contents/PrivacyInfoGrid";
import ProcessingInfoTable from "@/components/contents/ProcessingInfoTable";
import { FiDownload } from "react-icons/fi";
import NextLink from "next/link";
import PrivacyOfficerTable from "@/components/contents/PrivacyOfficerTable";
import InquiryContactTable from "@/components/contents/InquiryContactTable";
import RemedyInfo from "@/components/contents/RemedyInfo";
import CookiePolicyInfo from "@/components/contents/CookiePolicyInfo";
import ManagementLevelResults from "@/components/contents/ManagementLevelResults";
import PolicyHistory from "@/components/contents/PolicyHistory";
import PrivacyThirdPartyInfo from "@/components/contents/PrivacyThirdPartyInfo";
import PrivacyConsignmentInfo from "@/components/contents/PrivacyConsignmentInfo";
import DestructionInfo from "@/components/contents/DestructionInfo";

export default function PrivacyPolicyPage() {
  const heroData = useHeroSectionData();

  const introText = [
    "부산도시공사는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.",
  ];

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
              개인정보 처리방침 안내
            </Text>
          </HeadingH4>
          <InfoBoxList02 items={introText} hideBullets />

          <Box mt={{ base: 10, md: 20 }}>
            <Heading
              as="h4"
              size="lg"
              textAlign="center"
              mb={{ base: 6, md: 10 }}
              color="primary.500"
            >
              [주요 개인정보 처리 표시(라벨링)]
            </Heading>
            <PrivacyInfoGrid data={privacyInfoData} />
          </Box>

          <Box id="section-1" mt={{ base: "80px", lg: "160px", xl: "180px" }}>
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
                1조. 개인정보의 처리목적, 수집 항목, 보유 및 이용기간
              </Text>
            </HeadingH4>
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
            >
              <Box>
                <ProcessingInfoTable
                  title={privacyProcessingInfo1.title}
                  headers={privacyProcessingInfo1.headers}
                  data={privacyProcessingInfo1.data}
                />
              </Box>
              <Box mt={16}>
                <ProcessingInfoTable
                  title={privacyProcessingInfo2.title}
                  headers={privacyProcessingInfo2.headers}
                  data={privacyProcessingInfo2.data}
                />
              </Box>
              <Box mt={16}>
                <Text
                  textAlign="justify"
                  fontSize={{ base: "14px", xl: "18px" }}
                >
                  ③ 개인정보파일의 처리목적·보유기간 및 항목은 개인정보파일의
                  특성에 따라 달리 규정하고 있으며, 개인정보파일별 상세한 내용은
                  개인정보포털을 통해 확인하시기 바랍니다.
                </Text>
                <Text
                  color="#FAB20B"
                  mt={2}
                  fontSize={{ base: "14px", md: "md" }}
                >
                  ※ 개인정보보호위원회 개인정보포털(www.privacy.go.kr) =&gt;
                  개인서비스 =&gt; 정보주체 권리행사 =&gt; 개인정보 열람등 요구
                  =&gt; 개인정보파일 검색
                </Text>
              </Box>
            </Box>
          </Box>
          <Box id="section-2" mt={{ base: "80px", lg: "160px", xl: "180px" }}>
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
                2조. 개인정보 영향평가의 수행
              </Text>
            </HeadingH4>
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
            >
              <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
                ① 부산도시공사는 운영하고 있는 개인정보 처리시스템이 정보주체의
                개인정보파일에 미칠 영향에 대해 조사, 분석, 평가하기 위해
                「개인정보 보호법」 제33조에 따라 "개인정보 영향평가"를 받고
                있습니다.
              </Text>
              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ② 부산도시공사는 다음 개인정보파일에 대해 영향평가를
                수행하였습니다.
              </Text>
              <Box mt={4}>
                <ProcessingInfoTable
                  title=""
                  headers={privacyImpactAssessmentData.headers}
                  data={privacyImpactAssessmentData.data}
                />
              </Box>
            </Box>
          </Box>
          <Box id="section-3">
            <PrivacyThirdPartyInfo />
          </Box>
          <Box id="section-4">
            <PrivacyConsignmentInfo />
          </Box>
          <Box id="section-5">
            <DestructionInfo />
          </Box>
          <Box id="section-6" mt={{ base: "80px", lg: "160px", xl: "180px" }}>
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
                6조. 정보주체와 법정대리인의 권리·의무 및 행사방법
              </Text>
            </HeadingH4>
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
            >
              <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
                ① 정보주체는 부산도시공사에 대해 언제든지 개인정보
                열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
              </Text>
              <Text
                textAlign="justify"
                fontSize={{ base: "14px", xl: "16px" }}
                pl={4}
                mt={2}
                color="#FAB20B"
              >
                ※ 만 14세 미만 아동에 관한 개인정보의 열람 등 요구는
                법정대리인이 직접 해야 하며, 만 14세 이상의 미성년자인
                정보주체는 정보주체의 개인정보에 관하여 미성년자 본인이 권리를
                행사하거나 법정대리인을 통하여 권리를 행사할 수도 있습니다.
              </Text>

              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ② 권리 행사는 부산도시공사에 대해 「개인정보 보호법」 시행령
                제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여
                하실 수 있으며, 부산도시공사는 이에 대해 지체없이
                조치하겠습니다.
              </Text>
              {/* <ChakraLink
                as={NextLink}
                href="/files/private0601.pdf"
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                mt={4}
                p={4}
                bg="#FAB20B"
                color="white"
                borderRadius="md"
                _hover={{ textDecoration: "none", bg: "#E4A30D" }}
                w={{ base: "100%", md: "auto" }}
              >
                <Text fontSize={{ base: "14px", md: "16px" }}>
                  [ 개인정보 처리 방법에 관한 고시(제2023-12호) 별지 제8호 ]
                  개인정보 열람 요구서
                </Text>
                <Icon as={FiDownload} ml={2} />
              </ChakraLink> */}
              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ③ 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등
                대리인을 통하여 하실 수도 있습니다. 이 경우 "개인정보 처리
                방법에 관한 고시" 별지 제11호 서식에 따른 위임장을 제출하셔야
                합니다.
              </Text>
              {/* <ChakraLink
                as={NextLink}
                href="/files/private0602.pdf"
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                mt={4}
                p={4}
                bg="#FAB20B"
                color="white"
                borderRadius="md"
                _hover={{ textDecoration: "none", bg: "#E4A30D" }}
                w={{ base: "100%", md: "auto" }}
              >
                <Text fontSize={{ base: "14px", md: "16px" }}>
                  [ 개인정보 처리 방법에 관한 고시(제2023-12호) 별지 제11호 ]
                  위임장
                </Text>
                <Icon as={FiDownload} ml={2} />
              </ChakraLink> */}

              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ④ 개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조
                제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수
                있습니다.
              </Text>
              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가
                수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수
                없습니다.
              </Text>
              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ⑥ 부산도시공사는 정보주체 권리에 따른 열람의 요구, 정정·삭제의
                요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나
                정당한 대리인인지를 확인합니다.
              </Text>
              <Text
                mt={4}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                ⑦ 이의제기 절차 및 방법은 다음과 같습니다.
              </Text>
              <Box pl={4} mt={2}>
                <Text
                  textAlign="justify"
                  fontSize={{ base: "14px", xl: "18px" }}
                >
                  1. 정보주체는 개인정보 열람, 정정·삭제, 처리정지에 대한 조치에
                  불만이 있거나 이의가 있을 경우에는 이의신청서를 작성하여
                  개인정보보호 담당자에게 이의제기를 할 수 있습니다.
                </Text>
                <Text
                  mt={2}
                  textAlign="justify"
                  fontSize={{ base: "14px", xl: "18px" }}
                >
                  2. 부산도시공사는 이의제기를 받은 날로부터 10일 이내에
                  이의제기 내용을 검토한 후, 그 결과에 따라 조치하고
                  개인정보(열람, 정정, 삭제, 처리정지)요구에 대한 결과 통지서에
                  따라 정보주체에게 안내드립니다.
                </Text>
              </Box>
              {/* <ChakraLink
                as={NextLink}
                href="/files/private0603.pdf"
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                mt={4}
                p={4}
                bg="#FAB20B"
                color="white"
                borderRadius="md"
                _hover={{ textDecoration: "none", bg: "#E4A30D" }}
                w={{ base: "100%", md: "auto" }}
              >
                <Text fontSize={{ base: "14px", md: "16px" }}>
                  개인정보 열람 등 결정 이의신청서
                </Text>
                <Icon as={FiDownload} ml={2} />
              </ChakraLink> */}
            </Box>
          </Box>
          <Box id="section-7" mt={{ base: "80px", lg: "160px", xl: "180px" }}>
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
                7조. 개인정보의 안전성 확보조치
              </Text>
            </HeadingH4>
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
            >
              <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
                부산도시공사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를
                취하고 있습니다.
              </Text>
              <Box mt={4} pl={{ base: 2, md: 4 }}>
                <Text mt={2} fontSize={{ base: "14px", xl: "18px" }}>
                  <Text as="span" color="blue.500" fontWeight="semibold" mr={2}>
                    1. 관리적 조치 :
                  </Text>
                  내부관리계획 수립·시행, 정기적 직원 교육
                </Text>
                <Text mt={2} fontSize={{ base: "14px", xl: "18px" }}>
                  <Text as="span" color="blue.500" fontWeight="semibold" mr={2}>
                    2. 기술적 조치 :
                  </Text>
                  개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치,
                  고유식별정보 등의 암호화, 보안프로그램 설치
                </Text>
                <Text mt={2} fontSize={{ base: "14px", xl: "18px" }}>
                  <Text as="span" color="blue.500" fontWeight="semibold" mr={2}>
                    3. 물리적 조치 :
                  </Text>
                  전산실, 자료보관실 등의 접근통제
                </Text>
              </Box>
              <Text
                mt={8}
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
              >
                부산도시공사는 개인정보의 안전성을 확보하기 위하여 법령에서
                규정하고 있는 사항 이외에도 다음과 같은 활동을 시행하고
                있습니다.
              </Text>
              <Box mt={4} pl={{ base: 2, md: 4 }}>
                <Text mt={2} fontSize={{ base: "14px", xl: "18px" }}>
                  <Text as="span" color="blue.500" fontWeight="semibold" mr={2}>
                    1. 개인정보보호 활동 :
                  </Text>
                  개인정보보호 문화 조성 위한 자체 캠페인 추진 등
                </Text>
              </Box>
            </Box>
          </Box>
          <Box id="section-8">
            <CookiePolicyInfo />
          </Box>
          <Box id="section-9" mt={{ base: "80px", lg: "160px", xl: "180px" }}>
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
                9조. 개인정보 보호책임자 및 개인정보 열람청구
              </Text>
            </HeadingH4>
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              p={{ base: 4, md: 6 }}
            >
              <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
                ① 부산도시공사는 「개인정보 보호법」 제35조에 따라 개인정보
                보호책임자를 지정하고 있습니다.
              </Text>
              <PrivacyOfficerTable />
              <Text
                textAlign="justify"
                fontSize={{ base: "14px", xl: "18px" }}
                mt={16}
              >
                ② 정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의
                열람청구를 아래의 부서에 할 수 있습니다. 부산도시공사는
                정보주체의 개인정보 열람청구가 신속하게 처리되도록
                노력하겠습니다.
              </Text>
              <InquiryContactTable />
            </Box>
          </Box>
          <Box id="section-10">
            <RemedyInfo />
          </Box>
          <Box id="section-11">
            <ManagementLevelResults />
          </Box>
          <Box id="section-12">
            <PolicyHistory />
          </Box>
        </Box>
      </PageContainer>
    </Box>
  );
}
