# `no-css-var-bracket`

Replace TW3-era `w-[--var]` arbitrary-value syntax with TW4 `w-(--var)`.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.37.0` |

## Why

TW4 changed the CSS variable arbitrary-value syntax: `w-[--var]` → `w-(--var)`.
Applies to every utility that accepts an arbitrary value (w-, h-, p-, m-, gap-, etc.).

## What it reports

**`tw3VarBracket`**

> TW4 (shilp-sutra 0.37+) replaced `utility-[--var]` with `utility-(--var)`.

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
  rules: { 'shilp-sutra/no-css-var-bracket': 'error' },
}
```

---

<sub>Generated from `src/rules/no-css-var-bracket.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
