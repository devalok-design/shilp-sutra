# `no-renamed-surface-token`

Rename surface-raised to surface-panel, retarget interaction states to surface-panel-hover/-active, and replace the removed surface-chrome.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.57.0` |

## Why

A retarget is not "has a state modifier" — it is "the surface it now points
at is not the one a plain rename would have given". Classify by comparing the
transform against the rename, rather than by pattern-matching the token.

## What it reports

**`renamed`**

> `surface-raised` is now `surface-panel`. In light mode it is not raised — it is the same white as the page.

**`retargeted`**

> An interaction state painted with a container surface is invisible in light mode, where base, panel and overlay are all white. Use `surface-panel-hover` / `-active`.

**`chrome`**

> `surface-chrome` was removed — chrome is an arrangement decision, not a theme value. Use `surface-base`.

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
  rules: { 'shilp-sutra/no-renamed-surface-token': 'error' },
}
```

---

<sub>Generated from `src/rules/no-renamed-surface-token.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
