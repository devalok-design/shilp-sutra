import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
// Our own published plugin, applied to our own source. Resolved from
// packages/eslint-plugin/dist, so `lint` dependsOn its build in turbo.json.
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      'node_modules/**',
      // NOT ignoring *.stories.tsx globally: a global ignore cannot be
      // re-included by a later `files` block, and that is precisely how 24
      // deprecated surface tokens survived in stories. General rules are
      // switched off for stories further down; the token rules stay on.
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

  // ── Our own plugin, applied to our own source ───────────────────────
  //
  // We publish @devalok/eslint-plugin-shilp-sutra to catch exactly the class of
  // mistake that CLAUDE.md says rots silently here — and until now we did not
  // run it on ourselves. The four rules below mirror release-ONLY gates in
  // pre-publish-audit.mjs, which never execute on a PR. That gap cost a release
  // cycle twice: 0.52.0 (radius tokens) and 0.53.0 (`bg-surface-2` in the
  // schedule-view rebuild) both sailed through PR CI and failed post-merge.
  // Running them here moves the failure to the PR, where it is cheap.
  //
  // Deliberately NOT the `flat/recommended` preset. That preset is written for
  // CONSUMERS and several of its rules are wrong for this repo:
  //   - prefer-per-component-import targets consumer barrel imports of
  //     peer-cliff symbols; our source imports relatively.
  //   - no-deprecated-button-variant / no-deprecated-chip / use-toast-deprecated
  //     / no-iconbutton-children flag deprecated USAGE — we DEFINE those APIs,
  //     so our source legitimately references them.
  //   - no-tailwind-config-preset is about a consumer's tailwind config.
  //   - require-mutation-annotation is a taste rule, not a correctness gate.
  // Only the token/TW4-hygiene rules are true for both sides of the boundary.
  //
  // Note `**/*.stories.tsx` is globally ignored above, which matches the audit
  // gate's own story exclusion — so this does not tighten coverage beyond it.
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    plugins: { 'shilp-sutra': shilpSutra },
    rules: {
      // Numbered surface aliases don't invert for dark mode; the named tiers do.
      'shilp-sutra/no-deprecated-surface-token': 'error',
      // `surface-raised` -> `surface-panel`, and interaction states retarget to
      // `-panel-hover` rather than renaming (a hover painted with a container
      // value is invisible in light). See the 2026-08-26 surface audit, A1.
      'shilp-sutra/no-renamed-surface-token': 'error',
      'shilp-sutra/no-deprecated-shadow-token': 'error',
      // Bare `shadow` renders nothing in TW4.
      'shilp-sutra/no-bare-shadow': 'error',
      // `bg-gradient-to-*` is dead in TW4 — `bg-linear-to-*` replaced it.
      'shilp-sutra/no-bg-gradient-to': 'error',
      // `w-[--var]` is dead in TW4 — the shorthand is `w-(--var)`.
      'shilp-sutra/no-css-var-bracket': 'error',
    },
  },
  // Stories are globally ignored above, which is how 24 deprecated surface
  // tokens survived in them — and stories are precisely what consumers copy
  // from. Re-include them for the token rules only, so this stays a token gate
  // and not a general lint of demo code.
  {
    files: ['**/*.stories.tsx'],
    plugins: { 'shilp-sutra': shilpSutra },
    rules: {
      // Demo code gets latitude on general lint...
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-console': 'off',
      // ...but none at all on tokens, because stories are what people copy.
      'shilp-sutra/no-deprecated-surface-token': 'error',
      'shilp-sutra/no-renamed-surface-token': 'error',
      'shilp-sutra/no-deprecated-shadow-token': 'error',
      'shilp-sutra/no-bg-gradient-to': 'error',
      'shilp-sutra/no-css-var-bracket': 'error',
    },
  },
)
