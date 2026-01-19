import { Mic, MicOff, Users, Settings } from 'lucide-react';

interface MeetingHeaderProps {
  isRecording: boolean;
  onRecordingToggle: () => void;
}

export function MeetingHeader({ isRecording, onRecordingToggle }: MeetingHeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <div>
            <h1 className="text-lg text-white">GMS</h1>
            <p className="text-xs text-slate-400">아이디어 기획 회의</p>
          </div>
        </div>
        
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">3명 참여 중</span>
        </div>
        
        <button
          onClick={onRecordingToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span className="text-sm">녹음 중지</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span className="text-sm">STT 시작</span>
            </>
          )}
        </button>
        
        <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <Settings className="w-5 h-5 text-slate-300" />
        </button>
      </div>
    </header>
  );
}
