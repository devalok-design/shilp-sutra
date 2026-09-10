# `Updated Components` — the design pass, ported

**Measured 2026-09-05, ported 2026-09-06.** Figma file `bcBO7RgVYR4ulwPr3j2heY`,
page `Updated Components` (`206:629`) — where Yogin and Goutham propose spec
changes to the library.

10 sections, 439 instances. Every colour claim was re-resolved through the full
alias chain with **both** `Semantic/Color` and `Primitives/Color` set to the same
theme (rule 14 — setting one shows a hybrid), and the contrast computed rather
than read off the annotation.

**All twelve proposals shipped as designed.** The measurements below are
recorded because they are useful — a value that measures 1.000:1 is worth
knowing about — not because they overrode anything. See §12 for why an earlier
revision of this document got that balance wrong.

Visual before/after of every proposal, light and dark side by side:
**`Decisions — 2026-09-05`** page in the library file.

---

## Summary

| Section | Outcome |
|---|---|
| Badge | Already shipped before this pass — code and Figma both at step 2 / step 4 |
| Alert | Already shipped before this pass — `Component/Alert` already `*/2` + `*/4` |
| Toast | Groove already shipped; the `neutral-2` hairline **ported** |
| Form (8 sub-sections) | Already shipped via #303 |
| Slider | Track **ported**; handle → `palette-solid` **ported** |
| Tabs | Underline radius and padding already matched code |
| Sidebar item | Active `accent-3` + `accent-11` text + 12px padding **ported** |
| Bottom navbar | Active label `accent-10` + `surface-border` edge **ported** |
| Notification | `recede` **ported** and made the default |
| Schedule | Dot 6px + 1px step-4 selection ring **ported** |
| Buttons Updated | Dead section — 13 zombies repaired, no proposals in it |
| Comparison | Dead section — 2 zombies repaired |

---

## 1. File integrity — three faults, all fixed

### 1.1 A duplicate `Notification center` component set was publishing

| | id | key | page |
|---|---|---|---|
| real | `750:774` | `95b1399be0c18e1112cb372080cdcda2f7abced4` | `Components` |
| duplicate | `876:3544` | `a821e3cd97265f3c0d1d95d9f18b591a7a0cf0a6` | `Updated Components` |

Identical prop set, and the duplicate carried a copy of the DS-authored
description including the `SOURCE:` line. Different keys, so **both would
publish** and consumers would get two identically-named components with no way
to tell them apart.

The first live instance of the "components publish from EVERY page" rule.

**Deleted**, after verifying **zero instances document-wide** referenced it —
every page scanned individually. The page now holds zero `COMPONENT` /
`COMPONENT_SET` nodes; the real set is intact.

### 1.2 Eighteen zombie Button instances — all repaired

Pointing at mains deleted in the Button 330 → 55 collapse. `detachedInfo` was
null and `getMainComponentAsync()` returned a live node for every one — the only
tell is that the main has no page and is not `remote`.

| section | count |
|---|---|
| Buttons Updated | 13 |
| Comparison | 2 |
| loose on the page | 3 |

Repaired via `swapComponent` in three passes, reading `explicitVariableModes`
before each swap and restoring after — colour is now a mode, so a naive swap
resets every button to accent. The last three were **inside slots** and had to be
re-found by re-querying the page; cached nested ids do not survive their host
being mutated.

Verified: **0 zombies**, and all 22 Buttons resolve to their intended colour —
error `#c53637`, accent `#c22d6d`, info `#1479b0`, soft neutral `#f5f5f5`, soft
error `#fee0dd`.

### 1.3 Three `VIDEO` paints used as strokes — replaced

`876:3532`, `876:3598`, `876:3679` each carried a stroke paint of type `VIDEO`
with a `videoHash`. Accidental paste; replaced with `surface-border`.

### 1.4 A mislabelled section — renamed

The second sub-section of `Navigation` was **named "Tabs" and contained Sidebar
item specimens**, including both of its own annotations. Renamed `Sidebar item`.

---

## 2. Reverse drift — the Figma library was a release behind the code

0.60.0 (#303) ported this page's Form section into code. **Nothing was written
back into the Figma variables**, so the file had been teaching the pre-refresh
spec for a full release. Twelve changes, all applied 2026-09-05:

| # | Change | Where |
|---|---|---|
| 1 | Three `VIDEO` strokes → `surface-border` | notification specimens |
| 2 | Section `Tabs` → `Sidebar item` | `861:2499` |
| 3 | `control/opacity` Disabled `38` → `45` | `Component/Control State` |
| 4 | Created `field` (light `neutral-1` `#fcfcfc`, dark `neutral-2` `#171717`) and `field-hover` | `Semantic/Color` |
| 5 | `control/bg` Default → `field`, Hover → `field-hover`, Disabled → `field` | `Component/Control State` |
| 6 | Created `brand/error/8`, `brand/success/8`, semantic `error/8` and `success/8` | `Brand`, `Semantic/Color` |
| 7 | `field/border-color` Error → `error/8`, Success → `success/8`; **warning held at 7** (`FIELD-WARNING-EDGE-STEP-7`) | `Component/Field` |
| 8 | `avatar/ring-color` step 7 → 6 (`AVATAR-ROLE-RING-STEP-6`) | `Component/Avatar Ring` |
| 9 | Switch Off track → `neutral/5`, hover → `neutral/6`, all 9 Off variants | Switch set |
| 10 | Switch resting stroke **transparent at 2px**, not removed (`SWITCH-RESTING-STROKE-REMOVED`) | Switch set |
| 11 | **sm Switch thumb travel fixed** — `x: 18 → 16`, `rightGap` 0 → 2 | `140:303/305/307` |
| 12 | `select/bg-base` → `field`, `select/bg-hover` → `field-hover`, **Default mode only** | `Component/Select` |

Items 11 and 12 were not on the plan.

**11:** Figma had reproduced the exact defect #303 fixed in code — budget is
`38 − 2×2 border − 20 thumb = 14`, the thumb sat at 18 with a `rightGap` of
**0** where md and lg both had 2.

**12** came out of verifying 5: Select routes through `control/select-bg` →
`select/bg-base`, not `control/bg`, so repointing `control/bg` missed it and
Select alone would have kept the old `#f5f5f5`. **Checkbox and Radio go through a
third variable, `field/bg-tint`, and were correctly left alone** — code has both
on `bg-surface-panel-hover`, which is what that variable already resolves to.
Three routes to a field ground is worth flattening one day.

**Verified after**, resolving the full chain in both themes:

| control | light fill | dark fill | edge vs fill |
|---|---|---|---|
| Input / Textarea / Combobox | `#fcfcfc` | `#171717` | 1.950 / 2.074 |
| Select (Default) | `#fcfcfc` | `#171717` | 1.950 / 2.074 |
| Checkbox / Radio | `#f5f5f5` | `#252525` | 1.835 / 1.772 |

Validation edges against the new field ground: **error 3.830 light / 3.101 dark,
success 3.354 / 3.580** — both clear WCAG 1.4.11's 3:1. Warning stays at 2.260 /
2.896, the recorded deviation.

**One caveat:** `brand/error/8` has no `wb-red/8` primitive to point at, so its
Waybill mode falls back to Devalok's `red/8`. `brand/error/7` handles the same
gap with a raw `#ff00ff` magenta placeholder — a pre-existing hole in the Waybill
ramp, now the odd one out.

---

## 3. Notification — `recede`, and the new default

Four row states. Measured against the overlay the list sits in
(`#ffffff` light / `#171717` dark):

| state | bound to | light | dark |
|---|---|---|---|
| Unread | `surface-base` | **1.000:1** | 1.111:1 |
| Unread hover | `accent-3` | 1.244:1 | **1.040:1** |
| Read | `neutral-2` | 1.090:1 | **1.000:1** |
| Read hover | `surface-panel-active` | 1.230:1 | 1.445:1 |

Two of those are 1.000:1, and that is intrinsic to the model rather than a fault
in it: the row that matches the panel is the one meant to disappear into it. In
light that is unread-as-clean; in dark it is read-as-absorbed. **The dividers
carry row structure in both cases**, which is why they were made unconditional
rather than part of the style.

The hover ordering does invert in dark — unread hover 1.040 against read hover
1.445. Recorded, not corrected.

`recede` also required gating the shared `hover:bg-surface-panel-hover`, which
is ungated for the wash styles. Left ungated it is `(0,2,0)` against a
conditional `(0,1,0)` background and would grey out whichever row you point at.

### How it slots in

`unreadStyle` keeps `tint`, `strong` and `none` **exactly as they were**, so any
app that picked one explicitly is unaffected. `recede` is added alongside and
becomes the default. A value added to a union is a widening, so nothing stops
compiling.

`READ_STYLES` is a separate map because only `recede` styles read rows — the
wash styles leave them on the panel ground, which is how they have always
behaved.

---

## 4. Navigation

**Bottom nav active label → `accent-10`.** 8.770 → 6.701:1 light,
**8.693 → 2.899:1 dark**. The ramp inverts at step 11: `accent-11` in dark is
`#f48cae` (light-on-dark) while `accent-10` is `#b3005c`, a saturated mid-tone.
Below AA for text in dark.

**Sidebar active → `accent-3`.** 1.425 → 1.244:1 light, 1.367 → **1.155:1** dark,
against its own hover at 1.300:1 in dark — so a hovered inactive item out-reads
the active one there.

Three call sites moved together: the menu button, the **animated active
indicator** (`layoutId="sidebar-active-indicator"`, which renders the same state
and would otherwise disagree with the static version), and the sub-button.

**Sidebar active text → `accent-11`.** Resolves identically to the `pink/11` in
the artifact. 7.052 / 7.524:1 on the tint.

**Chrome edge → `surface-border`.** 1.381 → 1.225:1 light, 1.524 → 1.250:1 dark.
**The sidebar was already on `surface-border` in code**, so only the bottom
navbar changed.

**Sidebar inline padding 8 → 12px.** Block padding and the collapsed icon rail
unchanged.

---

## 5. Schedule

**Selection ring → 1px step-4 edge.** 4.914 → **1.297:1** light, 3.372 →
**1.321:1** dark, against the event's own fill. The ring is the only marker of
selection on an event — no tick, no label, no fill change.

**The 4px radius could not be reproduced faithfully.** The spec draws the ring
2px outside a 2px-radius block, so its corners land at 4px. A CSS ring follows
its element's radius, and reproducing the offset needs `ring-offset-*` with a
solid colour — which would punch a panel-coloured halo through any overlapping
event and through the today column's accent ground. The ring sits on the block
at its existing 2px radius. There is no 4px radius role token; the scale goes
2px (`control-inner`) to 6px (`control`).

**Event dot 8 → 6px.** Geometry only.

**Pre-existing, not part of this proposal:** `eventColorMap` gives accent
`bg-accent-2` and every other colour step 3 — 1.099:1 light / 1.073:1 dark for
accent. Figma mirrors code exactly, so it is a code question, not drift.

---

## 6. Slider

**Track → `surface-panel-active`.** The unfilled track is a groove and has to
differ from the panel it sits on; `surface-panel-hover` measured 1.090:1 there
in light. 1.230:1 after. Dark is unchanged because `surface-panel-hover` in dark
already **is** that step — which is why the fault survived a dark-mode review.

The artifact specified raw `neutral/3`; `surface-panel-active` is its
theme-aware equivalent and resolves to the same value in both themes.

**Handle → `palette-solid`.** Both design options on the page show it and no
annotation mentions it. Shipped on the maintainer's call that the artifact
carries it twice.

---

## 7. Toast

1px `neutral-2` hairline, on both toast roots. Measures 1.090:1 light and
**1.000:1 dark** — `neutral-2` in dark is the same colour as `surface-overlay`,
so the outline is not visible there.

---

## 8. Already shipped before this pass

- **Badge** "bg 3 → 2, border 7 → 4". Code: `--color-palette-subtle: accent-2`,
  `--color-palette-border: accent-4`. Figma: `Component/Badge` already matches.
- **Alert** — same, via `Component/Alert`.
- **Form** — the whole block landed in #303.
- **"Add check Icon"** — stale note; every `State=Checked` Checkbox variant
  already carries the `Check` glyph.

---

## 9. Notes that disagree with their own artifact

Fourth through seventh occurrences; #303 hit three.

| Note | Artifact |
|---|---|
| Alert — "Left accent bar removed" | the accent bar is still there (4×68, `success/9`) |
| Bottom navbar — "border changed to Surface-base" | the stroke is `surface-border` |
| Badge outline — "border 7 to 5" | bound to step 4 |
| Slider — "Bg neutral 2 to 3" | also swaps the handle to `pink/9`, unmentioned |

**The artifact wins**, as in #303.

---

## 10. The showcase — `Decisions — 2026-09-05`

All twelve proposals rendered before/after, **light and dark side by side on one
screen**. Three sections: *Needs your call* (7 cards), *Already ported* (4),
*Already shipped* (2).

Every dark panel carries **both** `Semantic/Color = Dark` and
`Primitives/Color = Dark`, set on the panel that means it rather than blanketed
on a container (rules 9 and 14). That is the point of the page: a reviewer who
sets one mode sees a hybrid, which is how three of these stayed invisible.

**Two new Figma traps, both invisible in the data:**

- **`figma.createAutoLayout()` ships a default WHITE fill**, exactly like
  `createSlot()` in rule 6. Invisible on a light ground and therefore invisible
  in every structural frame — until the dark panel, where it painted a white
  band across the specimens. Set `fills = []` on every structural frame you
  create. Eleven frames were affected on the first card alone.
- **A specimen needing absolute positioning must not be an auto-layout frame.**
  Setting `x`/`y` on children of one is silently ignored and they stack — the
  slider thumb rendered below its track. `layoutMode = 'NONE'` first.

Both read back from the API exactly as written. Only the screenshot showed them.
Rule 4 extends: measure, don't eyeball — **and look at the picture, not only the
numbers.**

---

## 11. Still open

**The Slider handle.** Shipped as `palette-solid` because the artifact carries
it on both design options, but no annotation explains it and a pink handle on a
pink filled track is hard to locate. Worth confirming with Yogin and Goutham
that it was intended rather than left over from experimenting.

**`no-ungated-hover-over-selection` has a blind spot.** It fires only when both
backgrounds are string literals. Anything resolving through a lookup table — which
this codebase uses everywhere — is invisible to it. That is how the notification
hover fault survived. Filed, not fixed.

---

## 12. What this pass changed about how we work

**A measurement is an input, not a verdict, and the call is not the porter's to
make.** An earlier revision of this document held six proposals on contrast
grounds and presented that as a conclusion. That was wrong twice over: the
deviations register exists precisely because this library ships values below a
threshold on purpose, and the decision belongs to the maintainer and the
designers, not to whoever happens to be reading the numbers.

The correct shape, and what happened on the second pass: **build what the
designers built, measure it, show it, and let someone else decide.** The
showcase page exists for that.

**A dark-only failure is invisible to the people proposing the change.** Several
of these are fine in light and fail in dark, and a designer reviewing in Figma
sees a hybrid unless they set *both* colour collections. That is a tooling
problem, not a discipline one, and the cost lands on whoever ports the spec.
The showcase page pre-sets both modes for exactly this reason.

**Binding a specimen to a raw primitive is how intent gets expressed here.** It
is a reasonable gesture — the only way to say "this step, not that one" without
editing the shared variable. But it discards theme inversion and palette role at
the same time, which is why several of these measure differently in the two
themes than the designer would expect from the light-mode view.
