<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  selectedNote: Note | null
}>();

const emit = defineEmits(['update-note', 'move-to-trash', 'restore-note', 'delete-permanently']);

// Local refs for editing
const editableTitle = ref('');
const editableContent = ref('');
// A ref to get direct access to the content div
const contentEditorRef = ref<HTMLDivElement | null>(null);

// Watch for when the selectedNote prop changes
watch(() => props.selectedNote, (newNote) => {
  if (newNote) {
    // Update local state WITH the new note's data
    editableTitle.value = newNote.title;
    editableContent.value = newNote.content;

    // Manually set the innerHTML of the editor div
    // This is safer than using v-html
    if (contentEditorRef.value) {
      contentEditorRef.value.innerHTML = newNote.content;
    }
  } else {
    // A note was deselected (or deleted), so clear the editor
    editableTitle.value = '';
    editableContent.value = '';
    if (contentEditorRef.value) {
      contentEditorRef.value.innerHTML = '';
    }
  }
});

// This function is called when the user types
function onContentInput() {
  if (contentEditorRef.value) {
    // Update our local 'editableContent' variable with the div's innerHTML
    editableContent.value = contentEditorRef.value.innerHTML;
  }
}

// This function is called when the user clicks away
function onContentChange() {
  if (!props.selectedNote || props.selectedNote.inTrash) return;

  const updatedNote = {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editableContent.value,
  };

  emit('update-note', updatedNote);
}

// --- FIX FOR ENTER KEY ---
// This stops the weird "div" creation on Enter
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault(); // Stop the default (weird) behavior
    document.execCommand('insertLineBreak'); // Insert a <br> tag instead
  }
}

// --- ALL YOUR OTHER FUNCTIONS ---
function onTrashClick() {
  if (props.selectedNote) {
    emit('move-to-trash', props.selectedNote.id);
  }
}

function onRestoreClick() {
  if (props.selectedNote) {
    emit('restore-note', props.selectedNote.id);
  }
}

function onDeleteClick() {
  if (props.selectedNote) {
    emit('delete-permanently', props.selectedNote.id);
  }
}

function applyFormat(command: string, value: string | null = null) {
  if (props.selectedNote?.inTrash) return;
  document.execCommand(command, false, value ?? undefined); // Use AI's fix

  // Manually update our ref and save
  if (contentEditorRef.value) {
    editableContent.value = contentEditorRef.value.innerHTML;
  }
  onContentChange();
}

function onPinClick() {
  if (!props.selectedNote || props.selectedNote.inTrash) return;
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned
  });
}

</script>

<template>
  <div class="note-content-area">
    <div v-if="selectedNote && selectedNote.inTrash" class="trash-options" id="trash-options">
      <button @click="onRestoreClick" id="restore-btn" class="icon-text-btn">
        <i class="fas fa-trash-restore"></i>
        Restore Note
      </button>
      <button @click="onDeleteClick" id="delete-permanently-btn" class="icon-text-btn danger-btn">
        <i class="fas fa-trash-alt"></i>
        Delete Permanently
      </button>
    </div>

    <div v-else-if="selectedNote && !selectedNote.inTrash" class="note-editor">
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
        <button @click="applyFormat('bold')" class="format-btn" title="Bold"><i class="fas fa-bold"></i></button>
        <button @click="applyFormat('italic')" class="format-btn" title="Italic"><i class="fas fa-italic"></i></button>
        <button @click="applyFormat('underline')" class="format-btn" title="Underline"><i class="fas fa-underline"></i></button>
        <div class="divider"></div>
        <button @click="applyFormat('insertUnorderedList')" class="format-btn" title="Bullet List"><i class="fas fa-list-ul"></i></button>
        <button @click="applyFormat('insertOrderedList')" class="format-btn" title="Numbered List"><i class="fas fa-list-ol"></i></button>
        <div class="divider"></div>
        <button @click="applyFormat('formatBlock', 'h1')" class="format-btn" title="Heading 1"><i class="fas fa-heading"></i>1</button>
        <button @click="applyFormat('formatBlock', 'h2')" class="format-btn" title="Heading 2"><i class="fas fa-heading"></i>2</button>
        <button @click="applyFormat('formatBlock', 'h3')" class="format-btn" title="Heading 3"><i class="fas fa-heading"></i>3</button>
        <div class="divider"></div>
        <button @click="applyFormat('createLink')" class="format-btn" title="Insert Link"><i class="fas fa-link"></i></button>
        <div class="flex-spacer"></div>
        <button
          id="pin-btn"
          class="icon-btn pin-btn"
          :class="{ active: selectedNote.pinned }"
          title="Pin Note"
          @click="onPinClick"
        >
          <i class="fas fa-thumbtack"></i>
        </button>
        <button @click="onTrashClick" id="trash-btn" class="icon-btn" title="Move to Trash">
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <div
        ref="contentEditorRef"
        class="note-text-input"
        contenteditable="true"
        @input="onContentInput"
        @blur="onContentChange"
        @keydown.enter="onKeydown"
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
