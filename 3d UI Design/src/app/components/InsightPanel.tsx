import { 
  TrendingUp, 
  Code, 
  DollarSign, 
  Target, 
  GitBranch, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Database,
  Shield,
  Clock
} from 'lucide-react';

interface InsightPanelProps {
  userMode: 'planner' | 'developer';
}

// 더미 데이터: 기획자 모드 인사이트
const plannerInsights = {
  businessValue: {
    title: '비즈니스 가치 분석',
    icon: <TrendingUp className="w-5 h-5" />,
    items: [
      { label: '시장 차별성', value: '높음', status: 'positive' },
      { label: '예상 개발 비용', value: '₩45,000,000', status: 'neutral' },
      { label: '출시 예상 기간', value: '6개월', status: 'neutral' },
      { label: 'MVP 가능성', value: '3개월', status: 'positive' },
    ],
  },
  marketAnalysis: {
    title: '시장 분석',
    icon: <Target className="w-5 h-5" />,
    competitors: [
      { name: '유사 서비스 A', similarity: '68%' },
      { name: '유사 서비스 B', similarity: '52%' },
    ],
    differentiation: '실시간 AI 추천 기능으로 차별화 가능',
  },
  pivotSuggestions: {
    title: '피벗 제안',
    icon: <Lightbulb className="w-5 h-5" />,
    suggestions: [
      'B2B 모델로 전환하여 기업 고객 타겟',
      'AI 기능을 외부 API로 제공하여 추가 수익 창출',
      '프리미엄 구독 모델 도입 검토',
    ],
  },
};

// 더미 데이터: 개발자 모드 인사이트
const developerInsights = {
  techStack: {
    title: '추천 기술 스택',
    icon: <Code className="w-5 h-5" />,
    frontend: ['React', 'Next.js', 'Tailwind CSS', 'Zustand'],
    backend: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
    infrastructure: ['AWS', 'Docker', 'GitHub Actions'],
  },
  architecture: {
    title: '아키텍처 권장사항',
    icon: <GitBranch className="w-5 h-5" />,
    items: [
      { label: '마이크로서비스', recommended: false, reason: '초기 단계에는 모놀리식 권장' },
      { label: 'RESTful API', recommended: true, reason: '구현 간편, 확장성 우수' },
      { label: 'WebSocket', recommended: true, reason: '실시간 기능 필수' },
    ],
  },
  risks: {
    title: '기술 리스크',
    icon: <AlertTriangle className="w-5 h-5" />,
    items: [
      { risk: 'AI 모델 학습', severity: 'high', mitigation: 'TensorFlow Serving 활용' },
      { risk: '실시간 처리 성능', severity: 'medium', mitigation: 'Redis 캐싱 적용' },
      { risk: '보안', severity: 'high', mitigation: 'JWT + OAuth 2.0 적용' },
    ],
  },
  references: {
    title: '오픈소스 레퍼런스',
    icon: <Database className="w-5 h-5" />,
    repos: [
      { name: 'awesome-chat-app', stars: '12.5k', url: '#' },
      { name: 'ml-recommendation-engine', stars: '8.2k', url: '#' },
      { name: 'payment-gateway-integration', stars: '5.1k', url: '#' },
    ],
  },
};

export function InsightPanel({ userMode }: InsightPanelProps) {
  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto">
      {/* 패널 헤더 */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className={`w-5 h-5 ${userMode === 'planner' ? 'text-blue-500' : 'text-purple-500'}`} />
          <h2 className="text-white font-semibold">
            {userMode === 'planner' ? '기획 인사이트' : '개발 인사이트'}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {userMode === 'planner' 
            ? 'AI가 분석한 비즈니스 가치와 시장 기회' 
            : 'AI가 추천하는 기술 스택과 아키텍처'
          }
        </p>
      </div>
      
      {/* 인사이트 컨텐츠 */}
      <div className="p-4 space-y-6">
        {userMode === 'planner' ? (
          <>
            {/* 비즈니스 가치 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                {plannerInsights.businessValue.icon}
                <h3 className="font-medium">{plannerInsights.businessValue.title}</h3>
              </div>
              
              <div className="space-y-3">
                {plannerInsights.businessValue.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className={`text-sm font-medium ${
                      item.status === 'positive' ? 'text-green-400' :
                      item.status === 'negative' ? 'text-red-400' :
                      'text-slate-300'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 시장 분석 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                {plannerInsights.marketAnalysis.icon}
                <h3 className="font-medium">{plannerInsights.marketAnalysis.title}</h3>
              </div>
              
              <div className="space-y-3">
                {plannerInsights.marketAnalysis.competitors.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{comp.name}</span>
                    <span className="text-sm text-yellow-400">{comp.similarity}</span>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300">{plannerInsights.marketAnalysis.differentiation}</p>
                </div>
              </div>
            </section>
            
            {/* 피벗 제안 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                {plannerInsights.pivotSuggestions.icon}
                <h3 className="font-medium">{plannerInsights.pivotSuggestions.title}</h3>
              </div>
              
              <div className="space-y-2">
                {plannerInsights.pivotSuggestions.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-700/50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* 기술 스택 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                {developerInsights.techStack.icon}
                <h3 className="font-medium">{developerInsights.techStack.title}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">Frontend</div>
                  <div className="flex flex-wrap gap-2">
                    {developerInsights.techStack.frontend.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 mb-2">Backend</div>
                  <div className="flex flex-wrap gap-2">
                    {developerInsights.techStack.backend.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 mb-2">Infrastructure</div>
                  <div className="flex flex-wrap gap-2">
                    {developerInsights.techStack.infrastructure.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* 아키텍처 권장사항 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                {developerInsights.architecture.icon}
                <h3 className="font-medium">{developerInsights.architecture.title}</h3>
              </div>
              
              <div className="space-y-3">
                {developerInsights.architecture.items.map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${
                    item.recommended 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {item.recommended ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-sm font-medium text-white">{item.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 기술 리스크 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                {developerInsights.risks.icon}
                <h3 className="font-medium">{developerInsights.risks.title}</h3>
              </div>
              
              <div className="space-y-3">
                {developerInsights.risks.items.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">{item.risk}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.severity === 'high' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {item.severity === 'high' ? '높음' : '보통'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{item.mitigation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 오픈소스 레퍼런스 */}
            <section className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                {developerInsights.references.icon}
                <h3 className="font-medium">{developerInsights.references.title}</h3>
              </div>
              
              <div className="space-y-2">
                {developerInsights.references.repos.map((repo, i) => (
                  <a
                    key={i}
                    href={repo.url}
                    className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{repo.name}</span>
                      <span className="text-xs text-yellow-400">★ {repo.stars}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
        
        {/* AI 컨설팅 타임스탬프 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-800">
          <Clock className="w-3 h-3" />
          <span>마지막 업데이트: 방금 전</span>
        </div>
      </div>
    </aside>
  );
}
