import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { IdeaNode } from './IdeaNode';
import { KeywordNode } from './KeywordNode';
import { ArrowLeft } from 'lucide-react';

interface MeetingCanvasProps {
  isRecording: boolean;
}

// 아이디어 상세 정보 타입 정의
interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  difficulty: 'green' | 'yellow' | 'red';
  feasible: boolean;
  techStack: {
    frontend: string[];
    backend: string[];
    infrastructure: string[];
  };
  estimatedTime: string;
  requiredSkills: string[];
  risks: string[];
  benefits: string[];
  features: Array<{
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'possible' | 'difficult' | 'impossible';
  }>;
}

// 더미 데이터: 아이디어 상세 정보
const ideaDetails: { [key: string]: IdeaDetail } = {
  '1': {
    id: '1',
    title: 'AI 기반 산업 안전 시스템',
    description: 'WebRTC와 AI를 결합하여 산업 현장의 안전을 실시간으로 모니터링하는 시스템',
    difficulty: 'green',
    feasible: true,
    techStack: {
      frontend: ['React', 'WebRTC', 'TensorFlow.js'],
      backend: ['Node.js', 'Python', 'FastAPI', 'Redis'],
      infrastructure: ['AWS', 'Docker', 'Kubernetes'],
    },
    estimatedTime: '4-6개월 (MVP: 2개월)',
    requiredSkills: ['WebRTC', 'Computer Vision', 'Real-time Processing'],
    risks: [
      '실시간 영상 처리로 인한 서버 부하',
      '정확한 위험 감지를 위한 AI 모델 학습 데이터 확보',
      '네트워크 지연으로 인한 실시간성 저하',
    ],
    benefits: [
      '산업 현장 사고율 감소',
      '실시간 위험 알림으로 신속한 대응',
      '안전 관리 비용 절감',
    ],
    features: [
      { name: '기능1: 실시간 영상 스트리밍', description: 'WebRTC 기반 작업자 헬멧 카메라 실시간 전송', priority: 'high', status: 'possible' },
      { name: '기능2: AI 위험 감지', description: '작업자 안전모 미착용, 위험 구역 진입 자동 감지', priority: 'high', status: 'possible' },
      { name: '기능3: 실시간 알림', description: '위험 상황 발생 시 관리자에게 즉시 알림 전송', priority: 'high', status: 'possible' },
      { name: '기능4: 대시보드', description: '전체 작업 현장 모니터링 통합 대시보드', priority: 'medium', status: 'possible' },
      { name: '기능5: 위험 이력 관리', description: '과거 위험 상황 로그 및 통계 분석', priority: 'medium', status: 'possible' },
    ],
  },
  '2': {
    id: '2',
    title: 'AI 회의 의사결정 도우미 (GMS)',
    description: 'STT와 LLM을 활용하여 회의 내용을 분석하고 의사결정을 지원하는 시스템',
    difficulty: 'green',
    feasible: true,
    techStack: {
      frontend: ['React', 'React Flow', 'WebRTC'],
      backend: ['Node.js', 'Express', 'OpenAI API', 'Google STT'],
      infrastructure: ['AWS', 'Firebase', 'Redis'],
    },
    estimatedTime: '3-4개월 (MVP: 6주)',
    requiredSkills: ['STT/TTS', 'LLM Integration', 'Real-time Data Processing'],
    risks: [
      'STT 정확도 문제 (한국어 방언, 전문 용어)',
      'LLM API 비용 증가',
      '실시간 분석 지연',
    ],
    benefits: [
      '회의 효율성 30% 향상',
      '자동 회의록 생성으로 시간 절약',
      '객관적인 의사결정 지원',
    ],
    features: [
      { name: '기능1: 실시간 STT', description: '회의 대화 내용 실시간 텍스트 변환', priority: 'high', status: 'possible' },
      { name: '기능2: 키워드 추출', description: 'AI 기반 핵심 키워드 자동 추출 및 분석', priority: 'high', status: 'possible' },
      { name: '기능3: 아이디어 노드 맵', description: '아이디어 시각화 및 관계도 자동 생성', priority: 'high', status: 'possible' },
      { name: '기능4: 자동 회의록', description: '회의 종료 시 요약 회의록 자동 생성', priority: 'medium', status: 'possible' },
      { name: '기능5: 구현 가능성 분석', description: '아이디어별 기술적 실현 가능성 평가', priority: 'medium', status: 'difficult' },
      { name: '기능6: 액션 아이템 추출', description: '회의에서 결정된 할 일 자동 추출', priority: 'low', status: 'possible' },
    ],
  },
  '3': {
    id: '3',
    title: '익명 심리상담 플랫폼',
    description: '익명성을 보장하면서 전문 심리상담사와 연결해주는 플랫폼',
    difficulty: 'yellow',
    feasible: true,
    techStack: {
      frontend: ['React Native', 'Socket.io'],
      backend: ['Node.js', 'PostgreSQL', 'Redis'],
      infrastructure: ['AWS', 'End-to-end Encryption'],
    },
    estimatedTime: '5-7개월 (MVP: 3개월)',
    requiredSkills: ['Security', 'Chat System', 'Payment Gateway'],
    risks: [
      '개인정보 보호 및 익명성 보장',
      '상담사 자격 검증 시스템',
      '긴급 상황 대응 프로토콜',
    ],
    benefits: [
      '심리상담 접근성 향상',
      '익명성으로 인한 심리적 부담 감소',
      '24시간 상담 가능',
    ],
    features: [
      { name: '기능1: 익명 매칭', description: '사용자-상담사 익명 자동 매칭 시스템', priority: 'high', status: 'possible' },
      { name: '기능2: 암호화 채팅', description: 'End-to-end 암호화 채팅 시스템', priority: 'high', status: 'difficult' },
      { name: '기능3: 결제 시스템', description: '상담료 결제 및 정산 시스템', priority: 'high', status: 'possible' },
      { name: '기능4: 상담사 인증', description: '전문 상담사 자격 검증 시스템', priority: 'high', status: 'difficult' },
      { name: '기능5: 상담 일지', description: '상담 내용 요약 및 일지 자동 저장', priority: 'medium', status: 'possible' },
      { name: '기능6: 긴급 대응', description: '위기 상황 감지 및 긴급 연락 시스템', priority: 'high', status: 'difficult' },
    ],
  },
  '4': {
    id: '4',
    title: 'AI 퀴즈 시스템',
    description: 'AI가 자동으로 퀴즈를 생성하고 정답을 맞추는 시스템',
    difficulty: 'green',
    feasible: true,
    techStack: {
      frontend: ['React', 'Framer Motion'],
      backend: ['Node.js', 'OpenAI API', 'MongoDB'],
      infrastructure: ['Vercel', 'MongoDB Atlas'],
    },
    estimatedTime: '2-3개월 (MVP: 4주)',
    requiredSkills: ['LLM Integration', 'Gamification', 'Real-time Updates'],
    risks: [
      'AI 생성 퀴즈의 품질 관리',
      '부적절한 콘텐츠 필터링',
    ],
    benefits: [
      '교육용 콘텐츠 자동 생성',
      '개인화된 학습 경험',
      '즉각적인 피드백',
    ],
    features: [
      { name: '기능1: AI 퀴즈 생성', description: 'GPT 기반 주제별 퀴즈 자동 생성', priority: 'high', status: 'possible' },
      { name: '기능2: 난이도 조절', description: '사용자 실력에 따른 난이도 자동 조절', priority: 'high', status: 'possible' },
      { name: '기능3: 실시간 채점', description: '정답 확인 및 즉시 피드백 제공', priority: 'high', status: 'possible' },
      { name: '기능4: 학습 분석', description: '사용자 학습 패턴 분석 및 리포트', priority: 'medium', status: 'possible' },
      { name: '기능5: 리더보드', description: '순위 시스템 및 게임화 요소', priority: 'low', status: 'possible' },
    ],
  },
  '5': {
    id: '5',
    title: '실시간 CPR 코칭 시스템',
    description: '컴퓨터 비전으로 CPR 동작을 인식하고 실시간 피드백을 제공하는 시스템',
    difficulty: 'red',
    feasible: false,
    techStack: {
      frontend: ['React', 'TensorFlow.js', 'MediaPipe'],
      backend: ['Python', 'FastAPI', 'TensorFlow'],
      infrastructure: ['AWS', 'GPU Instance'],
    },
    estimatedTime: '8-12개월 (MVP: 5개월)',
    requiredSkills: ['Computer Vision', 'Pose Estimation', 'Real-time Processing', 'Medical Knowledge'],
    risks: [
      '정확한 동작 인식을 위한 고성능 AI 모델 필요',
      '실시간 영상 처리 부하',
      '의료 기기 인증 필요',
      '다양한 환경과 조명에서의 정확도',
    ],
    benefits: [
      'CPR 교육 효과 향상',
      '응급 상황 대응 능력 향상',
      '비대면 교육 가능',
    ],
    features: [
      { name: '기능1: 동작 인식', description: 'MediaPipe 기반 CPR 동작 실시간 인식', priority: 'high', status: 'difficult' },
      { name: '기능2: 자세 평가', description: '압박 깊이, 속도, 자세 정확도 평가', priority: 'high', status: 'difficult' },
      { name: '기능3: 실시간 피드백', description: '음성 및 시각 피드백 실시간 제공', priority: 'high', status: 'possible' },
      { name: '기능4: 교육 모드', description: '단계별 CPR 학습 튜토리얼', priority: 'medium', status: 'possible' },
      { name: '기능5: 성적 관리', description: 'CPR 시뮬레이션 성적 및 인증서 발급', priority: 'low', status: 'impossible' },
    ],
  },
  '6': {
    id: '6',
    title: '수어 소통 보조 시스템',
    description: '수어를 실시간으로 인식하고 텍스트/음성으로 변환하는 시스템',
    difficulty: 'red',
    feasible: false,
    techStack: {
      frontend: ['React', 'TensorFlow.js', 'MediaPipe'],
      backend: ['Python', 'FastAPI', 'TensorFlow', 'OpenCV'],
      infrastructure: ['AWS', 'GPU Instance', 'Edge Computing'],
    },
    estimatedTime: '12-18개월 (MVP: 8개월)',
    requiredSkills: ['Computer Vision', 'Sign Language', 'Deep Learning', 'Real-time Processing'],
    risks: [
      '수어 데이터셋 확보 어려움',
      '지역별/개인별 수어 차이',
      '실시간 처리 성능 이슈',
      '복잡한 문장 인식 정확도',
    ],
    benefits: [
      '청각 장애인 소통 접근성 향상',
      '일상생활 편의성 증대',
      '사회적 포용성 강화',
    ],
    features: [
      { name: '기능1: 수어 인식', description: 'TensorFlow 기반 수어 동작 실시간 인식', priority: 'high', status: 'difficult' },
      { name: '기능2: 텍스트 변환', description: '인식된 수어를 텍스트로 변환', priority: 'high', status: 'difficult' },
      { name: '기능3: 음성 변환', description: 'TTS 기반 텍스트를 음성으로 변환', priority: 'high', status: 'possible' },
      { name: '기능4: 양방향 통신', description: '음성을 텍스트로 변환하여 화면 표시', priority: 'medium', status: 'possible' },
      { name: '기능5: 학습 모드', description: '수어 학습 및 연습 기능', priority: 'low', status: 'difficult' },
      { name: '기능6: 맥락 이해', description: 'AI 기반 문장 맥락 파악 및 보정', priority: 'medium', status: 'impossible' },
    ],
  },
};

const nodeTypes = {
  ideaNode: IdeaNode,
  keywordNode: KeywordNode,
};

// 아이디어 상세 정보를 노드로 변환하는 함수
function createDetailNodes(detail: IdeaDetail): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  // 중앙 제목 노드
  nodes.push({
    id: 'center',
    type: 'ideaNode',
    position: { x: 400, y: 50 },
    data: {
      label: detail.title,
      difficulty: detail.difficulty,
      description: detail.description,
      timestamp: '',
    },
  });

  // Frontend 노드들
  const frontendStatus: { [key: string]: { status: 'possible' | 'difficult' | 'impossible', recommendation?: string } } = {
    'React': { status: 'possible', recommendation: '풍부한 생태계와 커뮤니티, 빠른 개발 가능' },
    'WebRTC': { status: 'possible', recommendation: '브라우저 네이티브 지원, 안정적인 API' },
    'TensorFlow.js': { status: 'difficult', recommendation: '브라우저 성능 제약, 서버 측 처리 병행 필요' },
    'React Native': { status: 'possible', recommendation: '크로스 플랫폼 개발 가능, 네이티브 성능' },
    'Socket.io': { status: 'possible', recommendation: '실시간 통신 간편, 안정적인 라이브러리' },
    'Framer Motion': { status: 'possible', recommendation: '손쉬운 애니메이션, React 친화적' },
    'React Flow': { status: 'possible', recommendation: '노드 기반 UI 구현에 최적화' },
    'MediaPipe': { status: 'difficult', recommendation: '고성능 비전 처리 가능하나 학습 곡선 높음' },
  };

  detail.techStack.frontend.forEach((tech, i) => {
    const id = `frontend-${nodeId++}`;
    const mvpInfo = frontendStatus[tech] || { status: 'possible' };
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 100 + i * 140, y: 200 },
      data: {
        label: tech,
        type: 'frontend',
        status: mvpInfo.status,
        recommendation: mvpInfo.recommendation,
      },
    });
    edges.push({ id: `e-center-${id}`, source: 'center', target: id, style: { stroke: '#3b82f6' } });
  });

  // Backend 노드들
  const backendStatus: { [key: string]: { status: 'possible' | 'difficult' | 'impossible', recommendation?: string } } = {
    'Node.js': { status: 'possible', recommendation: '비동기 처리 우수, 빠른 개발 속도' },
    'Python': { status: 'possible', recommendation: 'AI/ML 라이브러리 풍부, 생산성 높음' },
    'FastAPI': { status: 'possible', recommendation: '빠른 성능, 자동 문서화, 타입 안정성' },
    'Redis': { status: 'possible', recommendation: '고성능 캐싱, 실시간 데이터 처리' },
    'Express': { status: 'possible', recommendation: '가볍고 유연한 웹 프레임워크' },
    'OpenAI API': { status: 'difficult', recommendation: 'API 비용 고려 필요, 응답 속도 변동 가능' },
    'Google STT': { status: 'difficult', recommendation: '한국어 인식률 우수하나 비용 고려 필요' },
    'PostgreSQL': { status: 'possible', recommendation: '안정적인 RDBMS, 트랜잭션 지원' },
    'MongoDB': { status: 'possible', recommendation: '유연한 스키마, 빠른 개발' },
    'TensorFlow': { status: 'difficult', recommendation: 'GPU 리소스 필요, 모델 학습 시간 소요' },
    'OpenCV': { status: 'difficult', recommendation: '강력한 CV 라이브러리지만 설정 복잡' },
  };

  detail.techStack.backend.forEach((tech, i) => {
    const id = `backend-${nodeId++}`;
    const mvpInfo = backendStatus[tech] || { status: 'possible' };
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 100 + i * 140, y: 340 },
      data: {
        label: tech,
        type: 'backend',
        status: mvpInfo.status,
        recommendation: mvpInfo.recommendation,
      },
    });
    edges.push({ id: `e-center-${id}`, source: 'center', target: id, style: { stroke: '#10b981' } });
  });

  // Infrastructure 노드들
  const infraStatus: { [key: string]: { status: 'possible' | 'difficult' | 'impossible', recommendation?: string } } = {
    'AWS': { status: 'possible', recommendation: '다양한 서비스 제공, 안정적인 인프라' },
    'Docker': { status: 'possible', recommendation: '컨테이너화로 일관된 환경, 배포 용이' },
    'Kubernetes': { status: 'difficult', recommendation: '학습 곡선 높음, 초기 설정 복잡하나 확장성 우수' },
    'Firebase': { status: 'possible', recommendation: '빠른 개발, 백엔드 관리 간소화' },
    'Vercel': { status: 'possible', recommendation: 'Next.js 최적화, 자동 배포' },
    'MongoDB Atlas': { status: 'possible', recommendation: '관리형 DB, 자동 백업' },
    'End-to-end Encryption': { status: 'difficult', recommendation: '보안 강화 가능하나 구현 난이도 높음' },
    'GPU Instance': { status: 'difficult', recommendation: '높은 비용, AI 처리에 필수' },
    'Edge Computing': { status: 'difficult', recommendation: '지연시간 감소하나 아키텍처 복잡도 증가' },
  };

  detail.techStack.infrastructure.forEach((tech, i) => {
    const id = `infra-${nodeId++}`;
    const mvpInfo = infraStatus[tech] || { status: 'possible' };
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 100 + i * 160, y: 480 },
      data: {
        label: tech,
        type: 'infrastructure',
        status: mvpInfo.status,
        recommendation: mvpInfo.recommendation,
      },
    });
    edges.push({ id: `e-center-${id}`, source: 'center', target: id, style: { stroke: '#a855f7' } });
  });

  // Required Skills 노드들 - 제거됨

  // Risks 노드들 - 모두 주의 필요로 표시
  detail.risks.forEach((risk, i) => {
    const id = `risk-${nodeId++}`;
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 50 + i * 220, y: 620 },
      data: {
        label: risk.substring(0, 30) + '...',
        type: 'risk',
        description: risk,
        status: 'difficult',
        recommendation: 'MVP에서 우선 대응 필요한 리스크',
      },
    });
    edges.push({ id: `e-center-${id}`, source: 'center', target: id, style: { stroke: '#ef4444', strokeDasharray: '5,5' } });
  });

  // Benefits 노드들 - 모두 긍정적 효과로 표시
  detail.benefits.forEach((benefit, i) => {
    const id = `benefit-${nodeId++}`;
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 700 + i * 220, y: 340 },
      data: {
        label: benefit.substring(0, 30) + '...',
        type: 'benefit',
        description: benefit,
        status: 'possible',
        recommendation: 'MVP 구현 시 확보 가능한 이점',
      },
    });
    edges.push({ id: `e-center-${id}`, source: 'center', target: id, animated: true, style: { stroke: '#10b981' } });
  });

  // Features 노드들 - 중앙 상단에 배치
  detail.features.forEach((feature, i) => {
    const id = `feature-${nodeId++}`;
    const row = Math.floor(i / 3); // 한 줄에 3개씩
    const col = i % 3;
    nodes.push({
      id,
      type: 'keywordNode',
      position: { x: 150 + col * 280, y: -150 - row * 150 },
      data: {
        label: feature.name,
        type: 'feature',
        description: feature.description,
        status: feature.status,
        priority: feature.priority,
        recommendation: `우선순위: ${feature.priority === 'high' ? '높음' : feature.priority === 'medium' ? '중간' : '낮음'}`,
      },
    });
    edges.push({
      id: `e-center-${id}`,
      source: 'center',
      target: id,
      animated: feature.priority === 'high',
      style: { stroke: '#6366f1', strokeWidth: feature.priority === 'high' ? 2 : 1 }
    });
  });

  // Timeline 노드
  const timeStatus = detail.difficulty === 'green' ? 'possible' : detail.difficulty === 'yellow' ? 'difficult' : 'difficult';
  const timeRecommendation = detail.difficulty === 'green'
    ? 'MVP 단계로 빠른 검증 가능'
    : detail.difficulty === 'yellow'
    ? '단계별 개발로 리스크 분산 권장'
    : 'POC 먼저 진행하여 기술 검증 필요';

  nodes.push({
    id: 'time',
    type: 'keywordNode',
    position: { x: 400, y: 760 },
    data: {
      label: detail.estimatedTime,
      type: 'time',
      status: timeStatus,
      recommendation: timeRecommendation,
    },
  });
  edges.push({ id: 'e-center-time', source: 'center', target: 'time', style: { stroke: '#eab308' } });

  return { nodes, edges };
}

// 더미 데이터: 서비스 아이디어 노드
const initialNodes: Node[] = [
  // 구현 가능한 아이디어들 (초록색)
  {
    id: '1',
    type: 'ideaNode',
    position: { x: 100, y: 50 },
    data: {
      label: 'AI 기반 산업 안전 시스템',
      difficulty: 'green',
      description: 'WebRTC × AI 실시간 모니터링',
      timestamp: '14:05',
    },
  },
  {
    id: '2',
    type: 'ideaNode',
    position: { x: 400, y: 50 },
    data: {
      label: 'AI 회의 의사결정 도우미',
      difficulty: 'green',
      description: 'STT + LLM 회의 분석',
      timestamp: '14:10',
    },
  },
  {
    id: '3',
    type: 'ideaNode',
    position: { x: 250, y: 200 },
    data: {
      label: '익명 심리상담 플랫폼',
      difficulty: 'yellow',
      description: '익명 전문 상담 서비스',
      timestamp: '14:15',
    },
  },
  {
    id: '4',
    type: 'ideaNode',
    position: { x: 100, y: 350 },
    data: {
      label: 'AI 퀴즈 시스템',
      difficulty: 'green',
      description: 'AI 자동 퀴즈 생성',
      timestamp: '14:20',
    },
  },

  // 구현 어려운 아이디어들 (빨간색)
  {
    id: '5',
    type: 'ideaNode',
    position: { x: 600, y: 150 },
    data: {
      label: '실시간 CPR 코칭',
      difficulty: 'red',
      description: 'CV 기반 동작 인식',
      timestamp: '14:25',
    },
  },
  {
    id: '6',
    type: 'ideaNode',
    position: { x: 600, y: 300 },
    data: {
      label: '수어 소통 보조 시스템',
      difficulty: 'red',
      description: '수어 인식 및 변환',
      timestamp: '14:30',
    },
  },
];

// 각 노드는 독립적인 서비스 아이디어이므로 연결선 불필요
const initialEdges: Edge[] = [];

export function MeetingCanvas({ isRecording }: MeetingCanvasProps) {
  const [viewMode, setViewMode] = useState<'main' | 'detail'>('main');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [simulatedText, setSimulatedText] = useState('');

  // 메인 뷰 노드와 엣지
  const mainNodesWithClick = initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => handleNodeClick(node.id),
    },
  }));

  // 상세 뷰 노드와 엣지
  const detailData = selectedIdeaId ? createDetailNodes(ideaDetails[selectedIdeaId]) : { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState(
    viewMode === 'main' ? mainNodesWithClick : detailData.nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    viewMode === 'main' ? initialEdges : detailData.edges
  );

  const handleNodeClick = (nodeId: string) => {
    const detail = ideaDetails[nodeId];
    if (detail) {
      setSelectedIdeaId(nodeId);
      setViewMode('detail');
    }
  };

  const handleBackToMain = () => {
    setViewMode('main');
    setSelectedIdeaId(null);
  };

  // 뷰 모드 변경 시 노드와 엣지 업데이트
  useEffect(() => {
    if (viewMode === 'main') {
      setNodes(mainNodesWithClick);
      setEdges(initialEdges);
    } else if (selectedIdeaId) {
      const detail = createDetailNodes(ideaDetails[selectedIdeaId]);
      setNodes(detail.nodes);
      setEdges(detail.edges);
    }
  }, [viewMode, selectedIdeaId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // STT 시뮬레이션 - 새로운 키워드 추가
  useEffect(() => {
    if (isRecording) {
      const texts = [
        '관리자 기능도 필요할 것 같아요...',
        '알림 시스템은 어떻게 하죠?',
        '모바일 대응도 고려해야 할까요?',
        '백업 시스템은 필수겠죠...',
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < texts.length) {
          setSimulatedText(texts[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setSimulatedText('');
    }
  }, [isRecording]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background
          color="#8b5cf6"
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
        />
        <Controls className="bg-slate-800 border-slate-700" />
        <MiniMap
          className="bg-slate-800 border-slate-700"
          nodeColor={(node) => {
            const difficulty = (node.data as any).difficulty;
            if (difficulty === 'green') return '#10b981';
            if (difficulty === 'yellow') return '#f59e0b';
            if (difficulty === 'red') return '#ef4444';
            return '#64748b';
          }}
        />
      </ReactFlow>

      {/* STT 시뮬레이션 오버레이 */}
      {isRecording && simulatedText && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse" />
              <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse delay-150" />
            </div>
            <p className="text-white text-sm">{simulatedText}</p>
          </div>
        </div>
      )}

      {/* 지식 로드맵 가이드 */}
      <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <p className="text-sm font-semibold text-white">아이디어 로드맵</p>
        </div>
        <p className="text-xs text-slate-400">회의에서 나온 아이디어 시각화</p>
      </div>

      {/* 범례 */}
      <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold text-white mb-3">구현 가능성</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">구현 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-400">검토 필요</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">구현 어려움</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            💡 총 {initialNodes.length}개 아이디어
          </p>
          <p className="text-xs text-slate-400 mt-1">
            클릭하여 상세 정보 확인
          </p>
        </div>
      </div>

      {/* 뒤로가기 버튼 (상세 뷰에서만 표시) */}
      {viewMode === 'detail' && (
        <button
          onClick={handleBackToMain}
          className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white">메인으로 돌아가기</span>
        </button>
      )}
    </div>
  );
}
