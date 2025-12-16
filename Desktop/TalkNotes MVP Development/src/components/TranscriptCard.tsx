import React from 'react';

interface TranscriptCardProps {
  transcript: string;
  error: string;
}

export function TranscriptCard({ transcript, error }: TranscriptCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-12">
      <div className="bg-[#111418] rounded-[28px] border border-[#87F1C6]/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-[#3F4448]/20">
          <h2 className="text-[#F2F3F2] tracking-[0.06em]">
            Transcript
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-10 mt-8 p-6 bg-red-500/5 border border-red-400/20 rounded-2xl">
            <p className="text-red-300/80 leading-relaxed tracking-wide">
              {error}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-10 py-10 min-h-[400px] max-h-[600px] overflow-y-auto scroll-fade-bottom">
          {transcript ? (
            <div className="animate-fade-in">
              <p className="text-[#F2F3F2] leading-[2] tracking-[0.02em] whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full min-h-[350px]">
              <div className="w-20 h-20 mb-8 rounded-full border border-[#3F4448]/30 flex items-center justify-center">
                <svg
                  className="w-9 h-9 text-[#3F4448]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-[#9BA3A0] tracking-[0.05em]">
                Your words will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
