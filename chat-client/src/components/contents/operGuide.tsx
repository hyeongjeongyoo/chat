"use client";

import { Box, List, Text, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

// 리스트 아이템 스타일을 위한 공통 컴포넌트
interface StyledListItemProps {
  children: ReactNode;
  color?: string;
  isNested?: boolean;
}

const StyledListItem = ({
  children,
  color = "#393939",
  isNested = false,
}: StyledListItemProps) => {
  // 반응형 폰트 크기 설정
  const fontSize = useBreakpointValue({
    base: "sm", // sm 이하: 2단계 줄임 (lg -> md)
    md: "md", // md: 1단계 줄임 (lg -> lg)
    lg: "lg", // lg: 1단계 줄임 (2xl -> xl)
  });

  return (
    <List.Item
      _marker={{ fontSize: "0" }}
      color={color}
      fontSize={fontSize}
      style={{
        display: "flex",
        flexFlow: "row wrap",
        alignItems: "center",
        marginTop: "10px",
      }}
      _before={{
        content: '"·"',
        alignSelf: "flex-start",
        marginRight: "10px",
      }}
    >
      <Text flex={"1 1 0"} textAlign="justify">
        {children}
      </Text>
      {isNested && <List.Root ps="3" w={"100%"} flexBasis="100%" />}
    </List.Item>
  );
};

// 이용안내 데이터 (계층 구조)
interface GuideItem {
  text: string;
  subItems?: string[];
}

const guideItems: GuideItem[] = [
  {
    text: "상기요금은 정상요금이며 부가세 포함입니다.",
  },
  {
    text: "체크인 오후 3:00부터 체크아웃 오전 11:00까지",
  },
  {
    text: "객실 내 발생되는 음식물 쓰레기 및 재활용 쓰레기는 3층 복도 끝 세탁실 옆 재활용 분리수거함에 분리수거 바랍니다.",
  },
  {
    text: "객실,내외(복도,로비,베란다)에서는 화기사용, 과도한음주, 소란행위(고성방가), 베란다에 매달리는 행위, 객실외부로 쓰레기투척 등 타인에게 피해를 주는 행위를 금합니다.",
  },
  {
    text: "또한 규격에 맞지 않는 보조배터리 사용은 화재의 위험이 있어 엄격히 금지 됩니다.",
  },
  {
    text: "건물내에서는 금연이며, 흡연이 적발될 경우 즉시 강제 퇴실 조치됩니다. 또한, 시설물 손괴 등 공공시설에 피해를 가할 경우에는 배상의 책임이 있음을 안내드립니다.",
  },
  {
    text: "욕실에서는 염색이나 색소입욕제 사용을 금지합니다.",
  },
  {
    text: "귀중품은 프런트에 보관바랍니다. 보관하지 않은 분실문은 당사의 책임이 없습니다. 또한 습득한 분실물은 1개월 보관 후 폐기처리 됩니다.",
  },
  {
    text: "객실 레이트 체크아웃 관련",
    subItems: [
      "적용내용 : 15:00까지, 요청일 1박이용요금 50% 적용",
      "입실 당일 또는 퇴실일 오전 프론트(740-3201) 협의 후 가능",
    ],
  },
];

const OperGuide: React.FC = () => {
  // 반응형 폰트 크기 설정
  const titleFontSize = useBreakpointValue({
    base: "lg", // sm 이하: 2단계 줄임 (2xl -> lg)
    md: "xl", // md: 1단계 줄임 (2xl -> xl)
    lg: "2xl", // lg: 원래 크기 (2xl)
  });

  const bottomTextFontSize = useBreakpointValue({
    base: "md", // sm 이하: 2단계 줄임 (lg -> md)
    md: "lg", // md: 1단계 줄임 (lg -> lg)
    lg: "lg", // lg: 원래 크기 (lg)
  });

  return (
    <Box
      className="oper-guide"
      mt={{ base: 10, md: 30, lg: 50 }}
      p={{ base: 5, md: 7, lg: 10 }}
      style={{
        backgroundColor: "#F7F8FB",
        borderRadius: "20px",
      }}
    >
      <Text color="#393939" fontSize={titleFontSize} fontWeight="medium">
        - 이용안내
      </Text>
      <List.Root>
        {guideItems.map((item, index) => (
          <StyledListItem key={`guide-${index}`} isNested={!!item.subItems}>
            {item.text}
            {item.subItems && (
              <List.Root ps="3" w={"100%"}>
                {item.subItems.map((subItem, subIndex) => (
                  <StyledListItem
                    key={`sub-${index}-${subIndex}`}
                    color="#838383"
                  >
                    {subItem}
                  </StyledListItem>
                ))}
              </List.Root>
            )}
          </StyledListItem>
        ))}
      </List.Root>
      <Text
        mt="10px"
        color="#FAB20B"
        fontWeight="semibold"
        fontSize={bottomTextFontSize}
      >
        객실 판매 상황에 따라 거절 될수 있음.
      </Text>
    </Box>
  );
};

export default OperGuide;
