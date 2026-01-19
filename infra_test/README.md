1. [CCTV 송출 페이지] 송출부 구현 (/cctv)
목표: 카메라 영상을 OpenVidu 세션에 올리는(Publish) 최소 기능 구현

[x] 환경 구축: npm install openvidu-browser 설치

[x] 권한 획득: 브라우저 API(getUserMedia)를 통해 마이크/카메라 권한 팝업 확인

[x] 세션 초기화: OpenVidu 객체 생성 및 initSession 호출

[x] 스트림 생성: ov.initPublisher(undefined, { audioSource: true, videoSource: true, ... })로 퍼블리셔 객체 생성

[x] 세션 접속 및 송출: 하드코딩된 토큰으로 session.connect(token) 성공 시 session.publish(publisher) 실행

[x] 예외 처리: 토큰 만료나 권한 거부 시 console.error로 로그 남기기

2. [관리자 대시보드] 기본 뼈대 및 통신 설정
목표: 백엔드 알림을 받을 준비와 영상이 나올 자리를 확보

[x] 환경 구축: npm install sockjs-client stompjs 설치

[x] WebSocket 연결 로직:

[x] SockJS를 이용해 백엔드 /ws 엔드포인트 연결부 작성

[x] Stomp.over(socket)를 통한 클라이언트 객체 생성

[x] 연결 성공(onConnect) 시 콘솔에 "Connected" 로그 출력 및 재연결 로직 고려

[x] 구독(Subscribe) 설정: 특정 채널(예: /sub/manager)을 구독하고 메시지가 오면 window.alert나 console.log로 띄우기

[x] UI 레이아웃: - [x] 영상을 보여줄 id="video-container" 또는 <div> 박스 생성 (배경색을 검은색으로 두어 영역 확인)

3. [통합 테스트] 송출-수신 연동 확인
목표: 실제로 한쪽에서 쏜 영상이 다른 쪽에서 보이는지 확인

[x] 자동 재생(Autoplay) 대응: 브라우저 정책상 첫 연결 시 영상 소리가 안 나올 수 있으므로 muted 속성 활용 및 정책 확인

[x] 화면 매핑: OpenVidu streamCreated 이벤트 발생 시, 전달받은 스트림을 위에서 만든 <div> 박스 안의 <video> 태그에 연결(addVideoElement)