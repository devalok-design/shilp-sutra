# `require-mutation-annotation`

Raw colour literals in class strings must use a token, or be marked a deliberate deviation with `// @mutation reason: <why>`.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (warn), `strict` (error) |
| Fixable | no |
| Applies from | `0.50.0` |

## Why

`@mutation` — legible deviations. A raw colour literal in a class string
(`bg-[#0af]`, `text-[oklch(...)]`, `border-[rgb(...)]`) bypasses the design
token system — the classic silent-drift path to slop. Allowed ONLY when the
author marks it as a deliberate deviation with a `// @mutation reason: <why>`
comment on the same line or the line directly above.

v1 targets raw colour literals (zero exist in the DS today, so this only
guards the future). The mechanism (annotated deviations) is meant to grow to
off-scale spacing, non-token easing, and card borders.

## What it reports

**`unannotated`**

> Raw colour `{{token}}` bypasses the token system. Use a semantic colour token, or mark the deviation with `// @mutation reason: <why>` on this line or the line above.

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
  rules: { 'shilp-sutra/require-mutation-annotation': 'error' },
}
```

---

<sub>Generated from `src/rules/require-mutation-annotation.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
