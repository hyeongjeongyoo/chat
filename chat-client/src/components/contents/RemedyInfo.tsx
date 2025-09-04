"use client";

import { Box, Heading, Text, VStack, Link, HStack } from "@chakra-ui/react";
import NextLink from "next/link";
import HeadingH4 from "./HeadingH4";

const RemedyInfo = () => {
  const remedies = [
    {
      name: "개인정보분쟁조정위원회",
      contact: "(국번없이) 1833-6972",
      url: "www.kopico.go.kr",
    },
    {
      name: "개인정보침해신고센터",
      contact: "(국번없이) 118",
      url: "privacy.kisa.or.kr",
    },
    {
      name: "대검찰청",
      contact: "(국번없이) 1301",
      url: "www.spo.go.kr",
    },
    {
      name: "경찰청",
      contact: "(국번없이) 182",
      url: "ecrm.cyber.go.kr",
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
          10조. 권익침해 구제방법
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" gap={4}>
          <Text textAlign="justify" fontSize={{ base: "14px", md: "18px" }}>
            정보주체는 개인정보침해로 인한 구제를 받기 위하여
            개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에
            분쟁해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타
            개인정보침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기
            바랍니다.
          </Text>

          <VStack
            align="start"
            gap={2}
            my={2}
            fontSize={{ base: "14px", md: "18px" }}
          >
            {remedies.map((remedy, index) => (
              <Text key={index} color="blue.600">
                {`${index + 1}. `}
                {remedy.name} : {remedy.contact}{" "}
                <Link
                  as={NextLink}
                  href={`https://${remedy.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ({remedy.url})
                </Link>
              </Text>
            ))}
          </VStack>

          <Text textAlign="justify" fontSize={{ base: "14px", md: "18px" }}>
            「개인정보 보호법」 제35조(개인정보의 열람), 제36조(개인정보의
            정정·삭제), 제37조(개인정보의 처리정지 등)의 규정에 의한 요구에
            대하여 공공기관의 장이 행한 처분 또는 부작위로 인하여 권리 또는
            이익의 침해를 받은 자는 행정심판법이 정하는 바에 따라 행정심판을
            청구할 수 있습니다.
          </Text>

          <HStack mt={2} fontSize={{ base: "14px", md: "18px" }}>
            <Text color="blue.600" fontWeight="bold">
              ▸
            </Text>
            <Text color="blue.600">
              중앙행정심판위원회 : (국번없이) 110{" "}
              <Link
                as={NextLink}
                href="https://ecrm.cyber.go.kr"
                target="_blank"
                rel="noopener noreferrer"
              >
                (ecrm.cyber.go.kr)
              </Link>
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default RemedyInfo;
