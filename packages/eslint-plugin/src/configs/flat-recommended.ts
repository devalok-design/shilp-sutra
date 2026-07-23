/**
 * `flat/recommended` preset — ESLint 9+ flat config shape.
 *
 * Use in `eslint.config.{js,ts,mjs}`:
 *
 *   import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'
 *   export default [shilpSutra.configs['flat/recommended']]
 */
import { rules } from '../rules'

const meta = { name: '@devalok/eslint-plugin-shilp-sutra' }

const config = {
  plugins: {
    'shilp-sutra': { meta, rules },
  },
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
    'shilp-sutra/no-bare-shadow': 'warn',
    'shilp-sutra/require-mutation-annotation': 'warn',
    'shilp-sutra/toast-object-syntax': 'warn',
  } as const,
}

export default config
