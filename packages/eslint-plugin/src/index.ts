/**
 * @devalok/eslint-plugin-shilp-sutra
 *
 * ESLint rules for the shilp-sutra design system. Catches deprecated APIs,
 * peer-cliff barrel imports, TW3-era class names, and ships autofixes that
 * turn migration entries from MIGRATION.md into one-command codemods.
 *
 * Install:
 *   pnpm add -D @devalok/eslint-plugin-shilp-sutra
 *
 * Use (flat config):
 *   import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'
 *   export default [shilpSutra.configs['flat/recommended']]
 *
 * Use (legacy .eslintrc):
 *   { extends: ['plugin:@devalok/shilp-sutra/recommended'] }
 *
 * Three presets — see docs/README.md for the full list.
 */
import flatMigration from './configs/flat-migration'
import flatRecommended from './configs/flat-recommended'
import flatStrict from './configs/flat-strict'
import legacyMigration from './configs/legacy-migration'
import legacyRecommended from './configs/legacy-recommended'
import legacyStrict from './configs/legacy-strict'
import { rules } from './rules'

const pkg = { name: '@devalok/eslint-plugin-shilp-sutra', version: '0.1.0' }

const plugin = {
  meta: pkg,
  rules,
  configs: {
    // Legacy (.eslintrc / eslintrc.cjs)
    recommended: legacyRecommended,
    strict: legacyStrict,
    migration: legacyMigration,
    // Flat config (ESLint 9+)
    'flat/recommended': flatRecommended,
    'flat/strict': flatStrict,
    'flat/migration': flatMigration,
  },
}

export default plugin
export { plugin }
