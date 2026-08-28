# `no-deprecated-surface-token`

Replace numeric surface aliases (bg-surface-1, border-surface-2, …) with their semantic v0.23.0 successors (surface-base, surface-raised, surface-raised-hover, surface-raised-active).

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.23.0` |

## Why

v0.23.0 renamed numeric surface aliases to semantic names. This rule
catches both `bg-surface-1` / `border-surface-2` / `text-surface-3` /
etc. across all utility prefixes that map to the surface token namespace.

`bg-surface-1` → `bg-surface-base` (page bg) — see MIGRATION.md v0.23.0
                 table; we pick `surface-base` as the closest semantic
                 match for `surface-1` (the original "page background"
                 alias). Consumers wanting other semantics review the
                 fix and adjust per-site.

## What it reports

**`deprecatedSurfaceToken`**

> Numeric `surface-*` aliases were removed in 0.23.0. Use the semantic name.

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
  rules: { 'shilp-sutra/no-deprecated-surface-token': 'error' },
}
```

---

<sub>Generated from `src/rules/no-deprecated-surface-token.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
