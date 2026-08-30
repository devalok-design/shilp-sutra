---
"@devalok/shilp-sutra": minor
---

Apply the 2026-08-24 design refresh to the form controls

Ported from the `Updated Components` page of the Figma library. The library's
own variables were **not** changed there — the designers specified intent by
rebinding individual specimens to raw primitives and annotating them on canvas —
so every value below was read off a specimen and re-derived, not copied from a
note. Three notes turned out to disagree with their own artifact, and those are
listed at the bottom.

**Field ground — Input, Textarea, Select, Combobox.** New role tokens
`--color-field` / `--color-field-hover`, emitting `bg-field` / `bg-field-hover`.
The control is now defined by its border, with a fill that sits essentially
flush with whatever it is dropped onto.

The spec was authored light-only, and taking it literally would have been a
dark-mode regression: `neutral-1` in dark **is** `surface-base`, so every field
would have sunk into the page at 1.000:1 — the same failure that shipped in
`Table striped` and linear `Progress`. Dark therefore takes the step that
preserves the relationship rather than the number. Measured: light field
`#fcfcfc` = 1.026:1 against the page with hover lifting 1.063:1; dark field
`#181818` = 1.000:1 against a panel / 1.115:1 against the page, hover lifting
1.173:1.

**Validation edges move to ramp step 8**, which is what finally clears WCAG
1.4.11 for them — error **2.831:1 → 3.929:1**, success **2.557:1 → 3.441:1** in
light (2.397:1 → 3.440:1 and 2.660:1 → 3.971:1 in dark). This required bridging
`--color-error-8` and `--color-success-8`, which did not exist: the primitives
were always there but the semantic aliases were not, so `border-error-8` would
have silently emitted nothing. Warning was explicitly held at step 7 by the
designers and still measures 2.319:1 — filed as `FIELD-WARNING-EDGE-STEP-7`.

**Uniform 12px inline padding** on all four controls at every size (Textarea
also 8px block). Previously each size stepped its own padding, so a column of
mixed-size fields did not share a text baseline.

**Disabled opacity 0.38 → 0.45.** A global token, so every
`opacity-action-disabled` consumer moves. Disabled text is exempt from WCAG
1.4.3, so this is legibility rather than pass/fail, and it improves on every
ground — worst case (`surface-fg-subtle` on a panel) 1.673:1 → 1.859:1, typical
`surface-fg` 2.144:1 → 2.523:1 light and 3.046:1 → 3.745:1 dark.

**Switch.** The OFF track moves to `neutral-5` and its hover to `neutral-6`,
lifting thumb-against-track from 1.350:1 to 1.598:1 and hover to 1.955:1. This
also resolves the `SWITCH-HOVER-DIRECTION` deviation, whose premise was wrong:
it recorded that "every other control gets lighter on hover in both themes", but
the standard surface hover gets *darker* in light (`#ffffff` → `#f5f5f5`). The
Switch now moves away from the ground in both themes exactly as the norm does,
so the entry is deleted rather than renumbered.

Separately, the `sm` thumb had 16px of travel against a 14px budget
(`38 − 2×2 border − 20 thumb`), so a checked small switch sat flush on its right
border with no inset at all. `md` and `lg` were already correct.

**Radio.** The selected dial is sized `control − 8`, leaving exactly a 4px ring
at every size (20→12, 24→16, 28→20). It was a fixed 6/8/10px, which left a
7/8/9px gap and made the md and lg dials read as specks.

**Radio + Checkbox hover** darkens the control to `neutral-4` and no longer
recolours the edge to `accent-7`, which had read as a pre-selection. Radio's
hover is now gated on `data-[state=unchecked]` to match Checkbox.

**Toast.** The auto-dismiss countdown runs in a visible groove instead of over
bare surface, so a part-elapsed bar reads as time remaining rather than a stray
rule of arbitrary length.

Nothing here changes a prop, a prop type or an export — visual and token only.

**Three notes were not followed, because the artifact disagreed with the prose:**

- Badge `outline` was annotated "border 7 → 5", but its specimen is bound to
  `pink/4` — step 4, the same as `subtle`, which is what the code already ships.
  No change.
- The Avatar role ring was annotated 7 → 6. That is a measured contrast
  *regression* on the sole carrier of role, which has no text alternative:
  lead 2.865:1 → 2.095:1, client 2.636:1 → 1.990:1, admin 2.319:1 → 1.930:1,
  all already under 3:1. Not shipped; raised as a question.
- The Switch was annotated "removed the stroke". Unchecked, that border is the
  only edge the control has and is the stronger of the two (neutral-6 at
  2.006:1 against the fill's 1.639:1). Not shipped; raised as a question.
