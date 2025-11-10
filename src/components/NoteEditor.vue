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

// This 'watch' is crucial. It fires when the selectedNote prop changes.
watch(() => props.selectedNote, (newNote) => {
  if (newNote) {
    // Update local state WITH the new note's data
    editableTitle.value = newNote.title;
    editableContent.value = newNote.content;
  } else {
    // A note was deselected (or deleted), so clear the editor
    editableTitle.value = '';
    editableContent.value = '';
  }
});

// This function is called when the user types in the content div
function onContentInput(e: Event) {
  // Update our local 'editableContent' variable with the div's innerHTML
  const target = e.target as HTMLDivElement;
  editableContent.value = target.innerHTML;
}

// This function is called when the user clicks away
function onContentChange() {
  if (!props.selectedNote) return;

  const updatedNote = {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editableContent.value,
  };

  // Send the *correct* local data up to App.vue
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
        v-html="editableContent"
        @input="onContentInput"
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
