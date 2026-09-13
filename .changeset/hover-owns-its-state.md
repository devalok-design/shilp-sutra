---
'@devalok/shilp-sutra': patch
'@devalok/eslint-plugin-shilp-sutra': minor
---

Close the lint rule's blind spot, and fix the bug it was still hiding

`no-ungated-hover-over-selection` only ever compared **string literals**. Any
conditional background resolving through a lookup table was invisible to it —
and `Record<Variant, string>` style tables are how dozens of components in this
library spell their variants. That is how the NotificationCenter fault got past
it in the first place.

**Three gaps had to close for the rule to catch the bug it missed:**

1. **Lookup tables now resolve.** `MAP[key]` is checked against *every* string
   value in `MAP`, when `MAP` is a module-scoped object of string literals.
   `MAP.key` resolves to that one entry, `a ? b : c` to both branches, and
   `as Record<…>` / `satisfies` wrappers are seen through. A table whose entries
   disagree about carrying a hover is exactly the shape that ships the bug on
   some values and not others, so each value is judged on its own.

   Deliberately shallow — no cross-file resolution, no spreads, no computed
   keys. A table it cannot read resolves to nothing and the rule stays quiet,
   which is the right failure direction for a lint rule.

2. **Negations unwrap.** `!isRead && '…'` is the same shape as `isUnread && '…'`,
   and the negated form is how half this codebase spells the interesting state.

3. **`read` and `unread` joined the state vocabulary.** Semantically neither is
   "selection", but both mark a row out and both lose to a shared hover in
   exactly the same way. `readOnly`, `readonly` and `disabled` are explicitly
   disqualified — a read-only field is disabled-ish, and a shared hover over it
   is intended.

The reported message no longer suggests `!!isRead`; it flips an existing
negation instead of stacking a second one.

**Verified against a known-bad input in a real linted file**, not just the rule
tester — a rule that loads but never fires is indistinguishable from a clean
codebase. Across the whole library it now reports **zero**, which means the
blind spot was hiding exactly one instance.

## The instance it was hiding

**NotificationCenter's `tint` and `strong` still greyed out unread rows on
hover.** The previous release fixed only `recede`: the shared
`hover:bg-surface-panel-hover` was gated with `unreadStyle !== 'recede'`, so for
the other two styles it still applied over `bg-accent-4` / `bg-accent-5` and
still won on specificity. The comment above it described the fault it was
shipping.

Every entry in both style maps now carries its own hover and the row paints no
shared one:

| `unreadStyle` | unread | read |
|---|---|---|
| `recede` | `bg-surface-base hover:bg-accent-3` | `bg-neutral-2 hover:bg-surface-panel-active` |
| `tint` | `bg-accent-4 hover:bg-accent-5` | `hover:bg-surface-panel-hover` |
| `strong` | `bg-accent-5 hover:bg-accent-6` | `hover:bg-surface-panel-hover` |
| `none` | `hover:bg-surface-panel-hover` | `hover:bg-surface-panel-hover` |

Keeping each hover in the same string as its wash makes the pair impossible to
separate later, which is what went wrong twice. Unread hover stays above a
hovered read row in both themes for every style.

Six tests lock it in, and they were confirmed to **fail against the previous
code** — the original bug had no test at all, which is why it survived a fix.

## Also

**Four of seventeen rule doc pages were publishing a private helper's
implementation note as their "Why".** `generate-rule-docs.mjs` took the *last*
JSDoc before `createRule(` rather than the file's leading comment, so it lifted
whichever helper happened to sit closest to the export.
`prefer-per-component-import` documented its rationale as
"Symbol → per-component subpath" — a map's type annotation. Now takes the first
block, as the generator's own header always said it did.
