<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import Sidebar from './components/SideBar.vue' // Corrected this to SideBar
import NoteEditor from './components/NoteEditor.vue'
import type { Note } from './types'
import * as ApiService from './services/ApiService'

const BACKGROUND_THEMES: Record<string, string> = {
  blue: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  yellow: 'https://wallpapercave.com/wp/wp11276048.jpg',
  green: 'https://mcdn.wallpapersafari.com/medium/34/82/0OWTQ5.jpg'
};

// --- 1. DEFINE ALL STATE REFS FIRST ---
const allNotes = ref<Note[]>([]);
const selectedNoteId = ref<number | null>(null);
const currentView = ref<'notes' | 'trash'>('notes');
const isDarkMode = ref(false);
const currentThemeColor = ref('blue');

// --- 2. DEFINE ALL FUNCTIONS SECOND ---
function setTheme(dark: boolean) {
  isDarkMode.value = dark;
  localStorage.setItem('darkMode', dark ? 'true' : 'false');
}

function toggleTheme() {
  setTheme(!isDarkMode.value);
}

function setAppBackground(color: string) {
  if (color in BACKGROUND_THEMES) {
    currentThemeColor.value = color;
    localStorage.setItem('appBackground', color);
  }
}

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

function handleSelectNote(id: number) {
  selectedNoteId.value = id;
}

async function handleAddNewNote() {
  const newNoteData = { title: 'New Note', content: '', tags: '' };
  try {
    const response = await ApiService.createNote(newNoteData);
    await loadNotes(); // Reload the list from the server
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

async function handleMoveToTrash(noteId: number) {
  try {
    await ApiService.moveToTrash(noteId);
    selectedNoteId.value = null;
    await loadNotes(); // Reload the list
  } catch (error) {
    console.error('Failed to move note to trash:', error);
  }
}

async function handleRestoreNote(noteId: number) {
  try {
    await ApiService.restoreNote(noteId);
    selectedNoteId.value = null;
    await loadNotes(); // Reload the list
  } catch (error) {
    console.error('Failed to restore note:', error);
  }
}

async function handleDeletePermanently(noteId: number) {
  try {
    await ApiService.deleteNotePermanently(noteId);
    selectedNoteId.value = null;
    await loadNotes(); // Reload the list
  } catch (error) {
    console.error('Failed to permanently delete note:', error);
  }
}

function handleSwitchView(view: 'notes' | 'trash') {
  currentView.value = view;
  selectedNoteId.value = null;
  loadNotes(); // Reload notes for the new view
}

// --- 3. DEFINE COMPUTED PROPERTIES THIRD ---
const pinnedNotes = computed(() => allNotes.value.filter(n => n.pinned && !n.inTrash));
const regularNotes = computed(() => allNotes.value.filter(n => !n.pinned && !n.inTrash));
const selectedNote = computed(() => allNotes.value.find(n => n.id === selectedNoteId.value) || null);

// --- 4. RUN ONMOUNTED HOOK LAST ---
onMounted(async () => {
  // Load theme
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme !== null) {
    setTheme(savedTheme === 'true');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark);
  }

  // Load background
  const savedBg = localStorage.getItem('appBackground');
  if (savedBg) {
    setAppBackground(savedBg);
  }

  // Load initial notes
  await loadNotes();
});
</script>

<template>
  <div class="bg-image" :style="{ backgroundImage: `url(${BACKGROUND_THEMES[currentThemeColor]})` }"></div>
  <div class="bg-overlay"></div>

  <div class="app-container" :class="{ 'dark-theme': isDarkMode }">
    <TopBar @toggle-theme="toggleTheme" @change-background="setAppBackground" />
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
