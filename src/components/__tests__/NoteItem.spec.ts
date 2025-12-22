import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteItem from '../NoteItem.vue'
import type { Note } from '@/types'

// Helper to create a dummy note for testing
const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  title: 'Test Note',
  content: '<p>This is some <strong>bold</strong> content.</p>',
  tags: '',
  pinned: false,
  inTrash: false,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  ...overrides,
})

describe('NoteItem.vue', () => {
  it('renders the note title correctly', () => {
    const note = createMockNote({ title: 'My Awesome Note' })
    const wrapper = mount(NoteItem, {
      props: { note },
    })
    expect(wrapper.text()).toContain('My Awesome Note')
  })

  it('renders a plain text preview (strips HTML)', () => {
    const note = createMockNote({
      content: '<h1>Hello</h1><p>World</p>',
    })
    const wrapper = mount(NoteItem, {
      props: { note },
    })
    // Expect "Hello World" or "HelloWorld" depending on rendering,
    // but definitely NOT "<h1>"
    expect(wrapper.text()).not.toContain('<h1>')
    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.text()).toContain('World')
  })

  it('shows the pin icon when the note is pinned', () => {
    const note = createMockNote({ pinned: true })
    const wrapper = mount(NoteItem, {
      props: { note },
    })
    // Check for the font-awesome icon class
    const pinIcon = wrapper.find('.fa-thumbtack')
    expect(pinIcon.exists()).toBe(true)
  })

  it('does NOT show the pin icon when the note is unpinned', () => {
    const note = createMockNote({ pinned: false })
    const wrapper = mount(NoteItem, {
      props: { note },
    })
    const pinIcon = wrapper.find('.fa-thumbtack')
    expect(pinIcon.exists()).toBe(false)
  })

  it('renders the time if the note was modified today', () => {
    // Create a date for "Today"
    const today = new Date()
    const note = createMockNote({ lastModified: today.toISOString() })

    const wrapper = mount(NoteItem, { props: { note } })

    // We expect a time format (e.g., 14:30), not a full date
    // This is a simple check to ensure it contains a colon
    expect(wrapper.find('.note-item-date').text()).toMatch(/\d{2}:\d{2}/)
  })
})
