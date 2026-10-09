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

The 2026-08 surface model renamed `surface-raised` to `surface-panel`, and
removed `surface-chrome`.

The rename is the easy half. The dangerous half is this: under the new model
`surface-base`, `surface-panel` and `surface-overlay` are the SAME white in
light mode. So a hover painted with the panel value is invisible on every one
of them.

  hover:bg-surface-raised   →  hover:bg-surface-panel        ✗ invisible
  hover:bg-surface-raised   →  hover:bg-surface-panel-hover  ✓

A blind rename would ship 141 invisible hover states — worse than shipping
nothing, because today only the menus are broken. So a token carrying an
interaction modifier is RETARGETED to the matching interaction surface, while
a bare one (or one carrying only a responsive/theme modifier) is renamed.

`dark:` and `md:` are NOT interaction states. `dark:bg-surface-raised` is
still a background and must stay a background.

See docs/audits/2026-08-26-surface-model-ds-audit.md (finding A1).

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
