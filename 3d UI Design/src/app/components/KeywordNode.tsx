import { Handle, Position } from 'reactflow';
import { Code, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface KeywordNodeProps {
  data: {
    label: string;
    type: 'frontend' | 'backend' | 'infrastructure' | 'skill' | 'risk' | 'benefit' | 'time' | 'mvp' | 'feature';
    description?: string;
    status?: 'possible' | 'difficult' | 'impossible';
    recommendation?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

export function KeywordNode({ data }: KeywordNodeProps) {
  const getTypeConfig = () => {
    switch (data.type) {
      case 'frontend':
        return {
          icon: <Code className="w-4 h-4" />,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-400',
          label: 'Frontend',
        };
      case 'backend':
        return {
          icon: <Code className="w-4 h-4" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
          label: 'Backend',
        };
      case 'infrastructure':
        return {
          icon: <Code className="w-4 h-4" />,
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-400',
          label: 'Infrastructure',
        };
      case 'skill':
        return {
          icon: <Users className="w-4 h-4" />,
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500',
          textColor: 'text-cyan-400',
          label: 'Skill',
        };
      case 'risk':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-400',
          label: 'Risk',
        };
      case 'benefit':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
          label: 'Benefit',
        };
      case 'time':
        return {
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-400',
          label: 'Timeline',
        };
      case 'mvp':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-400',
          label: 'MVP',
        };
      case 'feature':
        return {
          icon: <Code className="w-4 h-4" />,
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-500',
          textColor: 'text-indigo-400',
          label: 'Feature',
        };
    }
  };

  const getPriorityBadge = () => {
    if (!data.priority) return null;

    const priorityConfig = {
      high: { color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/30', label: '높음' },
      medium: { color: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: '중간' },
      low: { color: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: '낮음' },
    };

    const config = priorityConfig[data.priority];
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 ${config.bg} border ${config.border} rounded text-xs ${config.color}`}>
        우선순위: {config.label}
      </div>
    );
  };

  const getStatusBadge = () => {
    if (!data.status) return null;

    switch (data.status) {
      case 'possible':
        return (
          <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-300">가능</span>
          </div>
        );
      case 'difficult':
        return (
          <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-300">어려움</span>
          </div>
        );
      case 'impossible':
        return (
          <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-300">불가</span>
          </div>
        );
    }
  };

  const config = getTypeConfig();

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div
        className={`
          min-w-[180px] max-w-[240px] rounded-lg border ${config.borderColor} ${config.bgColor}
          bg-slate-900 p-3 shadow-xl backdrop-blur-sm
          transition-all hover:scale-105
        `}
      >
        {/* 타입 배지 */}
        <div className={`flex items-center gap-2 mb-2 ${config.textColor}`}>
          {config.icon}
          <span className="text-xs font-medium uppercase tracking-wide">{config.label}</span>
          {getPriorityBadge()}
        </div>

        {/* 키워드 */}
        <h4 className="text-white text-sm font-semibold mb-1">{data.label}</h4>

        {/* 설명 */}
        {data.description && (
          <p className="text-slate-400 text-xs mb-2">{data.description}</p>
        )}

        {/* 상태 배지 */}
        {getStatusBadge()}

        {/* 권장사항 */}
        {data.recommendation && (
          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
            <p className="text-xs text-blue-300">{data.recommendation}</p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}
