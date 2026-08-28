# `no-bare-shadow`

Bare `shadow` class renders no shadow in TW4. Use `shadow-raised`, `shadow-floating`, `shadow-overlay`, etc.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (warn), `strict` (error) |
| Fixable | no |
| Applies from | `0.37.0` |

## Why

TW4 has no `--shadow-DEFAULT`. Bare `shadow` class silently renders no
shadow. Use `shadow-raised`, `shadow-overlay`, `shadow-floating`, etc.

Warn-only (no autofix) — the consumer must choose the intent:
  - card-on-page surface → `shadow-raised`
  - dropdown / popover  → `shadow-floating`
  - dialog / modal      → `shadow-overlay`

## What it reports

**`bareShadow`**

> Bare `shadow` renders no shadow in TW4. Pick an explicit name: `shadow-raised` (cards/panels), `shadow-floating` (dropdowns/popovers), `shadow-overlay` (dialogs/sheets), or `shadow-ring` (focus ring).

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
  rules: { 'shilp-sutra/no-bare-shadow': 'error' },
}
```

---

<sub>Generated from `src/rules/no-bare-shadow.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
