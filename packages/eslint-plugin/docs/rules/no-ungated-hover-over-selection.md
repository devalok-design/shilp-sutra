# `no-ungated-hover-over-selection`

An ungated hover background outranks a conditional selected/active background, so hovering the selected row visually deselects it.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (error), `strict` (error) |
| Fixable | no |
| Applies from | `0.60.0` |

## Why

Does this test expression read as a selected/active check?

## What it reports

**`ungatedHover`**

> `{{hover}}` is (0,2,0) and the active background is (0,1,0), so hovering the selected element clears its tint. Gate the hover on the negation (`!{{flag}} && '{{hover}}'`) or give the active state its own hover.

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
  rules: { 'shilp-sutra/no-ungated-hover-over-selection': 'error' },
}
```

---

<sub>Generated from `src/rules/no-ungated-hover-over-selection.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
