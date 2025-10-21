<script setup lang="ts">
import { ref, computed } from 'vue'
// Remove NoteItem import (will be used in Sidebar)
// import { RouterView } from 'vue-router' // Keep commented/removed for now

// Import the new components
import TopBar from './components/TopBar.vue'
import Sidebar from './components/Sidebar.vue'
import NoteEditor from './components/NoteEditor.vue'
// Import the Note type definition from the types folder
import type { Note } from './types'

// Rename 'notes' to 'allNotes' and use the full Note structure
// Also update the hardcoded data to match the full structure
const allNotes = ref<Note[]>([
  { id: 1, title: 'My First Note', content: 'This is the content...', createdAt: new Date('2025-10-20T10:00:00Z'), lastModified: new Date('2025-10-20T11:30:00Z'), pinned: true, inTrash: false, tags: 'welcome' },
  { id: 2, title: 'Shopping List', content: 'Milk, Bread, Eggs', createdAt: new Date('2025-10-19T15:00:00Z'), lastModified: new Date('2025-10-19T15:00:00Z'), pinned: false, inTrash: false, tags: 'tasks' },
  { id: 3, title: 'Webtech M2 - v-for Loop', content: 'Completed...', createdAt: new Date('2025-10-18T09:00:00Z'), lastModified: new Date('2025-10-20T12:00:00Z'), pinned: false, inTrash: false, tags: 'htw,project' }
])
// Add state to track which note is currently selected
const selectedNoteId = ref<number | null>(null);

// Add computed properties to automatically filter notes
const pinnedNotes = computed(() => allNotes.value.filter(n => n.pinned && !n.inTrash));
const regularNotes = computed(() => allNotes.value.filter(n => !n.pinned && !n.inTrash));
const selectedNote = computed(() => allNotes.value.find(n => n.id === selectedNoteId.value) || null);

// Add function to handle note selection event from Sidebar
function handleSelectNote(id: number) {
  selectedNoteId.value = id;
}

// Add placeholder function for adding new notes
function handleAddNewNote() {
  console.log('Request to add a new note!');
  selectedNoteId.value = null; // Deselect current note when adding new
}
</script>

<template>
  <div class="bg-image"></div>
  <div class="bg-overlay"></div>

  <div class="app-container">
    <TopBar />
    <div class="main-content">
      <Sidebar
        :pinned-notes="pinnedNotes"
        :regular-notes="regularNotes"
        @select-note="handleSelectNote"
        @add-new-note="handleAddNewNote"
      />
      <NoteEditor :selected-note="selectedNote" />
    </div>
  </div>
</template>

<style scoped>
/* Styles from the M2 version can mostly be removed
   as styles.css provides the main styling.
   Keep only if needed for App.vue specific layout adjustments */
</style>
