import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Note } from '../types/note';
import { getNotes, deleteNote } from '../services/storage';

interface NotesListScreenProps {
  navigation: any;
}

export default function NotesListScreen({ navigation }: NotesListScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    setIsLoading(true);
    const loadedNotes = await getNotes();
    setNotes(loadedNotes);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            loadNotes();
          },
        },
      ]
    );
  };

  const handleShare = async (note: Note) => {
    try {
      await Share.share({
        message: note.transcript,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.noteDuration}>{formatDuration(item.duration)}</Text>
      </View>
      
      {item.summary && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>💡 Key Takeaways</Text>
          <Text style={styles.summaryText} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
      )}
      
      <Text style={styles.noteText} numberOfLines={item.summary ? 2 : 3}>
        {item.transcript}
      </Text>
      
      <View style={styles.noteActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <Text style={styles.subtitle}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notes yet</Text>
          <Text style={styles.emptySubtext}>
            Start recording to create your first note
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.createButtonText}>Create Note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  listContent: {
    padding: 20,
  },
  noteCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  noteDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  summarySection: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#cbd5e1',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#7f1d1d',
  },
  deleteButtonText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
