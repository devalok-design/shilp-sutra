/**
 * `strict` preset — everything at `error`. Opt-in.
 *
 * "Everything" is load-bearing: this list must contain every key in
 * `src/rules/index.ts`. It did not between 0.60.0 and this release —
 * `no-ungated-hover-over-selection` was registered, documented and in no
 * preset at all, so the one rule that catches an invisible selection state
 * was dead code for every consumer (#315). When you add a rule, add it here
 * first; `recommended` is the judgement call, `strict` is not.
 */
const config = {
  plugins: ['shilp-sutra'],
  rules: {
    'shilp-sutra/no-deprecated-button-variant': 'error',
    'shilp-sutra/no-deprecated-surface-token': 'error',
    'shilp-sutra/no-renamed-surface-token': 'error',
    'shilp-sutra/no-subtle-text-on-sunken': 'error',
    'shilp-sutra/no-deprecated-shadow-token': 'error',
    'shilp-sutra/no-deprecated-chip': 'error',
    'shilp-sutra/no-tailwind-config-preset': 'error',
    'shilp-sutra/prefer-per-component-import': 'error',
    'shilp-sutra/use-toast-deprecated': 'error',
    'shilp-sutra/no-bg-gradient-to': 'error',
    'shilp-sutra/no-css-var-bracket': 'error',
    'shilp-sutra/no-iconbutton-children': 'error',
    'shilp-sutra/no-bare-shadow': 'error',
    'shilp-sutra/no-ungated-hover-over-selection': 'error',
    'shilp-sutra/require-mutation-annotation': 'error',
    'shilp-sutra/require-progress-label': 'error',
    'shilp-sutra/toast-object-syntax': 'error',
  },
}

export default config
