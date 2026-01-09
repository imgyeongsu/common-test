/**
 * WebRTC Learning Feature - Public API
 *
 * 이 파일은 webrtc-learning 기능의 유일한 진입점입니다.
 * 외부에서는 이 파일을 통해서만 기능에 접근할 수 있습니다.
 *
 * Rule 2: 엄격한 캡슐화 (Public API)
 * - 내부 구현을 숨기고 index.js를 통해서만 소통
 */

// Components Export
export { default as LocalMediaCapture } from './components/LocalMediaCapture';
export { default as LocalPeerConnection } from './components/LocalPeerConnection';
