import { Box, Container, Text, Link, Flex, Image } from "@chakra-ui/react";

export function Footer() {
  const footerLinks = [
    { label: "개인정보처리방침", href: "/privacy-policy", isHighlighted: true },
    { label: "영상정보처리기기운영·관리방침", href: "/video-policy" },
    { label: "아르피나운영지침", href: "/operation-guidelines" },
    { label: "찾아오시는 길", href: "/arpina/location" },
    { label: "청소년문화센터", href: "/youth/committee" },
    { label: "이메일무단수집거부", href: "/reject-spam-email" },
  ];

  return (
    <Box
      as="footer"
      bg="white"
      color="#333333"
      mt={{ base: "80px", md: "120px", lg: "180px" }}
    >
      <Container maxW={{ base: "90%", "2xl": "1600px" }} px={0}>
        {/* Main Content Area */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "flex-start" }}
          py={8}
        >
          {/* Left Section: Logo, Address, Contact */}
          <Box
            textAlign={{ base: "center", md: "left" }}
            mb={{ base: 6, md: 0 }}
          >
            <Image
              src="/images/logo/logo4.png" // Replace with your actual logo path
              alt="BMC 부산유스호스텔 아르피나 로고"
              h={{ base: "35px", md: "40px" }} // Adjusted height for responsiveness
              mb={4}
              mx={{ base: "auto", md: 0 }}
            />
            <Text fontSize="sm" color="#333333" mb={1}>
              (48089) 부산광역시 해운대구 해운대해변로 35 (우동)
            </Text>
            <Flex
              justify={{ base: "center", md: "flex-start" }}
              gap={4} // Provides space between T. and F.
              color="#333333"
              fontSize="sm"
            >
              <Text>T.051-731-9800</Text>
              <Text>F.051-740-3205</Text>
            </Flex>
          </Box>

          {/* Right Section: Links and Social Icon */}
          <Flex
            direction="column"
            align={{ base: "center", md: "flex-end" }}
            mt={{ base: 4, md: 0 }}
          >
            <Flex
              wrap="wrap"
              justify={{ base: "center", md: "flex-end" }}
              gapX={4}
              gapY={2}
              mb={4}
              maxW={{ base: "100%", md: "450px" }} // To control wrapping on md+
              textAlign={{ base: "center", md: "right" }}
            >
              {footerLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  fontSize="xs"
                  fontWeight={item.isHighlighted ? "bold" : "300"}
                  color={item.isHighlighted ? "yellow.500" : "#555555"} // Changed to yellow
                  _hover={{
                    textDecoration: "underline",
                    color: item.isHighlighted ? "yellow.600" : "black", // Changed to yellow
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Flex>
            <Flex gap={3} align="center">
              <Link href="/" aria-label="호스텔링 인터내셔널">
                <Image
                  src="/images/icons/hostelling international.png" // Replace with your actual icon path
                  alt="호스텔링 인터내셔널 로고"
                  boxSize={{ base: "28px", md: "32px" }}
                />
              </Link>
              <Link
                href="https://www.instagram.com/bmc_arpina"
                target="_blank"
                aria-label="인스타그램 방문"
              >
                <Image
                  src="/images/icons/instagram_icon.png" // Replace with your actual icon path
                  alt="인스타그램 로고"
                  boxSize={{ base: "28px", md: "32px" }}
                />
              </Link>
            </Flex>
          </Flex>
        </Flex>

        {/* Copyright Section */}
        <Box
          borderTop="1px solid"
          borderColor="gray.300"
          py={6}
          textAlign={{ base: "center", md: "left" }} // Copyright to the left on desktop
        >
          <Text fontSize="xs" color="#657580">
            Copyright (c) 2025 Busan Youth Hostel Arpina. All Rights Reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
