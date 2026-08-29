---
"@devalok/eslint-plugin-shilp-sutra": minor
"@devalok/shilp-sutra": patch
---

Add `no-ungated-hover-over-selection`, and fix the fifth instance it found

An ungated `hover:bg-*` compiles to `(0,2,0)` and a conditional active
`bg-*` to `(0,1,0)`, so pointing at the selected row visually deselects it.
`tailwind-merge` does not save you: it de-duplicates by group, and `hover:bg-x`
and `bg-y` are different groups, so both survive and the cascade decides.

This had shipped three times — `TreeItem`, `TableRow`, `MasterDetail` — two of
them carrying a hand-written comment explaining the guard. The rule replaces the
fourth comment.

On its first run against the library it found **two more**, in files nobody had
connected to the pattern:

- `MultiSelectPopover` — a real instance, plus a second fault on the same
  element: `isFocused && 'bg-surface-panel-hover'` is also `(0,1,0)` but
  declared *after* `isSelected`, so arrowing onto a selected row greyed it as
  well. Both are fixed; keyboard focus on a selected row now advances within
  the accent ramp instead of dropping to grey.
- `EmojiPicker` — a **false positive**, and the rule was changed rather than the
  component. Its hover and active paint the *same* utility, so the cascade
  conflict has no visual consequence: the keyboard-active emoji is meant to look
  hovered. The rule now compares the two backgrounds and stays quiet when they
  match. A rule that cries wolf on a deliberate pattern gets switched off.

Two shapes are accepted, because both are legitimate and which one is right
depends on whether the active row should respond to the pointer at all:

```tsx
cn(!isActive && 'hover:bg-surface-panel-hover', isActive && 'bg-accent-4')
cn('hover:bg-surface-panel-hover', isActive && 'bg-accent-4 hover:bg-accent-5')
```

No autofix, for that reason.

Known limits, stated rather than papered over: it only reads `cn()`/`clsx()`
calls, because that is the only place the AST proves two class strings land on
the same element; and it ignores the `data-[state=selected]:` variant form,
which needs no gate since the variant carries its own specificity.

The repo now applies the rule to its own `packages/*/src`.
