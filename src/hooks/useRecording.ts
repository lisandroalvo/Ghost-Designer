import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUri: string | null;
}

export function useRecording() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioUri: null,
  });

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setState((prev) => ({ ...prev, isRecording: true, audioUri: null }));

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setState((prev) => ({
            ...prev,
            duration: status.durationMillis / 1000,
          }));
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      setState((prev) => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false,
        audioUri: uri 
      }));

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }, [recording]);

  const pauseRecording = useCallback(async () => {
    if (!recording) return;
    
    try {
      await recording.pauseAsync();
      setState((prev) => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, [recording]);

  const resumeRecording = useCallback(async () => {
    if (!recording) return;
    
    try {
      await recording.startAsync();
      setState((prev) => ({ ...prev, isPaused: false }));
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }, [recording]);

  const cancelRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioUri: null,
      });
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }, [recording]);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  };
}
