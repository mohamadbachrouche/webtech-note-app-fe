<!-- src/components/NoteItem.vue -->
<script setup lang="ts">
import type { Note } from '@/types';
import { computed } from 'vue';

const props = defineProps<{
  note: Note
}>();

const preview = computed(() => {
  const stripped = props.note.content.replace(/<[^>]+>/g, '');
  if (stripped.length <= 40) return stripped;
  return stripped.substring(0, 40) + '...';
});

const formattedDate = computed(() => {
  const date = new Date(props.note.lastModified);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
});
</script>

<template>
  <div class="note-item" :class="{ pinned: note.pinned }">
    <div class="note-item-title">{{ note.title }}</div>
    <div class="note-item-preview">{{ preview }}</div>
    <div class="note-item-date">{{ formattedDate }}</div>
    <div v-if="note.pinned" class="pin-indicator">
      <i class="fas fa-thumbtack"></i>
    </div>
  </div>
</template>
