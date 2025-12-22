<script setup lang="ts">
import NoteItem from './NoteItem.vue';
import type { Note } from '@/types';
import { ref, computed } from 'vue';

const props = defineProps<{
  pinnedNotes: Note[],
  regularNotes: Note[],
  trashedNotes: Note[], // --- NEW
  currentView: 'notes' | 'trash' // --- NEW
}>();

const emit = defineEmits(['select-note', 'add-new-note', 'switch-view']);

// Local search query for filtering notes by title
const searchQuery = ref('');

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());
const filteredTrashedNotes = computed(() => {
  if (!normalizedQuery.value) return props.trashedNotes;
  return props.trashedNotes.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
});

// Sorting state and helpers
const sortOption = ref<'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc'>('date-desc');

function getTime(n: Note) {
  // Prefer lastModified; fallback to createdAt
  const lm = new Date(n.lastModified ).getTime();
  const ca = new Date(n.createdAt ).getTime();
  return isNaN(lm) ? ca : lm;
}

const filteredPinned = computed(() => {
  const arr = props.pinnedNotes;
  if (!normalizedQuery.value) return arr;
  return arr.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
});

const filteredRegular = computed(() => {
  const arr = props.regularNotes;
  if (!normalizedQuery.value) return arr;
  return arr.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
});

function compareNotes(a: Note, b: Note): number {
  switch (sortOption.value) {
    case 'alpha-asc':
      return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
    case 'alpha-desc':
      return (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' });
    case 'date-asc':
      return getTime(a) - getTime(b);
    case 'date-desc':
    default:
      return getTime(b) - getTime(a);
  }
}

const sortedNotes = computed(() => {
  const pinned = [...filteredPinned.value].sort(compareNotes);
  const regular = [...filteredRegular.value].sort(compareNotes);
  return [...pinned, ...regular];
});

const sortedTrashedNotes = computed(() => {
  return [...filteredTrashedNotes.value].sort(compareNotes);
});
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="search-bar">
        <input type="text" id="search-input" v-model="searchQuery" placeholder="Search notes...">
      </div>
      <div class="sidebar-actions">
        <button @click="emit('add-new-note')" id="add-btn" class="icon-btn add-btn" title="Add New Note">
          <i class="fas fa-plus"></i>
        </button>
        <div class="sort-container">
          <select id="sort-select" v-model="sortOption">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="alpha-asc">A-Z</option>
            <option value="alpha-desc">Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- --- MODIFIED: Tabs are now functional --- -->
    <div class="tabs">
      <div
        class="tab"
        :class="{ active: currentView === 'notes' }"
        id="notes-tab"
        @click="emit('switch-view', 'notes')"
      >
        Notes
      </div>
      <div
        class="tab"
        :class="{ active: currentView === 'trash' }"
        id="trash-tab"
        @click="emit('switch-view', 'trash')"
      >
        Trash
      </div>
    </div>

    <!-- --- MODIFIED: Show EITHER notes OR trash --- -->
    <div v-if="currentView === 'notes'" class="notes-container" id="notes-section">
      <div id="notes-list">
        <NoteItem
          v-for="note in sortedNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>
    </div>

    <!-- --- NEW: Trash view --- -->
    <div v-else class="trash-container" id="trash-section">
      <div id="trash-list">
        <NoteItem
          v-for="note in sortedTrashedNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>
    </div>
  </div>
</template>
