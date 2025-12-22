import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopBar from '../TopBar.vue'

describe('TopBar.vue', () => {
  it('renders the app title', () => {
    const wrapper = mount(TopBar)
    expect(wrapper.text()).toContain('Notes')
  })

  it('emits "toggle-theme" when the theme button is clicked', async () => {
    const wrapper = mount(TopBar)

    // Find the button by ID (defined in your TopBar.vue)
    const themeBtn = wrapper.find('#theme-toggle')

    // Simulate a click
    await themeBtn.trigger('click')

    // Check if the event was actually emitted
    expect(wrapper.emitted()).toHaveProperty('toggle-theme')
    expect(wrapper.emitted('toggle-theme')).toHaveLength(1)
  })
})
