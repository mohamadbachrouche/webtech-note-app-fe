import { ref, watch, computed, onBeforeUnmount, type Ref } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { Note } from '@/types'
import { useDebouncedFn } from '@/composables/useDebouncedFn'

/**
 * Only these protocols are allowed as link targets. Anything else (most
 * notably `javascript:`) is rejected in normalizeLinkUrl.
 */
const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * Parse and sanitise a user-supplied link URL. Returns the canonical
 * form on success or `null` if the URL is empty, malformed, or uses
 * a disallowed protocol. Bare hostnames (e.g. `example.com`) are
 * assumed to mean `https://example.com`.
 */
export function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

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

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export interface UseNoteEditorOptions {
  selectedNote: Ref<Note | null>
  onUpdateNote: (note: Note) => void
}

/**
 * Tiptap lifecycle, content sync, debounced save, title validation,
 * link handling, and derived metadata formatters, all previously
 * inlined in NoteEditor.vue. Returning refs + handlers keeps the
 * view layer thin and makes this logic unit-testable in isolation.
 *
 * The caller passes an `onUpdateNote` callback so the composable stays
 * decoupled from Vue's emit system — tests can supply a spy directly.
 */
export function useNoteEditor({ selectedNote, onUpdateNote }: UseNoteEditorOptions) {
  const editableTitle = ref('')
  const titleError = ref('')

  /**
   * Debounced emitter for note updates. Tiptap's onUpdate fires on every
   * keystroke; without debouncing that produces one PUT per character.
   * We coalesce to a single emit ~500 ms after the user stops typing and
   * flush explicitly when switching notes or unmounting so nothing is lost.
   */
  const debouncedUpdate = useDebouncedFn((note: Note) => {
    onUpdateNote(note)
  }, 500)

  function buildPayload(): Note | null {
    if (!selectedNote.value || selectedNote.value.inTrash) return null
    return {
      ...selectedNote.value,
      title: editableTitle.value,
      content: editor.value?.getHTML() || '',
    }
  }

  function emitUpdate(immediate = false) {
    const payload = buildPayload()
    if (!payload) return
    if (immediate) {
      debouncedUpdate.cancel()
      onUpdateNote(payload)
    } else {
      debouncedUpdate(payload)
    }
  }

  const editor = useEditor({
    content: selectedNote.value?.content || '',
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
    onUpdate: () => {
      emitUpdate()
    },
  })

  watch(
    () => selectedNote.value,
    (newNote, oldNote) => {
      if (newNote) {
        const isSameNote = oldNote && oldNote.id === newNote.id

        // Only refresh the editor when we're switching to a different
        // note. Ignoring same-id updates prevents the async "echo" from
        // the server reverting local edits or jumping the cursor while
        // the user is typing.
        if (!isSameNote) {
          debouncedUpdate.flush()
          editableTitle.value = newNote.title
          titleError.value = ''
          editor.value?.commands.setContent(newNote.content)
        }
      } else {
        debouncedUpdate.flush()
        editableTitle.value = ''
        editor.value?.commands.setContent('')
      }
    },
  )

  function validateTitle(): boolean {
    if (!editableTitle.value.trim()) {
      titleError.value = 'Title cannot be empty'
      return false
    }
    titleError.value = ''
    return true
  }

  function onTitleChange() {
    if (!selectedNote.value || selectedNote.value.inTrash) return
    if (!validateTitle()) return
    emitUpdate()
  }

  function setLink() {
    const previousUrl = editor.value?.getAttributes('link').href
    const raw = window.prompt('URL', previousUrl)

    if (raw === null) return

    if (raw.trim() === '') {
      editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const safeUrl = normalizeLinkUrl(raw)
    if (!safeUrl) {
      window.alert('Invalid URL. Only http, https, and mailto links are allowed.')
      return
    }

    // Let Tiptap build the anchor node; never string-concatenate HTML.
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

  const formattedCreatedAt = computed(() => {
    if (!selectedNote.value) return ''
    return dateFormatter.format(new Date(selectedNote.value.createdAt))
  })

  const formattedLastModified = computed(() => {
    if (!selectedNote.value) return ''
    return dateFormatter.format(new Date(selectedNote.value.lastModified))
  })

  /** Flush any pending debounced edit right now. Used by callers before
   *  discrete actions like pin/color change, or when tearing down. */
  function flushPendingEdit() {
    debouncedUpdate.flush()
  }

  onBeforeUnmount(() => {
    // Make sure any pending debounced edit lands before the editor is
    // destroyed; otherwise the last few keystrokes would be lost.
    debouncedUpdate.flush()
    editor.value?.destroy()
  })

  return {
    editor,
    editableTitle,
    titleError,
    formattedCreatedAt,
    formattedLastModified,
    onTitleChange,
    setLink,
    flushPendingEdit,
  }
}
