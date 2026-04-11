import { ref } from 'vue'
import { BACKGROUND_THEMES } from '@/constants'

/**
 * Dark-mode + background-theme state with localStorage persistence.
 * Previously these lived directly inside NotesApp.vue; extracting them
 * makes the view thin and the logic unit-testable in isolation.
 */
export function useTheme() {
  const isDarkMode = ref(false)
  const currentThemeColor = ref<keyof typeof BACKGROUND_THEMES>('green')

  function setDarkMode(dark: boolean) {
    isDarkMode.value = dark
    localStorage.setItem('darkMode', dark ? 'true' : 'false')
  }

  function toggleDarkMode() {
    setDarkMode(!isDarkMode.value)
  }

  function setBackground(color: string) {
    if (color in BACKGROUND_THEMES) {
      currentThemeColor.value = color as keyof typeof BACKGROUND_THEMES
      localStorage.setItem('appBackground', color)
    }
  }

  function loadFromStorage() {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }

    const savedBg = localStorage.getItem('appBackground')
    if (savedBg) {
      setBackground(savedBg)
    }
  }

  function preloadBackgroundImages() {
    Object.values(BACKGROUND_THEMES).forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }

  return {
    isDarkMode,
    currentThemeColor,
    setDarkMode,
    toggleDarkMode,
    setBackground,
    loadFromStorage,
    preloadBackgroundImages,
  }
}
