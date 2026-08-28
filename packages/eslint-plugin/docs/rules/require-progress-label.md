# `require-progress-label`

<Progress> needs an accessible name via `label`, `aria-label`, or `aria-labelledby` — otherwise it announces as just "progressbar" with a percentage.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (warn), `strict` (error) |
| Fixable | no |
| Applies from | `0.4.0` |

## Why

`<Progress>` with no accessible name announces as just "progressbar, 72%" —
the value is already carried by `aria-valuenow`, so what's missing is WHAT
is progressing. The component itself only warns about this at runtime
(dev console); this rule catches it statically at lint time instead.

Only targets the smart all-in-one `<Progress>` — `<Progress.Track>` and
other compound parts take `aria-label`/`aria-labelledby` directly and
aren't this rule's concern.

## What it reports

**`missingLabel`**

> <Progress> has no accessible name. Pass `label`, `aria-label`, or `aria-labelledby` so screen readers announce what is progressing.

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
  rules: { 'shilp-sutra/require-progress-label': 'error' },
}
```

---

<sub>Generated from `src/rules/require-progress-label.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
