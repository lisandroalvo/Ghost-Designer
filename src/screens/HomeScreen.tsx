import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRecording } from '../hooks/useRecording';
import { transcribeAudio } from '../services/supabase';
import { saveNote } from '../services/storage';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { state, startRecording, stopRecording, cancelRecording } = useRecording();
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleStartRecording = async () => {
    try {
      setError('');
      setTranscript('');
      await startRecording();
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      if (!uri) return;

      setIsTranscribing(true);
      setError('');

      const result = await transcribeAudio(uri);
      setTranscript(result.transcript);

      await saveNote({
        transcript: result.transcript,
        duration: state.duration,
        audioSize: result.audioSize,
      });

      Alert.alert(
        'Note Saved',
        'Your note has been saved successfully!',
        [
          { text: 'View Notes', onPress: () => navigation.navigate('Notes') },
          { text: 'OK' },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCancel = async () => {
    await cancelRecording();
    setTranscript('');
    setError('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>TalkNotes</Text>
            <Text style={styles.subtitle}>Record your thoughts</Text>
          </View>
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => navigation.navigate('Notes')}
          >
            <Text style={styles.notesButtonText}>📝 My Notes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recordingContainer}>
        {state.isRecording && (
          <View style={styles.durationContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.duration}>{formatDuration(state.duration)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            state.isRecording && styles.recordButtonActive,
          ]}
          onPress={state.isRecording ? handleStopRecording : handleStartRecording}
          disabled={isTranscribing}
        >
          <View
            style={[
              styles.recordButtonInner,
              state.isRecording && styles.recordButtonInnerActive,
            ]}
          />
        </TouchableOpacity>

        <Text style={styles.recordingHint}>
          {state.isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
        </Text>

        {state.isRecording && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {isTranscribing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Transcribing...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {transcript && !isTranscribing && (
        <ScrollView style={styles.transcriptContainer}>
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>Transcript</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  notesButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  notesButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#334155',
  },
  recordButtonActive: {
    borderColor: '#3b82f6',
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
  },
  recordButtonInnerActive: {
    borderRadius: 12,
    width: 50,
    height: 50,
    backgroundColor: '#ef4444',
  },
  recordingHint: {
    marginTop: 24,
    fontSize: 14,
    color: '#64748b',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
  },
  transcriptContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transcriptCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transcriptText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
});
