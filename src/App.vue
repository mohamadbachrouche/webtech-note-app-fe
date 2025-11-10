<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/SideBar.vue'
import NoteEditor from './components/NoteEditor.vue'
import type { Note } from './types'
import * as ApiService from './services/ApiService'

const allNotes = ref<Note[]>([]);
const selectedNoteId = ref<number | null>(null);
// --- NEW: State to track which view is active ---
const currentView = ref<'notes' | 'trash'>('notes');

// This function will now load notes based on the current view
async function loadNotes() {
  try {
    let response;
    if (currentView.value === 'notes') {
      response = await ApiService.getActiveNotes();
    } else {
      response = await ApiService.getTrashedNotes();
    }
    allNotes.value = response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
}

// Load notes when the app first mounts
onMounted(loadNotes);

const pinnedNotes = computed(() => allNotes.value.filter(n => n.pinned && !n.inTrash));
const regularNotes = computed(() => allNotes.value.filter(n => !n.pinned && !n.inTrash));
const selectedNote = computed(() => allNotes.value.find(n => n.id === selectedNoteId.value) || null);

function handleSelectNote(id: number) {
  selectedNoteId.value = id;
}

async function handleAddNewNote() {
  const newNoteData = { title: 'New Note', content: '', tags: '' };
  try {
    const response = await ApiService.createNote(newNoteData);
    allNotes.value.push(response.data);
    selectedNoteId.value = response.data.id;
  } catch (error) {
    console.error('Failed to create note:', error);
  }
}

async function handleUpdateNote(noteToUpdate: Note) {
  try {
    const response = await ApiService.updateNote(noteToUpdate.id, noteToUpdate);
    const index = allNotes.value.findIndex(n => n.id === response.data.id);
    if (index !== -1) {
      allNotes.value[index] = response.data;
    }
  } catch (error) {
    console.error('Failed to update note:', error);
  }
}

// --- MODIFIED: Renamed and now calls moveToTrash ---
async function handleMoveToTrash(noteId: number) {
  try {
    await ApiService.moveToTrash(noteId);
    // Remove from list immediately
    allNotes.value = allNotes.value.filter(n => n.id !== noteId);
    selectedNoteId.value = null;
  } catch (error) {
    console.error('Failed to move note to trash:', error);
  }
}

// --- NEW ---
async function handleRestoreNote(noteId: number) {
  try {
    await ApiService.restoreNote(noteId);
    // Remove from trash list
    allNotes.value = allNotes.value.filter(n => n.id !== noteId);
    selectedNoteId.value = null;
  } catch (error) {
    console.error('Failed to restore note:', error);
  }
}

// --- NEW ---
async function handleDeletePermanently(noteId: number) {
  try {
    await ApiService.deleteNotePermanently(noteId);
    // Remove from trash list
    allNotes.value = allNotes.value.filter(n => n.id !== noteId);
    selectedNoteId.value = null;
  } catch (error) {
    console.error('Failed to permanently delete note:', error);
  }
}

// --- NEW ---
function handleSwitchView(view: 'notes' | 'trash') {
  currentView.value = view;
  selectedNoteId.value = null;
  loadNotes(); // Reload notes for the new view
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
        :trashed-notes="allNotes.filter(n => n.inTrash)"
        :current-view="currentView"
        @select-note="handleSelectNote"
        @add-new-note="handleAddNewNote"
        @switch-view="handleSwitchView"
      />
      <NoteEditor
        :selected-note="selectedNote"
        @update-note="handleUpdateNote"
        @move-to-trash="handleMoveToTrash"
        @restore-note="handleRestoreNote"
        @delete-permanently="handleDeletePermanently"
      />
    </div>
  </div>
</template>
