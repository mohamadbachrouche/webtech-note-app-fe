<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/SideBar.vue'
import NoteEditor from './components/NoteEditor.vue'
import type { Note } from './types'
import * as ApiService from './services/ApiService' // Import your new service

const allNotes = ref<Note[]>([]);
const selectedNoteId = ref<number | null>(null);

onMounted(async () => {
  try {
    const response = await ApiService.getNotes(); // Use ApiService
    allNotes.value = response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
});

const pinnedNotes = computed(() => allNotes.value.filter(n => n.pinned && !n.inTrash));
const regularNotes = computed(() => allNotes.value.filter(n => !n.pinned && !n.inTrash));
const selectedNote = computed(() => allNotes.value.find(n => n.id === selectedNoteId.value) || null);

function handleSelectNote(id: number) {
  selectedNoteId.value = id;
}

// M4: Implement "Create Note"
async function handleAddNewNote() {
  const newNoteData = {
    title: 'New Note',
    content: '',
    tags: '',
  };
  try {
    const response = await ApiService.createNote(newNoteData); // Call POST route
    allNotes.value.push(response.data); // Add new note to list
    selectedNoteId.value = response.data.id; // Select the new note
  } catch (error) {
    console.error('Failed to create note:', error);
  }
}

// M4: Implement "Update Note"
async function handleUpdateNote(noteToUpdate: Note) {
  try {
    const response = await ApiService.updateNote(noteToUpdate.id, noteToUpdate);
    // Find and update the note in the local list
    const index = allNotes.value.findIndex(n => n.id === response.data.id);
    if (index !== -1) {
      allNotes.value[index] = response.data;
    }
  } catch (error) {
    console.error('Failed to update note:', error);
  }
}

// M4: Implement "Delete Note"
async function handleDeleteNote(noteId: number) {
  try {
    await ApiService.deleteNote(noteId);
    // Remove the note from the local list
    allNotes.value = allNotes.value.filter(n => n.id !== noteId);
    selectedNoteId.value = null; // Deselect the note
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
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
      <NoteEditor
        :selected-note="selectedNote"
        @update-note="handleUpdateNote"
        @delete-note="handleDeleteNote"
      />
    </div>
  </div>
</template>
