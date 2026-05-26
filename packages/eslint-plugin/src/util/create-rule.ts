import { ESLintUtils } from '@typescript-eslint/utils'

/**
 * Categories — drive preset membership via `scripts/generate-configs.mjs`.
 *
 * - `migration`: covers a past breaking change in `@devalok/shilp-sutra`.
 *   Always autofixable. Goes in the `migration` preset + `strict`.
 * - `recommended`: catches a common foot-gun (e.g. bare `shadow` class in TW4).
 *   Usually autofixable, sometimes warn-only. Goes in `recommended` + `strict`.
 * - `stylistic`: opinion-driven (e.g. soft over outline). Suggestion-only,
 *   never autofixes. Goes in `strict` only — opt-in via project config.
 */
export type Category = 'migration' | 'recommended' | 'stylistic'

export interface ShilpSutraRuleDocs {
  description: string
  /** Default severity in the `recommended` preset. `false` = not in preset. */
  recommended?: 'error' | 'warn' | false
  /** Which preset this rule belongs to. */
  category: Category
  /**
   * The `@devalok/shilp-sutra` version this rule first applies to. Surfaced
   * in docs; let consumers correlate rule output with their installed DS
   * version.
   */
  appliesFrom?: string
}

export const createRule = ESLintUtils.RuleCreator<ShilpSutraRuleDocs>(
  (name) =>
    `https://github.com/devalok-design/shilp-sutra/blob/main/packages/eslint-plugin/docs/rules/${name}.md`,
)
