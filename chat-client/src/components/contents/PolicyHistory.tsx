"use client";

import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import HeadingH4 from "./HeadingH4";
import { FiDownload } from "react-icons/fi";
import NextLink from "next/link";

const PolicyHistory = () => {
  const history = [
    {
      dateRange: "2024.07.01. ~ 2024.09.30.",
      downloadUrl: "/files/privacyoldandnew.pdf",
    },
    {
      dateRange: "2023.08.30. ~ 2024.06.30.",
      downloadUrl: "/files/privacyoldandnew2.pdf",
    },
    { dateRange: "2022.12.07. ~ 2023.08.29." },
    { dateRange: "2022.05.12. ~ 2022.12.06." },
    { dateRange: "2022.03.31. ~ 2022.05.11." },
    { dateRange: "2021.04.21. ~ 2022.03.31." },
    { dateRange: "2021.02.18. ~ 2021.04.20." },
    { dateRange: "2020.11.26. ~ 2021.02.17." },
    { dateRange: "2020.06.01. ~ 2020.11.25." },
    { dateRange: "2019.04.12. ~ 2020.05.31." },
    { dateRange: "2016.12.28. ~ 2019.04.11." },
    { dateRange: "2015.05.06. ~ 2016.12.27." },
    { dateRange: "2011.11.02. ~ 2015.05.05." },
    { dateRange: "2011.07.14. ~ 2011.11.01." },
    { dateRange: "2010.07.27. 이전 적용지침" },
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
          12조. 개인정보 처리방침의 변경
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" fontSize={{ base: "14px", md: "18px" }}>
          <Text fontWeight="semibold">
            이 개인정보 처리방침은 2024.10.1부터 적용됩니다.
          </Text>
          <Text color="blue.600" fontWeight="semibold" mt={3}>
            이전의 개인정보처리방침은 아래에서 확인할 수 있습니다.
          </Text>
          <VStack align="stretch" mt={4}>
            {history.map((item, index) => (
              <Box key={index} mt={index > 0 ? 4 : 0}>
                <Text>
                  <Text as="span" color="gray.500" mr={2}>
                    *
                  </Text>
                  개인정보 처리방침 ({item.dateRange})
                </Text>
                {item.downloadUrl && (
                  <Box mt={2}>
                    <ChakraLink
                      as={NextLink}
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      bgColor="#FAB20B"
                      color="white"
                      _hover={{ bgColor: "#E4A30D", textDecoration: "none" }}
                      px={3}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                    >
                      신구대비표
                      <Icon as={FiDownload} ml={2} />
                    </ChakraLink>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PolicyHistory;
