import React from 'react';

interface ZenControlProps {
  isRecording: boolean;
  isTranscribing: boolean;
  timeElapsed: number;
  onStart: () => void;
  onStop: () => void;
}

export function ZenControl({
  isRecording,
  isTranscribing,
  timeElapsed,
  onStart,
  onStop,
}: ZenControlProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-16 flex flex-col items-center">
      {/* Main Breathing Circle */}
      <div className="relative flex items-center justify-center mb-12">
        {isTranscribing ? (
          // Transcribing State - Rotating Ring
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#87F1C6]/30 animate-rotate-slow"
                 style={{
                   borderTopColor: '#87F1C6',
                   borderRightColor: 'transparent',
                   borderBottomColor: 'transparent',
                   borderLeftColor: 'transparent',
                 }}
            ></div>
          </div>
        ) : isRecording ? (
          // Recording State - Pulsing Ring
          <button
            onClick={onStop}
            className="relative w-64 h-64 rounded-full border-2 border-[#87F1C6] bg-[#87F1C6]/5 hover:bg-[#87F1C6]/10 transition-all duration-500 group"
          >
            {/* Inner pulsing glow */}
            <div className="absolute inset-8 rounded-full bg-[#87F1C6]/20 animate-pulse-gentle"></div>
            
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(135,241,198,0.15)]"></div>
          </button>
        ) : (
          // Idle State - Breathing Ring
          <button
            onClick={onStart}
            className="relative w-64 h-64 rounded-full border-2 border-[#87F1C6]/40 hover:border-[#87F1C6]/60 bg-transparent hover:bg-[#87F1C6]/5 transition-all duration-700 animate-breathe group"
          >
            {/* Subtle outer glow on hover */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_60px_rgba(135,241,198,0.1)]"></div>
          </button>
        )}
      </div>

      {/* State Text */}
      <div className="text-center space-y-3">
        {isTranscribing ? (
          <p className="text-[#9BA3A0] tracking-[0.06em]">
            Transcribing…
          </p>
        ) : isRecording ? (
          <>
            <p className="text-[#F2F3F2] tracking-[0.08em] flex items-center justify-center gap-1">
              Listening
              <span className="inline-flex gap-0.5">
                <span className="inline-block w-1 h-1 bg-[#87F1C6] rounded-full" style={{ animation: 'dot-pulse 1.4s infinite' }}></span>
                <span className="inline-block w-1 h-1 bg-[#87F1C6] rounded-full" style={{ animation: 'dot-pulse 1.4s infinite 0.2s' }}></span>
                <span className="inline-block w-1 h-1 bg-[#87F1C6] rounded-full" style={{ animation: 'dot-pulse 1.4s infinite 0.4s' }}></span>
              </span>
            </p>
            <p className="text-[#9BA3A0] text-sm tabular-nums tracking-[0.1em]">
              {formatTime(timeElapsed)}
            </p>
          </>
        ) : (
          <p className="text-[#9BA3A0] tracking-[0.08em]">
            Begin Speaking
          </p>
        )}
      </div>
    </div>
  );
}
