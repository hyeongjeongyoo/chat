import { Box, Heading, Text } from "@chakra-ui/react";
import HeadingH4 from "@/components/contents/HeadingH4";

const DestructionInfo = () => {
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
          5조. 개인정보의 파기 절차 및 방법
        </Text>
      </HeadingH4>
      <Box border="1px solid #E2E8F0" borderRadius="md" p={{ base: 4, md: 6 }}>
        <Text textAlign="justify" fontSize={{ base: "14px", xl: "18px" }}>
          ① 부산도시공사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
          불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
        </Text>
        <Text
          mt={4}
          textAlign="justify"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          ② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이
          달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야
          하는 경우에는, 해당 개인정보(또는 개인정보파일)를 별도의
          데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.
        </Text>
        <Text
          mt={4}
          textAlign="justify"
          fontSize={{ base: "14px", xl: "18px" }}
        >
          ③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.
        </Text>

        <Box mt={8} pl={{ base: 2, md: 4 }}>
          <Heading as="h5" fontSize={{ base: "14px", xl: "18px" }} color="blue.500" mb={2}>
            1. 파기절차
          </Heading>
          <Text
            textAlign="justify"
            fontSize={{ base: "14px", xl: "18px" }}
            pl={4}
            position="relative"
            _before={{
              content: '"·"',
              position: "absolute",
              left: "0",
            }}
          >
            부산도시공사는 파기하여야 하는 개인정보(또는 개인정보파일)에 대해
            개인정보 파기계획을 수립하여 파기합니다. 부산도시공사는 파기 사유가
            발생한 개인정보(또는 개인정보파일)를 선정하고, 부산도시공사의
            개인정보 보호책임자의 승인을 받아 개인정보(또는 개인정보파일)를
            파기합니다.
          </Text>
        </Box>

        <Box mt={8} pl={{ base: 2, md: 4 }}>
          <Heading as="h5" fontSize={{ base: "14px", xl: "18px" }} color="blue.500" mb={2}>
            2. 파기방법
          </Heading>
          <Text
            textAlign="justify"
            fontSize={{ base: "14px", xl: "18px" }}
            pl={4}
            position="relative"
            _before={{
              content: '"·"',
              position: "absolute",
              left: "0",
            }}
          >
            부산도시공사는 전자적 파일 형태로 기록·저장된 개인정보는 기록을
            재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는
            분쇄기로 분쇄하거나 소각하여 파기합니다.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default DestructionInfo;
