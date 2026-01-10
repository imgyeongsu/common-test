/**
 * Intro Page - WebRTC 학습 소개 페이지
 *
 * features를 조합하여 화면을 구성하는 페이지 레벨 컴포넌트
 */

import { useNavigate } from 'react-router-dom';

function IntroPage() {
  const navigate = useNavigate();
  return (
    <div className="intro-section">
      <h2>WebRTC란?</h2>
      <p className="intro-text">
        <strong>WebRTC (Web Real-Time Communication)</strong>는 브라우저에서 플러그인 없이
        실시간으로 음성, 비디오, 데이터를 주고받을 수 있게 해주는 기술입니다.
      </p>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>저지연 통신</h3>
          <p>P2P 방식으로 서버를 거치지 않아 매우 빠른 실시간 통신이 가능합니다.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>보안</h3>
          <p>DTLS와 SRTP로 암호화된 통신을 기본으로 제공합니다.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🆓</div>
          <h3>오픈소스</h3>
          <p>무료로 사용 가능한 오픈소스 프로젝트입니다.</p>
        </div>
      </div>

      <div className="learning-path">
        <h3>학습 경로</h3>
        <div className="path-steps">
          <div className="path-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>미디어 캡처</h4>
              <p>getUserMedia API로 카메라/마이크 접근</p>
            </div>
          </div>
          <div className="path-arrow">→</div>
          <div className="path-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>P2P 연결</h4>
              <p>RTCPeerConnection으로 피어 연결</p>
            </div>
          </div>
          <div className="path-arrow">→</div>
          <div className="path-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>시그널링</h4>
              <p>WebSocket으로 연결 정보 교환</p>
            </div>
          </div>
          <div className="path-arrow">→</div>
          <div className="path-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>화상 통화</h4>
              <p>완전한 1:1 화상 통화 구현</p>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-links">
        <h3>빠른 시작</h3>
        <div className="links-grid">
          <button
            className="quick-link-button"
            onClick={() => navigate('/media')}
          >
            <span className="link-icon">🎥</span>
            <span>미디어 캡처 시작하기</span>
          </button>
          <button
            className="quick-link-button"
            onClick={() => navigate('/peer')}
          >
            <span className="link-icon">🔗</span>
            <span>P2P 연결 학습하기</span>
          </button>
          <button
            className="quick-link-button"
            onClick={() => navigate('/mindmap')}
          >
            <span className="link-icon">🧠</span>
            <span>3D 마인드맵 보기</span>
          </button>
          <a
            className="quick-link-button"
            href="/WEBRTC_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="link-icon">📚</span>
            <span>상세 가이드 보기</span>
          </a>
        </div>
      </div>

      <div className="resources">
        <h3>추천 자료</h3>
        <ul>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API" target="_blank" rel="noopener noreferrer">
              MDN WebRTC API 문서
            </a>
          </li>
          <li>
            <a href="https://webrtc.org/" target="_blank" rel="noopener noreferrer">
              WebRTC 공식 사이트
            </a>
          </li>
          <li>
            <a href="https://webrtc.github.io/samples/" target="_blank" rel="noopener noreferrer">
              WebRTC 샘플 코드
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default IntroPage;
