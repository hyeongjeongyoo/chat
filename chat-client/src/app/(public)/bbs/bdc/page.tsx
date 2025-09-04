import { PageContainer } from "@/components/layout/PageContainer";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

function BdcPage() {
  return (
    <PageContainer>
      <Box
        mt={{ base: "20px", md: "30px", lg: "50px", "2xl": "100px" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Image
          src="/images/contents/image.png"
          alt="준비중입니다."
          width={800}
          height={800}
          style={{ objectFit: "contain" }}
        />
      </Box>
    </PageContainer>
  );
}

export default BdcPage;
