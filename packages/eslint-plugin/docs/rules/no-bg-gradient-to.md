# `no-bg-gradient-to`

Replace TW3-era `bg-gradient-to-*` with TW4 `bg-linear-to-*`.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.37.0` |

## Why

TW4 renamed gradient utilities. `bg-gradient-to-r` is the TW3 spelling;
`bg-linear-to-r` is the TW4 successor. Also handles `bg-gradient-to-{r,l,t,b,tr,tl,br,bl}`.

## What it reports

**`tw3GradientTo`**

> `bg-gradient-to-*` is TW3-era; TW4 (shilp-sutra 0.37+) renamed to `bg-linear-to-*`.

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
  rules: { 'shilp-sutra/no-bg-gradient-to': 'error' },
}
```

---

<sub>Generated from `src/rules/no-bg-gradient-to.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
