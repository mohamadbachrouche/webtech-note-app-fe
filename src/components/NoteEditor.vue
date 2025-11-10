<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  selectedNote: Note | null
}>();

// --- MODIFIED: Added all new events ---
const emit = defineEmits(['update-note', 'move-to-trash', 'restore-note', 'delete-permanently']);

const editableTitle = ref('');
const editableContent = ref('');
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

function onContentInput() {
  if (contentEditorRef.value) {
    editableContent.value = contentEditorRef.value.innerHTML;
  }
}

function onContentChange() {
  if (!props.selectedNote || props.selectedNote.inTrash) return; // Don't save if in trash
  const updatedNote = {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editableContent.value,
  };
  
  emit('update-note', updatedNote);
}

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

function applyFormat(command: string, value?: string) {
  if (props.selectedNote?.inTrash) return; // Don't format in trash
  document.execCommand(command, false, value);
  onContentInput();
  onContentChange();
}

function onPinClick() {
  if (!props.selectedNote || props.selectedNote.inTrash) return; // Don't pin in trash
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned
  });
}
  
</script>
<template>
  <div class="note-content-area">
    <!-- --- NEW: Show trash options if note is in trash --- -->
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

    <!-- --- MODIFIED: Show editor only if note is selected AND not in trash --- -->
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
        <button
          id="pin-btn"
          class="icon-btn pin-btn"
          :class="{ active: selectedNote.pinned }"
          title="Pin Note"
          @click="onPinClick"
        >
          <i class="fas fa-thumbtack"></i>
        </button>
        <!-- --- MODIFIED: Emits 'move-to-trash' --- -->
        <button @click="onTrashClick" id="trash-btn" class="icon-btn" title="Move to Trash">
          <i class="fas fa-trash"></i>
        </button>
      </div>

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
