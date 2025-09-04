"use client";

import { Grid, GridItem } from "@chakra-ui/react";

const InquiryContactTable = () => {
  return (
    <Grid
      templateColumns="repeat(5, 1fr)"
      border="1px solid"
      borderColor="gray.200"
      borderTop="3px solid"
      borderTopColor="blue.500"
      mt={4}
      fontSize={{ base: "14px", md: "md" }}
      textAlign="center"
    >
      {[
        "개인정보파일",
        "모음부서(처리부서)",
        "열람 등 청구장소",
        "전화번호",
        "비고",
      ].map((header) => (
        <GridItem
          key={header}
          py={3}
          bg="gray.50"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor="gray.200"
          borderRight="1px solid"
          borderRightColor="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {header}
        </GridItem>
      ))}

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        주택임대
      </GridItem>
      <GridItem
        p={2}
        rowSpan={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        복지사업처
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        생산관리관
        <br />
        (당사 사옥 1층)
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1306
        <br />
        051-810-1307
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        상가임대
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        복지사업처(3층)
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1313
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        아르피나 이용회원
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        아르피나
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-740-1208
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        매입임대
      </GridItem>
      <GridItem
        p={2}
        rowSpan={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        맞춤임대처
      </GridItem>
      <GridItem
        p={2}
        rowSpan={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        맞춤임대처
        <br />
        (당사 사옥 2층)
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1314
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        전세임대
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1325
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        재개발임대
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1324
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        주거복지센터
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        주거복지센터
        <br />
        서부센터
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1344
        <br />
        051-810-1407
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        보상관련대상자
      </GridItem>
      <GridItem
        p={2}
        rowSpan={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        자산관리처
      </GridItem>
      <GridItem
        p={2}
        rowSpan={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        자산관리처
        <br />
        (당사 사옥 11층)
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1348
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        출자토지 계약자
        <br />
        인적사항 관리
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1275
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        토지 분양계약자
        <br />
        인적사항 관리
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        단지사업처
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        단지사업처
        <br />
        (당사 사옥 5층)
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        051-810-1406
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        주택 및 상가 분양계약자
        <br />
        인적사항 관리
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        주택사업처
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        주택사업처
        <br />
        (당사 사옥 9층)
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        051-810-1435
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        고객의소리(VOC)
        <br />
        민원사항관리
      </GridItem>
      <GridItem
        p={2}
        rowSpan={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        경영지원실
      </GridItem>
      <GridItem
        p={2}
        rowSpan={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        경영지원실
        <br />
        (당사 사옥 8층)
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1482
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        SMS문자서비스
        <br />
        신청자
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        051-810-1294
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>

      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        메이커스테이션
        <br />
        멤버쉽
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        도시재생처
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        도시재생지원센터
      </GridItem>
      <GridItem
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        borderRight="1px solid"
        borderRightColor="gray.200"
      >
        051-717-2522
      </GridItem>
      <GridItem
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>
    </Grid>
  );
};

export default InquiryContactTable;
