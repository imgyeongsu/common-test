# WebRTC 학습 가이드

## 📚 WebRTC란?

**WebRTC (Web Real-Time Communication)** 는 브라우저와 모바일 애플리케이션에서 **플러그인 없이** 실시간으로 음성, 비디오, 데이터를 주고받을 수 있게 해주는 오픈소스 프로젝트입니다.

### 주요 특징
- **P2P (Peer-to-Peer) 통신**: 서버를 거치지 않고 클라이언트 간 직접 연결
- **저지연**: 실시간 통신에 최적화
- **보안**: DTLS 및 SRTP로 암호화된 통신
- **무료**: 오픈소스 및 무료 사용

---

## 🏗️ WebRTC 아키텍처

### 1. 주요 API

#### getUserMedia()
- 사용자의 카메라와 마이크에 접근
- MediaStream 객체 반환
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    // stream 사용
  });
```

#### RTCPeerConnection
- P2P 연결의 핵심 API
- 오디오/비디오 스트림 전송 관리
- 네트워크 정보 교환
```javascript
const peerConnection = new RTCPeerConnection(configuration);
```

#### RTCDataChannel
- 임의의 데이터 전송 (텍스트, 파일 등)
- P2P 방식으로 낮은 지연시간

### 2. 연결 프로세스

```
[Peer A]                    [Signaling Server]                    [Peer B]
   |                                |                                |
   |------- Offer (SDP) ---------->|                                |
   |                                |------- Offer (SDP) ---------->|
   |                                |                                |
   |                                |<------ Answer (SDP) -----------|
   |<------ Answer (SDP) -----------|                                |
   |                                |                                |
   |<-------------- ICE Candidates 교환 (via Signaling) ----------->|
   |                                |                                |
   |<================== P2P Connection Established =================>|
```

---

## 🔑 핵심 개념

### SDP (Session Description Protocol)
- **미디어 세션을 설명하는 포맷**
- 지원하는 코덱, 해상도, 대역폭 등의 정보 포함
- Offer와 Answer 형태로 교환

**SDP 구조 예시:**
```
v=0
o=- 123456789 2 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:F7gI
a=ice-pwd:x9cml...
```

### ICE (Interactive Connectivity Establishment)
- **NAT와 방화벽을 통과하기 위한 프레임워크**
- 가능한 모든 연결 경로를 찾아내는 프로토콜

#### ICE Candidate 종류:
1. **Host Candidate**: 로컬 네트워크 주소 (가장 빠름)
2. **Server Reflexive Candidate**: STUN으로 얻은 공인 IP (중간 속도)
3. **Relay Candidate**: TURN 서버를 통한 중계 (가장 느림, 하지만 가장 확실)

### STUN (Session Traversal Utilities for NAT)
- **자신의 공인 IP 주소를 알아내는 서버**
- NAT 뒤에 있는 클라이언트가 외부와 통신할 수 있게 도움
- 무료 공개 STUN 서버: `stun:stun.l.google.com:19302`

### TURN (Traversal Using Relays around NAT)
- **P2P 직접 연결이 불가능할 때 사용하는 릴레이 서버**
- 모든 트래픽이 TURN 서버를 통과 (비용 발생)
- STUN으로 연결 실패 시 마지막 수단

---

## 🔄 Signaling

WebRTC는 **P2P 연결을 설정하기 위한 초기 정보 교환이 필요**합니다. 이것이 바로 **시그널링**입니다.

### Signaling이 필요한 이유
- WebRTC 표준에는 Signaling 방법이 정의되어 있지 않음
- 개발자가 자유롭게 구현 (WebSocket, Socket.io, HTTP 등)

### Signaling으로 교환되는 정보:
1. **Session Control**: 통신 시작/종료
2. **Error Messages**: 에러 처리
3. **Media Metadata**: 코덱, 해상도 등 (SDP)
4. **Network Data**: ICE candidates

### 일반적인 Signaling 구현 방법:
- **WebSocket**: 양방향 실시간 통신
- **Socket.io**: WebSocket 기반 라이브러리
- **HTTP Long Polling**: 폴백 옵션
- **Firebase, Supabase**: 간단한 프로토타입용

---

## 📝 WebRTC 연결 순서 (상세)

### 1단계: 미디어 스트림 획득
```javascript
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

### 2단계: RTCPeerConnection 생성
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turnserver.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};

const pc = new RTCPeerConnection(configuration);
```

### 3단계: 로컬 스트림을 PeerConnection에 추가
```javascript
localStream.getTracks().forEach(track => {
  pc.addTrack(track, localStream);
});
```

### 4단계: Offer 생성 및 전송 (호출자)
```javascript
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Signaling 서버로 offer 전송
signalingServer.send({ type: 'offer', sdp: offer });
```

### 5단계: Offer 수신 및 Answer 생성 (수신자)
```javascript
// Signaling 서버에서 offer 수신
pc.setRemoteDescription(new RTCSessionDescription(offer));

const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);

// Signaling 서버로 answer 전송
signalingServer.send({ type: 'answer', sdp: answer });
```

### 6단계: ICE Candidate 교환
```javascript
// ICE candidate 수집
pc.onicecandidate = (event) => {
  if (event.candidate) {
    signalingServer.send({
      type: 'ice-candidate',
      candidate: event.candidate
    });
  }
};

// 상대방의 ICE candidate 수신
pc.addIceCandidate(new RTCIceCandidate(candidate));
```

### 7단계: 원격 스트림 수신
```javascript
pc.ontrack = (event) => {
  const remoteStream = event.streams[0];
  remoteVideo.srcObject = remoteStream;
};
```

---

## 🎯 연결 상태 모니터링

### ICE Connection State
```javascript
pc.oniceconnectionstatechange = () => {
  console.log('ICE Connection State:', pc.iceConnectionState);
  // new, checking, connected, completed, failed, disconnected, closed
};
```

### Connection State
```javascript
pc.onconnectionstatechange = () => {
  console.log('Connection State:', pc.connectionState);
  // new, connecting, connected, disconnected, failed, closed
};
```

### ICE Gathering State
```javascript
pc.onicegatheringstatechange = () => {
  console.log('ICE Gathering State:', pc.iceGatheringState);
  // new, gathering, complete
};
```

---

## 🚧 일반적인 문제와 해결

### 1. NAT/방화벽 문제
- **증상**: P2P 연결 실패
- **해결**: TURN 서버 사용

### 2. 브라우저 호환성
- **증상**: 특정 브라우저에서 작동 안 함
- **해결**: Adapter.js 사용 (WebRTC API 정규화)

### 3. 미디어 권한 거부
- **증상**: getUserMedia 실패
- **해결**: HTTPS 사용, 권한 요청 UI 개선

### 4. Signaling 연결 끊김
- **증상**: ICE candidate 교환 실패
- **해결**: 재연결 로직 구현, heartbeat 메시지

---

## 🔒 보안 고려사항

1. **HTTPS 필수**: getUserMedia는 HTTPS에서만 작동 (localhost 제외)
2. **DTLS/SRTP**: WebRTC는 기본적으로 암호화
3. **권한 관리**: 카메라/마이크 권한 명확히 요청
4. **Signaling 보안**: 인증 및 권한 부여 구현

---

## 📚 학습 자료

### 공식 문서
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC.org](https://webrtc.org/)

### 무료 STUN 서버
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

### 추천 라이브러리
- **Simple-peer**: WebRTC 추상화 라이브러리
- **PeerJS**: 쉬운 P2P 연결
- **Mediasoup**: 고급 SFU (Selective Forwarding Unit)

---

## 🎓 다음 단계

1. 로컬 미디어 캡처 예제 구현
2. 같은 페이지에서 Peer 연결 테스트
3. WebSocket Signaling 서버 구축
4. 실제 1:1 화상 통화 구현
5. 다중 사용자 화상 회의 (Mesh/MCU/SFU)

---

## 💡 팁

- **개발 시 localhost 사용**: HTTPS 없이도 getUserMedia 작동
- **Chrome DevTools**: chrome://webrtc-internals 에서 디버깅
- **Firefox**: about:webrtc 에서 상세 정보 확인
- **ICE Candidate 로그**: 연결 경로 확인에 유용
