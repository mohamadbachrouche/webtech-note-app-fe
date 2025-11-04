<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' // Add onMounted
import TopBar from './components/TopBar.vue'
import Sidebar from './components/Sidebar.vue'
import NoteEditor from './components/NoteEditor.vue'
import type { Note } from './types'
import axios from 'axios' // Import axios

// Start with an empty list
const allNotes = ref<Note[]>([]);
const selectedNoteId = ref<number | null>(null);

// This hook runs once when the component is first loaded
onMounted(async () => {
  // Vite automatically picks the right .env file
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    // Make a GET request to your backend
    const response = await axios.get(`${baseUrl}/notes`);
    allNotes.value = response.data; // Fill the list with data from the API
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
});

// ... (rest of your computed properties and functions) ...
const pinnedNotes = computed(() => allNotes.value.filter(n => n.pinned && !n.inTrash));
const regularNotes = computed(() => allNotes.value.filter(n => !n.pinned && !n.inTrash));
const selectedNote = computed(() => allNotes.value.find(n => n.id === selectedNoteId.value) || null);

function handleSelectNote(id: number) {
  selectedNoteId.value = id;
}

function handleAddNewNote() {
  console.log('Request to add a new note!');
  selectedNoteId.value = null;
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
