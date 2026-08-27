/**
 * `migration` preset — only the rules that codemod past breaking changes.
 * Recommended workflow: install the plugin, set this preset,
 * `eslint --fix src/`, review the diff, ship the upgrade.
 *
 * Excludes warn-only advisory rules like `no-bare-shadow` and
 * `toast-object-syntax` so the migration pass doesn't touch stylistic
 * surfaces.
 */
const config = {
  plugins: ['shilp-sutra'],
  rules: {
    'shilp-sutra/no-deprecated-button-variant': 'error',
    'shilp-sutra/no-deprecated-surface-token': 'error',
    'shilp-sutra/no-renamed-surface-token': 'error',
    'shilp-sutra/no-deprecated-shadow-token': 'error',
    'shilp-sutra/no-deprecated-chip': 'error',
    'shilp-sutra/no-tailwind-config-preset': 'error',
    'shilp-sutra/prefer-per-component-import': 'error',
    'shilp-sutra/use-toast-deprecated': 'error',
    'shilp-sutra/no-bg-gradient-to': 'error',
    'shilp-sutra/no-css-var-bracket': 'error',
    'shilp-sutra/no-iconbutton-children': 'error',
  },
}

export default config
