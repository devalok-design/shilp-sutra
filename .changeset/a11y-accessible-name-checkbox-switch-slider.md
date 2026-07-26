---
"@devalok/shilp-sutra": patch
---

Fix Checkbox, Switch and Slider having **no accessible name** inside the documented `FormField` + `Label` pattern — a screen reader announced them unnamed.

All three read `useFormField()` and wired `state`, `aria-describedby` and `aria-required`, so they looked integrated. None of them adopted `fieldCtx.inputId`, so `<Label htmlFor>` resolved to an element that did not exist. The label rendered, was visible, and was associated with nothing.

Checkbox and Switch now adopt the field `inputId` (explicit `id` still wins), matching Input, Textarea, Select, Combobox, Autocomplete, NumberInput and ColorInput.

Slider needed a different mechanism. Radix renders `Slider.Root` as a `<span>` — not a labellable element — and puts `role="slider"` on the **thumb**, so `htmlFor` can never reach it. The thumb now takes `aria-labelledby` from the field label instead. An explicit `aria-label` still wins, and a range slider deliberately does *not* borrow the field label, because one label cannot disambiguate two thumbs — name each thumb yourself there.

Found by reading the browser's accessibility tree for every labellable control in three states (no label / placeholder only / `FormField` + `Label`), rather than trusting the DOM or a scanner's summary. The three broken controls turned out to be exactly the three that `form-field-label-association.test.tsx` did not cover — the 0.49.x round fixed the text-like controls and stopped there. Every labellable control including Radio is now asserted, and the new cases assert the accessible **name** via role rather than only label association, because that is what a screen-reader user actually receives. Verified to fail without the fix and pass with it.

No API change; no consumer action required beyond upgrading.
