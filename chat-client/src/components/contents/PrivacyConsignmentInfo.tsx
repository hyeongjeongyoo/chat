import { Box, Text } from "@chakra-ui/react";
import HeadingH4 from "@/components/contents/HeadingH4";
import ProcessingInfoTable from "@/components/contents/ProcessingInfoTable";
import { privacyConsignmentData } from "@/data/privacyPolicy";

const PrivacyConsignmentInfo = () => {
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
          4조. 개인정보 처리의 위탁
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
          ① 부산도시공사는 원활한 개인정보 업무처리를 위하여 다음과 같이
          개인정보 처리업무를 위탁하고 있습니다.
        </Text>
        <Box mt={4}>
          <ProcessingInfoTable
            title=""
            headers={privacyConsignmentData.headers}
            data={privacyConsignmentData.data}
          />
        </Box>
        <Text
          mt={4}
          textAlign="justify"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          ② 부산도시공사는 위탁계약 체결시 「개인정보 보호법」 제26조에 따라
          위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁
          제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서
          등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고
          있습니다.
        </Text>
        <Text
          mt={4}
          textAlign="justify"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          ③ 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체없이 본 개인정보
          처리방침을 통하여 공개하도록 하겠습니다.
        </Text>
      </Box>
    </Box>
  );
};

export default PrivacyConsignmentInfo;
