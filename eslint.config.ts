import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  // Upgraded from 'flat/essential' to 'flat/recommended': enforces
  // ordering + self-closing + multi-word component names etc. We opt out
  // of the multi-word rule for a handful of intentionally-named roots.
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/project-rules',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      // App-level components like App.vue, NotesApp.vue, LoginPage.vue
      // etc. are routes/roots that conventionally use single-word or
      // suffixed names. Disable the rule globally; the recommended
      // config's other safeguards still apply.
      'vue/multi-word-component-names': 'off',
      // Path alias convention: cross-directory imports must use the
      // `@/` alias instead of `../` relatives. Same-directory `./`
      // imports remain fine. Test files are exempt below so specs can
      // still reach the module-under-test via `../Component.vue`.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*'],
              message: 'Use the "@/" alias instead of "../" for cross-directory imports.',
            },
          ],
        },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*', 'src/**/*.spec.ts'],
    rules: {
      // Specs conventionally reach their module-under-test via `../Foo.vue`.
      'no-restricted-imports': 'off',
    },
  },
  skipFormatting,
)
