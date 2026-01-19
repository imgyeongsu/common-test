[공통 가이드]
- 세션 ID 규칙: 각 매장의 고유 ID(예: store_105)를 sessionId로 사용합니다.
- API 호출: 세션 접속 전, 백엔드의 POST /sessions/{sessionId}/connections를 호출하여 token을 받아옵니다.
- 라이브러리: openvidu-browser를 사용합니다.

[A. Publisher: CCTV/송출 기기]
역할: 매장 영상을 서버로 보냅니다.

주요 로직:
JavaScript
```
const OV = new OpenVidu();
const session = OV.initSession();

// 1. 백엔드에서 토큰 받아오기
const token = await getTokenFromServer(storeId);

// 2. 세션 연결
await session.connect(token);

// 3. 카메라/마이크 활성화 (CCTV는 마이크 제외 가능)
const publisher = await OV.initPublisherAsync(undefined, {
    audioSource: false, // CCTV용이라면 오디오 끄기 권장
    videoSource: undefined, 
    publishAudio: false,
    publishVideo: true,
    resolution: '640x480', // 대역폭 절약을 위해 적절한 해상도 설정
    frameRate: 30,
    insertMode: 'APPEND',
});
// 4. 영상 송출 시작
session.publish(publisher);
```
[B. Customer: 관리자/모바일 웹]
역할: 매장 영상을 실시간으로 모니터링합니다.

주요 로직:

JavaScript
```
const OV = new OpenVidu();
const session = OV.initSession();

// 1. 영상 스트림 감지 이벤트 등록 (핵심!)
session.on('streamCreated', (event) => {
    // Publisher가 송출을 시작하면 이 이벤트가 발생함
    const subscriber = session.subscribe(event.stream, 'video-container-id');
});

// 2. 백엔드에서 토큰 받아오기
const token = await getTokenFromServer(storeId);

// 3. 세션 연결 (연결만 해두면 스트림 감지 시 영상이 뜸)
await session.connect(token);```
