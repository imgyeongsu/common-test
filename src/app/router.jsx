/**
 * Router Configuration
 *
 * SPA 설계 원칙: 모든 Page 컴포넌트는 React.lazy를 통한 Lazy Loading 적용
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout';

// Lazy Loading으로 Page 컴포넌트 불러오기
const IntroPage = lazy(() => import('@/pages/IntroPage'));
const MediaCapturePage = lazy(() => import('@/pages/MediaCapturePage'));
const PeerConnectionPage = lazy(() => import('@/pages/PeerConnectionPage'));
const MindMapPage = lazy(() => import('@/pages/MindMapPage'));

// Loading Fallback 컴포넌트
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    color: '#646cff',
    fontSize: '1.2rem'
  }}>
    로딩 중...
  </div>
);

// 라우터 설정
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <IntroPage />
          </Suspense>
        )
      },
      {
        path: 'media',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MediaCapturePage />
          </Suspense>
        )
      },
      {
        path: 'peer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PeerConnectionPage />
          </Suspense>
        )
      },
      {
        path: 'mindmap',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MindMapPage />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
