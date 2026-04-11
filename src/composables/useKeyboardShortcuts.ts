import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcutHandlers {
  /** Fired on Cmd/Ctrl+N. */
  onNewNote: () => void
  /** Fired on Cmd/Ctrl+Backspace (when a note is selected and we're in the notes view). */
  onTrashSelected: () => void
  /** Fired on Escape. */
  onDeselect: () => void
}

/**
 * Binds the global keyboard shortcuts used by NotesApp. Typing inside an
 * input/textarea/contenteditable never triggers a shortcut, matching the
 * previous inline behaviour.
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    const mod = event.ctrlKey || event.metaKey

    if (mod && event.key === 'n') {
      event.preventDefault()
      handlers.onNewNote()
      return
    }

    if (mod && event.key === 'Backspace') {
      event.preventDefault()
      handlers.onTrashSelected()
      return
    }

    if (event.key === 'Escape') {
      handlers.onDeselect()
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
