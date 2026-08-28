# `toast-object-syntax`

shilp-sutra `toast` uses positional sonner syntax: `toast.success(message, options?)`. Object-first calls are likely a leftover from `useToast()` or a Mantine/Chakra muscle-memory.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (warn), `strict` (error) |
| Fixable | no |
| Applies from | `0.30.0` |

## Why

shilp-sutra's `toast` is sonner-style positional, NOT object-first.

  toast.success('Saved')                         ← correct
  toast.success({ title: 'Saved' })              ← wrong — surfaced as bug in hiring-platform audit (F-21)
  toast({ title, color: 'error' })                ← old useToast() pattern, no longer valid

Suggest-only (not autofix) — the rewrite is context-dependent (consumer
may have `description`, `duration`, `action` to map). We surface the
issue + show the canonical shape; reviewer applies.

## What it reports

**`objectSyntax`**

> shilp-sutra `toast.*` takes a positional message first. Use `toast.success("text", { description, … })` instead of `toast.success({ title, … })`.

**`bareCallWithObject`**

> `toast({ … })` is the old `useToast()` shape. Use the imperative `toast.success(message)` / `toast.error(message)` etc. variants.

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
  rules: { 'shilp-sutra/toast-object-syntax': 'error' },
}
```

---

<sub>Generated from `src/rules/toast-object-syntax.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
