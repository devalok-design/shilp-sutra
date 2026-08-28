# `use-toast-deprecated`

The `useToast()` hook was deprecated in 0.30.0. Use the imperative `toast.success("message")` API instead.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.30.0` |

## Why

`useToast()` was deprecated in v0.30.0 in favor of the imperative `toast`
API. Old:

  import { useToast } from '@devalok/shilp-sutra/ui/toast'
  const { toast } = useToast()
  toast({ title: 'Saved' })

New:

  import { toast } from '@devalok/shilp-sutra/ui/toast'
  toast.success('Saved')

This rule flags the import + the call. Autofix removes only the import
(call-site rewriting is too brittle — `toast({ variant: 'error', title })`
has many shapes; consumers review per-site).

## What it reports

**`useToastImport`**

> `useToast` was deprecated in 0.30.0. Import `toast` instead and call `toast.success(message, options)`.

**`useToastCall`**

> `useToast()` is deprecated. Replace `const { toast } = useToast()` with `import { toast } from "@devalok/shilp-sutra/ui/toast"`, then call `toast.success(message)` directly.

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
  rules: { 'shilp-sutra/use-toast-deprecated': 'error' },
}
```

---

<sub>Generated from `src/rules/use-toast-deprecated.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
