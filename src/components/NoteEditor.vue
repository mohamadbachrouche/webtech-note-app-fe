<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps<{
  selectedNote: Note | null
}>();

const emit = defineEmits(['update-note', 'move-to-trash', 'restore-note', 'delete-permanently']);

// Local refs for editing
const editableTitle = ref('');

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
  ],
  onUpdate: ({ editor }) => {
    if (!props.selectedNote || props.selectedNote.inTrash) return;

    // Emit update on every change
    emit('update-note', {
      ...props.selectedNote,
      title: editableTitle.value,
      content: editor.getHTML(),
    });
  },
});

// Watch for selectedNote changes to update editor content
watch(() => props.selectedNote, (newNote) => {
  if (newNote) {
    editableTitle.value = newNote.title;

    // Only update content if it's different to avoid cursor jumps / loops
    // or if we switched to a different note entirely
    if (editor.value) {
      const currentContent = editor.value.getHTML();
      if (currentContent !== newNote.content) {
         editor.value.commands.setContent(newNote.content);
      }
    }
  } else {
    editableTitle.value = '';
    editor.value?.commands.setContent('');
  }
});

// Handle Title Updates separately
function onTitleChange() {
  if (!props.selectedNote || props.selectedNote.inTrash) return;

  emit('update-note', {
    ...props.selectedNote,
    title: editableTitle.value,
    content: editor.value?.getHTML() || '',
  });
}

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // update
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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

function onPinClick() {
  if (!props.selectedNote || props.selectedNote.inTrash) return;
  emit('update-note', {
    ...props.selectedNote,
    pinned: !props.selectedNote.pinned
  });
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
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
          @input="onTitleChange"
          class="note-title-input"
          placeholder="Note title"
        >
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

      <editor-content :editor="editor" class="note-text-input-container" />
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
    color: #4a90e2; /* Or match your theme color */
    text-decoration: underline;
    cursor: pointer;
}
</style>
