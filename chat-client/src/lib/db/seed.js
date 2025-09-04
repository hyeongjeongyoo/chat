"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialAdmin = void 0;
exports.createInitialMenus = createInitialMenus;
var bcrypt = require("bcryptjs");
// 비밀번호 해시 함수
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
var createInitialAdmin = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var hashedPassword;
    return __generator(this, function () {
      hashedPassword = hashPassword("0000");
      return [
        2 /*return*/,
        "\n    INSERT INTO users (uuid, username, name, password, email, role, status) \n    VALUES (UUID(), 'admin', 'Administrator', '".concat(
          hashedPassword,
          "', 'admin@example.com', 'admin', 'active')\n  "
        ),
      ];
    });
  });
};
exports.createInitialAdmin = createInitialAdmin;
function createInitialMenus() {
  var menuStructure = [
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
  return { menuStructure: menuStructure };
}
