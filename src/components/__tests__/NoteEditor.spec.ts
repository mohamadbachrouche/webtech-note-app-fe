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
})
