<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  selectedNote: Note | null
}>();

const emit = defineEmits(['update-note', 'delete-note']);

const editableTitle = ref('');
const editableContent = ref('');
// A ref to get direct access to the content div
const contentEditorRef = ref<HTMLDivElement | null>(null);

watch(() => props.selectedNote, (newNote) => {
  if (newNote) {
    editableTitle.value = newNote.title;
    editableContent.value = newNote.content;
  } else {
    editableTitle.value = '';
    editableContent.value = '';
  }
});

// --- FIX 1: UPDATE 'onContentInput' ---
// We need to update the ref when the user types
function onContentInput() {
  if (contentEditorRef.value) {
    editableContent.value = contentEditorRef.value.innerHTML;
  }
}

function onContentChange() {
  if (!props.selectedNote) return;

  const updatedNote = {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editableContent.value,
  };

  emit('update-note', updatedNote);
}

function onDeleteClick() {
  if (props.selectedNote) {
    emit('delete-note', props.selectedNote.id);
  }
}

// --- FIX 2: ADD 'applyFormat' FUNCTION ---
// This function will be called by our buttons
function applyFormat(command: string, value: string | null = null) {
  // Use the browser's built-in text formatting
  document.execCommand(command, false, value);

  // Manually update our 'editableContent' ref with the new HTML
  onContentInput();
  // Manually save the change
  onContentChange();
}

// --- FIX 3: ADD 'onPinClick' FUNCTION ---
// We will add this for the pin button
function onPinClick() {
  if (!props.selectedNote) return;
  // Emit an update event, but with the 'pinned' value flipped
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned
  });
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

      <!-- --- FIX 4: WIRE UP THE BUTTONS --- -->
      <div class="formatting-tools">
        <button @click="applyFormat('bold')" class="format-btn" data-format="bold" title="Bold">
          <i class="fas fa-bold"></i>
        </button>
        <button @click="applyFormat('italic')" class="format-btn" data-format="italic" title="Italic">
          <i class="fas fa-italic"></i>
        </button>
        <button @click="applyFormat('underline')" class="format-btn" data-format="underline" title="Underline">
          <i class="fas fa-underline"></i>
        </button>
        <div class="divider"></div>
        <button @click="applyFormat('insertUnorderedList')" class="format-btn" data-format="insertUnorderedList" title="Bullet List">
          <i class="fas fa-list-ul"></i>
        </button>
        <button @click="applyFormat('insertOrderedList')" class="format-btn" data-format="insertOrderedList" title="Numbered List">
          <i class="fas fa-list-ol"></i>
        </button>
        <div class="divider"></div>
        <button @click="applyFormat('formatBlock', 'h1')" class="format-btn" data-format="formatBlock" data-value="h1" title="Heading 1">
          <i class="fas fa-heading"></i>1
        </button>
        <button @click="applyFormat('formatBlock', 'h2')" class="format-btn" data-format="formatBlock" data-value="h2" title="Heading 2">
          <i class="fas fa-heading"></i>2
        </button>
        <button @click="applyFormat('formatBlock', 'h3')" class="format-btn" data-format="formatBlock" data-value="h3" title="Heading 3">
          <i class="fas fa-heading"></i>3
        </button>
        <div class="divider"></div>
        <button @click="applyFormat('createLink')" class="format-btn" data-format="createLink" title="Insert Link">
          <i class="fas fa-link"></i>
        </button>
        <div class="flex-spacer"></div>

        <!-- --- FIX 5: WIRE UP PIN BUTTON --- -->
        <button
          id="pin-btn"
          class="icon-btn pin-btn"
          :class="{ active: selectedNote.pinned }"
          title="Pin Note"
          @click="onPinClick"
        >
          <i class="fas fa-thumbtack"></i>
        </button>

        <button @click="onDeleteClick" id="trash-btn" class="icon-btn" title="Move to Trash">
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <!-- --- FIX 6: UPDATE THE DIV --- -->
      <div
        ref="contentEditorRef"
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
