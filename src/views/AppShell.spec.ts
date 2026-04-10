import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AppShell from './AppShell.vue'
import { nextTick } from 'vue'

// Mock ApiService
vi.mock('@/services/ApiService', () => ({
  getActiveNotes: vi.fn(() => Promise.resolve({ data: [] })),
  getTrashedNotes: vi.fn(() => Promise.resolve({ data: [] })),
}))

// Mock AuthService so logout doesn't trigger router navigation during tests
vi.mock('@/services/AuthService', () => ({
  logout: vi.fn(),
}))

describe('AppShell.vue Background Theme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
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

  it('initializes with default green theme', async () => {
    const wrapper = mount(AppShell)
    await nextTick()
    const bgImage = wrapper.find('.bg-image')
    // Green theme URL from constants.ts
    expect(bgImage.attributes('style')).toContain(
      'https://mcdn.wallpapersafari.com/medium/34/82/0OWTQ5.jpg',
    )
  })

  it('loads saved theme from localStorage on mount', async () => {
    localStorage.setItem('appBackground', 'yellow')
    const wrapper = mount(AppShell)

    await flushPromises()
    await nextTick()

    const bgImage = wrapper.find('.bg-image')
    expect(bgImage.attributes('style')).toContain('https://wallpapercave.com/wp/wp11276048.jpg')
  })
})
