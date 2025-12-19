export const SUPABASE_CONFIG = {
  projectId: 'hekavtsofsenadenwfrs',
  transcriptionUrl: 'https://hekavtsofsenadenwfrs.supabase.co/functions/v1/make-server-b1d03c55/transcribe',
  publicAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhla2F2dHNvZnNlbmFkZW53ZnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDYyNTAsImV4cCI6MjA4MTAyMjI1MH0.2jg9HP6SyaCJdhL7Cc6b4wg4f8kdhcCo5YtS_lJfiIc',
};

export interface TranscriptionResponse {
  transcript: string;
  audioSize: number;
  audioType: string;
}

export interface TranscriptionError {
  error: string;
}

export async function transcribeAudio(
  audioUri: string
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);

  const response = await fetch(SUPABASE_CONFIG.transcriptionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_CONFIG.publicAnonKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error: TranscriptionError = await response.json();
    throw new Error(error.error || 'Transcription failed');
  }

  return response.json();
}
