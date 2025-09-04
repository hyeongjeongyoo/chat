"use client";

import { Link } from "@chakra-ui/react";

interface MapButtonProps {
  url: string;
  bgColor: string;
  hoverColor: string;
}

export default function MapButton({
  url,
  bgColor,
  hoverColor,
}: MapButtonProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      w="100%"
      h="40px"
      borderRadius="50px"
      bg={bgColor}
      color="#fff"
      fontWeight="700"
      fontSize="md"
      _hover={{ bg: hoverColor, textDecoration: "none" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      지도보기
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M17 17H3V3H8V1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H17C17.5304 19 18.0391 18.7893 18.4142 18.4142C18.7893 18.0391 19 17.5304 19 17V12H17V17Z"
          fill="white"
        />
        <path
          d="M10.9996 1L14.2996 4.3L8.59961 10L9.99961 11.4L15.6996 5.7L18.9996 9V1H10.9996Z"
          fill="white"
        />
      </svg>
    </Link>
  );
}
