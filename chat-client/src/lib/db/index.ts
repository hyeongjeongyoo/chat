import * as mysql from "mysql2/promise";
import {
  createUsersTable,
  createMenusTable,
  createEquipmentTable,
  createMonitoringTable,
} from "./schema";
import { createInitialMenus, createInitialAdmin } from "./seed";

interface MySQLResult {
  insertId: number;
}

// MySQL 연결 설정
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || "172.30.1.11",
  user: process.env.DB_USER || "handy",
  password: process.env.DB_PASSWORD || "gosel@1224",
  database: process.env.DB_NAME || "cms_new",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306,
  timezone: "+09:00",
  charset: "utf8mb4",
});

// 에러 핸들링 함수
function handlePoolError(err: Error) {
  console.error("[DB] Pool error:", err);
}

export async function initializeDatabase() {
  let connection;
  try {
    connection = await dbPool.getConnection();

    // 테이블 존재 여부 확인
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    const tablesExist = (tables as unknown[]).length > 0;

    if (!tablesExist) {
      console.log("[DB] Tables do not exist. Starting initialization...");

      // Users 테이블 생성
      await connection.query(createUsersTable);
      console.log("[DB] Users table created");

      // Menus 테이블 생성
      await connection.query(createMenusTable);
      console.log("[DB] Menus table created");

      // Equipment 테이블 생성
      await connection.query(createEquipmentTable);
      console.log("[DB] Equipment table created");

      // Monitoring 테이블 생성
      await connection.query(createMonitoringTable);
      console.log("[DB] Monitoring table created");

      // 초기 관리자 계정 생성
      const adminQuery = await createInitialAdmin();
      await connection.query(adminQuery);
      console.log("Initial admin account created with credentials:");

      // 초기 메뉴 생성
      const { menuStructure } = createInitialMenus();

      // 메인 메뉴와 하위 메뉴 삽입
      for (const menu of menuStructure) {
        const [result] = await connection.query(
          "INSERT INTO menus (name, type, url, display_position, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
          [
            menu.name,
            menu.type,
            menu.url,
            menu.display_position,
            menu.is_visible ? 1 : 0,
            menu.sort_order,
          ]
        );
        const parentId = (result as MySQLResult).insertId;

        // 해당 메인 메뉴의 서브메뉴 추가
        for (const subMenu of menu.subMenus) {
          const [subResult] = await connection.query(
            "INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              subMenu.name,
              subMenu.type,
              subMenu.url,
              subMenu.display_position,
              subMenu.is_visible ? 1 : 0,
              subMenu.sort_order,
              parentId,
            ]
          );

          // 기업별 소개 메뉴인 경우 추가 하위 메뉴 삽입
          if (subMenu.name === "기업별 소개" && subMenu.companySubMenus) {
            const companyParentId = (subResult as MySQLResult).insertId;
            for (const companySubMenu of subMenu.companySubMenus) {
              await connection.query(
                "INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                  companySubMenu.name,
                  companySubMenu.type,
                  companySubMenu.url,
                  companySubMenu.display_position,
                  companySubMenu.is_visible ? 1 : 0,
                  companySubMenu.sort_order,
                  companyParentId,
                ]
              );
            }
          }
        }
      }
    } else {
      // admin 계정 존재 여부 확인
      const [adminUsers] = await connection.query(
        "SELECT * FROM users WHERE username = 'admin'"
      );

      if ((adminUsers as unknown[]).length === 0) {
        const adminQuery = await createInitialAdmin();
        await connection.query(adminQuery);
      } else {
        console.log("[DB] Admin account already exists");
      }
    }
  } catch (error) {
    console.error("[DB] Database initialization failed:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 데이터베이스 초기화 실행
initializeDatabase()
  .catch((error) => {
    console.error("[DB] Database initialization failed:", error);
  })
  .finally(async () => {
    await dbPool.end();
    process.exit(0);
  });

// 메인 풀에도 에러 핸들러 추가
dbPool
  .on("acquire", () => {})
  .on("connection", () => {})
  .on("release", () => {});

process.on("uncaughtException", handlePoolError);

export default dbPool;
