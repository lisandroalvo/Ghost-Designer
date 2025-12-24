import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { ZenControl } from './components/ZenControl';
import { TranscriptCard } from './components/TranscriptCard';
import DocumentExport from './components/DocumentExport';
import { IntentSelector } from './components/IntentSelector';
import { LanguageAccordion } from './components/LanguageAccordion';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { translationService } from './utils/translationService';

type SessionState = 'idle' | 'recording' | 'processing' | 'results';
type Tab = 'record' | 'transcript' | 'analysis' | 'export';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('talknotes-theme');
    return saved ? saved === 'dark' : true;
  });
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [conversationIntent, setConversationIntent] = useState<'meeting' | 'interview' | 'sales' | 'therapy' | 'lecture' | 'casual'>('casual');
  const [activeTab, setActiveTab] = useState<Tab>('record');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranslatedTranscript, setLiveTranslatedTranscript] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [useRealtime, setUseRealtime] = useState(
    // Only enable realtime on localhost
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  );
  const realtimeTranscriptRef = useRef<string>('');
  const translatedTranscriptRef = useRef<string>('');

  useEffect(() => {
    localStorage.setItem('talknotes-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const resetSession = () => {
    setSessionState('idle');
    setTranscript('');
    setSummary('');
    setError('');
    setTimeElapsed(0);
    setShowExport(false);
    setLiveTranscript('');
    setLiveTranslatedTranscript('');
    setOriginalTranscript('');
    realtimeTranscriptRef.current = '';
    translatedTranscriptRef.current = '';
    audioChunksRef.current = [];
    translationService.reset();
    setActiveTab('record');
  };

  const startRecording = async () => {
    try {
      setSessionState('recording');
      setError('');
      setTranscript('');
      setSummary('');
      setLiveTranscript('');
      setLiveTranslatedTranscript('');
      translationService.reset();
      
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires a secure connection (HTTPS)');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        } 
      });

      let mimeType = 'audio/webm;codecs=opus';
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        
        console.log(`Recording stopped. Total size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // If we have a realtime transcript, use it and generate summary
        if (realtimeTranscriptRef.current && realtimeTranscriptRef.current.length > 0) {
          console.log('[Realtime] Using realtime transcript for summary');
          await generateSummary(realtimeTranscriptRef.current);
          realtimeTranscriptRef.current = '';
        } else {
          // Fallback to standard transcription
          console.log('[Fallback] Using standard transcription');
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setTimeElapsed(0);

      timerIntervalRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      // Start realtime streaming if enabled
      if (useRealtime) {
        try {
          await startRealtimeStreaming(stream);
        } catch (realtimeErr) {
          console.warn('Realtime streaming failed, falling back to standard mode:', realtimeErr);
          setUseRealtime(false);
        }
      }

    } catch (err) {
      console.error('Error starting recording:', err);
      
      let errorMessage = '';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Microphone access was denied. Please allow microphone permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone detected. Please connect a microphone.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Your microphone is currently in use. Please close other applications and try again.';
        } else if (err.name === 'OverconstrainedError') {
          setTimeout(() => retryWithSimpleConstraints(), 1000);
          return;
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const retryWithSimpleConstraints = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        
        console.log(`Recording stopped. Total size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // If we have a realtime transcript, use it and generate summary
        if (realtimeTranscriptRef.current && realtimeTranscriptRef.current.length > 0) {
          console.log('[Realtime] Using realtime transcript for summary');
          await generateSummary(realtimeTranscriptRef.current);
          realtimeTranscriptRef.current = '';
        } else {
          // Fallback to standard transcription
          console.log('[Fallback] Using standard transcription');
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setTimeElapsed(0);

      timerIntervalRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Retry error:', err);
      setError(`Unable to access microphone: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const startRealtimeStreaming = async (stream: MediaStream) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket('ws://localhost:8787/stream');
        websocketRef.current = ws;

        ws.onopen = () => {
          console.log('[Realtime] Connected to gateway');
          ws.send(JSON.stringify({
            type: 'start',
            targetLanguage: targetLanguage.trim() || undefined
          }));
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'ready') {
              console.log('[Realtime] Session ready, streaming audio...');
              startAudioStreaming(stream, ws);
              resolve();
            } else if (message.type === 'transcript.partial') {
              // Partial updates replace the entire transcript
              const currentText = message.text || '';
              setLiveTranscript(currentText);
              realtimeTranscriptRef.current = currentText;
              
              // Trigger live translation for partial (interim) results
              if (targetLanguage && targetLanguage.toLowerCase() !== 'original') {
                const translated = await translationService.translateDelta(
                  currentText,
                  targetLanguage,
                  false
                );
                setLiveTranslatedTranscript(translated);
                translatedTranscriptRef.current = translated;
              } else {
                setLiveTranslatedTranscript(currentText);
              }
            } else if (message.type === 'transcript.delta') {
              // Delta updates append to the existing transcript
              const delta = message.text || '';
              const fullText = message.full || (realtimeTranscriptRef.current + delta);
              setLiveTranscript(fullText);
              realtimeTranscriptRef.current = fullText;
              
              // Trigger live translation for delta
              if (targetLanguage && targetLanguage.toLowerCase() !== 'original') {
                const translated = await translationService.translateDelta(
                  fullText,
                  targetLanguage,
                  false
                );
                setLiveTranslatedTranscript(translated);
                translatedTranscriptRef.current = translated;
              } else {
                setLiveTranslatedTranscript(fullText);
              }
            } else if (message.type === 'transcript.final') {
              const finalText = message.text || realtimeTranscriptRef.current;
              realtimeTranscriptRef.current = finalText;
              setOriginalTranscript(finalText);
              
              // Final translation
              if (targetLanguage && targetLanguage.toLowerCase() !== 'original') {
                const translated = await translationService.translateDelta(
                  finalText,
                  targetLanguage,
                  true
                );
                setTranscript(translated);
                setLiveTranslatedTranscript('');
              } else {
                setTranscript(finalText);
                setLiveTranslatedTranscript('');
              }
              setLiveTranscript('');
            } else if (message.type === 'error') {
              console.error('[Realtime] Error:', message.message);
              reject(new Error(message.message));
            }
          } catch (err) {
            console.error('[Realtime] Failed to parse message:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('[Realtime] WebSocket error:', err);
          reject(err);
        };

        ws.onclose = () => {
          console.log('[Realtime] WebSocket closed');
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
        };

        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      } catch (err) {
        reject(err);
      }
    });
  };

  const startAudioStreaming = (stream: MediaStream, ws: WebSocket) => {
    const audioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        ws.send(pcm16.buffer);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setSessionState('processing');
      const finalRealtimeTranscript = realtimeTranscriptRef.current;
      if (finalRealtimeTranscript && finalRealtimeTranscript.length > 0) {
        setTranscript(finalRealtimeTranscript);
        setLiveTranscript('');
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: 'stop' }));
        websocketRef.current.close();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('Sending audio to transcription endpoint...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b1d03c55/transcribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transcription received:', data);

      if (data.transcript) {
        // Store original transcript first; generateSummary will handle translation
        setTranscript(data.transcript);
        await generateSummary(data.transcript);
      } else {
        throw new Error('No transcript in response');
      }

    } catch (err) {
      console.error('Transcription error:', err);
      setError(`Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateSummary = async (transcriptText: string) => {
    setIsSummarizing(true);
    
    try {
      console.log('Generating summary...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b1d03c55/summarize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            transcript: transcriptText,
            targetLanguage: targetLanguage.trim() || undefined,
            conversationIntent,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Summary received:', data);

      // If backend returned a translated transcript, show that; otherwise keep original
      if (data.translatedTranscript && typeof data.translatedTranscript === 'string') {
        setTranscript(data.translatedTranscript);
      }

      if (data.summary) {
        setSummary(data.summary);
        setSessionState('results');
      } else {
        throw new Error('No summary in response');
      }

    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'record':
        return (
          <div className="tab-panel">
            {sessionState === 'idle' && (
              <div className="section">
                <IntentSelector
                  value={conversationIntent}
                  onChange={setConversationIntent}
                  disabled={false}
                />
              </div>
            )}
            
            <div className="section">
              <div className="w-full max-w-3xl mx-auto px-8 mt-4 mb-2">
                <label className="language-select-label">
                  Output language
                </label>
                <LanguageAccordion
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                  disabled={isRecording || isTranscribing}
                />
              </div>
            </div>

            <div className="section">
              <ZenControl
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                timeElapsed={timeElapsed}
                onStart={startRecording}
                onStop={stopRecording}
              />
            </div>

            {isRecording && (liveTranscript || liveTranslatedTranscript) && (
              <div className="section">
                <div className="w-full max-w-3xl mx-auto px-8">
                  <div className="bg-[#111418] rounded-2xl border border-[#87F1C6]/20 p-6 max-h-[300px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#87F1C6] animate-pulse"></div>
                        <h3 className="text-[#87F1C6] text-sm tracking-[0.1em] uppercase font-medium">
                          Live Transcript
                          {targetLanguage && targetLanguage.toLowerCase() !== 'original' && ` (${targetLanguage})`}
                        </h3>
                      </div>
                      {targetLanguage && targetLanguage.toLowerCase() !== 'original' && (
                        <div className="px-2 py-1 rounded-md bg-[#87F1C6]/10 border border-[#87F1C6]/30">
                          <span className="text-[#87F1C6] text-xs font-medium">
                            {targetLanguage}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[#F2F3F2] leading-[1.8] tracking-[0.02em] whitespace-pre-wrap">
                      {targetLanguage && targetLanguage.toLowerCase() !== 'original' 
                        ? liveTranslatedTranscript 
                        : liveTranscript}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {sessionState === 'results' && (
              <div className="section">
                <div className="w-full max-w-3xl mx-auto px-8 mt-6 flex justify-center">
                  <button
                    onClick={resetSession}
                    className="new-recording-button"
                    type="button"
                  >
                    <svg
                      className="new-recording-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>New Recording</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'transcript':
        return (
          <div className="tab-panel">
            <TranscriptCard
              transcript={transcript}
              summary={summary}
              isSummarizing={isSummarizing}
              error={error}
            />
          </div>
        );

      case 'analysis':
        return (
          <div className="tab-panel">
            {transcript && summary && !isRecording && !isSummarizing && (
              <div className="w-full max-w-4xl mx-auto px-8 py-6">
                <DocumentExport
                  transcript={transcript}
                  summary={summary}
                  language={targetLanguage || 'Original'}
                  mode={conversationIntent}
                  onClose={() => {}}
                />
              </div>
            )}
            {(!transcript || !summary) && (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <h3>No Analysis Yet</h3>
                <p>Complete a recording to see your analysis here</p>
              </div>
            )}
          </div>
        );

      case 'export':
        return (
          <div className="tab-panel">
            {transcript && summary && (
              <div className="w-full max-w-4xl mx-auto px-8 py-6">
                <div className="export-panel">
                  <h2 className="export-title">Export Document</h2>
                  <p className="export-description">
                    Download your transcript and analysis as a professional document
                  </p>
                  
                  <DocumentExport
                    transcript={transcript}
                    summary={summary}
                    language={targetLanguage || 'Original'}
                    mode={conversationIntent}
                    onClose={() => {}}
                  />
                </div>
              </div>
            )}
            {(!transcript || !summary) && (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <h3>No Content to Export</h3>
                <p>Complete a recording to export your document</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      sessionState={sessionState}
    >
      {renderTabContent()}

      <style jsx>{`
        .tab-panel {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .section {
          margin-bottom: 24px;
        }

        .language-select-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .new-recording-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid rgba(52, 201, 143, 0.3);
          border-radius: 12px;
          color: rgba(52, 201, 143, 0.9);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          letter-spacing: -0.01em;
        }

        .new-recording-button:hover {
          background: rgba(52, 201, 143, 0.08);
          border-color: rgba(52, 201, 143, 0.5);
          color: rgba(52, 201, 143, 1);
          transform: translateY(-1px);
        }

        .new-recording-button:active {
          transform: translateY(0);
        }

        .new-recording-icon {
          flex-shrink: 0;
          transition: transform 200ms ease;
        }

        .new-recording-button:hover .new-recording-icon {
          transform: rotate(-15deg);
        }

        .export-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 32px;
        }

        .export-title {
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
        }

        .export-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-state svg {
          margin-bottom: 24px;
          opacity: 0.4;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (prefers-color-scheme: light) {
          .language-select-label {
            color: rgba(0, 0, 0, 0.6);
          }

          .new-recording-button {
            border-color: rgba(30, 142, 94, 0.3);
            color: rgba(30, 142, 94, 0.9);
          }

          .new-recording-button:hover {
            background: rgba(30, 142, 94, 0.08);
            border-color: rgba(30, 142, 94, 0.5);
            color: rgba(30, 142, 94, 1);
          }

          .export-panel {
            background: rgba(0, 0, 0, 0.02);
            border-color: rgba(0, 0, 0, 0.08);
          }

          .export-title {
            color: rgba(0, 0, 0, 0.9);
          }

          .export-description {
            color: rgba(0, 0, 0, 0.6);
          }

          .empty-state {
            color: rgba(0, 0, 0, 0.5);
          }

          .empty-state h3 {
            color: rgba(0, 0, 0, 0.7);
          }

          .empty-state p {
            color: rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </AppShell>
  );
}
