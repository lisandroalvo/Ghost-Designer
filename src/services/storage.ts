import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';

const NOTES_KEY = '@talknotes:notes';

export async function saveNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  const newNote: Note = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    ...note,
  };

  const existingNotes = await getNotes();
  const updatedNotes = [newNote, ...existingNotes];
  
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  return newNote;
}

export async function getNotes(): Promise<Note[]> {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
}

export async function clearAllNotes(): Promise<void> {
  await AsyncStorage.removeItem(NOTES_KEY);
}
