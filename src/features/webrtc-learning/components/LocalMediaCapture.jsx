import { useState, useRef, useEffect } from 'react';
import './LocalMediaCapture.css';

/**
 * LocalMediaCapture 컴포넌트
 * - getUserMedia API를 사용하여 로컬 카메라/마이크 접근
 * - 비디오/오디오 스트림을 화면에 표시
 * - WebRTC 기초: MediaStream 다루기
 */
function LocalMediaCapture() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaDevices, setMediaDevices] = useState({ video: [], audio: [] });
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudio, setSelectedAudio] = useState('');

  const videoRef = useRef(null);

  // 사용 가능한 미디어 디바이스 목록 가져오기
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');

        setMediaDevices({
          video: videoDevices,
          audio: audioDevices
        });

        // 기본 디바이스 선택
        if (videoDevices.length > 0) setSelectedVideo(videoDevices[0].deviceId);
        if (audioDevices.length > 0) setSelectedAudio(audioDevices[0].deviceId);
      } catch (err) {
        console.error('디바이스 목록 가져오기 실패:', err);
      }
    }

    getDevices();
  }, []);

  // 미디어 스트림 시작
  const startStream = async () => {
    try {
      // getUserMedia로 카메라/마이크 접근
      const constraints = {
        video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
        audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // 비디오 엘리먼트에 스트림 연결
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsStreaming(true);
      setError(null);

      console.log('스트림 시작:', mediaStream);
      console.log('비디오 트랙:', mediaStream.getVideoTracks());
      console.log('오디오 트랙:', mediaStream.getAudioTracks());
    } catch (err) {
      console.error('미디어 접근 실패:', err);

      // 에러 타입별 메시지
      let errorMessage = '미디어 접근 실패';
      if (err.name === 'NotAllowedError') {
        errorMessage = '카메라/마이크 권한이 거부되었습니다.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '카메라 또는 마이크를 찾을 수 없습니다.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '디바이스가 이미 사용 중입니다.';
      }

      setError(errorMessage);
    }
  };

  // 미디어 스트림 중지
  const stopStream = () => {
    if (stream) {
      // 모든 트랙 정지
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`${track.kind} 트랙 정지:`, track.label);
      });

      // 비디오 엘리먼트에서 스트림 제거
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStream(null);
      setIsStreaming(false);
    }
  };

  // 디바이스 변경 시 스트림 재시작
  const changeDevice = async () => {
    if (isStreaming) {
      stopStream();
      setTimeout(() => startStream(), 100);
    }
  };

  // 컴포넌트 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="local-media-capture">
      <h2>Step 1: 로컬 미디어 캡처</h2>
      <p className="description">
        getUserMedia API를 사용하여 카메라와 마이크에 접근합니다.
      </p>

      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={isStreaming ? 'active' : ''}
        />
        {!isStreaming && (
          <div className="placeholder">
            카메라가 꺼져있습니다
          </div>
        )}
      </div>

      <div className="controls">
        <div className="device-selectors">
          <div className="selector-group">
            <label>비디오 디바이스:</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              disabled={isStreaming}
            >
              {mediaDevices.video.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `카메라 ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label>오디오 디바이스:</label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              disabled={isStreaming}
            >
              {mediaDevices.audio.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `마이크 ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-group">
          {!isStreaming ? (
            <button onClick={startStream} className="start-btn">
              스트림 시작
            </button>
          ) : (
            <>
              <button onClick={stopStream} className="stop-btn">
                스트림 중지
              </button>
              <button onClick={changeDevice} className="change-btn">
                디바이스 변경
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {stream && (
        <div className="stream-info">
          <h3>스트림 정보:</h3>
          <div className="info-grid">
            <div>
              <strong>스트림 ID:</strong> {stream.id}
            </div>
            <div>
              <strong>비디오 트랙:</strong> {stream.getVideoTracks().length}개
            </div>
            <div>
              <strong>오디오 트랙:</strong> {stream.getAudioTracks().length}개
            </div>
            {stream.getVideoTracks()[0] && (
              <div>
                <strong>비디오 레이블:</strong> {stream.getVideoTracks()[0].label}
              </div>
            )}
            {stream.getAudioTracks()[0] && (
              <div>
                <strong>오디오 레이블:</strong> {stream.getAudioTracks()[0].label}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="learning-notes">
        <h3>학습 포인트:</h3>
        <ul>
          <li><code>navigator.mediaDevices.getUserMedia()</code>: 카메라/마이크 접근</li>
          <li><code>MediaStream</code>: 비디오/오디오 트랙을 담는 컨테이너</li>
          <li><code>MediaStreamTrack</code>: 개별 미디어 트랙 (비디오 또는 오디오)</li>
          <li><code>track.stop()</code>: 트랙 중지 및 리소스 해제</li>
          <li><code>enumerateDevices()</code>: 사용 가능한 미디어 디바이스 목록</li>
        </ul>
      </div>
    </div>
  );
}

export default LocalMediaCapture;
