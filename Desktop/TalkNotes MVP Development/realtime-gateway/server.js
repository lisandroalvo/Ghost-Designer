import 'dotenv/config';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

if (!OPENAI_API_KEY) {
  console.warn('[Realtime Gateway] WARNING: OPENAI_API_KEY is not set. Streaming will not work until you configure it.');
}

// Basic HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// WebSocket server for streaming audio and transcripts
const wss = new WebSocketServer({ server, path: '/stream' });

wss.on('connection', (clientWs) => {
  console.log('[Realtime Gateway] Client connected');
  
  let openaiWs = null;
  let targetLanguage = null;
  let partialTranscript = '';

  // Connect to OpenAI Realtime API
  const connectToOpenAI = () => {
    if (!OPENAI_API_KEY) {
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        message: 'OpenAI API key not configured' 
      }));
      return;
    }

    openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    openaiWs.on('open', () => {
      console.log('[Realtime Gateway] Connected to OpenAI Realtime');
      
      // Configure session for audio transcription and translation
      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          instructions: targetLanguage 
            ? `You are a real-time translator. Listen to the audio and translate everything to ${targetLanguage}. Output only the translated text, nothing else. Be immediate and concise.`
            : 'Transcribe the audio in the original language.',
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          }
        }
      }));

      clientWs.send(JSON.stringify({ type: 'ready' }));
    });

    openaiWs.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString());
        
        // Log all events from OpenAI to debug
        console.log('[Realtime Gateway] OpenAI event:', event.type);
        
        // Handle different OpenAI Realtime events
        if (event.type === 'conversation.item.input_audio_transcription.delta') {
          // Delta update - only send to client if NO translation is needed
          const delta = event.delta || '';
          if (delta && !targetLanguage) {
            partialTranscript += delta;
            clientWs.send(JSON.stringify({
              type: 'transcript.delta',
              text: delta,
              full: partialTranscript,
              language: 'original'
            }));
          }
        } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
          // Completed segment - translate instantly using Chat API if target language is set
          const transcript = event.transcript || '';
          if (transcript && targetLanguage) {
            console.log('[Realtime Gateway] Translating:', transcript);
            
            // Call OpenAI Chat Completions API for instant translation
            fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `You are a translator. Translate the following text to ${targetLanguage}. Output ONLY the translation, nothing else.`
                  },
                  {
                    role: 'user',
                    content: transcript
                  }
                ],
                temperature: 0.3
              })
            })
            .then(res => res.json())
            .then(data => {
              const translation = data.choices?.[0]?.message?.content || '';
              if (translation) {
                partialTranscript += (partialTranscript ? ' ' : '') + translation;
                console.log('[Realtime Gateway] Translation:', translation);
                
                clientWs.send(JSON.stringify({
                  type: 'transcript.delta',
                  text: translation,
                  full: partialTranscript,
                  language: targetLanguage
                }));
              }
            })
            .catch(err => {
              console.error('[Realtime Gateway] Translation error:', err);
            });
          } else if (transcript) {
            // No translation needed, just accumulate original
            partialTranscript += (partialTranscript ? ' ' : '') + transcript;
            console.log('[Realtime Gateway] Accumulated transcript:', partialTranscript);
            
            clientWs.send(JSON.stringify({
              type: 'transcript.delta',
              text: transcript,
              full: partialTranscript,
              language: 'original'
            }));
          }
        } else if (event.type === 'response.audio_transcript.delta') {
          // Real-time transcript chunk
          const delta = event.delta || '';
          partialTranscript += delta;
          
          clientWs.send(JSON.stringify({
            type: 'transcript.delta',
            text: delta,
            full: partialTranscript,
            language: targetLanguage || 'original'
          }));
        } else if (event.type === 'response.text.delta') {
          // AI's translated text output (real-time translation)
          const delta = event.delta || '';
          if (delta && targetLanguage) {
            partialTranscript += delta;
            console.log('[Realtime Gateway] Translation delta:', delta);
            
            clientWs.send(JSON.stringify({
              type: 'transcript.delta',
              text: delta,
              full: partialTranscript,
              language: targetLanguage
            }));
          }
        } else if (event.type === 'response.text.done') {
          // AI's complete translated response
          const text = event.text || '';
          if (text && targetLanguage) {
            console.log('[Realtime Gateway] Translation completed:', text);
          }
        } else if (event.type === 'error') {
          console.error('[Realtime Gateway] OpenAI error:', event.error);
          clientWs.send(JSON.stringify({
            type: 'error',
            message: event.error.message || 'OpenAI Realtime error'
          }));
        }
      } catch (err) {
        console.error('[Realtime Gateway] Failed to parse OpenAI message:', err);
      }
    });

    openaiWs.on('error', (err) => {
      console.error('[Realtime Gateway] OpenAI WebSocket error:', err);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Connection to OpenAI failed'
      }));
    });

    openaiWs.on('close', () => {
      console.log('[Realtime Gateway] OpenAI connection closed');
    });
  };

  clientWs.on('message', async (data) => {
    try {
      // Try to parse as JSON first (control messages)
      const message = JSON.parse(data.toString());
      
      if (message.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        return;
      }

      if (message.type === 'start') {
        targetLanguage = message.targetLanguage || null;
        console.log('[Realtime Gateway] Starting session, target language:', targetLanguage || 'original');
        partialTranscript = '';
        connectToOpenAI();
        return;
      }

      if (message.type === 'stop') {
        console.log('[Realtime Gateway] Stopping session');
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.close();
        }
        clientWs.send(JSON.stringify({
          type: 'transcript.final',
          text: partialTranscript,
          language: targetLanguage || 'original'
        }));
        return;
      }

      console.log('[Realtime Gateway] Unknown message type:', message.type);
    } catch (err) {
      // Not JSON, assume it's raw audio data (binary)
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN && data instanceof Buffer) {
        // Forward audio to OpenAI
        openaiWs.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: data.toString('base64')
        }));
      }
    }
  });

  clientWs.on('close', () => {
    console.log('[Realtime Gateway] Client disconnected');
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Realtime Gateway] Listening on port ${PORT}`);
});
