# WebRTC 시그널링 서버

Node.js + Express + Socket.IO로 구현한 간단한 WebRTC 시그널링 서버입니다.

## 실행 방법

```bash
# 의존성 설치
npm install

# 서버 시작
npm start

# 개발 모드 (nodemon)
npm run dev
```

## 기능

- ✅ WebRTC Offer/Answer 교환
- ✅ ICE Candidate 교환
- ✅ 다중 사용자 관리
- ✅ 방(Room) 기능
- ✅ 채팅 메시지
- ✅ 실시간 사용자 목록

## API

### Socket.IO 이벤트

**클라이언트 → 서버:**
- `register` - 사용자 등록
- `join-room` - 방 참여
- `offer` - WebRTC Offer 전송
- `answer` - WebRTC Answer 전송
- `ice-candidate` - ICE Candidate 전송
- `chat-message` - 채팅 메시지

**서버 → 클라이언트:**
- `users` - 사용자 목록
- `user-joined` - 새 사용자 참여
- `user-left` - 사용자 퇴장
- `room-users` - 방 사용자 목록
- `offer` - WebRTC Offer 수신
- `answer` - WebRTC Answer 수신
- `ice-candidate` - ICE Candidate 수신
- `chat-message` - 채팅 메시지 수신

## 배포

### Render
1. GitHub에 푸시
2. Render에서 새 Web Service 생성
3. Build Command: `npm install`
4. Start Command: `npm start`

### Railway
1. GitHub에 푸시
2. Railway에서 GitHub 연결
3. 자동 배포
