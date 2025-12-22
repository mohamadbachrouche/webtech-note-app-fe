// src/types/index.ts
export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  lastModified: string;
  pinned: boolean;
  inTrash: boolean;
  tags: string; // Comma-separated for now
}
