// Browser-based speech recognition for live transcription

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export interface SpeechRecognitionCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
}

export class LiveSpeechRecognition {
  private recognition: ISpeechRecognition | null = null;
  private fullTranscript: string = '';
  private isActive: boolean = false;

  constructor(private callbacks: SpeechRecognitionCallbacks) {
    console.log('[SpeechRecognition] Initializing...');
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('[SpeechRecognition] Not supported in this browser');
      throw new Error('Speech recognition not supported in this browser');
    }

    console.log('[SpeechRecognition] API found, creating instance');
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    console.log('[SpeechRecognition] Configuration set, setting up handlers');
    this.setupHandlers();
    console.log('[SpeechRecognition] Ready');
  }

  private setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('[SpeechRecognition] Got result, processing...');
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          console.log('[SpeechRecognition] Final text:', transcript);
        } else {
          interimTranscript += transcript;
          console.log('[SpeechRecognition] Interim text:', transcript);
        }
      }

      if (finalTranscript) {
        this.fullTranscript += finalTranscript;
        console.log('[SpeechRecognition] Calling onFinal callback');
        this.callbacks.onFinal(this.fullTranscript.trim());
      }

      if (interimTranscript) {
        const combinedText = (this.fullTranscript + ' ' + interimTranscript).trim();
        console.log('[SpeechRecognition] Calling onInterim callback with:', combinedText);
        this.callbacks.onInterim(combinedText);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error event:', event.error, event);
      
      if (event.error === 'no-speech') {
        console.log('[SpeechRecognition] No speech detected (normal during pauses)');
        return;
      }
      
      if (event.error === 'not-allowed') {
        console.error('[SpeechRecognition] Microphone permission denied!');
      }
      
      this.callbacks.onError(event.error);
    };

    this.recognition.onstart = () => {
      console.log('[SpeechRecognition] Started successfully');
    };

    this.recognition.onend = () => {
      console.log('[SpeechRecognition] Ended, isActive:', this.isActive);
      // Auto-restart if still active
      if (this.isActive) {
        console.log('[SpeechRecognition] Attempting to restart...');
        try {
          this.recognition?.start();
        } catch (err) {
          console.error('[SpeechRecognition] Failed to restart:', err);
        }
      }
    };
  }

  start() {
    console.log('[SpeechRecognition] start() called');
    if (!this.recognition) {
      console.error('[SpeechRecognition] Recognition not initialized');
      throw new Error('Speech recognition not initialized');
    }

    this.fullTranscript = '';
    this.isActive = true;

    try {
      console.log('[SpeechRecognition] Calling recognition.start()...');
      this.recognition.start();
      console.log('[SpeechRecognition] Start call completed');
    } catch (err) {
      console.error('[SpeechRecognition] Start error:', err);
      throw err;
    }
  }

  stop() {
    this.isActive = false;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error('[SpeechRecognition] Stop error:', err);
      }
    }
  }

  abort() {
    this.isActive = false;
    
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        console.error('[SpeechRecognition] Abort error:', err);
      }
    }
  }

  getFullTranscript(): string {
    return this.fullTranscript.trim();
  }

  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}
