import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // These files intentionally colocate small helpers/types with the
      // component that owns them (matches the original app's structure).
      'react-refresh/only-export-components': 'warn',
      // One-time init effects that synchronously mark "ready" (no async work
      // to await) are fine; not worth restructuring for this project's scale.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
)
