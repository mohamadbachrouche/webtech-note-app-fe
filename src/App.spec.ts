import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App.vue'
import { nextTick } from 'vue'

// Mock ApiService
vi.mock('./services/ApiService', () => ({
  getActiveNotes: vi.fn(() => Promise.resolve({ data: [] })),
  getTrashedNotes: vi.fn(() => Promise.resolve({ data: [] })),
}))

describe('App.vue Background Theme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('initializes with default blue theme', async () => {
    const wrapper = mount(App)
    await nextTick()
    const bgImage = wrapper.find('.bg-image')
    expect(bgImage.attributes('style')).toContain('https://images.unsplash.com/photo-1519681393784-d120267933ba')
  })

  it('loads saved theme from localStorage on mount', async () => {
    localStorage.setItem('appBackground', 'yellow')
    const wrapper = mount(App)

    await flushPromises()
    await nextTick()

    const bgImage = wrapper.find('.bg-image')
    expect(bgImage.attributes('style')).toContain('https://wallpapercave.com/wp/wp11276048.jpg')
  })
})
