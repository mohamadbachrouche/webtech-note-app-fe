import axios from 'axios';
import type { Note } from '@/types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getNotes = () => {
  return apiClient.get<Note[]>('/notes');
}

export const createNote = (noteData: Partial<Note>) => {
  return apiClient.post<Note>('/notes', noteData);
}

export const updateNote = (id: number, noteData: Partial<Note>) => {
  return apiClient.put<Note>(`/notes/${id}`, noteData);
}

export const deleteNote = (id: number) => {
  return apiClient.delete(`/notes/${id}`);
}
