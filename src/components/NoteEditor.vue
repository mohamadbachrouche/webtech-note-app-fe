<script setup lang="ts">
import type { Note } from '@/types';
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps<{
  selectedNote: Note | null
}>();

const emit = defineEmits(['update-note', 'move-to-trash', 'restore-note', 'delete-permanently']);

// Local refs for editing
const editableTitle = ref('');
const editableContent = ref('');
// A ref to get direct access to the content div
const contentEditorRef = ref<HTMLDivElement | null>(null);

// Track the last selection range inside the editor so toolbar actions work reliably
let lastSelection: Range | null = null;
function saveSelection() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  // Ensure the selection is within our editor
  if (contentEditorRef.value && contentEditorRef.value.contains(range.commonAncestorContainer)) {
    lastSelection = range.cloneRange();
  }
}
function restoreSelection() {
  if (!lastSelection) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(lastSelection);
}

// --- Toolbar state tracking ---
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const isUnorderedList = ref(false);
const isOrderedList = ref(false);
const activeHeading = ref<'H1' | 'H2' | 'H3' | null>(null);

function getEditorRoot(): HTMLElement | null {
  return contentEditorRef.value;
}
function getCurrentNode(): Node | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.anchorNode as Node;
}
function closestTag(node: Node | null, tagNames: string[]): Element | null {
  let el: Node | null = node;
  const root = getEditorRoot();
  while (el && el !== root) {
    if (el instanceof Element) {
      if (tagNames.includes(el.tagName)) return el;
    }
    el = el.parentNode;
  }
  return null;
}
function isInListContext(): boolean {
  const node = getCurrentNode();
  return !!closestTag(node, ['UL', 'OL', 'LI']);
}

function updateToolbarStates() {
  try {
    isBold.value = document.queryCommandState('bold');
    isItalic.value = document.queryCommandState('italic');
    isUnderline.value = document.queryCommandState('underline');

    // Lists
    const ulState = document.queryCommandState('insertUnorderedList');
    const olState = document.queryCommandState('insertOrderedList');
    const node = getCurrentNode();
    const hasUL = !!closestTag(node, ['UL']);
    const hasOL = !!closestTag(node, ['OL']);
    isUnorderedList.value = ulState || (!olState && hasUL);
    isOrderedList.value = olState || (!ulState && hasOL);

    let block = document.queryCommandValue('formatBlock') as string | null;
    if (block) block = String(block).toUpperCase();
    let heading: 'H1' | 'H2' | 'H3' | null = null;
    if (block === 'H1' || block === 'H2' || block === 'H3') {
      heading = block as 'H1' | 'H2' | 'H3';
    }
    if (!heading) {
      const hEl = closestTag(node, ['H1', 'H2', 'H3']);
      heading = (hEl ? (hEl.tagName as 'H1' | 'H2' | 'H3') : null);
    }
    activeHeading.value = heading;
  } catch {
    // Ignore query errors in unsupported browsers
  }
}

// Watch for when the selectedNote prop changes
watch(() => props.selectedNote, async (newNote) => {
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
  await nextTick();
  updateToolbarStates();
});

// This function is called when the user types
function onContentInput() {
  if (contentEditorRef.value) {
    // Update our local 'editableContent' variable with the div's innerHTML
    editableContent.value = contentEditorRef.value.innerHTML;
  }
  updateToolbarStates();
}

// Keep selection saved on key/mouse/input inside the editor
function onSelectionUpdate() {
  saveSelection();
  updateToolbarStates();
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
  // Handle Tab indent/outdent within lists
  if (e.key === 'Tab') {
    if (isInListContext()) {
      e.preventDefault();
      document.execCommand(e.shiftKey ? 'outdent' : 'indent');
      saveSelection();
      updateToolbarStates();
    }
    return;
  }

  if (e.key === 'Enter') {
    if (isInListContext()) {
      // Allow default behavior inside lists to create a new list item
      // Update toolbar state on next tick
      setTimeout(updateToolbarStates, 0);
      return;
    }
    e.preventDefault(); // Outside lists, insert a <br>
    document.execCommand('insertLineBreak');
    saveSelection();
    updateToolbarStates();
  }
}

function toggleHeading(level: 'H1' | 'H2' | 'H3') {
  if (props.selectedNote?.inTrash) return;
  const current = activeHeading.value;
  if (current === level) {
    // Toggle off to paragraph
    applyFormat('formatBlock', 'p');
  } else {
    applyFormat('formatBlock', level);
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

function normalizeUrl(url: string): string {
  try {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  } catch {
    return '';
  }
}

function applyFormat(command: string, value: string | null = null) {
  if (props.selectedNote?.inTrash) return;
  const editor = contentEditorRef.value;
  if (!editor) return;

  // Keep focus in the editor and restore selection before applying commands
  editor.focus();
  restoreSelection();

  // Normalize special cases
  let cmd = command;
  let val: string | undefined = value ?? undefined;

  if (cmd === 'formatBlock' && val) {
    // Some browsers require uppercase tag names
    val = val.toUpperCase(); // H1/H2/H3/P
  }

  if (cmd === 'createLink') {
    const input = window.prompt('Enter URL:', 'https://');
    const href = input ? normalizeUrl(input) : '';
    if (!href) return; // Abort if no url
    document.execCommand('createLink', false, href);
  } else {
    document.execCommand(cmd, false, val);
  }

  // Manually update our ref and save
  editableContent.value = editor.innerHTML;
  saveSelection();
  onContentChange();
  updateToolbarStates();
}

onMounted(() => {
  nextTick(() => updateToolbarStates());
});

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
        <button @mousedown.prevent @click="applyFormat('bold')" :class="['format-btn', { active: isBold }]" title="Bold"><i class="fas fa-bold"></i></button>
        <button @mousedown.prevent @click="applyFormat('italic')" :class="['format-btn', { active: isItalic }]" title="Italic"><i class="fas fa-italic"></i></button>
        <button @mousedown.prevent @click="applyFormat('underline')" :class="['format-btn', { active: isUnderline }]" title="Underline"><i class="fas fa-underline"></i></button>
        <div class="divider"></div>
        <button @mousedown.prevent @click="applyFormat('insertUnorderedList')" :class="['format-btn', { active: isUnorderedList }]" title="Bullet List"><i class="fas fa-list-ul"></i></button>
        <button @mousedown.prevent @click="applyFormat('insertOrderedList')" :class="['format-btn', { active: isOrderedList }]" title="Numbered List"><i class="fas fa-list-ol"></i></button>
        <div class="divider"></div>
        <button @mousedown.prevent @click="toggleHeading('H1')" :class="['format-btn', { active: activeHeading === 'H1' }]" title="Heading 1"><i class="fas fa-heading"></i>1</button>
        <button @mousedown.prevent @click="toggleHeading('H2')" :class="['format-btn', { active: activeHeading === 'H2' }]" title="Heading 2"><i class="fas fa-heading"></i>2</button>
        <button @mousedown.prevent @click="toggleHeading('H3')" :class="['format-btn', { active: activeHeading === 'H3' }]" title="Heading 3"><i class="fas fa-heading"></i>3</button>
        <div class="divider"></div>
        <button @mousedown.prevent @click="applyFormat('createLink')" class="format-btn" title="Insert Link"><i class="fas fa-link"></i></button>
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
        @keydown="onKeydown"
        @keyup="onSelectionUpdate"
        @mouseup="onSelectionUpdate"
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
