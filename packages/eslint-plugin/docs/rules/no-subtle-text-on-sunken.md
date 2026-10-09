# `no-subtle-text-on-sunken`

Subtle foreground text on a sunken surface measures 4.38:1, under WCAG AA. Wells take surface-fg-muted.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (error), `strict` (error) |
| Fixable | no |
| Applies from | `0.57.0` |

## Why

`text-surface-fg-subtle` on `bg-surface-sunken` measures **4.38:1** — under
WCAG AA's 4.5. Every other text-on-surface pair in the system passes.

The tokens are both fine; the pairing is not. `fg-subtle` is the faintest text
in the system and a sunken well is already a de-emphasised region, so putting
them together asks the quietest text to sit on the quietest ground. Wells take
`fg-muted` (7.06:1).

Fixing this in the tokens was worse both ways: lightening the well needs
`#f2f2f2` to clear 4.5, which lands 3 levels from `panel-hover` and defeats
having a separate step; and darkening `fg-subtle` moves a token with 264
references to suit one pairing.

Not autofixable — swapping to `fg-muted` changes the visual weight of the
text, which is a judgement the author should make.

KNOWN LIMITATION: reads one string literal at a time. A pairing split across
two `cn()` arguments is invisible, because knowing which strings land on the
same element is not decidable from the AST. Catches the common case.

See docs/audits/2026-08-26-surface-model-ds-audit.md (finding A3).

## What it reports

**`subtleOnSunken`**

> `text-surface-fg-subtle` on `bg-surface-sunken` is 4.38:1, under WCAG AA (4.5). Use `text-surface-fg-muted` — 7.06:1.

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
  rules: { 'shilp-sutra/no-subtle-text-on-sunken': 'error' },
}
```

---

<sub>Generated from `src/rules/no-subtle-text-on-sunken.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
