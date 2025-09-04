"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import InfoTopBox from "@/components/contents/InfoTopBox";
import {
  Box,
  Heading,
  List,
  Tabs,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import ApTable01 from "@/components/contents/ApTable01";
import ApTable02 from "@/components/contents/ApTable02";

const CheckInGuide = () => (
  <Box p={{ base: 4, md: 8 }}>
    <List.Root pl={5}>
      <List.Item>입실 PM 3:00 / 퇴실 AM 11:00</List.Item>
      <List.Item>
        객실 내 치약, 칫솔, 면도기는 제공되지 않습니다.(B1 편의점 구입가능)
      </List.Item>
      <List.Item>객실에서는 화기사용을 절대 금합니다.</List.Item>
      <List.Item>
        객실에서는 음주, 고성방가 및 타인에게 피해를 주는 행위를 금합니다.
      </List.Item>
      <List.Item>
        아르피나는 전체 금연 시설이오니 흡연자는 반드시 실외 별도 설치된 흡연
        부스를 이용하시기 바랍니다.
      </List.Item>
      <List.Item>
        각종 비품 및 시설물 등의 파손이 발생할 시에는 손해를 배상해야 합니다.
      </List.Item>
      <List.Item>
        실내외(복도, 로비, 베란다 포함)에서의 소란행위(고성방가)를 금합니다.
      </List.Item>
      <List.Item>
        욕실에서는 욕실화만 착용 하시고 욕실바닥이 물, 비눗물, 샴푸 등으로 인해
        미끄러울 수 있으니 주의하시기 바랍니다.
      </List.Item>
      <List.Item>객실 외부로 쓰레기 투기 행위를 금합니다.</List.Item>
      <List.Item>
        객실 내 발생되는 음식물쓰레기 및 재활용쓰레기는 3층복도끝 세탁실옆
        재활용 분리수거함에 분리수거 바랍니다.
      </List.Item>
      <List.Item>
        객실,내외(복도,로비,베란다)에서는 화기사용, 과도한음주,
        소란행위(고성방가), 베란다에 매달리는 행위, 객실외부로 쓰레기투척 등
        타인에게 피해를 주는 행위를 금합니다
      </List.Item>
      <List.Item>
        또한 규격에 맞지 않는 보조배터리 사용은 화재의 위험이 있어 엄격히 금지
        됩니다.
      </List.Item>
      <List.Item>
        건물내에서는 금연이며, 흡연이 적발될 경우 즉시 강제 퇴실 조치됩니다.
        또한, 시설물 손괴 등 공공시설에 피해를 가할 경우에는 배상의 책임이
        있음을 안내드립니다.
      </List.Item>
      <List.Item>욕실에서는 염색이나 색소입욕제 사용을 금지합니다.</List.Item>
      <List.Item>
        귀중품은 프런트에 보관바랍니다. 보관하지 않은 분실문은 당사의 책임이
        없습니다. 또한 습 득한 분실물은 1개월 보관 후 폐기처리 됩니다.
      </List.Item>
    </List.Root>
  </Box>
);

const AccommodationTerms = () => (
  <Box p={{ base: 4, md: 8 }}>
    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제 1조(약관의 적용)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          부산도시공사 아르피나(이하 "아르피나"라 한다)가 체결하는 숙박약관 및
          여기에 관계되는 계약은 본 약관이 정하는 바에 의한 것으로 하고, 본
          약관에 규정되지 않은 사항에 관하여는 법령 또는 관습에 의하는 것으로
          한다.
        </List.Item>
        <List.Item>
          아르피나는 약관의 취지, 법령 또는 관습에 위배되지 않는 범위 내에서
          필요할 경우 별도 계약을 체결할 수 있다.
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제2조(숙박접수의 거절)
      </Heading>
      <Text mb={2}>
        아르피나는 다음 각 호에 해당하는 경우에 숙박을 접수하지 아니할 수 있다.
      </Text>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>숙박신청이 본 약관에 의하지 않는 경우</List.Item>
        <List.Item>
          만실 또는 객실내부 고장 및 안전상 문제가 있어 객실의 여유가 없을 때
        </List.Item>
        <List.Item>
          숙박자가 숙박에 관한 법령 또는 공공질서나 미풍양속에 위배되는 행위를
          할 염려가 있다고 인정될 때
        </List.Item>
        <List.Item>
          숙박 대상자가 감염병(전염병)자로 명백히 인정 확인 될 때
        </List.Item>
        <List.Item>
          천재지변 또는 시설의 고장 등 불가피한 이유로 숙박에 응할 수 없을 때
        </List.Item>
        <List.Item>
          애완용 동물 또는 위험약물 등을 소지하고 있다고 인정되는 경우
        </List.Item>
        <List.Item>불법 무기 휴대자</List.Item>
        <List.Item>
          대한민국 법령 등이 규정하는 바에 따라 숙박할 수 없다고 인정될 때
        </List.Item>
        <List.Item>
          주취(난동)로 시설물을 파손하거나 타인에게 피해를 가할 위험이 있을 경우
        </List.Item>
        <List.Item>
          근무자 또는 시설관리자에게 폭언, 폭행을 가해 정상적인 운영을 방해하는
          경우
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제3조(성명 등의 신고)
      </Heading>
      <Text mb={2}>
        아르피나는 숙박예약을 신청하는 예약자에게 다음 사항의 명시를 요구할 수
        있다.
      </Text>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>숙박자의 성명, 국적(외국인), 연락처 등</List.Item>
        <List.Item>기타 아르피나에서 필요하다고 인정되는 사항</List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제4조(객실예약기준)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>개인 예약가능기간은 예약일로부터 30일 이내로한다</List.Item>
        <List.Item>
          단체 행사의 예약 가능 기간은 예약일로부터 180일 이내로 한다.
        </List.Item>
        <List.Item>
          온라인 여행사(플랫폼)의 예약가능기간은 예약일로부터 30일 이내로한다
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제5조(예약금)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          아르피나가 숙박예약 신청을 받을 경우에는 예약금의 불입을 확인한
          경우에만 예약을 보증한다. 단, 신용카드를 이용할 경우에는 예약금 불입
          여부에 관계없이 예약을 보증한다.
        </List.Item>
        <List.Item>
          제1항의 예약금은 제7조에서 정한 내용에 해당할 경우 위약금으로 충당하고
          잔액이 있을 때에는 반환한다. 단, 예약금 없이 신용카드를 이용할 경우,
          예약시 등록된 신용카드로 제7조에 해당하는 위약금을 청구한다.
        </List.Item>
        <List.Item>
          아르피나는 신용카드에 의한 예약 또는 예약 해제 시에는 접수번호,
          접수일시, 접수자 성명, 위약금 내용을 예약자에게 알린다.
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제6조(예약의 취소)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          <Text>
            아르피나는 따로 정하는 바를 제외하고는 다음 각 호에 해당하는 경우에
            예약을 취소할 수 있다.
          </Text>
          <List.Root as="ol" pl={5} mt={2} listStyleType="'· '">
            <List.Item>제2조에 해당된다고 인정될 경우</List.Item>
            <List.Item>
              제3조 각호에 해당하는 사항의 명시를 요구했음에도 기한까지 회답하지
              않을 경우
            </List.Item>
            <List.Item>
              제5조 제1항의 예약금 납부를 요구하였으나 기한까지 불입하지 않을
              경우
            </List.Item>
          </List.Root>
        </List.Item>
        <List.Item>
          아르피나는 제1항에 의해 예약을 취소했을 시 이미 수납한 예약금이 있을
          경우에는 이를 반환한다.
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제7조(위약금 청구)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          <Text>
            아르피나는 예약신청자가 예약의 전부 또는 일부를 취소했을 때 이에
            대한 위약금을 다음의 각 호와 같이 징수할 수 있다.
          </Text>
          <List.Root as="ol" pl={5} mt={2} listStyleType="'· '">
            <List.Item>
              <Text>인터넷 여행사 및 아르피나 홈페이지 예약자</Text>
              <List.Root as="ol" pl={5} mt={2} listStyleType="'가. '">
                <List.Item>
                  각 사이트별 위약금 기준 약관에 따라 위약금 발생 / 예약
                  사이트로 문의 바랍니다.
                </List.Item>
                <List.Item>
                  비수기: 숙박일 4일 전까지만 취소·변경 가능, 숙박일 3일전부터
                  1일 전에 취소·변경시 객실료의 20%, 숙박 당일 취소·변경 시
                  객실료의 100% 위약금 발생
                </List.Item>
                <List.Item>
                  성수기: 숙박일 4일 전까지만 취소·변경 가능, 숙박일 3일 전
                  취소·변경시 객실료의 20%, 숙박일 2일 전부터 당일 취소·변경시
                  객실료의 100% 위약금 발생
                </List.Item>
              </List.Root>
            </List.Item>
          </List.Root>
        </List.Item>
        <List.Item>
          제6조에 따라 예약이 취소된 경우 및 예약자가 연락을 하지 않고 도착하지
          않은 것이 기차, 항공기 등의 결항 또는 지연, 기타 예약자 자신의 책임에
          의한 것이 아니라고 인정될 시에는 제1항의 위약금은 받지 않는다.
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제8조(등록)
      </Heading>
      <Text>
        숙박자는 도착 즉시 객실 프론트에서 등록카드를 기재하여야 한다.
      </Text>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제9조(숙박요금 산정)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          숙박료는 고객이 도착한 후로부터 출발할 때까지 요금을 기준으로 하되,
          도착 시 등록카드에 기명한 시간에서 출발 시 객실 키를 회수한
          시간까지며, 체크아웃 시간은 11:00를 기준으로 한다.
        </List.Item>
        <List.Item>
          퇴실시한이 경과하였을 경우 추가 요금이 부과되며 만실일 경우 숙박을
          거절할 수 있다.
        </List.Item>
        <List.Item>
          <Text>
            퇴실시한이 경과하였을 경우 다음과 같이 추가 요금을 부과한다.
          </Text>
          <List.Root as="ol" pl={5} mt={2} listStyleType="'· '">
            <List.Item>15:00까지, 요청일 1박이용요금 50% 적용</List.Item>
            <List.Item>
              입실 당일 또는 퇴실일 오전 프론트(740-3201) 협의 후 가능
            </List.Item>
          </List.Root>
          <Text mt={2}>
            단, 입·퇴실 시간은 성수기 등 시기별로 탄력적으로 운영할 수 있다.
          </Text>
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제10조(요금의 지불)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          숙박자는 아르피나에서 지불요청이 있을 때는 통화, 신용카드나 쿠폰으로
          프론트 직원에게 요금을 지불하여야 한다.
        </List.Item>
        <List.Item>
          숙박자가 등록을 필한 이후에는 임의 또는 부득이한 사정으로 숙박을 하지
          않을 경우에도 숙박요금은 환불하지 않는다.
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제11조(출입카드 인수 및 반납)
      </Heading>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>
          숙박자는 등록할 때 프론트 데스크에서 출입카드를 인수하고 퇴실 시에는
          이를 반납하여야 한다.
        </List.Item>
        <List.Item>
          숙박자는 투숙 중 출입카드를 분실하였을 경우 지체 없이 프론트에
          신고하여야 한다.
        </List.Item>
        <List.Item>
          <Text>
            숙박자가 출입카드를 소지하고 퇴실하였을 경우 지체 없이 아르피나에
            알리고 신속히 반납하여야 한다.
          </Text>
          <Text mt={2}>
            · 단, 숙박자가 출입카드 분실 시 [금30,000원(금삼만원)] 요금을
            부과한다.
          </Text>
        </List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제12조(숙박계속의 사절)
      </Heading>
      <Text mb={2}>
        아르피나는 숙박자가 비록 투숙중일지라도 다음 사항에 해당될 때는 계속
        투숙을 거절할 수도 있다.
      </Text>
      <List.Root as="ol" pl={5} listStyleType="decimal">
        <List.Item>제2조에 해당된다고 인정될 경우</List.Item>
        <List.Item>아르피나의 규칙을 준수하지 않을 경우</List.Item>
        <List.Item>예약 만실로 인한 판매 객실이 없는 경우</List.Item>
      </List.Root>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제13조(시설물 파손 및 변상)
      </Heading>
      <Text>
        숙박자는 숙박기간 동안 시설물 및 객실비품을 파손했을 경우 시설물 및
        객실비품에 대해 파손당사자가 변상하여야 한다.
      </Text>
    </Box>

    <Box mb={6}>
      <Heading as="h4" size="md" mb={4}>
        제14조(영업시간)
      </Heading>
      <Text>
        아르피나 부대시설의 영업시간은 별도 게시되어 있으며 사정에 따라 변경될
        수 있다.
      </Text>
    </Box>
  </Box>
);

export default function GuidePage() {
  const descSize = useBreakpointValue({
    base: "lg",
    md: "xl",
    lg: "2xl",
    xl: "3xl",
  });

  return (
    <PageContainer>
      <InfoTopBox
        title="이용안내"
        titleHighlight="이용안내"
        description=""
        images={[]}
        showReservation={false}
      />
      <Text
        color="#393939"
        fontWeight="normal"
        textAlign="justify"
        lineHeight="1.3"
        fontSize={descSize}
        whiteSpace="pre-line"
      >
        아르피나 유스호스텔 이용에 대한 안내사항입니다. 방문 전 반드시
        숙지해주시기 바랍니다.
      </Text>
      <Box mt={{ base: 6, md: 8, lg: 10 }}>
        <Tabs.Root defaultValue="guide" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="guide">입실안내문</Tabs.Trigger>
            <Tabs.Trigger value="terms">숙박약관</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="guide">
            <CheckInGuide />
          </Tabs.Content>
          <Tabs.Content value="terms">
            <AccommodationTerms />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </PageContainer>
  );
}
