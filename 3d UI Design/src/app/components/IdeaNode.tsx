import { Handle, Position } from 'reactflow';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface IdeaNodeProps {
  data: {
    label: string;
    difficulty: 'green' | 'yellow' | 'red';
    description: string;
    timestamp: string;
    onClick?: () => void;
  };
}

export function IdeaNode({ data }: IdeaNodeProps) {
  const getDifficultyConfig = () => {
    switch (data.difficulty) {
      case 'green':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
          label: '구현 가능',
        };
      case 'yellow':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-400',
          label: '검토 필요',
        };
      case 'red':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-400',
          label: '구현 어려움',
        };
    }
  };

  const config = getDifficultyConfig();

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div
        onClick={data.onClick}
        className={`
          min-w-[280px] rounded-xl border-2 ${config.borderColor} ${config.bgColor}
          bg-slate-900 p-4 shadow-2xl backdrop-blur-sm
          transition-all hover:scale-105 hover:shadow-3xl cursor-pointer
        `}
      >
        {/* 난이도 배지 */}
        <div className={`flex items-center gap-2 mb-3 ${config.textColor}`}>
          {config.icon}
          <span className="text-xs font-medium uppercase tracking-wide">{config.label}</span>
          <span className="text-xs text-slate-500 ml-auto">{data.timestamp}</span>
        </div>

        {/* 아이디어 제목 */}
        <h3 className="text-white font-semibold mb-2">{data.label}</h3>

        {/* 설명 */}
        <p className="text-slate-400 text-sm">{data.description}</p>

        {/* 신호등 인디케이터 */}
        <div className="flex gap-1 mt-4">
          <div className={`w-2 h-2 rounded-full ${data.difficulty === 'green' ? 'bg-green-500' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${data.difficulty === 'yellow' ? 'bg-yellow-500' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${data.difficulty === 'red' ? 'bg-red-500' : 'bg-slate-700'}`} />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
