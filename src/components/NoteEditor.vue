<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  selectedNote: Note | null
}>();

const emit = defineEmits(['update-note', 'delete-note']);

// Create local copies of the note data to allow editing
const editableTitle = ref('');
const editableContent = ref('');

// Watch for when the selectedNote prop changes
watch(() => props.selectedNote, (newNote) => {
  if (newNote) {
    editableTitle.value = newNote.title;
    editableContent.value = newNote.content;
  } else {
    editableTitle.value = '';
    editableContent.value = '';
  }
});

// Function to handle auto-save on blur (when user clicks away)
function onContentChange() {
  if (!props.selectedNote) return;
  // Create an updated note object
  const updatedNote = {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editableContent.value,
    // (We'll add tags/pinning later)
  };
  // Emit the event to App.vue
  emit('update-note', updatedNote);
}

function onDeleteClick() {
  if (props.selectedNote) {
    emit('delete-note', props.selectedNote.id);
  }
}

</script>

<template>
  <div class="note-content-area">
    <div v-if="selectedNote" class="note-editor">
      <div class="editor-header">
        <input
          type="text"
          v-model="editableTitle"
          @blur="onContentChange"
          class="note-title-input"
          placeholder="Note title"
        >
      </div>
      <div class="formatting-tools">
        <button title="Bold"><i class="fas fa-bold"></i></button>
        <button title="Italic"><i class="fas fa-italic"></i></button>
        <div class="flex-spacer"></div>
        <button @click="onDeleteClick" id="trash-btn" class="icon-btn" title="Move to Trash">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div
        class="note-text-input"
        contenteditable="true"
        v-text="editableContent"
        @blur="onContentChange"
      ></div>
    </div>

    <div v-else class="empty-state-message" id="empty-state">
      <div class="empty-icon">
        <i class="far fa-sticky-note"></i>
      </div>
      <h2>No Note Selected</h2>
      <p>Select a note from the sidebar or create a new note to get started.</p>
    </div>
  </div>
</template>
