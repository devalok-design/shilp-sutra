/**
 * Preset-membership guards.
 *
 * These exist because of #315: `no-ungated-hover-over-selection` was
 * implemented, registered, documented and shipped in ZERO of the six presets
 * for a whole release. Nothing failed — the rule simply never ran for any
 * consumer, and the one automated guard against an invisible selection state
 * was dead code. Every check here is cheap and would have caught it.
 */
import { describe, expect, it } from 'vitest'

import flatMigration from '../src/configs/flat-migration'
import flatRecommended from '../src/configs/flat-recommended'
import flatStrict from '../src/configs/flat-strict'
import migration from '../src/configs/migration'
import recommended from '../src/configs/recommended'
import strict from '../src/configs/strict'
import { rules } from '../src/rules'

const PREFIX = 'shilp-sutra/'
const allRuleNames = Object.keys(rules)

/** Rule names a preset configures, with the plugin prefix stripped. */
const named = (config: { rules: Record<string, string> }) =>
  Object.keys(config.rules).map((k) => k.slice(PREFIX.length))

const severities = (config: { rules: Record<string, string> }) => config.rules

describe('strict', () => {
  // The preset's own header promises "everything at `error`". A rule missing
  // from here is a rule that can never be enforced anywhere.
  it('configures every registered rule', () => {
    expect([...named(strict)].sort()).toEqual([...allRuleNames].sort())
  })

  it('sets every rule to error', () => {
    for (const [name, severity] of Object.entries(severities(strict))) {
      expect(severity, name).toBe('error')
    }
  })
})

describe('recommended', () => {
  // A rule can legitimately sit out of `recommended` (too noisy for a default),
  // but it must be a decision, not an omission — so assert the current set
  // exactly rather than asserting completeness.
  it('configures every registered rule', () => {
    expect([...named(recommended)].sort()).toEqual([...allRuleNames].sort())
  })

  it('keeps the advisory rules at warn', () => {
    expect(severities(recommended)['shilp-sutra/no-bare-shadow']).toBe('warn')
    expect(severities(recommended)['shilp-sutra/no-ungated-hover-over-selection']).toBe('warn')
    expect(severities(recommended)['shilp-sutra/toast-object-syntax']).toBe('warn')
  })
})

describe('migration', () => {
  // Migration is the post-upgrade codemod preset, so membership is exactly
  // `category: 'migration'` — the same rule `scripts/generate-configs.mjs`
  // applies. Asserting "is fixable" instead would be wrong:
  // `no-tailwind-config-preset` belongs here and has no autofix, because the
  // change it flags spans more than one file.
  //
  // This is the check that proves `no-ungated-hover-over-selection`'s absence
  // here is a category decision and not the #315 omission repeating.
  it('contains exactly the migration-category rules', () => {
    const expected = Object.entries(rules)
      .filter(([, r]) => (r.meta.docs as { category?: string }).category === 'migration')
      .map(([name]) => name)
    expect([...named(migration)].sort()).toEqual([...expected].sort())
  })
})

describe('flat twins', () => {
  // The legacy and flat shapes are hand-maintained in six separate files
  // (`scripts/generate-configs.mjs` is not wired up — read its header). They
  // drift silently, and a consumer on flat config gets a different rule set
  // than one on .eslintrc with no way to tell.
  it.each([
    ['recommended', recommended, flatRecommended],
    ['strict', strict, flatStrict],
    ['migration', migration, flatMigration],
  ])('flat/%s matches its legacy twin exactly', (_label, legacy, flat) => {
    expect(severities(flat as never)).toEqual(severities(legacy as never))
  })
})

describe('rule metadata', () => {
  // `scripts/generate-rule-docs.mjs` states each rule's preset membership from
  // `meta.docs.recommended`, NOT from the presets themselves. When the two
  // disagree, the published docs page confidently describes a severity the
  // consumer does not get.
  it('meta.docs.recommended matches the severity in the recommended preset', () => {
    for (const [name, rule] of Object.entries(rules)) {
      const declared = (rule.meta.docs as { recommended?: string }).recommended
      const actual = severities(recommended)[PREFIX + name]
      if (declared === undefined || actual === undefined) continue
      expect(actual, name).toBe(declared)
    }
  })
})
