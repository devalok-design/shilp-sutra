---
"@devalok/shilp-sutra": minor
---

**Autocomplete rebuild (finish-bar).** Re-parented onto the DS `Input` primitive instead of a hand-rolled `<input>`, closing the composition drift and a painted-error gap, and adding the capabilities that put it at market parity.

- **Composes `Input`** — inherits `size`, error/`state` painting, read-only, hover, and FormField auto-consumption. (Previously re-rolled the field: `ring-offset`/`focus-visible` drift from `Input`, hardcoded height, and it read FormField `error` but never painted it.)
- **Uncontrolled mode** — new `defaultValue`.
- **`size` / `state`** forwarded to the field.
- **Async** — new `isLoading` + `loadingText` (spinner in the field and the listbox).
- **`renderOption`** slot for custom option content; default now **bolds the matched substring** in each option.
- Dropped a keystroke-frequency stagger animation, a dead cleanup effect, and copy-pasted AI-filler JSDoc. Option labels truncate. Dropdown fade is reduced-motion gated.
- Doc corrected (it DOES auto-consume FormField, via Input).

Non-breaking: the `value` object API + `onValueChange` are unchanged; new props are additive.
