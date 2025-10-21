<!-- src/components/NoteEditor.vue -->
<script setup lang="ts">
import type { Note } from '@/types';

defineProps<{
  selectedNote: Note | null
}>();
</script>

<template>
  <div class="note-content-area">
    <!-- Show the editor if a note is selected -->
    <div v-if="selectedNote" class="note-editor">
      <div class="editor-header">
        <input type="text" :value="selectedNote.title" class="note-title-input" placeholder="Note title">
      </div>
      <div class="formatting-tools">
        <!-- Placeholder for formatting buttons -->
        <button title="Bold"><i class="fas fa-bold"></i></button>
        <button title="Italic"><i class="fas fa-italic"></i></button>
      </div>
      <div class="note-text-input" contenteditable="true" v-html="selectedNote.content"></div>
    </div>

    <!-- Otherwise, show the empty state message -->
    <div v-else class="empty-state-message" id="empty-state">
      <div class="empty-icon">
        <i class="far fa-sticky-note"></i>
      </div>
      <h2>No Note Selected</h2>
      <p>Select a note from the sidebar or create a new note to get started.</p>
    </div>
  </div>
</template>
