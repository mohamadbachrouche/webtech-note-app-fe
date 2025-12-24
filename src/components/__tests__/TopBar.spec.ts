import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopBar from '../TopBar.vue'

describe('TopBar.vue', () => {
  it('renders the app title', () => {
    const wrapper = mount(TopBar, {
      props: { currentTheme: 'blue' }
    })
    expect(wrapper.text()).toContain('Notes')
  })

  it('emits "toggle-theme" when the theme button is clicked', async () => {
    const wrapper = mount(TopBar, {
      props: { currentTheme: 'blue' }
    })

    // Find the button by ID (defined in your TopBar.vue)
    const themeBtn = wrapper.find('#theme-toggle')

    // Simulate a click
    await themeBtn.trigger('click')

    // Check if the event was actually emitted
    expect(wrapper.emitted()).toHaveProperty('toggle-theme')
    expect(wrapper.emitted('toggle-theme')).toHaveLength(1)
  })

  it('shows color menu when palette button is clicked and emits "change-background" when a color is selected', async () => {
    const wrapper = mount(TopBar, {
      props: { currentTheme: 'blue' }
    })

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
    await swatches[0]!.trigger('click')

    // Check if event was emitted
    expect(wrapper.emitted()).toHaveProperty('change-background')
    expect(wrapper.emitted('change-background')![0]).toEqual(['blue'])

    // Check if menu is hidden after selection
    expect(wrapper.find('.color-menu-dropdown').exists()).toBe(false)
  })

  it('applies "active" class to the swatch matching currentTheme prop', async () => {
    const wrapper = mount(TopBar, {
      props: {
        currentTheme: 'yellow'
      }
    })

    // Open the menu
    const paletteBtn = wrapper.find('button[title="Change Background"]')
    await paletteBtn.trigger('click')

    const swatches = wrapper.findAll('.color-swatch')
    // swatches[0] is blue, [1] is yellow, [2] is green
    expect(swatches[0]!.classes()).not.toContain('active')
    expect(swatches[1]!.classes()).toContain('active')
    expect(swatches[2]!.classes()).not.toContain('active')
  })
})
