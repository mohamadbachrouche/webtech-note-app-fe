import axios from 'axios';
import type { Note } from '@/types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- MODIFIED: Renamed to be specific ---
export const getActiveNotes = () => {
  return apiClient.get<Note[]>('/notes');
}

// --- NEW ---
export const getTrashedNotes = () => {
  return apiClient.get<Note[]>('/notes/trash');
}

export const createNote = (noteData: Partial<Note>) => {
  return apiClient.post<Note>('/notes', noteData);
}

export const updateNote = (id: number, noteData: Partial<Note>) => {
  return apiClient.put<Note>(`/notes/${id}`, noteData);
}

// --- MODIFIED: Points to the new "move to trash" endpoint ---
export const moveToTrash = (id: number) => {
  return apiClient.put<Note>(`/notes/trash/${id}`);
}

// --- NEW ---
export const restoreNote = (id: number) => {
  return apiClient.put<Note>(`/notes/restore/${id}`);
}

// --- NEW ---
export const deleteNotePermanently = (id: number) => {
  return apiClient.delete(`/notes/permanent/${id}`);
}
