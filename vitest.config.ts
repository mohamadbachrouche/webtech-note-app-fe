import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

// Resolve Vite config in test mode in case vite.config exports an async factory
const resolvedViteConfig =
  typeof viteConfig === 'function'
    ? await viteConfig({ mode: 'test', command: 'serve' } as any)
    : viteConfig

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
