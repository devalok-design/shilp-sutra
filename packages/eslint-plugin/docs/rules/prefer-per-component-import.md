# `prefer-per-component-import`

Split barrel imports of peer-cliff symbols (Toaster, DatePicker, RichTextEditor, …) into their per-component subpaths. v0.40.0 removed these from the barrels because they statically import optional peers.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.40.0` |

## Why

Symbol → per-component subpath

## What it reports

**`peerCliffImport`**

> Symbols `{{symbols}}` were removed from `{{from}}` in 0.40.0. Import them from their per-component subpath instead.

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
  rules: { 'shilp-sutra/prefer-per-component-import': 'error' },
}
```

---

<sub>Generated from `src/rules/prefer-per-component-import.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
