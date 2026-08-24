---
"@devalok/shilp-sutra": minor
---

quieten the Badge fill and border, and open up the category ramps to match

Badge's twelve colour rows move their fill from step 3 to step 2 and their border
from step 7 to step 4. From design work by Yogin and Goutham, tested against a
real dashboard rather than a variant grid.

**The fill change is a straight improvement.** Label contrast is measured on
step-11 text against its own fill, worst case across the ten ramps that use
numbered steps: light rises from 6.36 to 7.13, dark from 7.50 to 8.41. Both
already cleared AA; both now clear it by more.

**The border change is a deliberate deviation, recorded in `docs/deviations.md`**
as `BADGE-OUTLINE-BORDER` and `BADGE-SUBTLE-BORDER`. Step 4 measures 1.26:1
against the page in light, under the 3.0 that WCAG 1.4.11 asks of non-text
boundaries. It is kept because the hairline reads to the eye at this weight, and
because a static badge is not an interactive control whose boundary carries
meaning — the label does that. Worth knowing: the previous step 7 was also under
the bar at 2.35, so this deepens a pre-existing shortfall rather than creating
one. Step 8 is the first that clears 3.0 on every ramp in both themes.

`default` and `neutral` are unchanged. They use `bg-surface-raised-hover` and
`border-surface-border-strong` rather than numbered steps, so the step change has
no meaning for them and inventing one would have been guesswork.

**New tokens.** The seven category ramps previously declared only steps 3, 7, 9
and 11 — exactly what Badge consumed. Steps 2 and 4 are now declared for each, so
`bg-category-teal-2`, `border-category-teal-4` and their siblings exist. Without
this the change would have shipped seven category badges with no background and
no border, since the classes would have referenced tokens that were never
declared.

Adds 14 tokens: `--color-category-{teal,amber,slate,indigo,cyan,orange,emerald}-{2,4}`.
