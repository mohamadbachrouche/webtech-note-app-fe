<script setup lang="ts">
import NoteItem from './NoteItem.vue';
import type { Note } from '@/types';

defineProps<{
  pinnedNotes: Note[],
  regularNotes: Note[],
  trashedNotes: Note[], // --- NEW
  currentView: 'notes' | 'trash' // --- NEW
}>();

const emit = defineEmits(['select-note', 'add-new-note', 'switch-view']);
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="search-bar">
        <input type="text" id="search-input" placeholder="Search notes...">
      </div>
      <div class="sidebar-actions">
        <button @click="emit('add-new-note')" id="add-btn" class="icon-btn add-btn" title="Add New Note">
          <i class="fas fa-plus"></i>
        </button>
        <div class="sort-container">
          <select id="sort-select">
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
          v-for="note in [...pinnedNotes, ...regularNotes]"
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
          v-for="note in trashedNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>
    </div>
  </div>
</template>
