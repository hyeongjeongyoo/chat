# Ubuntu Server Setup Guide

이 문서는 **Ubuntu 20.04 / 22.04** 등 우분투 계열 서버 환경에서 **Node.js(20.x)**, **MySQL**, 그리고 **firewalld**를 설치하고, **PM2**를 이용해 Node.js 애플리케이션을 백그라운드로 구동하는 방법을 간략히 설명합니다.

> 만약 다른 버전을 사용 중이라면, 명령어가 약간 다를 수 있으니 참고해 주세요.

---

## 1. Node.js 20 설치

우분투 기본 저장소에는 최신 Node.js 버전이 없을 수 있으므로, [NodeSource](https://github.com/nodesource/distributions)에서 제공하는 설치 스크립트를 사용합니다.

1. **패키지 목록 업데이트**
   ```bash
   sudo apt-get update
   ```
2. **Node.js 20.x 스크립트 등록 및 설치**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. **설치 확인**
   ```bash
   node -v
   npm -v
   ```
   - `node -v` 실행 결과가 `v20.x.x` 형식이면 정상 설치된 것입니다.

4. **필요한 글로벌 패키지 설치**  
   ```bash
   # PM2 (Node.js 프로세스 매니저)
   sudo npm install -g pm2

   # pnpm (패키지 매니저, 필요할 경우에만)
   sudo npm install -g pnpm
   ```

---

## 2. MySQL 설치 및 초기 설정

우분투에서 MySQL을 설치하고 기본 보안을 설정하는 방법입니다.

1. **MySQL 서버 설치**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mysql-server
   ```
2. **서비스 시작 및 자동 시작 설정**
   ```bash
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```
3. **보안 설정 (mysql_secure_installation)**
   ```bash
   sudo mysql_secure_installation
   ```
   - 비밀번호 정책, 루트 비밀번호 설정, 익명 사용자 삭제 등을 단계별로 진행합니다.

4. **MySQL 접속 확인**
   ```bash
   sudo mysql -u root -p
   ```
   - 설정한 루트 비밀번호를 입력해 접속 가능 여부를 테스트합니다.

> **기본 포트**: MySQL은 3306 포트를 사용합니다.  
> 외부에서 DB에 접속해야 한다면 방화벽 설정에서 3306 포트를 허용해야 합니다.

---

## 3. Firewalld 설치 및 포트 열기

우분투에서는 기본적으로 `ufw`를 사용하는 경우가 많지만, `firewalld`를 쓰고 싶다면 아래와 같이 설정할 수 있습니다.

1. **firewalld 설치**
   ```bash
   sudo apt-get update
   sudo apt-get install -y firewalld
   ```

2. **서비스 시작 및 자동 시작 설정**
   ```bash
   sudo systemctl start firewalld
   sudo systemctl enable firewalld
   ```

3. **Node.js 애플리케이션 포트 열기** (예: 3000 포트)
   ```bash
   sudo firewall-cmd --zone=public --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   ```
4. **MySQL 포트 열기** (3306 포트)
   ```bash
   sudo firewall-cmd --zone=public --permanent --add-port=3306/tcp
   sudo firewall-cmd --reload
   ```

> 참고:  
> - **ufw 사용 시**: `sudo ufw allow 3000`, `sudo ufw allow 3306` 등의 형태로 간단히 설정할 수 있습니다.  
> - 외부에서 접속이 불필요한 서비스 포트는 허용하지 않는 것이 보안상 안전합니다.

---

## 4. PM2를 통해 Node.js 애플리케이션 실행

[PM2](https://pm2.keymetrics.io/)는 Node.js 프로세스를 백그라운드 서비스처럼 구동하고 관리해 주는 툴입니다.

1. **프로젝트 환경 준비**  
   - 예: 프로젝트 경로에 `app.js` 혹은 `server.js` 등의 실행 파일이 있다고 가정
2. **PM2로 애플리케이션 실행**  
   ```bash
   cd /path/to/your/node-project
   pm2 start app.js --name "my-app"
   ```
   - `--name` 옵션으로 애플리케이션 이름을 지정하면 관리가 편리합니다.
3. **pnpm으로 실행해야 할 경우**  
   ```bash
   pm2 start pnpm --name "h-startup" -- run start
   ```
   - 프로젝트 내 `package.json`에 `"start": "node app.js"`가 정의되어 있어야 합니다.
4. **PM2 상태 확인**
   ```bash
   pm2 status
   pm2 logs my-app
   ```
5. **자동 시작 설정**
   ```bash
   pm2 startup systemd
   pm2 save
   ```
   - 서버 재부팅 이후에도 PM2가 애플리케이션을 자동으로 다시 실행해 줍니다.

---

## 5. 참고 사항

- **MySQL 튜닝**: 대규모 트래픽이나 고성능이 필요한 환경에서는 `my.cnf`(보통 `/etc/mysql/mysql.conf.d/mysqld.cnf`) 파일을 수정해 버퍼 크기, 스레드 수 등을 조정해야 합니다.
- **Node.js 메모리 제한**: 고부하 상황에서 Node.js 프로세스가 메모리를 많이 사용한다면 `--max-old-space-size` 옵션으로 힙 크기를 조절할 수 있습니다.
- **보안 고려**:  
  - SSH 키 인증, 방화벽 규칙 최소화, SSL/TLS 인증서(Nginx 혹은 다른 Reverse Proxy 사용 시) 적용 등을 병행하면 안전한 서버 환경을 구축할 수 있습니다.

---

## 6. 요약

1. **Node.js 20 설치**  
   - NodeSource 스크립트 이용 → `curl ... | sudo -E bash -` → `sudo apt-get install -y nodejs`  
2. **MySQL 설치 및 초기 설정**  
   - `sudo apt-get install -y mysql-server` → `mysql_secure_installation` → 방화벽에서 3306 포트 열기  
3. **firewalld (선택)**  
   - `sudo apt-get install -y firewalld` → 특정 포트(3000, 3306 등) 허용 → `sudo firewall-cmd --reload`  
4. **PM2 프로세스 매니저**  
   - `sudo npm i -g pm2` → `pm2 start app.js --name "my-app"` → `pm2 startup` → `pm2 save`  

root@s195b36b423b:~/h-startup# systemctl daemon-reload
root@s195b36b423b:~/h-startup# systemctl restart h-startup

이 단계를 거치면 **우분투 서버**에서 Node.js 애플리케이션을 안정적으로 구동하고, MySQL 데이터베이스를 운영하며, 필요 시 firewalld로 보안을 강화할 수 있습니다.  