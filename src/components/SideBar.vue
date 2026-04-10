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
  <aside id="app-sidebar" class="sidebar" aria-label="Notes navigation">
    <div class="sidebar-header">
      <div class="search-bar">
        <label for="search-input" class="visually-hidden">Search notes</label>
        <input
          id="search-input"
          v-model="searchQuery"
          type="search"
          placeholder="Search notes..."
        />
      </div>
      <div class="sidebar-actions">
        <button
          id="add-btn"
          class="icon-btn add-btn"
          title="Add new note"
          aria-label="Add new note"
          @click="emit('add-new-note')"
        >
          <i class="fas fa-plus" aria-hidden="true"></i>
        </button>
        <div class="sort-container">
          <label for="sort-select" class="visually-hidden">Sort notes</label>
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
    <div class="tabs" role="tablist">
      <button
        id="notes-tab"
        type="button"
        class="tab"
        :class="{ active: currentView === 'notes' }"
        role="tab"
        :aria-selected="currentView === 'notes'"
        aria-controls="notes-section"
        @click="emit('switch-view', 'notes')"
      >
        Notes
      </button>
      <button
        id="trash-tab"
        type="button"
        class="tab"
        :class="{ active: currentView === 'trash' }"
        role="tab"
        :aria-selected="currentView === 'trash'"
        aria-controls="trash-section"
        @click="emit('switch-view', 'trash')"
      >
        Trash
      </button>
    </div>

    <!-- --- MODIFIED: Show EITHER notes OR trash --- -->
    <div
      v-if="currentView === 'notes'"
      id="notes-section"
      class="notes-container"
      role="tabpanel"
      aria-labelledby="notes-tab"
    >
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
    <div
      v-else
      id="trash-section"
      class="trash-container"
      role="tabpanel"
      aria-labelledby="trash-tab"
    >
      <div id="trash-list">
        <NoteItem
          v-for="note in sortedTrashedNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* The tabs used to be <div> elements styled by the global stylesheet. They
   are now <button> elements for keyboard/screen-reader affordance, so we
   need to reset the default button chrome and let the global .tab rules
   do the rest. */
.tabs .tab {
  background: none;
  border: none;
  font-family: inherit;
}
</style>
