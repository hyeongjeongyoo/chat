"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import HeadingH4 from "./HeadingH4";

const CookiePolicyInfo = () => {
  const content = [
    {
      id: 1,
      type: "main",
      text: "① 부산도시공사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다.",
    },
    {
      id: 2,
      type: "main",
      text: "② 쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터내의 하드디스크에 저장되기도 합니다.",
    },
    {
      id: 3,
      type: "sub",
      prefix: "가.",
      title: "쿠키의 사용목적 :",
      description:
        "이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 보안접속 여부 등을 파악하여 이용자에게 최적화된 정보 제공을 위해 사용됩니다.",
    },
    {
      id: 4,
      type: "sub",
      prefix: "나.",
      title: "쿠키의 설치·운영 및 거부 :",
      description:
        "웹브라우저 상단의 도구>인터넷 옵션>개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부 할 수 있습니다.",
    },
    {
      id: 5,
      type: "sub",
      prefix: "다.",
      title: "쿠키 저장을 거부할 경우 :",
      description: "맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.",
    },
  ];

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
          8조. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" gap={4} fontSize={{ base: "14px", md: "18px" }}>
          {content.map((item) => (
            <Text
              key={item.id}
              textAlign="justify"
              pl={item.type === "sub" ? 4 : 0}
            >
              {item.type === "main" ? (
                item.text
              ) : (
                <>
                  <Text as="span" fontWeight="semibold">
                    {item.prefix} {item.title}
                  </Text>{" "}
                  {item.description}
                </>
              )}
            </Text>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default CookiePolicyInfo;
