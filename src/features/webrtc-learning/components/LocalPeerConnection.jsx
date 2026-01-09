import { useState, useRef, useEffect } from 'react';
import './LocalPeerConnection.css';

/**
 * LocalPeerConnection 컴포넌트
 * - 같은 페이지에서 두 개의 RTCPeerConnection 생성
 * - Signaling 서버 없이 SDP와 ICE Candidate를 직접 교환
 * - Offer/Answer 메커니즘 학습
 * - WebRTC 연결 프로세스 이해
 */
function LocalPeerConnection() {
  const [localStream, setLocalStream] = useState(null);
  const [pc1, setPc1] = useState(null); // Peer 1 (Caller)
  const [pc2, setPc2] = useState(null); // Peer 2 (Callee)
  const [connectionState, setConnectionState] = useState('new');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    offerCreated: false,
    answerCreated: false,
    ice1Count: 0,
    ice2Count: 0
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 로그 추가 함수
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // 로컬 스트림 시작
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setLocalStream(stream);
      addLog('로컬 스트림 시작 성공', 'success');
    } catch (err) {
      addLog(`스트림 시작 실패: ${err.message}`, 'error');
    }
  };

  // Peer Connection 생성 및 연결
  const createPeerConnection = async () => {
    if (!localStream) {
      addLog('먼저 로컬 스트림을 시작하세요', 'error');
      return;
    }

    // ICE 서버 설정 (Google의 공개 STUN 서버)
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    // Peer Connection 1 (Caller) 생성
    const peerConnection1 = new RTCPeerConnection(configuration);
    addLog('Peer Connection 1 (Caller) 생성', 'success');

    // Peer Connection 2 (Callee) 생성
    const peerConnection2 = new RTCPeerConnection(configuration);
    addLog('Peer Connection 2 (Callee) 생성', 'success');

    // PC1: 로컬 스트림 추가
    localStream.getTracks().forEach(track => {
      peerConnection1.addTrack(track, localStream);
      addLog(`PC1에 ${track.kind} 트랙 추가`, 'info');
    });

    // PC1: ICE Candidate 이벤트
    peerConnection1.onicecandidate = (event) => {
      if (event.candidate) {
        // 실제로는 Signaling 서버를 통해 전송
        // 여기서는 직접 PC2에 추가
        peerConnection2.addIceCandidate(event.candidate);
        setStats(prev => ({ ...prev, ice1Count: prev.ice1Count + 1 }));
        addLog(`PC1 -> PC2: ICE Candidate 전송`, 'info');
      } else {
        addLog('PC1: ICE Candidate 수집 완료', 'success');
      }
    };

    // PC2: ICE Candidate 이벤트
    peerConnection2.onicecandidate = (event) => {
      if (event.candidate) {
        peerConnection1.addIceCandidate(event.candidate);
        setStats(prev => ({ ...prev, ice2Count: prev.ice2Count + 1 }));
        addLog(`PC2 -> PC1: ICE Candidate 전송`, 'info');
      } else {
        addLog('PC2: ICE Candidate 수집 완료', 'success');
      }
    };

    // PC1: 연결 상태 변경
    peerConnection1.onconnectionstatechange = () => {
      addLog(`PC1 연결 상태: ${peerConnection1.connectionState}`, 'info');
      setConnectionState(peerConnection1.connectionState);
    };

    // PC1: ICE 연결 상태 변경
    peerConnection1.oniceconnectionstatechange = () => {
      addLog(`PC1 ICE 연결 상태: ${peerConnection1.iceConnectionState}`, 'info');
    };

    // PC2: 원격 스트림 수신
    peerConnection2.ontrack = (event) => {
      addLog(`PC2: 원격 트랙 수신 (${event.track.kind})`, 'success');
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = event.streams[0];
          addLog('원격 스트림 연결 완료', 'success');
        }
      }
    };

    setPc1(peerConnection1);
    setPc2(peerConnection2);

    // Offer 생성 및 교환
    await createOfferAndAnswer(peerConnection1, peerConnection2);
  };

  // Offer와 Answer 생성
  const createOfferAndAnswer = async (pc1, pc2) => {
    try {
      // 1. PC1에서 Offer 생성
      addLog('PC1: Offer 생성 중...', 'info');
      const offer = await pc1.createOffer();
      addLog('PC1: Offer 생성 완료', 'success');

      // 2. PC1에 Local Description 설정
      await pc1.setLocalDescription(offer);
      addLog('PC1: Local Description (Offer) 설정', 'success');
      setStats(prev => ({ ...prev, offerCreated: true }));

      // 3. PC2에 Remote Description 설정 (Offer 수신)
      await pc2.setRemoteDescription(offer);
      addLog('PC2: Remote Description (Offer) 수신', 'success');

      // 4. PC2에서 Answer 생성
      addLog('PC2: Answer 생성 중...', 'info');
      const answer = await pc2.createAnswer();
      addLog('PC2: Answer 생성 완료', 'success');

      // 5. PC2에 Local Description 설정
      await pc2.setLocalDescription(answer);
      addLog('PC2: Local Description (Answer) 설정', 'success');
      setStats(prev => ({ ...prev, answerCreated: true }));

      // 6. PC1에 Remote Description 설정 (Answer 수신)
      await pc1.setRemoteDescription(answer);
      addLog('PC1: Remote Description (Answer) 수신', 'success');

      addLog('🎉 SDP 교환 완료! ICE Candidate 교환 중...', 'success');
    } catch (err) {
      addLog(`Offer/Answer 생성 실패: ${err.message}`, 'error');
    }
  };

  // 연결 종료
  const closeConnection = () => {
    if (pc1) {
      pc1.close();
      addLog('PC1 연결 종료', 'info');
    }
    if (pc2) {
      pc2.close();
      addLog('PC2 연결 종료', 'info');
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setPc1(null);
    setPc2(null);
    setConnectionState('closed');
    setStats({
      offerCreated: false,
      answerCreated: false,
      ice1Count: 0,
      ice2Count: 0
    });
  };

  // 로그 클리어
  const clearLogs = () => {
    setLogs([]);
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (pc1) pc1.close();
      if (pc2) pc2.close();
    };
  }, [localStream, pc1, pc2]);

  return (
    <div className="local-peer-connection">
      <h2>Step 2: Peer-to-Peer 연결 (로컬)</h2>
      <p className="description">
        같은 페이지에서 두 개의 Peer를 생성하고 직접 연결합니다.
        Signaling 서버 없이 Offer/Answer 메커니즘을 학습합니다.
      </p>

      <div className="connection-status">
        <span className={`status-badge ${connectionState}`}>
          연결 상태: {connectionState}
        </span>
      </div>

      <div className="video-grid">
        <div className="video-box">
          <h3>로컬 비디오 (Peer 1 - Caller)</h3>
          <video ref={localVideoRef} autoPlay playsInline muted />
        </div>
        <div className="video-box">
          <h3>원격 비디오 (Peer 2 - Callee)</h3>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>

      <div className="controls">
        <button
          onClick={startLocalStream}
          disabled={localStream !== null}
          className="btn-primary"
        >
          1. 로컬 스트림 시작
        </button>
        <button
          onClick={createPeerConnection}
          disabled={!localStream || pc1 !== null}
          className="btn-success"
        >
          2. Peer 연결 시작
        </button>
        <button
          onClick={closeConnection}
          disabled={!pc1}
          className="btn-danger"
        >
          연결 종료
        </button>
      </div>

      <div className="stats-panel">
        <h3>연결 통계</h3>
        <div className="stats-grid">
          <div className={stats.offerCreated ? 'stat-item active' : 'stat-item'}>
            <span className="stat-label">Offer 생성</span>
            <span className="stat-value">{stats.offerCreated ? '✓' : '✗'}</span>
          </div>
          <div className={stats.answerCreated ? 'stat-item active' : 'stat-item'}>
            <span className="stat-label">Answer 생성</span>
            <span className="stat-value">{stats.answerCreated ? '✓' : '✗'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">PC1 ICE Candidates</span>
            <span className="stat-value">{stats.ice1Count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">PC2 ICE Candidates</span>
            <span className="stat-value">{stats.ice2Count}</span>
          </div>
        </div>
      </div>

      <div className="logs-panel">
        <div className="logs-header">
          <h3>연결 로그</h3>
          <button onClick={clearLogs} className="btn-clear">Clear</button>
        </div>
        <div className="logs-content">
          {logs.length === 0 ? (
            <div className="no-logs">로그가 없습니다</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`log-item ${log.type}`}>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="learning-notes">
        <h3>학습 포인트:</h3>
        <ul>
          <li><code>RTCPeerConnection</code>: P2P 연결의 핵심 객체</li>
          <li><code>createOffer()</code>: 연결을 시작하는 Peer가 호출</li>
          <li><code>createAnswer()</code>: Offer를 받은 Peer가 응답</li>
          <li><code>setLocalDescription()</code>: 로컬 SDP 설정</li>
          <li><code>setRemoteDescription()</code>: 상대방 SDP 설정</li>
          <li><code>onicecandidate</code>: ICE Candidate 수집 이벤트</li>
          <li><code>addIceCandidate()</code>: 상대방의 ICE Candidate 추가</li>
          <li><code>ontrack</code>: 원격 미디어 트랙 수신 이벤트</li>
        </ul>
      </div>

      <div className="process-diagram">
        <h3>연결 프로세스:</h3>
        <pre>{`
1. PC1: createOffer() → Local SDP
2. PC1: setLocalDescription(offer)
3. PC2: setRemoteDescription(offer)
4. PC2: createAnswer() → Local SDP
5. PC2: setLocalDescription(answer)
6. PC1: setRemoteDescription(answer)
7. 양쪽: ICE Candidates 교환
8. 연결 완료!
        `}</pre>
      </div>
    </div>
  );
}

export default LocalPeerConnection;
