<!-- src/components/Sidebar.vue -->
<script setup lang="ts">
import NoteItem from './NoteItem.vue';
import type { Note } from '@/types';

defineProps<{
  pinnedNotes: Note[],
  regularNotes: Note[]
}>();

const emit = defineEmits(['select-note', 'add-new-note']);
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

    <div class="tabs">
      <div class="tab active" id="notes-tab">Notes</div>
      <div class="tab" id="trash-tab">Trash</div>
    </div>

    <div class="notes-container" id="notes-section">
      <div class="section-heading" v-if="pinnedNotes.length > 0">Pinned</div>
      <div id="pinned-notes">
        <NoteItem
          v-for="note in pinnedNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>

      <div class="section-heading" v-if="regularNotes.length > 0">All Notes</div>
      <div id="notes-list">
        <NoteItem
          v-for="note in regularNotes"
          :key="note.id"
          :note="note"
          @click="emit('select-note', note.id)"
        />
      </div>
    </div>
  </div>
</template>
