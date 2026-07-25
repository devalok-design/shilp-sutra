---
"@devalok/shilp-sutra": minor
---

fix(combobox): trigger is now `div[role=combobox]`, not a `<button>` — fixes invalid nested buttons in multi-select

In multi-select mode the trigger rendered selected chips whose remove-`×` are
`<button>`s **inside** the trigger `<button>`. A button cannot legally contain a
button — the browser silently splits the DOM (mangling pill layout), the remove
click can be swallowed, and screen readers misreport what's actionable.

The trigger is now a `<div role="combobox" tabindex="0">` — the W3C
select-only-combobox pattern (the same structure MUI, eBay MIND, and React Aria
use). Chip remove-buttons are now legally nested, layout is stable, and the
remove affordance is reliably clickable. Single-select is visually and
behaviourally unchanged.

**Potentially breaking:**
- The forwarded `ref` type changes from `HTMLButtonElement` to `HTMLDivElement`.
  A consumer typing the ref as `HTMLButtonElement` will need to update it to
  `HTMLDivElement`. `.focus()` etc. are unaffected.
- Disabled state is now conveyed via `aria-disabled` + `tabindex="-1"` (a div has
  no `:disabled`). A test asserting `toBeDisabled()` on the trigger should assert
  `aria-disabled="true"` instead. Keyboard open (Enter / Space / ArrowDown) and
  Radix's disabled-blocking are preserved.
