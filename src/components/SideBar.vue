<script setup lang="ts">
import NoteItem from './NoteItem.vue';
import type { Note } from '@/types';
import { ref, computed, watch } from 'vue';

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

// Tag filtering
const selectedTag = ref('');

watch(() => props.currentView, () => {
  selectedTag.value = '';
});

function parseTags(note: Note): string[] {
  return note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
}

const availableTags = computed(() => {
  const allNotes = [...props.pinnedNotes, ...props.regularNotes];
  const tagSet = new Set<string>();
  for (const note of allNotes) {
    for (const tag of parseTags(note)) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
});

function matchesTag(note: Note): boolean {
  if (!selectedTag.value) return true;
  return parseTags(note).includes(selectedTag.value);
}

const filteredTrashedNotes = computed(() => {
  let arr = props.trashedNotes;
  if (normalizedQuery.value) {
    arr = arr.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
  }
  if (selectedTag.value) {
    arr = arr.filter(matchesTag);
  }
  return arr;
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
  let arr = props.pinnedNotes;
  if (normalizedQuery.value) {
    arr = arr.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
  }
  if (selectedTag.value) {
    arr = arr.filter(matchesTag);
  }
  return arr;
});

const filteredRegular = computed(() => {
  let arr = props.regularNotes;
  if (normalizedQuery.value) {
    arr = arr.filter(n => (n.title || '').toLowerCase().includes(normalizedQuery.value));
  }
  if (selectedTag.value) {
    arr = arr.filter(matchesTag);
  }
  return arr;
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

    <!-- Tag filter bar -->
    <div v-if="availableTags.length > 0" class="tag-filter-bar">
      <button
        class="tag-filter-pill"
        :class="{ active: selectedTag === '' }"
        @click="selectedTag = ''"
      >All</button>
      <button
        v-for="tag in availableTags"
        :key="tag"
        class="tag-filter-pill"
        :class="{ active: selectedTag === tag }"
        @click="selectedTag = tag"
      >{{ tag }}</button>
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
