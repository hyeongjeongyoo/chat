"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
var mysql = require("mysql2/promise");
var schema_1 = require("./schema");
var seed_1 = require("./seed");
// MySQL 연결 설정
var dbPool = mysql.createPool({
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
function handlePoolError(err) {
    console.error("[DB] Pool error:", err);
}
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, tables, tablesExist, adminQuery, menuStructure, _i, menuStructure_1, menu, result, parentId, _a, _b, subMenu, subResult, companyParentId, _c, _d, companySubMenu, adminUsers, adminQuery, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 25, 26, 27]);
                    return [4 /*yield*/, dbPool.getConnection()];
                case 1:
                    connection = _e.sent();
                    return [4 /*yield*/, connection.query("SHOW TABLES LIKE 'users'")];
                case 2:
                    tables = (_e.sent())[0];
                    tablesExist = tables.length > 0;
                    if (!!tablesExist) return [3 /*break*/, 19];
                    console.log("[DB] Tables do not exist. Starting initialization...");
                    // Users 테이블 생성
                    return [4 /*yield*/, connection.query(schema_1.createUsersTable)];
                case 3:
                    // Users 테이블 생성
                    _e.sent();
                    console.log("[DB] Users table created");
                    // Menus 테이블 생성
                    return [4 /*yield*/, connection.query(schema_1.createMenusTable)];
                case 4:
                    // Menus 테이블 생성
                    _e.sent();
                    console.log("[DB] Menus table created");
                    // Equipment 테이블 생성
                    return [4 /*yield*/, connection.query(schema_1.createEquipmentTable)];
                case 5:
                    // Equipment 테이블 생성
                    _e.sent();
                    console.log("[DB] Equipment table created");
                    // Monitoring 테이블 생성
                    return [4 /*yield*/, connection.query(schema_1.createMonitoringTable)];
                case 6:
                    // Monitoring 테이블 생성
                    _e.sent();
                    console.log("[DB] Monitoring table created");
                    return [4 /*yield*/, (0, seed_1.createInitialAdmin)()];
                case 7:
                    adminQuery = _e.sent();
                    return [4 /*yield*/, connection.query(adminQuery)];
                case 8:
                    _e.sent();
                    console.log("Initial admin account created with credentials:");
                    menuStructure = (0, seed_1.createInitialMenus)().menuStructure;
                    _i = 0, menuStructure_1 = menuStructure;
                    _e.label = 9;
                case 9:
                    if (!(_i < menuStructure_1.length)) return [3 /*break*/, 18];
                    menu = menuStructure_1[_i];
                    return [4 /*yield*/, connection.query("INSERT INTO menus (name, type, url, display_position, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [
                            menu.name,
                            menu.type,
                            menu.url,
                            menu.display_position,
                            menu.is_visible ? 1 : 0,
                            menu.sort_order,
                        ])];
                case 10:
                    result = (_e.sent())[0];
                    parentId = result.insertId;
                    _a = 0, _b = menu.subMenus;
                    _e.label = 11;
                case 11:
                    if (!(_a < _b.length)) return [3 /*break*/, 17];
                    subMenu = _b[_a];
                    return [4 /*yield*/, connection.query("INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                            subMenu.name,
                            subMenu.type,
                            subMenu.url,
                            subMenu.display_position,
                            subMenu.is_visible ? 1 : 0,
                            subMenu.sort_order,
                            parentId,
                        ])];
                case 12:
                    subResult = (_e.sent())[0];
                    if (!(subMenu.name === "기업별 소개" && subMenu.companySubMenus)) return [3 /*break*/, 16];
                    companyParentId = subResult.insertId;
                    _c = 0, _d = subMenu.companySubMenus;
                    _e.label = 13;
                case 13:
                    if (!(_c < _d.length)) return [3 /*break*/, 16];
                    companySubMenu = _d[_c];
                    return [4 /*yield*/, connection.query("INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                            companySubMenu.name,
                            companySubMenu.type,
                            companySubMenu.url,
                            companySubMenu.display_position,
                            companySubMenu.is_visible ? 1 : 0,
                            companySubMenu.sort_order,
                            companyParentId,
                        ])];
                case 14:
                    _e.sent();
                    _e.label = 15;
                case 15:
                    _c++;
                    return [3 /*break*/, 13];
                case 16:
                    _a++;
                    return [3 /*break*/, 11];
                case 17:
                    _i++;
                    return [3 /*break*/, 9];
                case 18:
                    console.log("[DB] Initial menus created");
                    return [3 /*break*/, 24];
                case 19:
                    console.log("[DB] Tables already exist. Checking for admin account...");
                    return [4 /*yield*/, connection.query("SELECT * FROM users WHERE username = 'admin'")];
                case 20:
                    adminUsers = (_e.sent())[0];
                    if (!(adminUsers.length === 0)) return [3 /*break*/, 23];
                    console.log("[DB] Admin account not found. Creating admin account...");
                    return [4 /*yield*/, (0, seed_1.createInitialAdmin)()];
                case 21:
                    adminQuery = _e.sent();
                    return [4 /*yield*/, connection.query(adminQuery)];
                case 22:
                    _e.sent();
                    console.log("Initial admin account created with credentials:");
                    return [3 /*break*/, 24];
                case 23:
                    console.log("[DB] Admin account already exists");
                    _e.label = 24;
                case 24:
                    console.log("[DB] Database initialization completed");
                    return [3 /*break*/, 27];
                case 25:
                    error_1 = _e.sent();
                    console.error("[DB] Database initialization failed:", error_1);
                    throw error_1;
                case 26:
                    if (connection) {
                        connection.release();
                    }
                    return [7 /*endfinally*/];
                case 27: return [2 /*return*/];
            }
        });
    });
}
// 데이터베이스 초기화 실행
initializeDatabase()
    .catch(function (error) {
    console.error("[DB] Database initialization failed:", error);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbPool.end()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
// 메인 풀에도 에러 핸들러 추가
dbPool
    .on("acquire", function () { })
    .on("connection", function () { })
    .on("release", function () { });
process.on("uncaughtException", handlePoolError);
exports.default = dbPool;
