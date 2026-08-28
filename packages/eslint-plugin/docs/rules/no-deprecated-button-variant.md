# `no-deprecated-button-variant`

Replace removed Button variant/color values (default, destructive) with their current equivalents.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.32.0` |

## Why

v0.32.0 removed these Button variants/colors:
  variant="default"     → variant="solid"
  variant="destructive" → variant="solid" color="error"
  color="default"       → color="accent"

## What it reports

**`deprecatedVariantDefault`**

> `variant="default"` was removed in 0.32.0. Use `variant="solid"`.

**`deprecatedVariantDestructive`**

> `variant="destructive"` was removed in 0.32.0. Use `variant="solid" color="error"`.

**`deprecatedColorDefault`**

> `color="default"` was removed in 0.32.0. Use `color="accent"`.

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
  rules: { 'shilp-sutra/no-deprecated-button-variant': 'error' },
}
```

---

<sub>Generated from `src/rules/no-deprecated-button-variant.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
