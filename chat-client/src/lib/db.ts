import mysql from "mysql2/promise";

// MariaDB 연결 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST || "172.30.1.11:3306",
  user: process.env.DB_USER || "handy",
  password: process.env.DB_PASSWORD || "gosel@1224", // 기본 비밀번호 설정
  database: process.env.DB_NAME || "cms_new",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  // MariaDB 특화 설정
  timezone: "+09:00", // 한국 시간대
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  debug: process.env.NODE_ENV === "development",
  multipleStatements: true,
});

// 연결 풀 이벤트 핸들러
pool.on("connection", () => {});

// API 라우트에서 사용할 수 있는 데이터베이스 연결 함수
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

export default pool;
