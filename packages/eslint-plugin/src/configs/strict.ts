/**
 * `strict` preset — everything at `error`. Opt-in.
 */
const config = {
  plugins: ['shilp-sutra'],
  rules: {
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
    'shilp-sutra/no-bare-shadow': 'error',
    'shilp-sutra/require-mutation-annotation': 'error',
    'shilp-sutra/require-progress-label': 'error',
    'shilp-sutra/toast-object-syntax': 'error',
  },
}

export default config
