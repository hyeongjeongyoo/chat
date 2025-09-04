"use client";
import { Box, Text, Heading, List, Flex, VStack } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";

// 타입 정의
interface TermItem {
  text?: string;
  subItems?: (string | TermItem)[];
}

interface Term {
  title: string;
  content?: string;
  isList: boolean;
  items?: (string | TermItem)[];
}

// 스타일 상수 정의
const styles = {
  heading: {
    color: "#373636",
    fontSize: { base: "lg", md: "xl", lg: "2xl" },
    fontWeight: "500",
    mb: 2,
  },
  text: {
    color: "#393939",
    fontSize: { base: "sm", md: "md", lg: "lg" },
    fontWeight: "400",
    lineHeight: "1.6",
  },
  numberBadge: {
    color: "#2E3192",
    fontSize: { base: "sm", md: "md", lg: "lg" },
    fontWeight: "400",
    mr: 5,
  },
  nestedList: {
    pl: 1,
  },
  nestedListText: {
    color: "#838383",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
  },
};

// 약관 데이터 정의
const termsData: Term[] = [
  {
    title: "제1조(목적)",
    content:
      '이 약관은 부산도시공사 아르피나(이하"아르피나"라 한다)가 제공하는 체육시설 및 서비스를 이용하는 이용자와 아르피나의 권리와 의무에 관한 사항을 정함을 목적으로 하고, 본 약관에 규정되지 않은 사항에 관하여는 법령 또는 관습에 의하는 것으로 한다.',
    isList: false,
  },
  {
    title: "제2조(약관의 효력 및 변경)",
    isList: true,
    items: [
      "이 약관의 내용은 아르피나의 안내프런트에 게시하거나 회원가입 시 가입신청서 확인 및 구두로 설명함으로써 그 효력이 발생한다.",
      "아르피나는 필요할 경우 약관 및 회원가입 신청서를 변경할 수 있으며, 변경된 내용은 제1항과 같은 방법으로 공지함으로써 그 효력이 발생한다.",
      "이용자가 변경된 약관에 동의하지 않을 경우 계약해지를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후의 계속적인 체육시설 및 서비스 이용은 변경된 약관에 동의한 것으로 간주한다.",
    ],
  },
  {
    title: "제3조(회원가입)",
    isList: true,
    items: [
      "신규 및 재가입 신청 시 회원가입 신청서는 이용자가 직접 수기로 작성하여야 한다.",
      "회원가입 신청서에는 현재 사실과 일치하는 완전한 정보를 기재하여야 한다.",
      "회원가입 신청서 오기로 인해 발생하는 불이익에 대해 아르피나에 책임을 물을 수 없다.",
      "회원의 개인정보 변경이 있을 시에는 즉시 갱신하여야 한다.",
      {
        text: "75세 이상, 개인 지병이 있는 사람이 신규회원가입 및 재가입 신청을 할 경우에는 아래의 확인서를 요구할 수 있으며, 안전사고 예방 등을 위하여 이용을 제한할 수 있다.",
        subItems: [
          "회원가입 보호자 확인서",
          "건강상태 확인서(병명, 복용 중인 약, 병원 진료 의사 소견 등 기재)",
        ],
      },
    ],
  },
  {
    title: "제4조(환불기준)",
    isList: true,
    items: [
      "환불은 본인 의사에 의해 가능하며, 직접 탈회 환불 신청서를 작성하여야 한다.",
      "아르피나가 서비스를 제공하지 못하여 탈회하는 경우에는 위약금을 받지 않는다.",
      "환불금은 총결재액의 10%에 해당하는 위약금을 공제한 후, 사용기한이 남아 있는 날을 일할계산 하여 지급한다.",
      "환불신청 시 계약자 명의의 본인 통장 사본을 제출하여야 한다.",
      "이용자가 미성년자인 경우 대리인이 환불 신청을 할 수 있으며, 가족 관계 증명서를 제출하여야 한다.",
      "환불금의 지급은 아르피나의 운영일과 업무에 따라 달라질 수 있다.",
    ],
  },
  {
    title: "제5조(시설운영 및 휴관)",
    isList: true,
    items: [
      {
        text: "체육시설의 운영시간은 다음과 같다. 다만, 개별시설별 운영시간은 제반 사항을 고려하여 아르피나가 임의로 조정할 수 있다.",
        subItems: [
          "골프연습장 : 06:00 ~ 22:00",
          "수영장 : 평일 06:00 ~ 22:00, 주말·공휴일 07:00 ~17:00",
        ],
      },
      "정기휴관 일은 매월 2번째 화요일과 추석, 설날 당일로 한다.",
      "제2호의 정기휴관일 외에 행정지시 또는 시설의 정비 및 보수, 기타 운영상 불가피한 사유가 발생할 경우에는 휴관할 수 있으며 해당 기간만큼 이용 기간 연장한다.",
    ],
  },
  {
    title: "제6조(이용안내)",
    isList: true,
    items: [
      {
        text: "회원은 1일 1회 시설 이용을 원칙으로 한다, 추가 이용을 원할 시 프런트에서 해당 시설 일일 이용료를 추가 결제하여야 하며, 위반할 경우 다음과 같이 조치할 수 있다.",
        subItems: [
          "적발 시 일일 이용료의 10배 부과",
          "3회 이상 적발 시 탈회 조치 및 영구입장 금지",
        ],
      },
      "회원증 무단 양도 및 타인 이용은 불가하며 적발 시 탈회 조치 또는 영구 입장 금지 등 불이익을 당할 수 있다.",
      "회원증 분실 시 프런트에 방문하여 소정의 요금 결제 후 재발급 받아야 한다.",
      "회원 기간 종료 후에는 회원증을 프런트에 반납하여야 한다.",
      {
        text: "휴회 이용 안내",
        subItems: [
          "회원 기간 중 휴회를 원할 시에는 회원 본인 또는 대리인이 직접 프런트에 방문하여 회원증을 반납하고 휴회신청서를 작성하여야 한다.",
          "휴회 기간은 당사 지정 기간을 준수하여야 하며, 부득이 부상 또는 질환으로 추가적 기간이 필요할 시 병원에서 발행한 진단서를 제출하여야 하며 그 기간은 진단일을 경과 할 수 없다.",
          "휴회의 시작 일자는 신청서를 제출한 일자부터 가능하며, 지난 일자를 소급 적용할 수 없다.",
        ],
      },
      {
        text: "휴회 기간",
        subItems: [
          "1개월 등록 시 7일 (강습수영은 1회 30일 가능)",
          "3개월 등록 시 최소 7일~최대 30일 (강습수영은 1회 30일 가능)",
          "6개월 등록 시 최소 7일~최대 60일 (강습수영은 2회 각 30일 가능)",
          "12개월 등록 시 최소 7일~최대 90일 (강습수영은 3회 각 30일 가능)",
        ],
      },
      {
        text: "양도 양수",
        subItems: [
          "양도 양수는 회원의 직계 가족 성인 간에만 가능하다.",
          "양도 양수한 상품은 환불, 휴회 및 재양도가 불가하며 할인받은 상품의 경우 양도 양수 진행이 불가하다.",
          "양도 양수에 같은 이력이 있을 경우 양도 양수가 불가하다.",
        ],
      },
      {
        text: "회원 간의 분쟁",
        subItems: [
          "회원 간의 부주의나 다툼 등으로 인한 사고 발생 시 아르피나에 책임을 물을 수 없다.",
        ],
      },
    ],
  },
  {
    title: "제7조(이용제한)",
    content:
      "다음 각 호의 어느 하나에 해당하는 경우 체육시설 이용을 제한 할 수 있다.",
    isList: true,
    items: [
      "심신질환이나 전염성 질병, 문신 등으로 다른 회원에게 피해를 주거나 혐오감을 느끼게 하는 회원",
      "기타 공공질서 파괴 및 문란행위 등으로 다른 회원에게 피해를 주거나 혐오감을 느끼게 하는 회원",
      "이 약관을 위반하여 탈회 조치되었거나 영구입장 금지된 회원",
      "개인의 권리와 이득만을 위하여 악의적이고 상습적으로 민원을 제기하는 회원",
    ],
  },
  {
    title: "제8조(이용수칙)",
    isList: true,
    items: [
      {
        text: "수영장",
        subItems: [
          "수질 보호를 위하여 수영장 이용전 반드시 샤워를 합니다.",
          "입수 전 반드시 준비운동을 합니다.",
          "입수 시 수영복 및 수영모자를 올바르게 착용합니다.",
          "안전사고 예방을 위하여 뛰는 행위 및 다이빙을 금지합니다.",
          "수영레인 우측방향 으로 운동하시고 개인 속도에 맞는 레인을 이용합니다.",
          "수영레인 횡단 및 레인을 잡거나 기대는 행동을 금지합니다.",
          "호흡곤란 현기증 등 신체 이상 시 운동을 중지합니다.",
          "심실질환 및 전염성 질환자는 출입을 금지합니다.",
          "수영장 내 배설, 방뇨 및 타액을 뱉는 행위를 금지합니다.",
          "아르피나 정규 수영지도자 이외 수영지도를 금지합니다.",
          "심장관련질환, 고협압, 노약자, 허약체질자, 고령자 등 수영장 내 안전사고 및 신체 이상이 발생할 수 있는 분은 이용을 삼가해 주십시오.",
          "회원카드, 락커 키, 귀중품 등 개인소지품 분실 시 책임지지 않습니다.",
          "안전요원의 안내와 지시에 적극 협조하여 주십시오.",
        ],
      },
      {
        text: "골프연습장",
        subItems: [
          "1인 1타석 이용규칙을 준수하여 주십시오. (2인 이상 사용금지)",
          "안전 수칙을 준수하고, 시설 이용 시 정숙하여 주십시오.",
          "동반하신 분의 안전은 이용자의 책임이며, 5세이하 유아는 동반을 금지합니다.",
          "타석 이외 장소에서의 스윙을 금지하며, 음주자는 출입이 불가합니다.",
          "타석 출입 시에는 주변을 확인하시고 안전한 통로를 이용하여 주십시오.",
          "연습 중 타인에게 부상을 입혔을 경우 당사에서는 책임을 지지 않습니다.",
          "골프연습장 소속 지도자 이외 골프 지도를 금지합니다.",
          "장비 및 개인물품은 직접 관리하여야 하며, 분실 시 책임지지 않습니다.",
          "바른 복장을 착용하여 주시고 타인에게 불쾌감을 주는 행동을 삼가해 주십시오.",
          "타인에게 불편을 주거나, 운영수칙을 위반할 시 퇴장 및 탈회 조치 됩니다.",
          "회원카드, 락커 키, 귀중품 등 개인 소지품 분실 시 책임지지 않습니다.",
          {
            text: "아래 사항 해당 경우 골프연습장 운영이 중단될 수 있습니다.",
            subItems: [
              "가. 기상청 발표 풍속 14m/s 이상 또는 순간풍속 20m/s 이상 예상될 때",
              "나. 강풍주의보 또는 강풍경보 발효 시",
              "다. 강풍주의보 및 경보 발효 전이라도 사전 안전 점검, 시설물 정비 등의 사유 발생 시",
              "라. 기타 태풍 및 폭우 등으로 안전사고 발생 위험이 있다고 판단 될 때",
            ],
          },
        ],
      },
      {
        text: "퍼팅 연습장",
        subItems: [
          "당사 골프회원만 이용 가능합니다.",
          "사람 또는 차량 또는 기물을 향하여 스윙을 금지합니다.",
          "골프공은 개인공을 사용합니다.",
          "안전사고 예방을 위하여 어린이 동반을 금지합니다.",
          "시설 이용 시 운동화 또는 골프화를 착용합니다.",
          "퍼팅장 내에서는 어프로치샷을 금지합니다.",
          "퍼팅장 내 일어나는 이용객 간의 사고는 당사에서 책임지지 않습니다.",
        ],
      },
    ],
  },
];

// 리스트 아이템 렌더링 함수
const renderListItem = (item: string | TermItem, index: number) => {
  if (typeof item === "string") {
    return (
      <List.Item key={index} {...styles.listItem} mb={2}>
        <Flex {...styles.numberBadge}>{index + 1}.</Flex>
        <Text {...styles.text}>{item}</Text>
      </List.Item>
    );
  } else if (typeof item === "object" && item.text) {
    return (
      <List.Item key={index} {...styles.listItem}>
        <Flex {...styles.numberBadge}>{index + 1}.</Flex>
        <Box>
          <Text {...styles.text}>{item.text}</Text>
          <List.Root {...styles.nestedList}>
            {item.subItems?.map((subItem, subIndex) => (
              <List.Item key={subIndex} listStyleType="none">
                <Text {...styles.nestedListText}>
                  <Text as="span" color="gray.500" mr={2}>
                    ·
                  </Text>
                  {typeof subItem === "string" ? subItem : subItem.text}
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </Box>
      </List.Item>
    );
  }
  return null;
};

// 약관 섹션 렌더링 함수
const renderTermSection = (term: Term, index: number) => {
  return (
    <Box key={index} mb={{ base: 6, md: 8, lg: 10 }}>
      <Heading as="h3" {...styles.heading}>
        {term.title}
      </Heading>

      {!term.isList ? (
        <Text {...styles.text}>{term.content}</Text>
      ) : (
        <List.Root>
          {term.items?.map((item, itemIndex) =>
            renderListItem(item, itemIndex)
          )}
        </List.Root>
      )}
    </Box>
  );
};

export default function GuidePage() {
  return (
    <PageContainer>
      <Box className="sports-guide-box">
        <VStack align="stretch">
          {termsData.map((term, index) => renderTermSection(term, index))}
        </VStack>
      </Box>
    </PageContainer>
  );
}
