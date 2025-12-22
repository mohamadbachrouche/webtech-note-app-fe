import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBar from '../SideBar.vue'
import type { Note } from '@/types'

// Reusing our helper from NoteItem.spec.ts
const createMockNote = (id: number, title: string, content: string = ''): Note => ({
  id,
  title,
  content,
  tags: '',
  pinned: false,
  inTrash: false,
  // Using generic ISO strings for dates
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
})

describe('SideBar.vue', () => {
  const notes = [
    createMockNote(1, 'Shopping List'),
    createMockNote(2, 'Meeting Notes'),
    createMockNote(3, 'Ideas'),
  ]
  const trashedNotes = [createMockNote(4, 'Old Stuff')]

  it('renders the regular notes by default', () => {
    const wrapper = mount(SideBar, {
      props: {
        pinnedNotes: [],
        regularNotes: notes,
        trashedNotes: [],
        currentView: 'notes',
      },
    })

    // It should render 3 note items
    expect(wrapper.findAll('.note-item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Shopping List')
  })

  it('filters notes when searching', async () => {
    const wrapper = mount(SideBar, {
      props: {
        pinnedNotes: [],
        regularNotes: notes,
        trashedNotes: [],
        currentView: 'notes',
      },
    })

    // Find the search input
    const input = wrapper.find('#search-input')

    // Type "Shopping" into it
    await input.setValue('Shopping')

    // Now only 1 note should be visible
    const visibleNotes = wrapper.findAll('.note-item')
    expect(visibleNotes).toHaveLength(1)
    expect(wrapper.text()).toContain('Shopping List')
    expect(wrapper.text()).not.toContain('Meeting Notes')
  })

  it('emits "switch-view" when clicking the Trash tab', async () => {
    const wrapper = mount(SideBar, {
      props: {
        pinnedNotes: [],
        regularNotes: notes,
        trashedNotes: [],
        currentView: 'notes',
      },
    })

    // Find trash tab and click
    await wrapper.find('#trash-tab').trigger('click')

    // Check payload
    const emitted = wrapper.emitted('switch-view')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['trash'])
  })

  it('emits "add-new-note" when the add button is clicked', async () => {
    const wrapper = mount(SideBar, {
      props: {
        pinnedNotes: [],
        regularNotes: [],
        trashedNotes: [],
        currentView: 'notes',
      },
    })

    await wrapper.find('#add-btn').trigger('click')
    expect(wrapper.emitted('add-new-note')).toBeTruthy()
  })

  it('renders trashed notes when currentView is "trash"', () => {
    const wrapper = mount(SideBar, {
      props: {
        pinnedNotes: [],
        regularNotes: notes,
        trashedNotes: trashedNotes,
        currentView: 'trash', // <--- Key prop
      },
    })

    expect(wrapper.text()).toContain('Old Stuff')
    expect(wrapper.text()).not.toContain('Shopping List')
  })
})
