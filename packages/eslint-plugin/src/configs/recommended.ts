/**
 * `recommended` preset — legacy .eslintrc shape.
 *
 * All migration rules at `error` (they autofix past breaking changes;
 * leaving them at warn is just deferring the cost). The recommended
 * advisory rules (no-bare-shadow, toast-object-syntax) at `warn`.
 *
 * Stylistic rules are NOT included in `recommended` — see `strict`.
 *
 * Use with `extends: ['plugin:@devalok/shilp-sutra/recommended']` in
 * a legacy `.eslintrc.{json,js,cjs}` file.
 */
const config = {
  plugins: ['shilp-sutra'],
  rules: {
    // Migration (autofix)
    'shilp-sutra/no-deprecated-button-variant': 'error',
    'shilp-sutra/no-deprecated-surface-token': 'error',
    'shilp-sutra/no-deprecated-shadow-token': 'error',
    'shilp-sutra/no-deprecated-chip': 'error',
    'shilp-sutra/no-tailwind-config-preset': 'error',
    'shilp-sutra/prefer-per-component-import': 'error',
    'shilp-sutra/use-toast-deprecated': 'error',
    'shilp-sutra/no-bg-gradient-to': 'error',
    'shilp-sutra/no-css-var-bracket': 'error',
    'shilp-sutra/no-iconbutton-children': 'error',
    // Recommended (warn / advisory)
    'shilp-sutra/no-bare-shadow': 'warn',
    'shilp-sutra/toast-object-syntax': 'warn',
  },
}

export default config
