import { useState } from 'react';
import { MeetingCanvas } from './components/MeetingCanvas';
import { MeetingSidebar } from './components/MeetingSidebar';
import { MeetingHeader } from './components/MeetingHeader';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950">
      <MeetingHeader
        isRecording={isRecording}
        onRecordingToggle={() => setIsRecording(!isRecording)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <MeetingCanvas isRecording={isRecording} />
        </div>

        {showTimeline && (
          <MeetingSidebar
            onToggleTimeline={() => setShowTimeline(!showTimeline)}
          />
        )}

        {!showTimeline && (
          <button
            onClick={() => setShowTimeline(true)}
            className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            타임라인 보기
          </button>
        )}
      </div>
    </div>
  );
}
