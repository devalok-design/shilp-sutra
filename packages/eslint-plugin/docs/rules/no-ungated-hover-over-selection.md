# `no-ungated-hover-over-selection`

An ungated hover background outranks a conditional selected/active background, so hovering the selected row visually deselects it.

| | |
|---|---|
| Type | `problem` |
| Category | `recommended` |
| Presets | `recommended` (error), `strict` (error) |
| Fixable | no |
| Applies from | `0.60.0` |

## Why

An ungated `hover:bg-*` beats a conditional selected/active `bg-*`, so
pointing at the selected row visually deselects it.

```
.hover\:bg-surface-panel-hover:hover   (0,2,0)   <- wins
.bg-accent-4                           (0,1,0)
```

Tailwind emits the hover utility with an extra `:hover` pseudo-class, so it
outranks a plain background utility no matter what order they appear in the
`cn()` call. `tailwind-merge` does not save you either: it de-duplicates
conflicting utilities by *group*, and `hover:bg-x` and `bg-y` are different
groups, so both survive into the class list and the cascade decides.

This has shipped three times — `TreeItem`, `TableRow` and `MasterDetail`, the
last found only while rebuilding the component in Figma. Two of the three
carry a hand-written comment explaining the fix, which is the tell that this
wants a rule rather than a fourth comment.

Two shapes are correct and are NOT reported:

```tsx
// gate the hover on the negation
cn(!isActive && 'hover:bg-surface-panel-hover', isActive && 'bg-accent-4')

// or give the active state its own hover, which is usually what you want —
// an active row with no hover response looks dead to the pointer
cn('hover:bg-surface-panel-hover', isActive && 'bg-accent-4 hover:bg-accent-5')
```

Not autofixable: both fixes are legitimate and they look different. Which one
is right depends on whether the active row should respond to the pointer at
all, and that is the author's call.

KNOWN LIMITATION: only sees `cn()` / `clsx()` calls, because that is the only
place the AST proves two class strings land on the same element. A hover
applied in one component and a selected background in a parent is invisible
here — and so is the `data-[state=selected]:` variant form, which does not
need this rule because the variant carries its own specificity.

## What it reports

**`ungatedHover`**

> `{{hover}}` is (0,2,0) and the active background is (0,1,0), so hovering the selected element clears its tint. Gate the hover (`{{gate}} && '{{hover}}'`) or give the active state its own hover.

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
  rules: { 'shilp-sutra/no-ungated-hover-over-selection': 'error' },
}
```

---

<sub>Generated from `src/rules/no-ungated-hover-over-selection.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
