import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteEditor from '../NoteEditor.vue'
import type { Note } from '@/types'
import { nextTick } from 'vue'

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  title: 'Test Note',
  content: 'Test Content',
  tags: '',
  pinned: false,
  inTrash: false,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  ...overrides,
})

describe('NoteEditor.vue', () => {
  it('renders the empty state when no note is selected', () => {
    const wrapper = mount(NoteEditor, {
      props: { selectedNote: null }
    })
    expect(wrapper.find('#empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No Note Selected')
  })

  it('renders the editor when a note is selected', async () => {
    const note = createMockNote()
    const wrapper = mount(NoteEditor, {
      props: { selectedNote: null }
    })

    await wrapper.setProps({ selectedNote: note })
    await nextTick()

    expect(wrapper.find('.note-editor').exists()).toBe(true)
    const titleInput = wrapper.find('.note-title-input')
    expect(titleInput.exists()).toBe(true)
    expect((titleInput.element as HTMLInputElement).value).toBe('Test Note')

    // Check for Tiptap editor
    expect(wrapper.find('.ProseMirror').exists()).toBe(true)
    expect(wrapper.find('.ProseMirror').text()).toContain('Test Content')
  })

  it('renders trash options when a note is in trash', async () => {
    const note = createMockNote({ inTrash: true })
    const wrapper = mount(NoteEditor, {
      props: { selectedNote: null }
    })

    await wrapper.setProps({ selectedNote: note })
    await nextTick()

    expect(wrapper.find('#trash-options').exists()).toBe(true)
    expect(wrapper.text()).toContain('Restore Note')
    expect(wrapper.text()).toContain('Delete Permanently')
  })

  it('ignores content updates from props for the same note to prevent typing glitches', async () => {
    const note = createMockNote({ id: 1, content: 'Initial Content' })
    const wrapper = mount(NoteEditor, {
      props: { selectedNote: null }
    })

    // 1. Load the note
    await wrapper.setProps({ selectedNote: note })
    await nextTick()
    expect(wrapper.find('.ProseMirror').text()).toContain('Initial Content')

    // 2. Simulare typing (local change) - logic is internal to Tiptap,
    // but here we simulate an incoming prop update that might happen asynchronously
    // e.g. "Initial Content" -> API -> "Initial Content" (delayed)
    // while user typed "Initial Content Updated"

    // We update prop with NEW content but SAME ID
    const updatedNote = { ...note, content: 'External Update' }
    await wrapper.setProps({ selectedNote: updatedNote })
    await nextTick()

    // 3. Expect editor content to REMAIN 'Initial Content' because ID is same
    // (The watcher should ignore the update)
    expect(wrapper.find('.ProseMirror').text()).toContain('Initial Content')
    expect(wrapper.find('.ProseMirror').text()).not.toContain('External Update')
  })
})
