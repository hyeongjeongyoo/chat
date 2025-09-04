"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import HeadingH4 from "./HeadingH4";

const ManagementLevelResults = () => {
  const content = [
    "① 부산도시공사는 정보주체의 개인정보를 안전하게 관리하기 위해 「개인정보 보호법」 제11조에 따라 매년 개인정보보호위원회에서 실시하는 “공공기관 개인정보 관리수준 진단”을 받고 있습니다.",
    "② 부산도시공사는 ‘2021년도 개인정보 관리수준진단 평가에서 ‘양호’ 등급을 획득하였습니다.",
    "③ 부산도시공사는 2021년도 개인정보 관리수준진단 결과에 따라 다음과 같이 개선 조치하였습니다.",
  ];
  const improvements = ["- 개인정보 재해·재난대응 절차서 정비"];

  return (
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
          11조. 개인정보 관리수준 진단 결과
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" gap={4} fontSize={{ base: "14px", md: "18px" }}>
          {content.map((text, index) => (
            <Text key={index} textAlign="justify">
              {text}
            </Text>
          ))}
          <Text textAlign="justify" pl={4}>
            {improvements[0]}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default ManagementLevelResults;
