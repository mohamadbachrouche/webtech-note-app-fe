import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// Only include Vue DevTools in development to avoid Node 25.2+ localStorage errors during production builds
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [vue()]

  if (mode === 'development') {
    // Dynamic import prevents evaluating the plugin in production mode
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.push(vueDevTools() as PluginOption)
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
