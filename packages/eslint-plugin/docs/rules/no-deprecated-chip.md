# `no-deprecated-chip`

`Chip` was removed in 0.32.0. Use `Badge onClick={...}` instead.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.32.0` |

## Why

`Chip` was removed in v0.32.0. Replace with `Badge` (which accepts
`onClick` for interactivity).

This rule flags two things:
  1. The `<Chip>` JSX element. Autofix: rename to `<Badge>` (preserves
     children + attributes).
  2. The `import { Chip } from '@devalok/shilp-sutra/...'`. Autofix:
     rename the imported specifier to `Badge`.

## What it reports

**`deprecatedChipImport`**

> `Chip` was removed in 0.32.0. Replace with `Badge` from `@devalok/shilp-sutra/ui/badge` (use `onClick` for interactivity).

**`deprecatedChipJsx`**

> `<Chip>` was removed in 0.32.0. Use `<Badge onClick={...}>` instead.

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
  rules: { 'shilp-sutra/no-deprecated-chip': 'error' },
}
```

---

<sub>Generated from `src/rules/no-deprecated-chip.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
