/**
 * AppLayout - 공통 레이아웃 컴포넌트
 *
 * 헤더, 네비게이션, 푸터 등 모든 페이지에서 공통으로 사용되는 레이아웃
 * Outlet을 통해 자식 라우트를 렌더링
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: '/', label: '소개', icon: '📚' },
    { id: '/media', label: 'Step 1: 미디어 캡처', icon: '🎥' },
    { id: '/peer', label: 'Step 2: P2P 연결', icon: '🔗' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>WebRTC 학습 프로젝트</h1>
        <p>React에서 WebRTC를 단계별로 학습하고 구현합니다</p>
      </header>

      <nav className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${location.pathname === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>WebRTC 학습 프로젝트 - React + Vite</p>
      </footer>
    </div>
  );
}

export default AppLayout;
