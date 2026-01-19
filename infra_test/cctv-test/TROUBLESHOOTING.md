# CCTV 테스트 트러블슈팅 가이드

## 1. 네트워크 연결 문제

### 연결 거부 (Connection Refused)
**증상:** 토큰 발급 시 "Failed to fetch" 또는 "ERR_CONNECTION_REFUSED"

**원인:**
- EC2 보안 그룹에서 포트가 열려있지 않음
- 백엔드 서버가 실행되지 않음

**해결:**
1. EC2 콘솔 → 보안 그룹 → 인바운드 규칙 편집
2. 백엔드 포트(예: 8080) 추가
   - 유형: 사용자 지정 TCP
   - 포트 범위: 8080
   - 소스: 0.0.0.0/0 (또는 특정 IP)
3. 백엔드 서버 실행 상태 확인: `sudo netstat -tlnp | grep 8080`

---

### CORS 에러
**증상:** 콘솔에 "Access-Control-Allow-Origin" 관련 에러

**원인:** 백엔드에서 프론트엔드 도메인을 허용하지 않음

**해결 (Spring Boot):**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173", "https://your-frontend.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

**해결 (Node.js/Express):**
```javascript
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-frontend.com'],
    credentials: true
}));
```

---

### Mixed Content 에러
**증상:** HTTPS 페이지에서 HTTP API 호출 시 차단

**원인:** 브라우저 보안 정책으로 HTTPS → HTTP 요청 차단

**해결:**
- 백엔드에 SSL 인증서 적용 (Let's Encrypt 등)
- 또는 Nginx 리버스 프록시로 HTTPS 처리
- 개발 환경에서는 프론트도 HTTP로 실행

---

## 2. 토큰 발급 문제

### HTTP 401 Unauthorized
**증상:** 토큰 발급 시 401 에러

**원인:** 백엔드 인증 실패 또는 OpenVidu 서버 인증 정보 오류

**해결:**
1. 백엔드의 OpenVidu 서버 URL/Secret 확인
2. 백엔드 로그에서 상세 에러 확인

---

### HTTP 404 Not Found
**증상:** 토큰 발급 시 404 에러

**원인:** API 엔드포인트 경로 불일치

**해결:**
1. 백엔드 API 경로 확인: `/sessions/{sessionId}/connections`
2. URL에 오타가 없는지 확인
3. 백엔드 라우팅 설정 확인

---

### 토큰 파싱 실패
**증상:** 토큰은 발급되었으나 입력란에 `[object Object]` 표시

**원인:** 백엔드 응답 형식이 예상과 다름

**해결:**
1. 브라우저 개발자 도구 → Network 탭에서 응답 확인
2. 응답 형식에 맞게 토큰 추출 코드 수정:
```javascript
// 현재 지원 형식
const newToken = data.token || data.connectionToken || data
```

---

## 3. 카메라/마이크 문제

### NotAllowedError
**증상:** "카메라/마이크 권한이 거부되었습니다"

**원인:** 브라우저에서 미디어 권한 거부

**해결:**
1. 브라우저 주소창 왼쪽 자물쇠/정보 아이콘 클릭
2. 카메라/마이크 권한을 "허용"으로 변경
3. 페이지 새로고침

---

### NotFoundError
**증상:** 카메라를 찾을 수 없음

**원인:** 카메라가 연결되지 않았거나 다른 앱에서 사용 중

**해결:**
1. 카메라가 물리적으로 연결되어 있는지 확인
2. 다른 앱(Zoom, Teams 등)에서 카메라를 사용 중인지 확인
3. 장치 관리자에서 카메라 드라이버 확인

---

### NotReadableError
**증상:** 카메라에 접근할 수 없음

**원인:** 카메라가 다른 프로세스에 의해 잠겨있음

**해결:**
1. 브라우저 완전 종료 후 재시작
2. 카메라를 사용하는 다른 앱 종료
3. 컴퓨터 재시작

---

## 4. OpenVidu 연결 문제

### 세션 연결 실패
**증상:** "세션 연결 실패" 에러

**원인:**
- 토큰이 만료됨
- OpenVidu 서버 연결 불가
- 토큰의 세션 ID 불일치

**해결:**
1. 토큰 재발급
2. OpenVidu 서버 상태 확인
3. 세션 ID가 일치하는지 확인

---

### 스트림 송출 실패
**증상:** 카메라는 보이지만 송출이 안됨

**원인:** WebRTC 연결 실패 (방화벽, NAT 문제)

**해결:**
1. OpenVidu 서버의 TURN 서버 설정 확인
2. 필요한 포트가 열려있는지 확인:
   - TCP 443 (HTTPS)
   - TCP 3478 (TURN)
   - UDP 3478 (TURN)
   - UDP 40000-65535 (WebRTC 미디어)

---

## 5. 영상 수신 문제 (Dashboard)

### 영상이 표시되지 않음
**증상:** Dashboard에서 "영상 대기 중" 상태 유지

**원인:**
- Publisher가 송출을 시작하지 않음
- 같은 세션에 연결되지 않음

**해결:**
1. CCTV 페이지에서 먼저 송출 시작
2. Dashboard와 CCTV가 같은 세션 ID 사용 확인
3. 콘솔에서 "새 스트림 감지" 로그 확인

---

### 영상이 검은 화면
**증상:** 비디오 엘리먼트는 있지만 검은 화면

**원인:** autoplay 정책 또는 muted 설정 문제

**해결:**
1. 비디오가 muted 상태인지 확인 (autoplay에 필요)
2. 사용자 인터랙션 후 재생 시도
3. 브라우저 콘솔에서 에러 확인

---

## 6. 디버깅 팁

### 브라우저 개발자 도구 활용
1. **F12** → 개발자 도구 열기
2. **Console 탭:** JavaScript 에러 및 로그 확인
3. **Network 탭:** API 요청/응답 확인
4. **Application 탭:** 저장된 데이터 확인

### 유용한 콘솔 로그
```javascript
// 현재 미디어 장치 목록 확인
navigator.mediaDevices.enumerateDevices().then(console.log)

// WebRTC 연결 상태 확인
session.connection // 연결 정보
publisher.stream // 스트림 정보
```

### OpenVidu 디버그 모드
```javascript
const OV = new OpenVidu()
OV.enableProdMode() // 프로덕션 모드 (로그 최소화)
// 또는 기본값으로 디버그 로그 활성화
```
