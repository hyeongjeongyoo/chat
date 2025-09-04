# Chat Popup 테스트 가이드

## 🎯 테스트 목표

URL: `http://localhost:3001/chat-popup?threadId=1&userName=방문자&userType=USER`에서 채팅 더미 데이터가 정상적으로 표시되는지 확인

## 📋 테스트 단계

### 1단계: 서버 준비

```bash
# 백엔드 서버 실행 (포트 8080)
cd server
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 2단계: 프론트엔드 준비

```bash
# 프론트엔드 서버 실행 (포트 3001로 변경 필요)
cd client
npm run dev -- --port 3001
```

### 3단계: 데이터 확인

브라우저에서 다음 단계로 확인:

#### 3-1. API 직접 테스트

```bash
# 1. 로그인
curl -X POST "http://localhost:8081/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"gosel@0716!!"}'

# 2. 토큰으로 메시지 조회 (토큰은 위에서 받은 accessToken 사용)
curl -X GET "http://localhost:8081/api/v1/chat/threads/1/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3-2. 브라우저 테스트

1. **URL 접속**: `http://localhost:3001/chat-popup?threadId=1&userName=방문자&userType=USER`
2. **개발자 도구**: F12 → Network 탭에서 API 호출 확인
3. **Console 확인**: 에러 메시지 체크

### 4단계: 예상 결과

✅ **성공 시**: 5개의 메시지가 표시됨

- 방문자: "안녕하세요! 문의드릴게 있어서 연락했습니다."
- 상담원: "안녕하세요! 무엇을 도와드릴까요?"
- 방문자: "제품 구매 관련해서 질문이 있습니다."
- 상담원: "어떤 제품에 대해 문의하시나요?"
- 방문자: "가격 정보를 알고 싶습니다."

❌ **실패 시 체크사항**:

- [ ] 백엔드 서버 실행 중인가? (포트 8080)
- [ ] 프론트엔드 서버 실행 중인가? (포트 3001)
- [ ] V21 마이그레이션이 실행되었는가?
- [ ] ChatController가 로드되었는가?
- [ ] CORS 설정이 올바른가?

## 🔧 문제 해결

### 404 오류 시

```bash
# ChatController 확인
curl -X GET "http://localhost:8080/api/v1/chat/channels" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### CORS 오류 시

`server/src/main/resources/application-dev.yml`에서 확인:

```yaml
cors:
  allowed-origins: http://localhost:3001
```

### 데이터 없음 시

```sql
-- 데이터 확인
SELECT * FROM chat_thread WHERE id = 1;
SELECT * FROM chat_message WHERE thread_id = 1;
```

## 🎉 성공 기준

- [ ] 페이지가 에러 없이 로드됨
- [ ] 5개의 메시지가 순서대로 표시됨
- [ ] 사용자/상담원 구분이 명확함
- [ ] 메시지 입력창이 활성화됨
- [ ] WebSocket 연결 상태 표시됨
