import { X, Code, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface TechStack {
  frontend: string[];
  backend: string[];
  infrastructure: string[];
}

interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  difficulty: 'green' | 'yellow' | 'red';
  feasible: boolean;
  techStack: TechStack;
  estimatedTime: string;
  requiredSkills: string[];
  risks: string[];
  benefits: string[];
}

interface IdeaDetailModalProps {
  idea: IdeaDetail | null;
  onClose: () => void;
}

export function IdeaDetailModal({ idea, onClose }: IdeaDetailModalProps) {
  if (!idea) return null;

  const getDifficultyInfo = () => {
    switch (idea.difficulty) {
      case 'green':
        return {
          label: '구현 가능',
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          icon: <CheckCircle className="w-5 h-5" />,
        };
      case 'yellow':
        return {
          label: '검토 필요',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'red':
        return {
          label: '구현 어려움',
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
    }
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{idea.title}</h2>
            <p className="text-slate-400 text-sm">{idea.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 실현 가능성 */}
          <section className={`p-4 rounded-lg border ${difficultyInfo.border} ${difficultyInfo.bg}`}>
            <div className={`flex items-center gap-2 mb-2 ${difficultyInfo.color}`}>
              {difficultyInfo.icon}
              <h3 className="font-semibold">실현 가능성 평가</h3>
            </div>
            <p className="text-sm text-slate-300">
              {idea.feasible
                ? '이 아이디어는 현재 기술 스택으로 구현 가능합니다.'
                : '이 아이디어는 추가적인 리소스 또는 기술 검토가 필요합니다.'}
            </p>
          </section>

          {/* 예상 개발 기간 */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">예상 개발 기간</h3>
            </div>
            <p className="text-slate-300 text-sm">{idea.estimatedTime}</p>
          </section>

          {/* 필요 기술 스택 */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Code className="w-5 h-5" />
              <h3 className="font-semibold">필요 기술 스택</h3>
            </div>

            <div className="space-y-4">
              {/* Frontend */}
              <div>
                <div className="text-xs text-slate-500 mb-2">Frontend</div>
                <div className="flex flex-wrap gap-2">
                  {idea.techStack.frontend.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div>
                <div className="text-xs text-slate-500 mb-2">Backend</div>
                <div className="flex flex-wrap gap-2">
                  {idea.techStack.backend.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded border border-green-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Infrastructure */}
              <div>
                <div className="text-xs text-slate-500 mb-2">Infrastructure</div>
                <div className="flex flex-wrap gap-2">
                  {idea.techStack.infrastructure.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded border border-purple-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 필요 역량 */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold">필요 역량</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {idea.requiredSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded border border-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* 리스크 */}
          {idea.risks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">리스크</h3>
              </div>
              <ul className="space-y-2">
                {idea.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 기대 효과 */}
          {idea.benefits.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="font-semibold">기대 효과</h3>
              </div>
              <ul className="space-y-2">
                {idea.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
