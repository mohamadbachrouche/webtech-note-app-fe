import axios from 'axios';
import type { Note } from '@/types';
import { getToken, logout } from './AuthService';
import router from '@/router';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

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

export const downloadNoteAsPdf = (id: number) => {
  return apiClient.get(`/notes/${id}/download/pdf`, {
    responseType: 'blob'
  });
}
