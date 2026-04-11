<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/components/TopBar.vue'
import Sidebar from '@/components/SideBar.vue'
import NoteEditor from '@/components/NoteEditor.vue'
import ToastHost from '@/components/ToastHost.vue'
import { BACKGROUND_THEMES } from '@/constants'
import { useNotes } from '@/composables/useNotes'
import { useTheme } from '@/composables/useTheme'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

// Note list + CRUD state.
const {
  selectedNoteId,
  currentView,
  isInitialLoad,
  isLoading,
  pinnedNotes,
  regularNotes,
  trashedNotes,
  selectedNote,
  loadNotes,
  selectNote,
  deselectNote,
  switchView,
  addNewNote,
  updateNote,
  moveToTrash,
  restoreNote,
  deletePermanently,
} = useNotes()

// Dark mode + background theme.
const {
  isDarkMode,
  currentThemeColor,
  toggleDarkMode,
  setBackground,
  loadFromStorage: loadThemeFromStorage,
  preloadBackgroundImages,
} = useTheme()

// Sidebar state is trivial enough to stay local.
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value ? 'true' : 'false')
}

// Global keyboard shortcuts: Cmd/Ctrl+N, Cmd/Ctrl+Backspace, Escape.
useKeyboardShortcuts({
  onNewNote: () => addNewNote(),
  onTrashSelected: () => {
    if (selectedNoteId.value !== null && currentView.value === 'notes') {
      moveToTrash(selectedNoteId.value)
    }
  },
  onDeselect: () => deselectNote(),
})

const modKey = computed(() => (navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'))

onMounted(async () => {
  loadThemeFromStorage()
  preloadBackgroundImages()

  const savedSidebar = localStorage.getItem('sidebarCollapsed')
  if (savedSidebar === 'true') {
    sidebarCollapsed.value = true
  }

  await loadNotes()
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
      @toggle-theme="toggleDarkMode"
      @change-background="setBackground"
    />
    <div v-if="!isInitialLoad && isLoading" class="top-progress" role="status" aria-live="polite">
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
        :trashed-notes="trashedNotes"
        :current-view="currentView"
        @select-note="selectNote"
        @add-new-note="addNewNote"
        @switch-view="switchView"
      />
      <NoteEditor
        :selected-note="selectedNote"
        @update-note="updateNote"
        @move-to-trash="moveToTrash"
        @restore-note="restoreNote"
        @delete-permanently="deletePermanently"
        @back="deselectNote"
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
