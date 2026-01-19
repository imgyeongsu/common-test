# 프로젝트 아키텍처 가이드

이 프로젝트는 **Pure Feature-based Architecture**를 따릅니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # 앱 진입점
│   ├── App.jsx            # 메인 앱 컴포넌트 (라우팅, 전역 상태)
│   └── App.css            # 전역 스타일
│
├── pages/                  # 라우트 페이지 (Feature 조합)
│   ├── IntroPage.jsx      # 소개 페이지
│   ├── MediaCapturePage.jsx    # 미디어 캡처 페이지
│   └── PeerConnectionPage.jsx  # P2P 연결 페이지
│
├── features/               # [핵심] 독립적인 비즈니스 기능 단위
│   └── webrtc-learning/   # WebRTC 학습 기능
│       ├── components/    # 해당 기능 전용 UI
│       │   ├── LocalMediaCapture.jsx
│       │   ├── LocalMediaCapture.css
│       │   ├── LocalPeerConnection.jsx
│       │   └── LocalPeerConnection.css
│       ├── hooks/         # 해당 기능 전용 로직 (향후 추가)
│       ├── api/           # 해당 기능 전용 API 요청 (향후 추가)
│       ├── types/         # 해당 기능 전용 타입 정의 (향후 추가)
│       └── index.js       # Public API (Entry Point)
│
├── shared/                 # [공용] 범용 요소
│   ├── components/        # 디자인 시스템 (Button, Input, Modal 등)
│   ├── hooks/             # 범용 유틸리티 훅
│   └── utils/             # 순수 자바스크립트 함수
│
├── assets/                 # 정적 리소스
│   └── react.svg
│
├── index.css              # 전역 스타일
└── main.jsx               # 앱 진입점
```

## 🎯 핵심 개발 원칙 (The Golden Rules)

### ✅ Rule 1: 자기 완결성 (Self-Contained)
- 특정 기능을 수정할 때 해당 `features/[name]/` 폴더 밖을 벗어나지 않는 것을 지향
- **로직(Hooks) + UI(Components) + 데이터(API)**는 항상 한 세트로 움직임

### ✅ Rule 2: 엄격한 캡슐화 (Public API)
- 각 feature는 내부 구현을 숨기고 `index.js`를 통해서만 소통

**❌ Bad:**
```javascript
import { LocalMediaCapture } from '@/features/webrtc-learning/components/LocalMediaCapture'
```

**✅ Good:**
```javascript
import { LocalMediaCapture } from '@/features/webrtc-learning'
```

### ✅ Rule 3: 수평 참조 금지 (No Horizontal Dependency)
- `features/auth`가 `features/game`을 직접 참조할 수 없음
- 공통 로직이 필요하다면:
  1. 상위 레벨인 `shared/`로 격상
  2. `pages/`에서 두 기능을 조합

## 🔧 경로 별칭 (Path Alias)

Vite 설정에 다음 별칭이 등록되어 있습니다:

```javascript
'@'          → './src'
'@/app'      → './src/app'
'@/pages'    → './src/pages'
'@/features' → './src/features'
'@/shared'   → './src/shared'
'@/assets'   → './src/assets'
```

**사용 예시:**
```javascript
import { LocalMediaCapture } from '@/features/webrtc-learning';
import Button from '@/shared/components/Button';
```

## 📦 Feature 개발 가이드

새로운 기능을 추가할 때는 다음 단계를 따르세요:

### 1. Feature 폴더 생성
```bash
mkdir -p src/features/[feature-name]/{components,hooks,api,types}
```

### 2. 컴포넌트 작성
`features/[feature-name]/components/`에 UI 컴포넌트 작성

### 3. 로직 분리
복잡한 상태나 이펙트는 `hooks/`에 Custom Hook으로 추출

### 4. Public API 작성
`index.js`에서 외부에 노출할 것만 export

```javascript
// features/[feature-name]/index.js
export { default as MyComponent } from './components/MyComponent';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyType } from './types';
```

### 5. Page에서 조합
`pages/`에서 feature들을 조합하여 화면 구성

```javascript
// pages/MyPage.jsx
import { MyComponent } from '@/features/my-feature';
import { AnotherComponent } from '@/features/another-feature';

function MyPage() {
  return (
    <>
      <MyComponent />
      <AnotherComponent />
    </>
  );
}
```

## 🚀 SPA 코드 설계 원칙

| 원칙 | 설명 | 실천 방안 |
|------|------|-----------|
| **Logic 분리** | UI 컴포넌트와 비즈니스 로직을 분리 | 복잡한 상태/이펙트는 반드시 Custom Hooks로 추출 |
| **SSOT 유지** | 데이터의 단일 출처 원칙 준수 | Server State(React Query)와 Client State를 엄격히 분리 |
| **코드 분할** | 초기 로딩 속도 최적화 | 모든 Page 컴포넌트는 React.lazy를 통한 Lazy Loading 적용 |
| **선언적 코드** | '어떻게'보다 '무엇을'에 집중 | Suspense와 Error Boundary를 활용해 선언적으로 상태 처리 |

## ✅ 팀 협업 체크리스트

- [ ] 새 기능을 만드나요? → `features/` 아래에 새로운 폴더 생성
- [ ] 공통 버튼인가요? → `shared/components/`에 있는지 확인하고 만들기
- [ ] 파일이 너무 긴가요? → UI는 컴포넌트로, 로직은 훅으로 즉시 분리
- [ ] 다른 기능의 코드가 필요한가요? → 직접 참조하지 말고 `pages/`에서 조합하거나 `shared/` 활용

## 📝 현재 구현된 Features

### webrtc-learning
WebRTC를 학습하기 위한 예제 모음

**Export된 컴포넌트:**
- `LocalMediaCapture` - 로컬 미디어 캡처 예제
- `LocalPeerConnection` - P2P 연결 예제

**사용 예시:**
```javascript
import { LocalMediaCapture, LocalPeerConnection } from '@/features/webrtc-learning';
```

## 🎓 추가 학습 자료

- [프론트 설계 원칙.pdf](./프론트%20설계%20원칙.pdf) - 상세한 설계 가이드
- [WEBRTC_GUIDE.md](./WEBRTC_GUIDE.md) - WebRTC 학습 가이드

---

**팀장으로서의 한마디:**

"우리의 목표는 응집도는 높이고 결합도는 낮추는 것입니다. 각자의 feature 폴더 안에서는 자유롭게 개발하되, 폴더 밖으로 나가는 연결 고리는 최소화하여 서로의 코드에 영향이 가지 않도록 합시다!"
