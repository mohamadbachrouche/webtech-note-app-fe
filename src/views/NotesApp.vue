<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TopBar from '@/components/TopBar.vue'
import Sidebar from '@/components/SideBar.vue'
import NoteEditor from '@/components/NoteEditor.vue'
import ToastHost from '@/components/ToastHost.vue'
import type { Note } from '@/types'
import * as ApiService from '@/services/ApiService'
import { BACKGROUND_THEMES } from '@/constants'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// --- 1. DEFINE ALL STATE REFS FIRST ---
const allNotes = ref<Note[]>([])
const selectedNoteId = ref<number | null>(null)
const currentView = ref<'notes' | 'trash'>('notes')
const isDarkMode = ref(false)
const currentThemeColor = ref('green')
const sidebarCollapsed = ref(false)
const isInitialLoad = ref(true)
const isLoading = ref(false)

// Monotonic request id for loadNotes() so that a late response from a
// previously-toggled view can't overwrite the current one.
let loadSequence = 0

// --- 2. DEFINE ALL FUNCTIONS SECOND ---
function setTheme(dark: boolean) {
  isDarkMode.value = dark
  localStorage.setItem('darkMode', dark ? 'true' : 'false')
}

function toggleTheme() {
  setTheme(!isDarkMode.value)
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value ? 'true' : 'false')
}

function setAppBackground(color: string) {
  if (color in BACKGROUND_THEMES) {
    currentThemeColor.value = color
    localStorage.setItem('appBackground', color)
  }
}

async function loadNotes() {
  const seq = ++loadSequence
  isLoading.value = true
  try {
    const response =
      currentView.value === 'notes'
        ? await ApiService.getActiveNotes()
        : await ApiService.getTrashedNotes()
    // Discard stale responses (e.g. rapid view toggles) so the latest
    // request always wins.
    if (seq !== loadSequence) return
    allNotes.value = response.data
  } catch (error) {
    if (seq !== loadSequence) return
    console.error('Failed to fetch notes:', error)
    toast.error('Failed to load notes. Please try again.')
  } finally {
    if (seq === loadSequence) {
      isLoading.value = false
      isInitialLoad.value = false
    }
  }
}

function handleSelectNote(id: number) {
  selectedNoteId.value = id
}

async function handleAddNewNote() {
  const newNoteData = { title: 'New Note', content: '', color: '', tags: '' }
  try {
    const response = await ApiService.createNote(newNoteData)
    await loadNotes() // Reload the list from the server
    selectedNoteId.value = response.data.id
  } catch (error) {
    console.error('Failed to create note:', error)
    toast.error('Failed to create note. Please try again.')
  }
}

async function handleUpdateNote(noteToUpdate: Note) {
  try {
    const response = await ApiService.updateNote(noteToUpdate.id, noteToUpdate)
    const index = allNotes.value.findIndex((n) => n.id === response.data.id)
    if (index !== -1) {
      allNotes.value[index] = response.data
    }
  } catch (error) {
    console.error('Failed to update note:', error)
    toast.error('Failed to save note. Please try again.')
  }
}

async function handleMoveToTrash(noteId: number) {
  try {
    await ApiService.moveToTrash(noteId)
    selectedNoteId.value = null
    await loadNotes() // Reload the list
  } catch (error) {
    console.error('Failed to move note to trash:', error)
    toast.error('Failed to move note to trash.')
  }
}

async function handleRestoreNote(noteId: number) {
  try {
    await ApiService.restoreNote(noteId)
    selectedNoteId.value = null
    await loadNotes() // Reload the list
  } catch (error) {
    console.error('Failed to restore note:', error)
    toast.error('Failed to restore note.')
  }
}

async function handleDeletePermanently(noteId: number) {
  try {
    await ApiService.deleteNotePermanently(noteId)
    selectedNoteId.value = null
    await loadNotes() // Reload the list
  } catch (error) {
    console.error('Failed to permanently delete note:', error)
    toast.error('Failed to delete note.')
  }
}

function handleSwitchView(view: 'notes' | 'trash') {
  currentView.value = view
  selectedNoteId.value = null
  loadNotes() // Reload notes for the new view
}

// --- KEYBOARD SHORTCUTS ---
function handleKeydown(event: KeyboardEvent) {
  // Ignore shortcuts when typing in input/textarea/contenteditable
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  const mod = event.ctrlKey || event.metaKey

  if (mod && event.key === 'n') {
    event.preventDefault()
    handleAddNewNote()
    return
  }

  if (mod && event.key === 'Backspace') {
    event.preventDefault()
    if (selectedNoteId.value !== null && currentView.value === 'notes') {
      handleMoveToTrash(selectedNoteId.value)
    }
    return
  }

  if (event.key === 'Escape') {
    selectedNoteId.value = null
    return
  }
}

// --- 3. DEFINE COMPUTED PROPERTIES THIRD ---
const pinnedNotes = computed(() => allNotes.value.filter((n) => n.pinned && !n.inTrash))
const regularNotes = computed(() => allNotes.value.filter((n) => !n.pinned && !n.inTrash))
const selectedNote = computed(
  () => allNotes.value.find((n) => n.id === selectedNoteId.value) || null,
)
const modKey = computed(() => (navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'))

// --- 4. RUN ONMOUNTED HOOK LAST ---
onMounted(async () => {
  // Load theme
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    setTheme(savedTheme === 'true')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark)
  }

  // Load background
  const savedBg = localStorage.getItem('appBackground')
  if (savedBg) {
    setAppBackground(savedBg)
  }

  // Preload images
  Object.values(BACKGROUND_THEMES).forEach((url) => {
    const img = new Image()
    img.src = url
  })

  // Register keyboard shortcuts
  window.addEventListener('keydown', handleKeydown)

  // Load sidebar state
  const savedSidebar = localStorage.getItem('sidebarCollapsed')
  if (savedSidebar === 'true') {
    sidebarCollapsed.value = true
  }

  // Load initial notes
  await loadNotes()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- Full-screen loading overlay: only on the very first load. Subsequent
       refreshes (after trash/restore/switch-view) show a subtle inline
       indicator instead so the UI doesn't blank out. -->
  <div v-if="isInitialLoad && isLoading" class="loading-overlay" role="status" aria-live="polite">
    <div class="loading-spinner" aria-hidden="true"></div>
    <span class="visually-hidden">Loading notes…</span>
  </div>

  <ToastHost />

  <div
    class="bg-image"
    :style="{ backgroundImage: `url(${BACKGROUND_THEMES[currentThemeColor]})` }"
  ></div>
  <div class="bg-overlay"></div>

  <div
    class="app-container"
    :class="{ 'dark-theme': isDarkMode, 'has-selected-note': selectedNoteId !== null }"
  >
    <TopBar
      :current-theme="currentThemeColor"
      @toggle-theme="toggleTheme"
      @change-background="setAppBackground"
    />
    <div
      v-if="!isInitialLoad && isLoading"
      class="top-progress"
      role="status"
      aria-live="polite"
    >
      <span class="visually-hidden">Loading…</span>
    </div>
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <button
        class="icon-btn sidebar-toggle-btn"
        :title="sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'"
        :aria-label="sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'"
        :aria-expanded="!sidebarCollapsed"
        aria-controls="app-sidebar"
        @click="toggleSidebar"
      >
        <i
          class="fas"
          :class="sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'"
          aria-hidden="true"
        ></i>
      </button>
      <Sidebar
        :pinned-notes="pinnedNotes"
        :regular-notes="regularNotes"
        :trashed-notes="allNotes.filter((n) => n.inTrash)"
        :current-view="currentView"
        @select-note="handleSelectNote"
        @add-new-note="handleAddNewNote"
        @switch-view="handleSwitchView"
      />
      <NoteEditor
        :selected-note="selectedNote"
        @update-note="handleUpdateNote"
        @move-to-trash="handleMoveToTrash"
        @restore-note="handleRestoreNote"
        @delete-permanently="handleDeletePermanently"
        @back="selectedNoteId = null"
      />
    </div>
    <footer class="shortcut-legend">
      <span
        ><kbd>{{ modKey }}+N</kbd> New note</span
      >
      <span
        ><kbd>{{ modKey }}+⌫</kbd> Trash note</span
      >
      <span><kbd>Esc</kbd> Deselect</span>
    </footer>
  </div>
</template>

<style scoped>
.shortcut-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 6px 16px;
  font-size: 12px;
  color: var(--secondary-text);
  border-top: 1px solid var(--border-color);
  background: var(--sidebar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 10;
}

.shortcut-legend kbd {
  display: inline-block;
  padding: 1px 5px;
  font-size: 11px;
  font-family: inherit;
  background: var(--border-color);
  border-radius: 4px;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .shortcut-legend {
    display: none;
  }
}

.top-progress {
  position: relative;
  height: 2px;
  background: transparent;
  overflow: hidden;
}
.top-progress::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--accent-color, #3b82f6) 50%,
    transparent 100%
  );
  animation: top-progress-slide 1.2s linear infinite;
}
@keyframes top-progress-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
