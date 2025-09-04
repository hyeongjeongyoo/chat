import * as bcrypt from "bcryptjs";

// 비밀번호 해시 함수
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export const createInitialAdmin = async () => {
  const hashedPassword = hashPassword("0000");
  return `
    INSERT INTO users (uuid, username, name, password, email, role, status) 
    VALUES (UUID(), 'admin', 'Administrator', '${hashedPassword}', 'admin@example.com', 'admin', 'active')
  `;
};

export function createInitialMenus() {
  const menuStructure = [
    {
      name: "창업가꿈 소개",
      type: "FOLDER",
      url: null,
      display_position: "HEADER",
      is_visible: true,
      sort_order: 1,
      subMenus: [
        {
          name: "비전 및 목표",
          type: "CONTENT",
          url: "/about/vision",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 1,
        },
        {
          name: "주요프로그램",
          type: "CONTENT",
          url: "/about/program",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 2,
        },
        {
          name: "찾아오시는 길",
          type: "CONTENT",
          url: "/about/location",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 3,
        },
      ],
    },
    {
      name: "창업기업 모집",
      type: "FOLDER",
      url: null,
      display_position: "HEADER",
      is_visible: true,
      sort_order: 2,
      subMenus: [
        {
          name: "모집공고",
          type: "CONTENT",
          url: "/recruit/notice",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 1,
        },
        {
          name: "지원안내",
          type: "CONTENT",
          url: "/recruit/guide",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 2,
        },
        {
          name: "교육내용",
          type: "CONTENT",
          url: "/recruit/education",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 3,
        },
        {
          name: "FAQ",
          type: "BOARD",
          url: "/recruit/faq",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 4,
        },
      ],
    },
    {
      name: "창업기업 소개",
      type: "FOLDER",
      url: null,
      display_position: "HEADER",
      is_visible: true,
      sort_order: 3,
      subMenus: [
        {
          name: "참여기업",
          type: "CONTENT",
          url: "/companies/participants",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 1,
        },
        {
          name: "기업별 소개",
          type: "FOLDER",
          url: null,
          display_position: "HEADER",
          is_visible: true,
          sort_order: 2,
          companySubMenus: [
            {
              name: "오늘의 이야기",
              type: "LINK",
              url: "/companies/details/today-story",
              display_position: "HEADER",
              is_visible: true,
              sort_order: 1,
            },
            {
              name: "유니마스",
              type: "LINK",
              url: "/companies/details/unimas",
              display_position: "HEADER",
              is_visible: true,
              sort_order: 2,
            },
            {
              name: "삼선택",
              type: "LINK",
              url: "/companies/details/samseontaek",
              display_position: "HEADER",
              is_visible: true,
              sort_order: 3,
            },
            {
              name: "세로라",
              type: "LINK",
              url: "/companies/details/serora",
              display_position: "HEADER",
              is_visible: true,
              sort_order: 4,
            },
          ],
        },
        {
          name: "참고자료실",
          type: "BOARD",
          url: "/companies/resources",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 3,
        },
      ],
    },
    {
      name: "커뮤니티",
      type: "FOLDER",
      url: null,
      display_position: "HEADER",
      is_visible: true,
      sort_order: 4,
      subMenus: [
        {
          name: "답변게시판",
          type: "BOARD",
          url: "/community/qna",
          display_position: "HEADER",
          is_visible: true,
          sort_order: 1,
        },
      ],
    },
  ];

  return { menuStructure };
}
