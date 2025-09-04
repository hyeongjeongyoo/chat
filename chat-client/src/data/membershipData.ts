export interface MembershipTier {
  name: string;
  discount: string;
  colorScheme: string;
}

export interface MembershipCardData {
  id: number;
  logoUrl: string;
  title: string;
  subtitle?: string;
  text?: string;
  tiers?: MembershipTier[];
  linkUrl?: string;
  links?: { name: string; url: string }[];
}

export const membershipData: MembershipCardData[] = [
  {
    id: 1,
    logoUrl: "/images/logo/partner_logo1.jpg",
    title: "뮤지엄원",
    subtitle: "미디어 아트 & 현대미술관",
    text: `아르피나 객실 이용고객 본인 포함 4인까지 할인 적용
*(아르피나 프론트에서 할인쿠폰 수령 후 관람권 구매시 제시)*`,
    tiers: [
      { name: "성인", discount: "18,000원 -> 12,000원", colorScheme: "gray" },
      { name: "청소년", discount: "15,000원 -> 10,000원", colorScheme: "gray" },
      { name: "어린이", discount: "13,000원 -> 9,000원", colorScheme: "gray" },
    ],
    linkUrl: "https://www.museum1.co.kr",
  },
  {
    id: 2,
    logoUrl: "/images/logo/partner_logo2.jpg",
    title: "해운대블루라인파크",
    subtitle: "해변열차",
    text: `최대 2인까지 이용료 *10% 할인* 제공`,
    linkUrl: "https://www.bluelinepark.com/",
  },
  {
    id: 3,
    logoUrl: "/images/logo/partner_logo3.jpg",
    title: "광안리해양레포츠",
    subtitle: "광안리바다영화관, 해상드론쇼투어",
    text: "최대 2인까지 *체험료 10% 할인* 제공",
    linkUrl: "https://www.gwanganli.co.kr",
  },
  {
    id: 4,
    logoUrl: "/images/logo/partner_logo4.jpg",
    title: "부산마리나선박",
    subtitle: "시설 이용 혜택",
    text: `아르피나 객실 및 스포츠센터 이용고객 대상
*프라이빗 & 퍼블릭 요트투어 10% 할인* 제공

※ 아르피나 프론트에서 할인쿠폰 수령 후 예약 문의시`,
    links: [
      { name: "요트탈래", url: "https://www.yachttale.com" },
      { name: "요트홀릭", url: "https://www.yachtholic.com" },
    ],
  },
  {
    id: 5,
    logoUrl: "/images/logo/partner_logo5.jpg",
    title: "스카이라인 루지",
    subtitle: "BUSAN",
    text: `아르피나 객실 및 스포츠센터 이용고객 대상
*루지 & 스카이라이드 개인탑승권 10% 할인* 제공

※ 아르피나 프론트에서 할인쿠폰 수령 후 쿠폰 구매시 제시`,
    linkUrl: "https://www.skylineluge.kr/busan",
  },
  {
    id: 6,
    logoUrl: "/images/logo/partner_logo6.jpg",
    title: "부산의아름다운길",
    subtitle: "갈맷길협동조합",
    text: `아르피나 객실 및 스포츠센터 이용고객 대상
걷기여행(해파랑·남파랑) *트레킹 상품* 10% 할인 제공
갈맷길 완주자 대상 스카프 및 개인 맞춤액자 무료 제공

※ 아르피나 프론트에서 할인쿠폰 수령 후 예약 문의시
※ 아르피나 객실 이용 영수증 제시시`,
    linkUrl: "http://www.gobusan.kr",
  },
  {
    id: 7,
    logoUrl: "/images/logo/partner_logo7.jpg",
    title: "㈜서프홀릭",
    text: `*서핑강습(장비포함)* 할인 제공
아르피나 객실 이용고객 *15% 할인* 제공
아르피나 스포츠센터 이용고객 10% 할인 제공

※ 아르피나 프론트에서 할인쿠폰 수령 후 예약문의(영수증 지참)`,
    linkUrl: "https://surfholic.co.kr",
  },
  {
    id: 8,
    logoUrl: "/images/logo/partner_logo8.jpg",
    title: "㈜부산여행특공대",
    subtitle: "로컬 여행",
    text: `아르피나 객실 및 스포츠센터 이용고객 대상
부산 로컬 여행상품 특별혜택 제공

※ 로컬상품 : 고품격 힐링투어, 이바구투어, 영도투어 등
※ 아르피나 프론트에서 쿠폰 수령 후 예약문의`,
    linkUrl: "https://busanbustour.co.kr/web/html/00_main/",
  },
]; 