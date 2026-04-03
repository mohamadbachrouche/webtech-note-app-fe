import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import type { ConfigEnv } from 'vite'
import viteConfig from './vite.config'

// Resolve Vite config in test mode in case vite.config exports an async factory
const testConfigEnv: ConfigEnv = { mode: 'test', command: 'serve' }
const resolvedViteConfig =
  typeof viteConfig === 'function' ? await viteConfig(testConfigEnv) : viteConfig

export default mergeConfig(
  resolvedViteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
