// src/types/index.ts
export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  lastModified: Date;
  pinned: boolean;
  inTrash: boolean;
  tags: string; // Comma-separated for now
}
