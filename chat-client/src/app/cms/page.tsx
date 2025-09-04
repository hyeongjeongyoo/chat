"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

export default function Cms() {
  const { isAuthenticated, isLoading } = useRecoilValue(authState);
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/cms/login");
    } else {
      router.push("/cms/menu");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bg={colors.bg}
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <></>;
}
