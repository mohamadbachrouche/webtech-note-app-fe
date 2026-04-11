<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { Note } from '@/types'

defineProps<{
  editor: Editor
  selectedNote: Note
  copied: boolean
  isDownloading: boolean
}>()

const emit = defineEmits<{
  (e: 'set-link'): void
  (e: 'copy'): void
  (e: 'download'): void
  (e: 'pin'): void
  (e: 'color-select', color: string): void
  (e: 'trash'): void
}>()

const noteColorOptions = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e', '#a855f7']
</script>

<template>
  <div class="formatting-tools" role="toolbar" aria-label="Text formatting">
    <button
      :class="['format-btn', { active: editor.isActive('bold') }]"
      title="Bold"
      aria-label="Bold"
      :aria-pressed="editor.isActive('bold')"
      @click="editor.chain().focus().toggleBold().run()"
    >
      <i class="fas fa-bold" aria-hidden="true"></i>
    </button>
    <button
      :class="['format-btn', { active: editor.isActive('italic') }]"
      title="Italic"
      aria-label="Italic"
      :aria-pressed="editor.isActive('italic')"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <i class="fas fa-italic" aria-hidden="true"></i>
    </button>
    <button
      :class="['format-btn', { active: editor.isActive('underline') }]"
      title="Underline"
      aria-label="Underline"
      :aria-pressed="editor.isActive('underline')"
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      <i class="fas fa-underline" aria-hidden="true"></i>
    </button>

    <div class="divider" aria-hidden="true"></div>

    <button
      :class="['format-btn', { active: editor.isActive('bulletList') }]"
      title="Bullet list"
      aria-label="Bullet list"
      :aria-pressed="editor.isActive('bulletList')"
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      <i class="fas fa-list-ul" aria-hidden="true"></i>
    </button>
    <button
      :class="['format-btn', { active: editor.isActive('orderedList') }]"
      title="Numbered list"
      aria-label="Numbered list"
      :aria-pressed="editor.isActive('orderedList')"
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      <i class="fas fa-list-ol" aria-hidden="true"></i>
    </button>

    <div class="divider" aria-hidden="true"></div>

    <button
      :class="['format-btn', { active: editor.isActive('heading', { level: 2 }) }]"
      title="Heading"
      aria-label="Heading"
      :aria-pressed="editor.isActive('heading', { level: 2 })"
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <i class="fas fa-heading" aria-hidden="true"></i> Heading
    </button>

    <div class="divider" aria-hidden="true"></div>

    <button
      :class="['format-btn', { active: editor.isActive('link') }]"
      title="Insert link"
      aria-label="Insert link"
      :aria-pressed="editor.isActive('link')"
      @click="emit('set-link')"
    >
      <i class="fas fa-link" aria-hidden="true"></i>
    </button>

    <div class="divider" aria-hidden="true"></div>

    <button
      :class="['format-btn', { active: copied }]"
      title="Copy to clipboard"
      :aria-label="copied ? 'Copied to clipboard' : 'Copy to clipboard'"
      @click="emit('copy')"
    >
      <i :class="copied ? 'fas fa-check' : 'fas fa-copy'" aria-hidden="true"></i>
      {{ copied ? 'Copied!' : '' }}
    </button>

    <div class="flex-spacer" aria-hidden="true"></div>

    <button
      id="download-btn"
      class="icon-btn"
      :disabled="isDownloading"
      :title="isDownloading ? 'Downloading…' : 'Download as PDF'"
      :aria-label="isDownloading ? 'Downloading PDF' : 'Download as PDF'"
      @click="emit('download')"
    >
      <i
        :class="isDownloading ? 'fas fa-spinner fa-spin' : 'fas fa-download'"
        aria-hidden="true"
      ></i>
    </button>
    <button
      id="pin-btn"
      class="icon-btn pin-btn"
      :class="{ active: selectedNote.pinned }"
      :title="selectedNote.pinned ? 'Unpin note' : 'Pin note'"
      :aria-label="selectedNote.pinned ? 'Unpin note' : 'Pin note'"
      :aria-pressed="selectedNote.pinned"
      @click="emit('pin')"
    >
      <i class="fas fa-thumbtack" aria-hidden="true"></i>
    </button>
    <div class="color-picker" role="radiogroup" aria-label="Note color">
      <button
        v-for="color in noteColorOptions"
        :key="color || 'none'"
        type="button"
        class="color-picker-swatch"
        role="radio"
        :aria-checked="(selectedNote.color || '') === color"
        :class="{
          active: (selectedNote.color || '') === color,
          none: color === '',
        }"
        :style="color ? { backgroundColor: color } : {}"
        :title="color ? `Set note color ${color}` : 'Clear note color'"
        :aria-label="color ? `Set note color ${color}` : 'Clear note color'"
        @click="emit('color-select', color)"
      ></button>
    </div>
    <button
      id="trash-btn"
      class="icon-btn"
      title="Move to trash"
      aria-label="Move to trash"
      @click="emit('trash')"
    >
      <i class="fas fa-trash" aria-hidden="true"></i>
    </button>
  </div>
</template>
