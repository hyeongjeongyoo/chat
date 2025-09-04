export const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  uuid VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'editor', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

export const createMenusTable = `
CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('LINK', 'FOLDER', 'BOARD', 'CONTENT') NOT NULL,
  url VARCHAR(255),
  target_id INT,
  display_position VARCHAR(50) NOT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  parent_id INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE SET NULL
)
`;

export const createEquipmentTable = `
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  location VARCHAR(100),
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

export const createMonitoringTable = `
CREATE TABLE IF NOT EXISTS monitoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(10,2),
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
)
`;
