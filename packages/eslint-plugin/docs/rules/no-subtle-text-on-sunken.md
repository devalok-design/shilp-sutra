# `no-subtle-text-on-sunken`

Subtle foreground text on a sunken surface measures 4.38:1, under WCAG AA. Wells take surface-fg-muted.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (error), `strict` (error) |
| Fixable | no |
| Applies from | `0.57.0` |

## Why

Strip responsive/theme/state modifiers so `dark:bg-surface-sunken` counts.

## What it reports

**`subtleOnSunken`**

> `text-surface-fg-subtle` on `bg-surface-sunken` is 4.38:1, under WCAG AA (4.5). Use `text-surface-fg-muted` — 7.06:1.

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
  rules: { 'shilp-sutra/no-subtle-text-on-sunken': 'error' },
}
```

---

<sub>Generated from `src/rules/no-subtle-text-on-sunken.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
