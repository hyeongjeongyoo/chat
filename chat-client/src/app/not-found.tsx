"use client";
import { Box, Heading, Text, Button, Flex, Image } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box className="error-wrap" position="relative" height="100vh">
      <Box
        className="img-box"
        position="absolute"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={-1}
      >
        <Image
          src="/images/contents/404_bg.png"
          alt="404 배경 이미지"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>

      <Flex
        className="error-box"
        direction="column"
        justify="center"
        width="100%"
        height="100%"
        maxWidth="1600px"
        margin="0 auto"
      >
        <Box className="txt-box">
          <Heading
            as="p"
            className="tit"
            color="#05140E"
            fontSize="88px"
            fontWeight={700}
          >
            PAGE NOT FOUND
          </Heading>
          <Text
            className="txt"
            marginTop="50px"
            color="#05140E"
            fontSize="40px"
            fontWeight={500}
            lineHeight="1.3"
            textShadow="0 4px 4px rgba(255, 255, 255, .25)"
          >
            홈페이지 이용에 불편을 드려 죄송합니다. <br />
            현재 접속하신 페이지는 없는 페이지거나, <br />
            일시적인 오류일수 있습니다.
          </Text>
        </Box>

        <Flex
          className="btn-box"
          flexFlow="row wrap"
          alignItems="center"
          marginTop="40px"
          gap={4}
        >
          <Link href="/">
            <Button
              className="error-btn-home"
              bg="#4CCEC6"
              borderColor="#4CCEC6"
              borderWidth="1px"
              borderStyle="solid"
              borderRadius="10px"
              minWidth="150px"
              padding="10px"
              color="white"
              fontSize="20px"
              fontWeight={600}
              textAlign="center"
              transition="all .3s ease-out"
              _hover={{
                bg: "white",
                color: "#4CCEC6",
              }}
            >
              홈페이지
            </Button>
          </Link>
          <Button
            className="error-btn-back"
            bg="#0D344E"
            borderColor="#0D344E"
            borderWidth="1px"
            borderStyle="solid"
            borderRadius="10px"
            minWidth="150px"
            padding="10px"
            color="white"
            fontSize="20px"
            fontWeight={600}
            textAlign="center"
            transition="all .3s ease-out"
            _hover={{
              bg: "white",
              color: "#0D344E",
            }}
            onClick={() => router.back()}
          >
            이전 페이지로
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
