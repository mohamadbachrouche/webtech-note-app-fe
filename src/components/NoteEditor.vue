<script setup lang="ts">
import { ref, toRef } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import type { Note } from '@/types'
import { downloadNoteAsPdf } from '@/services/ApiService'
import { useToast } from '@/composables/useToast'
import { useNoteEditor } from '@/composables/useNoteEditor'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EditorToolbar from '@/components/EditorToolbar.vue'
import EditorMetadata from '@/components/EditorMetadata.vue'

const toast = useToast()

const props = defineProps<{
  selectedNote: Note | null
}>()

const emit = defineEmits<{
  (e: 'update-note', note: Note): void
  (e: 'move-to-trash', id: number): void
  (e: 'restore-note', id: number): void
  (e: 'delete-permanently', id: number): void
  (e: 'back'): void
}>()

// All the Tiptap lifecycle, title validation, debounced save, link
// sanitisation, and date formatting lives in useNoteEditor — this view
// is a thin shell that wires it up to the child components.
const {
  editor,
  editableTitle,
  titleError,
  formattedCreatedAt,
  formattedLastModified,
  onTitleChange,
  setLink,
  flushPendingEdit,
} = useNoteEditor({
  selectedNote: toRef(props, 'selectedNote'),
  onUpdateNote: (note) => emit('update-note', note),
})

const copied = ref(false)
const isDownloading = ref(false)
const showDeleteConfirm = ref(false)

async function copyToClipboard() {
  const text = editor.value?.getText() ?? ''
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Copy failed silently
  }
}

function onTrashClick() {
  if (props.selectedNote) {
    emit('move-to-trash', props.selectedNote.id)
  }
}

function onRestoreClick() {
  if (props.selectedNote) {
    emit('restore-note', props.selectedNote.id)
  }
}

function onDeleteClick() {
  if (props.selectedNote) {
    showDeleteConfirm.value = true
  }
}

function confirmDelete() {
  if (props.selectedNote) {
    emit('delete-permanently', props.selectedNote.id)
  }
  showDeleteConfirm.value = false
}

function cancelDelete() {
  showDeleteConfirm.value = false
}

function onPinClick() {
  if (!props.selectedNote || props.selectedNote.inTrash) return
  // Pin is a discrete action — flush any pending text edit and emit now.
  flushPendingEdit()
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned,
  })
}

function onColorSelect(chosenColor: string) {
  if (!props.selectedNote || props.selectedNote.inTrash) return
  flushPendingEdit()
  emit('update-note', {
    ...props.selectedNote,
    color: chosenColor,
  })
}

async function onDownloadClick() {
  if (!props.selectedNote || isDownloading.value) return
  isDownloading.value = true
  try {
    const response = await downloadNoteAsPdf(props.selectedNote.id)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const sanitizedTitle = props.selectedNote.title.replace(/[^a-zA-Z0-9_\- ]/g, '')
    link.download = `${sanitizedTitle || 'note'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download note as PDF:', error)
    toast.error('Failed to download note as PDF. Please try again.')
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="note-content-area">
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Delete note permanently?"
      :message="`\u201C${selectedNote?.title || 'Untitled'}\u201D will be permanently deleted. This action cannot be undone.`"
      confirm-label="Delete permanently"
      cancel-label="Cancel"
      destructive
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <div v-if="selectedNote && selectedNote.inTrash" id="trash-options" class="trash-options">
      <button id="restore-btn" class="icon-text-btn" @click="onRestoreClick">
        <i class="fas fa-trash-restore" aria-hidden="true"></i>
        Restore Note
      </button>
      <button id="delete-permanently-btn" class="icon-text-btn danger-btn" @click="onDeleteClick">
        <i class="fas fa-trash-alt" aria-hidden="true"></i>
        Delete Permanently
      </button>
    </div>

    <div v-else-if="selectedNote && !selectedNote.inTrash" class="note-editor">
      <EditorMetadata
        :editable-title="editableTitle"
        :title-error="titleError"
        :formatted-created-at="formattedCreatedAt"
        :formatted-last-modified="formattedLastModified"
        @update:editable-title="(v) => (editableTitle = v)"
        @title-input="onTitleChange"
        @back="emit('back')"
      />

      <EditorToolbar
        v-if="editor"
        :editor="editor"
        :selected-note="selectedNote"
        :copied="copied"
        :is-downloading="isDownloading"
        @set-link="setLink"
        @copy="copyToClipboard"
        @download="onDownloadClick"
        @pin="onPinClick"
        @color-select="onColorSelect"
        @trash="onTrashClick"
      />

      <editor-content :editor="editor" class="note-text-input-container" />
      <div v-if="editor" class="editor-status-bar">
        {{ editor.storage.characterCount.words() }} words ·
        {{ editor.storage.characterCount.characters() }} characters
      </div>
    </div>

    <div v-else id="empty-state" class="empty-state-message">
      <div class="empty-icon" aria-hidden="true">
        <i class="far fa-sticky-note"></i>
      </div>
      <h2>No Note Selected</h2>
      <p>Select a note from the sidebar or create a new note to get started.</p>
    </div>
  </div>
</template>

<style>
/* Basic Tiptap / ProseMirror Styles */
.ProseMirror {
  outline: none;
  min-height: 200px; /* Ensure there is clickable area */
  color: var(--text-color);
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.ProseMirror ul {
  list-style-type: disc;
}
.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3 {
  line-height: 1.2;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.ProseMirror a {
  color: #4a90e2 !important; /* Or match your theme color */
  text-decoration: underline;
  cursor: pointer;
}

/* Validation Styles */
.input-error {
  border: 2px solid #dc3545 !important;
  background-color: rgba(220, 53, 69, 0.05) !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
