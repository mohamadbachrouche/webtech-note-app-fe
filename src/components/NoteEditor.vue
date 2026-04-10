<script setup lang="ts">
import type { Note } from '@/types'
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { downloadNoteAsPdf } from '@/services/ApiService'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'

const props = defineProps<{
  selectedNote: Note | null
}>()

const copied = ref(false)
const noteColorOptions = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e', '#a855f7']

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

const emit = defineEmits([
  'update-note',
  'move-to-trash',
  'restore-note',
  'delete-permanently',
  'back',
])

const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

const formattedCreatedAt = computed(() => {
  if (!props.selectedNote) return ''
  return dateFormatter.format(new Date(props.selectedNote.createdAt))
})

const formattedLastModified = computed(() => {
  if (!props.selectedNote) return ''
  return dateFormatter.format(new Date(props.selectedNote.lastModified))
})

// Local refs for editing
const editableTitle = ref('')
const titleError = ref('')
const isDownloading = ref(false)

// Validation function
function validateTitle(): boolean {
  if (!editableTitle.value.trim()) {
    titleError.value = 'Title cannot be empty'
    return false
  }
  titleError.value = ''
  return true
}

// Tiptap Editor Setup
const editor = useEditor({
  content: props.selectedNote?.content || '',
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: 'Start typing...',
    }),
    CharacterCount,
  ],
  onUpdate: ({ editor }) => {
    if (!props.selectedNote || props.selectedNote.inTrash) return

    // Emit update on every change
    emit('update-note', {
      ...props.selectedNote,
      title: editableTitle.value,
      content: editor.getHTML(),
    })
  },
})

// Watch for selectedNote changes to update editor content
watch(
  () => props.selectedNote,
  (newNote, oldNote) => {
    if (newNote) {
      const isSameNote = oldNote && oldNote.id === newNote.id

      // If it's a newly selected note, load its data.
      // If it's the SAME note, we ignore prop updates to avoid the
      // async "echo" causing cursor jumps or reverting content while typing.
      if (!isSameNote) {
        editableTitle.value = newNote.title
        titleError.value = '' // Clear validation error when switching notes
        editor.value?.commands.setContent(newNote.content)
      }
    } else {
      editableTitle.value = ''
      editor.value?.commands.setContent('')
    }
  },
)

// Handle Title Updates separately
function onTitleChange() {
  if (!props.selectedNote || props.selectedNote.inTrash) return

  // Validate title before saving
  if (!validateTitle()) return

  emit('update-note', {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editor.value?.getHTML() || '',
  })
}

const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Allow protocol-relative URLs and schemeless hosts by assuming https://
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(candidate)
    if (!ALLOWED_LINK_PROTOCOLS.has(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href
  const raw = window.prompt('URL', previousUrl)

  // cancelled
  if (raw === null) {
    return
  }

  // empty
  if (raw.trim() === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  const safeUrl = normalizeLinkUrl(raw)
  if (!safeUrl) {
    window.alert('Invalid URL. Only http, https, and mailto links are allowed.')
    return
  }

  // Let Tiptap build the anchor; never string-concatenate HTML.
  if (editor.value?.state.selection.empty) {
    editor.value
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: safeUrl,
        marks: [{ type: 'link', attrs: { href: safeUrl } }],
      })
      .run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: safeUrl }).run()
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
    emit('delete-permanently', props.selectedNote.id)
  }
}

function onPinClick() {
  if (!props.selectedNote || props.selectedNote.inTrash) return
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned,
  })
}

function onColorSelect(chosenColor: string) {
  if (!props.selectedNote || props.selectedNote.inTrash) return
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
  } finally {
    isDownloading.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
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
        <button class="icon-btn back-btn" @click="emit('back')" title="Back to list">
          <i class="fas fa-arrow-left"></i>
        </button>
        <input
          type="text"
          v-model="editableTitle"
          @input="onTitleChange"
          :class="['note-title-input', { 'input-error': titleError }]"
          placeholder="Note title"
        />
        <span v-if="titleError" class="error-message">{{ titleError }}</span>
      </div>

      <div class="note-meta">
        <span>Created: {{ formattedCreatedAt }}</span>
        <span>Last modified: {{ formattedLastModified }}</span>
      </div>

      <div class="formatting-tools" v-if="editor">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="['format-btn', { active: editor.isActive('bold') }]"
          title="Bold"
        >
          <i class="fas fa-bold"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="['format-btn', { active: editor.isActive('italic') }]"
          title="Italic"
        >
          <i class="fas fa-italic"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="['format-btn', { active: editor.isActive('underline') }]"
          title="Underline"
        >
          <i class="fas fa-underline"></i>
        </button>

        <div class="divider"></div>

        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="['format-btn', { active: editor.isActive('bulletList') }]"
          title="Bullet List"
        >
          <i class="fas fa-list-ul"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="['format-btn', { active: editor.isActive('orderedList') }]"
          title="Numbered List"
        >
          <i class="fas fa-list-ol"></i>
        </button>

        <div class="divider"></div>

        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="['format-btn', { active: editor.isActive('heading', { level: 2 }) }]"
          title="Heading"
        >
          <i class="fas fa-heading"></i> Heading
        </button>

        <div class="divider"></div>

        <button
          @click="setLink"
          :class="['format-btn', { active: editor.isActive('link') }]"
          title="Insert Link"
        >
          <i class="fas fa-link"></i>
        </button>

        <div class="divider"></div>

        <button
          @click="copyToClipboard"
          :class="['format-btn', { active: copied }]"
          title="Copy to clipboard"
        >
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
          {{ copied ? 'Copied!' : '' }}
        </button>

        <div class="flex-spacer"></div>

        <button
          id="download-btn"
          class="icon-btn"
          :disabled="isDownloading"
          title="Download as PDF"
          @click="onDownloadClick"
        >
          <i :class="isDownloading ? 'fas fa-spinner fa-spin' : 'fas fa-download'"></i>
        </button>
        <button
          id="pin-btn"
          class="icon-btn pin-btn"
          :class="{ active: selectedNote.pinned }"
          title="Pin Note"
          @click="onPinClick"
        >
          <i class="fas fa-thumbtack"></i>
        </button>
        <div class="color-picker" aria-label="Note color picker">
          <button
            v-for="color in noteColorOptions"
            :key="color || 'none'"
            type="button"
            class="color-picker-swatch"
            :class="{
              active: (selectedNote.color || '') === color,
              none: color === '',
            }"
            :style="color ? { backgroundColor: color } : {}"
            :title="color ? `Set note color ${color}` : 'Clear note color'"
            @click="onColorSelect(color)"
          ></button>
        </div>
        <button @click="onTrashClick" id="trash-btn" class="icon-btn" title="Move to Trash">
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <editor-content :editor="editor" class="note-text-input-container" />
      <div v-if="editor" class="editor-status-bar">
        {{ editor.storage.characterCount.words() }} words ·
        {{ editor.storage.characterCount.characters() }} characters
      </div>
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
