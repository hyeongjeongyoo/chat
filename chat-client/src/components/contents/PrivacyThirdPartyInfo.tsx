import { Box, Text } from "@chakra-ui/react";
import HeadingH4 from "@/components/contents/HeadingH4";
import ProcessingInfoTable from "@/components/contents/ProcessingInfoTable";
import { privacyThirdPartyData } from "@/data/privacyPolicy";

const PrivacyThirdPartyInfo = () => {
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
          3조. 개인정보의 제3자 제공
        </Text>
      </HeadingH4>
      <Box
        border="1px solid #E2E8F0"
        borderRadius="md"
        p={{ base: 4, md: 6 }}
      >
        <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
          ① 부산도시공사는 정보주체의 동의, 법률의 특별한 규정 등 「개인정보
          보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게
          제공합니다.
        </Text>
        <Text
          mt={4}
          textAlign="justify"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          ② 부산도시공사는 다음과 같이 개인정보를 제3자에게 제공하고
          있습니다.
        </Text>
        <Box mt={4}>
          <ProcessingInfoTable
            title=""
            headers={privacyThirdPartyData.headers}
            data={privacyThirdPartyData.data}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PrivacyThirdPartyInfo; 