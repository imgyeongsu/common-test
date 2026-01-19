import { Clock, X } from 'lucide-react';

interface MeetingSidebarProps {
  onToggleTimeline: () => void;
}

// 더미 데이터: AI 회의 도우미 "GMS" 프로젝트 기획 회의
const conversationMessages = [
  {
    id: 1,
    time: '14:05',
    speaker: '김기획',
    message: 'WebRTC로 화상회의 기능을 먼저 만들어야 할 것 같아요',
    keywords: ['WebRTC', '화상회의', '기본 기능'],
    feasible: true,
  },
  {
    id: 2,
    time: '14:07',
    speaker: '이개발',
    message: 'WebRTC는 구현 가능해요. 화면 공유도 같이 넣을 수 있어요',
    keywords: ['구현 가능', '화면 공유'],
    feasible: true,
  },
  {
    id: 3,
    time: '14:10',
    speaker: '박기획',
    message: 'STT로 실시간 대화 내용을 텍스트로 변환해서 분석하면 어떨까요?',
    keywords: ['STT', '실시간 변환', '텍스트 분석'],
    feasible: true,
  },
  {
    id: 4,
    time: '14:12',
    speaker: 'AI 넥서스',
    message: '🟢 실현 가능: Google Speech-to-Text API 활용하면 1주일 내 구현 가능합니다',
    keywords: ['Google STT', '1주 개발'],
    feasible: true,
  },
  {
    id: 5,
    time: '14:15',
    speaker: '최팀장',
    message: 'AI가 대화 내용을 분석해서 자동으로 회의록 작성하면 좋겠어요',
    keywords: ['AI 분석', '자동 회의록'],
    feasible: true,
  },
  {
    id: 6,
    time: '14:18',
    speaker: '김기획',
    message: '참여자들의 감정까지 실시간으로 분석해서 표정으로 보여주면 어때요?',
    keywords: ['감정 분석', '실시간 표정'],
    feasible: false,
  },
  {
    id: 7,
    time: '14:20',
    speaker: 'AI 넥서스',
    message: '🔴 위험: 실시간 감정 분석은 영상 처리 부하가 높아 프로토타입만 2개월 소요됩니다',
    keywords: ['높은 부하', '장기 개발'],
    feasible: false,
  },
  {
    id: 8,
    time: '14:23',
    speaker: '박기획',
    message: '그럼 대화 키워드만 추출해서 신호등으로 구현 난이도 보여주는 건요?',
    keywords: ['키워드 추출', '난이도 신호등'],
    feasible: true,
  },
  {
    id: 9,
    time: '14:25',
    speaker: '이개발',
    message: 'LLM API 쓰면 키워드 분석하고 난이도 판정까지 가능할 것 같아요',
    keywords: ['LLM', 'API 활용'],
    feasible: true,
  },
  {
    id: 10,
    time: '14:27',
    speaker: 'AI 넥서스',
    message: '🟢 실현 가능: GPT API로 키워드 분석 + 난이도 평가 2주 내 구현 가능합니다',
    keywords: ['GPT API', '2주 개발'],
    feasible: true,
  },
  {
    id: 11,
    time: '14:30',
    speaker: '최팀장',
    message: '3D 마인드맵으로 아이디어를 시각화하면 회의가 더 생산적일 것 같아요',
    keywords: ['3D 마인드맵', '시각화'],
    feasible: false,
  },
  {
    id: 12,
    time: '14:32',
    speaker: 'AI 넥서스',
    message: '🔴 위험: 3D 렌더링 라이브러리 학습 곡선이 높고 최적화 어려움. MVP 범위 초과',
    keywords: ['3D 복잡도', 'MVP 초과'],
    feasible: false,
  },
  {
    id: 13,
    time: '14:35',
    speaker: '김기획',
    message: '2D 노드 그래프로 연결 관계만 보여줘도 충분할 것 같은데요?',
    keywords: ['2D 그래프', '노드 연결'],
    feasible: true,
  },
  {
    id: 14,
    time: '14:38',
    speaker: '이개발',
    message: 'React Flow 라이브러리 쓰면 간단해요. 바로 적용 가능합니다',
    keywords: ['React Flow', '즉시 적용'],
    feasible: true,
  },
  {
    id: 15,
    time: '14:40',
    speaker: '박기획',
    message: '유사 서비스 검색해서 차별점 알려주는 기능도 필요해요',
    keywords: ['경쟁사 분석', '차별점'],
    feasible: true,
  },
  {
    id: 16,
    time: '14:42',
    speaker: 'AI 넥서스',
    message: '🟢 실현 가능: 웹 검색 API + 유사도 분석으로 1주일 내 구현 가능합니다',
    keywords: ['검색 API', '유사도 분석'],
    feasible: true,
  },
];

export function MeetingSidebar({ onToggleTimeline }: MeetingSidebarProps) {
  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* 사이드바 헤더 */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">대화 타임라인</h2>
          <button
            onClick={onToggleTimeline}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-400">진행 중</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">35:42</span>
        </div>
      </div>

      {/* 대화 타임라인 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-start gap-3">
              {/* 아바타 */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {msg.speaker[0]}
              </div>

              {/* 메시지 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{msg.speaker}</span>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                  {/* 구현 가능 여부 표시 */}
                  <div className={`w-2 h-2 rounded-full ${msg.feasible ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                <div className={`text-sm p-3 rounded-lg border ${
                  msg.feasible
                    ? 'bg-slate-800/50 text-slate-300 border-slate-700/50'
                    : 'bg-red-500/10 text-slate-300 border-red-500/30'
                }`}>
                  {msg.message}
                </div>

                {/* 키워드 태그 */}
                {msg.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded border ${
                          msg.feasible
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 사이드바 푸터 */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>총 {conversationMessages.length}개의 대화</span>
        </div>
      </div>
    </aside>
  );
}
