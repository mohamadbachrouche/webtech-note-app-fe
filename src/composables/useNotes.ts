import { ref, computed } from 'vue'
import type { Note } from '@/types'
import * as ApiService from '@/services/ApiService'
import { useToast } from '@/composables/useToast'

export type NotesView = 'notes' | 'trash'

/**
 * Centralises the note list + CRUD state that used to live inside
 * NotesApp.vue. Returned refs are plain `Ref`s so templates can bind
 * directly; the CRUD helpers already handle error toasts internally.
 *
 * Notes race-condition fix: loadNotes() is guarded by a monotonic
 * sequence counter so a late response from a previously-toggled view
 * can't overwrite the current one.
 */
export function useNotes() {
  const toast = useToast()

  const allNotes = ref<Note[]>([])
  const selectedNoteId = ref<number | null>(null)
  const currentView = ref<NotesView>('notes')
  const isInitialLoad = ref(true)
  const isLoading = ref(false)

  let loadSequence = 0

  const pinnedNotes = computed(() => allNotes.value.filter((n) => n.pinned && !n.inTrash))
  const regularNotes = computed(() => allNotes.value.filter((n) => !n.pinned && !n.inTrash))
  const trashedNotes = computed(() => allNotes.value.filter((n) => n.inTrash))
  const selectedNote = computed(
    () => allNotes.value.find((n) => n.id === selectedNoteId.value) || null,
  )

  async function loadNotes() {
    const seq = ++loadSequence
    isLoading.value = true
    try {
      const response =
        currentView.value === 'notes'
          ? await ApiService.getActiveNotes()
          : await ApiService.getTrashedNotes()
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

  function selectNote(id: number) {
    selectedNoteId.value = id
  }

  function deselectNote() {
    selectedNoteId.value = null
  }

  function switchView(view: NotesView) {
    currentView.value = view
    selectedNoteId.value = null
    loadNotes()
  }

  async function addNewNote() {
    const newNoteData = { title: 'New Note', content: '', color: '', tags: '' }
    try {
      const response = await ApiService.createNote(newNoteData)
      await loadNotes()
      selectedNoteId.value = response.data.id
    } catch (error) {
      console.error('Failed to create note:', error)
      toast.error('Failed to create note. Please try again.')
    }
  }

  async function updateNote(noteToUpdate: Note) {
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

  async function moveToTrash(noteId: number) {
    try {
      await ApiService.moveToTrash(noteId)
      selectedNoteId.value = null
      await loadNotes()
    } catch (error) {
      console.error('Failed to move note to trash:', error)
      toast.error('Failed to move note to trash.')
    }
  }

  async function restoreNote(noteId: number) {
    try {
      await ApiService.restoreNote(noteId)
      selectedNoteId.value = null
      await loadNotes()
    } catch (error) {
      console.error('Failed to restore note:', error)
      toast.error('Failed to restore note.')
    }
  }

  async function deletePermanently(noteId: number) {
    try {
      await ApiService.deleteNotePermanently(noteId)
      selectedNoteId.value = null
      await loadNotes()
    } catch (error) {
      console.error('Failed to permanently delete note:', error)
      toast.error('Failed to delete note.')
    }
  }

  return {
    // state
    allNotes,
    selectedNoteId,
    currentView,
    isInitialLoad,
    isLoading,
    // derived
    pinnedNotes,
    regularNotes,
    trashedNotes,
    selectedNote,
    // actions
    loadNotes,
    selectNote,
    deselectNote,
    switchView,
    addNewNote,
    updateNote,
    moveToTrash,
    restoreNote,
    deletePermanently,
  }
}
