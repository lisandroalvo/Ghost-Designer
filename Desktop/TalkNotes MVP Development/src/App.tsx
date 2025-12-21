import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ZenControl } from './components/ZenControl';
import { TranscriptCard } from './components/TranscriptCard';
import DocumentExport from './components/DocumentExport';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('talknotes-theme');
    return saved ? saved === 'dark' : true;
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [showExport, setShowExport] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [useRealtime, setUseRealtime] = useState(true);
  const realtimeTranscriptRef = useRef<string>('');

  useEffect(() => {
    localStorage.setItem('talknotes-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startRecording = async () => {
    try {
      setError('');
      setTranscript('');
      setSummary('');
      setLiveTranscript('');
      
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

        ws.onmessage = (event) => {
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
            } else if (message.type === 'transcript.delta') {
              // Delta updates append to the existing transcript
              const delta = message.text || '';
              const fullText = message.full || (realtimeTranscriptRef.current + delta);
              setLiveTranscript(fullText);
              realtimeTranscriptRef.current = fullText;
            } else if (message.type === 'transcript.final') {
              const finalText = message.text || realtimeTranscriptRef.current;
              realtimeTranscriptRef.current = finalText;
              setTranscript(finalText);
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
    if (mediaRecorderRef.current && isRecording) {
      // Transfer live transcript to final before stopping
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
      } else {
        throw new Error('No summary in response');
      }

    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0B0D10]' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Theme Toggle Switch - Large and Visible */}
      <div className="fixed top-24 right-8 z-[9999]">
        <button
          onClick={toggleTheme}
          className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-[#111418] to-[#1a1d23] border-2 border-[#87F1C6] hover:border-[#6EE7B7]' 
              : 'bg-gradient-to-r from-white to-gray-50 border-2 border-gray-400 hover:border-gray-600 shadow-2xl'
          }`}
        >
          {isDarkMode ? (
            <>
              <svg className="w-6 h-6 text-[#87F1C6]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-[#F2F3F2] font-semibold text-sm">Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-gray-800 font-semibold text-sm">Dark Mode</span>
            </>
          )}
        </button>
      </div>
      
      <main className="pb-20">
        <ZenControl
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          timeElapsed={timeElapsed}
          onStart={startRecording}
          onStop={stopRecording}
        />
        <div className="w-full max-w-3xl mx-auto px-8 mt-4 mb-2">
          <label className="block text-sm text-[#9BA3A0] mb-2 tracking-[0.08em] uppercase">
            Reading language
          </label>

          {(() => {
            const preset = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Russian', 'Hindi', 'Bengali', 'Thai', 'Vietnamese', 'Turkish', 'Polish', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Hebrew', 'Indonesian', 'Malay', 'Filipino', 'Czech', 'Romanian', 'Hungarian', 'Ukrainian', 'Catalan', 'Croatian', 'Serbian', 'Bulgarian', 'Slovak', 'Slovenian', 'Lithuanian', 'Latvian', 'Estonian', 'Icelandic', 'Irish', 'Welsh', 'Basque', 'Galician', 'Albanian', 'Macedonian', 'Bosnian', 'Azerbaijani', 'Georgian', 'Armenian', 'Kazakh', 'Uzbek', 'Mongolian', 'Nepali', 'Sinhala', 'Burmese', 'Khmer', 'Lao', 'Urdu', 'Persian', 'Pashto', 'Kurdish', 'Amharic', 'Swahili', 'Yoruba', 'Igbo', 'Zulu', 'Afrikaans', 'Somali', 'Hausa', 'Oromo', 'Malagasy'];
            const trimmed = targetLanguage.trim();
            const selectValue =
              trimmed === ''
                ? 'original'
                : preset.some((l) => l.toLowerCase() === trimmed.toLowerCase())
                ? trimmed
                : 'custom';

            return (
              <>
                <div className="relative mb-2 inline-block min-w-[220px]">
                  <select
                    className="appearance-none w-full bg-[#111418] border border-[#3F4448]/70 rounded-lg px-3 py-2 text-xs text-[#F2F3F2] pr-8 focus:outline-none focus:ring-2 focus:ring-[#87F1C6]/60 focus:border-transparent"
                    value={selectValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'original') {
                        setTargetLanguage('');
                      } else if (value === 'custom') {
                        // keep current custom value, or empty for user to type
                        if (trimmed === '' || preset.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
                          setTargetLanguage('');
                        }
                      } else {
                        setTargetLanguage(value);
                      }
                    }}
                  >
                    <option value="original">Original language</option>
                    <optgroup label="Popular">
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Chinese">Chinese (Mandarin)</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Russian">Russian</option>
                      <option value="Hindi">Hindi</option>
                    </optgroup>
                    <optgroup label="Asian">
                      <option value="Bengali">Bengali</option>
                      <option value="Thai">Thai</option>
                      <option value="Vietnamese">Vietnamese</option>
                      <option value="Indonesian">Indonesian</option>
                      <option value="Malay">Malay</option>
                      <option value="Filipino">Filipino (Tagalog)</option>
                      <option value="Burmese">Burmese</option>
                      <option value="Khmer">Khmer (Cambodian)</option>
                      <option value="Lao">Lao</option>
                      <option value="Nepali">Nepali</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Persian">Persian (Farsi)</option>
                      <option value="Mongolian">Mongolian</option>
                    </optgroup>
                    <optgroup label="European">
                      <option value="Turkish">Turkish</option>
                      <option value="Polish">Polish</option>
                      <option value="Dutch">Dutch</option>
                      <option value="Swedish">Swedish</option>
                      <option value="Norwegian">Norwegian</option>
                      <option value="Danish">Danish</option>
                      <option value="Finnish">Finnish</option>
                      <option value="Greek">Greek</option>
                      <option value="Czech">Czech</option>
                      <option value="Romanian">Romanian</option>
                      <option value="Hungarian">Hungarian</option>
                      <option value="Ukrainian">Ukrainian</option>
                      <option value="Catalan">Catalan</option>
                      <option value="Croatian">Croatian</option>
                      <option value="Serbian">Serbian</option>
                      <option value="Bulgarian">Bulgarian</option>
                      <option value="Slovak">Slovak</option>
                      <option value="Slovenian">Slovenian</option>
                      <option value="Lithuanian">Lithuanian</option>
                      <option value="Latvian">Latvian</option>
                      <option value="Estonian">Estonian</option>
                      <option value="Icelandic">Icelandic</option>
                      <option value="Irish">Irish</option>
                      <option value="Welsh">Welsh</option>
                      <option value="Basque">Basque</option>
                      <option value="Galician">Galician</option>
                      <option value="Albanian">Albanian</option>
                      <option value="Macedonian">Macedonian</option>
                      <option value="Bosnian">Bosnian</option>
                    </optgroup>
                    <optgroup label="Middle Eastern & Caucasus">
                      <option value="Hebrew">Hebrew</option>
                      <option value="Pashto">Pashto</option>
                      <option value="Kurdish">Kurdish</option>
                      <option value="Azerbaijani">Azerbaijani</option>
                      <option value="Georgian">Georgian</option>
                      <option value="Armenian">Armenian</option>
                      <option value="Kazakh">Kazakh</option>
                      <option value="Uzbek">Uzbek</option>
                    </optgroup>
                    <optgroup label="African">
                      <option value="Amharic">Amharic</option>
                      <option value="Swahili">Swahili</option>
                      <option value="Yoruba">Yoruba</option>
                      <option value="Igbo">Igbo</option>
                      <option value="Zulu">Zulu</option>
                      <option value="Afrikaans">Afrikaans</option>
                      <option value="Somali">Somali</option>
                      <option value="Hausa">Hausa</option>
                      <option value="Oromo">Oromo</option>
                      <option value="Malagasy">Malagasy</option>
                    </optgroup>
                    <option value="custom">Custom…</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#3F4448]">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 8L10 13L15 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {selectValue === 'custom' && (
                  <input
                    type="text"
                    className="mt-1 w-full bg-[#111418] border border-[#3F4448]/50 rounded-lg px-3 py-2 text-xs text-[#F2F3F2] placeholder:text-[#3F4448] focus:outline-none focus:ring-2 focus:ring-[#87F1C6]/60 focus:border-transparent"
                    placeholder="Type any language (e.g. Japanese, German, Thai)"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  />
                )}
              </>
            );
          })()}
        </div>
        
        {/* Live transcript while recording */}
        {isRecording && liveTranscript && (
          <div className="w-full max-w-3xl mx-auto px-8 mt-6">
            <div className="bg-[#111418] rounded-2xl border border-[#87F1C6]/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#87F1C6] animate-pulse"></div>
                <h3 className="text-[#87F1C6] text-sm tracking-[0.1em] uppercase font-medium">
                  Live Transcript
                </h3>
              </div>
              <p className="text-[#F2F3F2] leading-[1.8] tracking-[0.02em]">
                {liveTranscript}
              </p>
            </div>
          </div>
        )}
        
        <TranscriptCard
          transcript={transcript}
          summary={summary}
          isSummarizing={isSummarizing}
          error={error}
        />

        {/* View Document Button - Show when both transcript and summary are ready */}
        {transcript && summary && !isRecording && !isSummarizing && (
          <div className="w-full max-w-3xl mx-auto px-8 mt-6 mb-12 flex justify-center">
            <button
              onClick={() => setShowExport(true)}
              className="group relative px-6 py-3.5 bg-[#111418] border border-[#3F4448] rounded-lg hover:border-[#87F1C6] transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#87F1C6]/0 via-[#87F1C6]/10 to-[#87F1C6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 text-[#9BA3A0] group-hover:text-[#87F1C6] transition-colors duration-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-[#F2F3F2] relative z-10">View Document & Analysis</span>
            </button>
          </div>
        )}

        {/* Export Modal */}
        {showExport && (
          <DocumentExport
            transcript={transcript}
            summary={summary}
            language={targetLanguage || 'Original'}
            onClose={() => setShowExport(false)}
          />
        )}
      </main>
    </div>
  );
}
