# `no-deprecated-shadow-token`

Replace numeric shadow aliases (shadow-01..04) with their semantic v0.23.0 successors. shadow-05 was removed entirely.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.23.0` |

## Why

v0.23.0 renamed numeric shadow aliases:
  shadow-01 → shadow-raised
  shadow-02 → shadow-raised-hover
  shadow-03 → shadow-floating
  shadow-04 → shadow-overlay
  shadow-05 — removed entirely. Surface as error with no autofix.

## What it reports

**`deprecatedShadowToken`**

> Numeric `shadow-*` aliases were renamed in 0.23.0. Use the semantic name.

**`removedShadow05`**

> `shadow-05` was removed entirely in 0.23.0 (was unused). Drop it or pick `shadow-overlay` if a top-tier shadow is wanted.

## Configuration

```js
// eslint.config.js — flat config
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'

export default [
  shilpSutra.configs['flat-recommended'],
]
```

Or enable just this rule:

```js
{
  plugins: { 'shilp-sutra': shilpSutra },
  rules: { 'shilp-sutra/no-deprecated-shadow-token': 'error' },
}
```

---

<sub>Generated from `src/rules/no-deprecated-shadow-token.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
