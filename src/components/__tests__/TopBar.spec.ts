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

  it('shows color menu when palette button is clicked and emits "change-background" when a color is selected', async () => {
    const wrapper = mount(TopBar)

    // Find the palette button
    const paletteBtn = wrapper.find('button[title="Change Background"]')
    await paletteBtn.trigger('click')

    // Check if color menu is shown
    const colorMenu = wrapper.find('.color-menu-dropdown')
    expect(colorMenu.exists()).toBe(true)

    // Find all color swatches
    const swatches = colorMenu.findAll('.color-swatch')
    expect(swatches.length).toBe(3)

    // Click the first one (blue)
    await swatches[0].trigger('click')

    // Check if event was emitted
    expect(wrapper.emitted()).toHaveProperty('change-background')
    expect(wrapper.emitted('change-background')![0]).toEqual(['blue'])

    // Check if menu is hidden after selection
    expect(wrapper.find('.color-menu-dropdown').exists()).toBe(false)
  })
})
