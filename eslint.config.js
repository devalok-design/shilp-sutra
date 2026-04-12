import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      'node_modules/**',
      '**/*.stories.tsx',
      '.storybook/**',
      'packages/core/src/primitives/**',
    ],
  },

  // ── Base TypeScript rules ───────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Project-wide settings for TS/TSX source ─────────────────────────
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ── TypeScript ────────────────────────────────────────────────
      // Warn instead of error — existing codebase has many `any` usages
      '@typescript-eslint/no-explicit-any': 'warn',

      // Allow unused vars when prefixed with underscore (common pattern)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Allow empty object types (used heavily for component prop interfaces)
      '@typescript-eslint/no-empty-object-type': 'off',

      // Allow require imports (some config files use them)
      '@typescript-eslint/no-require-imports': 'off',

      // ── React Hooks (classic rules only, v7 compiler rules are too strict) ─
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── JSX Accessibility (recommended rules at error level) ─
      ...jsxA11y.flatConfigs.recommended.rules,
      // Downgrade rules with pre-existing violations in karm/ to warn
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',

      // ── Import ordering ────────────────────────────────────────────
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      // ── General ───────────────────────────────────────────────────
      'prefer-const': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── Module boundary enforcement ─────────────────────────────────
  // ui/ cannot import from composed/, shell/, or karm/
  {
    files: ['packages/core/src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/composed/*', '**/composed'], message: 'ui/ must not import from composed/' },
            { group: ['**/shell/*', '**/shell'], message: 'ui/ must not import from shell/' },
            { group: ['**/karm/*', '**/karm'], message: 'ui/ must not import from karm/' },
          ],
        },
      ],
    },
  },
  // composed/ cannot import from shell/ or karm/
  {
    files: ['packages/core/src/composed/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/shell/*', '**/shell'], message: 'composed/ must not import from shell/' },
            { group: ['**/karm/*', '**/karm'], message: 'composed/ must not import from karm/' },
          ],
        },
      ],
    },
  },
  // shell/ cannot import from karm/
  {
    files: ['packages/core/src/shell/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/karm/*', '**/karm'], message: 'shell/ must not import from karm/' },
          ],
        },
      ],
    },
  },


)
