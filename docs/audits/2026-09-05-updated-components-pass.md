# `Updated Components` — a measured pass

**Measured 2026-09-05** against Figma file `bcBO7RgVYR4ulwPr3j2heY`, page
`Updated Components` (`206:629`) — the working page where Yogin and Goutham
propose spec changes to the library.

10 sections, 439 instances. Every colour claim was re-resolved through the full
alias chain with **both** `Semantic/Color` and `Primitives/Color` set to the same
theme (rule 14 — setting one shows a hybrid) and the contrast computed, rather
than read off the annotation.

The annotations are proposals. **The artifact is the specification** — four notes
disagree with the specimen they label, which is the same failure #303 hit three
times.

> **On the word "held".** Nothing in this document is a rejection. Every item
> marked **held** is a measurement plus a recommendation, waiting on the
> maintainer's call — the numbers are an input, not the verdict, which is the
> whole premise of `docs/deviations.md`. Several shipped values in this library
> already sit below a threshold on purpose. A visual showcase of all twelve
> proposals is being built in the Figma file so the calls can be made by looking
> rather than by reading ratios.

---

## Summary

| Section | Verdict |
|---|---|
| Badge Updated | **Already shipped** — code and Figma both at step 2 / step 4 |
| Feedback (Alert) | **Already shipped** — `Component/Alert` already `*/2` + `*/4` |
| Feedback (Toast) | Groove shipped; the new `neutral/2` stroke measures **1.000:1 dark** |
| Form (all 8 sub-sections) | **Already shipped** via #303 — except Slider |
| Form > Slider | **Accept the track**, thumb change is unannotated and ambiguous |
| Navigation > Tabs | Underline radius correct; padding already matches code |
| Navigation > Sidebar item | Padding **ported**; active step **held**; fg binding **fix** |
| Navigation > Bottom navbar | Active label step **held** — 2.899:1 in dark |
| Notification | **Held as drawn** — two states measure 1.000:1, hover order inverts |
| Schedule | Dot **ported**; selection ring **held** — 4.914 → 1.297:1 |
| Buttons Updated | Dead — 13 zombies, no notes, superseded by the 330 → 55 collapse |
| Comparison | Dead — 2 zombies inside the before/after dashboards |

---

## 1. File integrity — three faults

### 1.1 A duplicate `Notification center` component set publishes from this page

| | id | key | page |
|---|---|---|---|
| real | `750:774` | `95b1399be0c18e1112cb372080cdcda2f7abced4` | `Components` |
| duplicate | `876:3544` | `a821e3cd97265f3c0d1d95d9f18b591a7a0cf0a6` | `Updated Components` |

Two variants each (`State=Items`, `State=Empty`), identical prop set, and the
duplicate carries a copy of the DS-authored description including the `SOURCE:`
line. Different keys, so **both publish** and consumers get two identically-named
components in the assets panel with no way to tell them apart.

This is the "components publish from EVERY page" rule in CLAUDE.md, live for the
first time.

### 1.2 Eighteen zombie Button instances

Pointing at mains deleted in the Button 330 → 55 collapse — `Button/md/error/Default`,
`Button/icon-md/error/Default`, `Button/compact-sm/error/Default`, and so on.
Thirteen carry the old `<size>/<colour>/<state>` naming; exactly one instance on
the page uses the current `Size=lg, State=Default` scheme.

| section | count |
|---|---|
| Buttons Updated | 13 |
| Comparison | 2 |
| loose on the page | 3 |

`detachedInfo` is null and `getMainComponentAsync()` returns a live node for all
of them — the only tell is that the main has no page and is not `remote`. The
2026-08-27 sweep repaired the example screens and never reached this page.

### 1.3 Three `Notification item` specimens carry a `VIDEO` paint as their stroke

`876:3532`, `876:3598`, `876:3679` — each has a single stroke paint of type
`VIDEO` with a `videoHash`. Accidental paste. The published mains are clean
(no strokes at all), so this is override-only and cannot reach consumers.

### 1.4 A mislabelled section

The second sub-section of `Navigation` is **named "Tabs" and contains Sidebar
item specimens** — including both of its own annotations ("left padding increased
from 8 to 12 px", "Surface changed accent 3, fg color changed to pink11").
Anyone porting by label puts the sidebar changes onto Tabs.

---

## 2. Reverse drift — the Figma library is a release behind the code

0.60.0 (#303) ported this page's Form section into code. **Nothing was written
back into the Figma variables**, so the file now teaches the pre-refresh spec.

| Variable / node | Figma today | Code at 0.60.0 |
|---|---|---|
| `Component/Control State :: control/opacity` Disabled | `38` | `45` (`--action-disabled-opacity: 0.45`) |
| `Component/Field :: field/bg-tint` Default | `surface-panel-hover` | new `--color-field` role (`neutral-1` light / `neutral-2` dark) |
| `Component/Field :: field/border-color` Error | `error/7` | `error-8` |
| `Component/Field :: field/border-color` Success | `success/7` | `success-8` |
| `Component/Field :: field/border-color` Warning | `warning/7` | `warning-7` — held deliberately (`FIELD-WARNING-EDGE-STEP-7`) |
| Switch Off track fill | `surface-border-strong` | `bg-neutral-5` |
| Switch Off hover fill | `surface-panel-active` | `hover:bg-neutral-6` |
| Switch Off stroke | `surface-border-interactive`, painted | reserved **transparent** (`SWITCH-RESTING-STROKE-REMOVED`) |
| `Component/Avatar Ring :: avatar/ring-color` Lead/Admin/Client | step **7** | step **6** (`AVATAR-ROLE-RING-STEP-6`) |

Pre-existing Tabs drift, unrelated to this page but found on the same pass:
`tabs/list-bg` = `surface-panel` and `tabs/pill-bg` = `surface-overlay`, where
code uses `bg-segment-track` (`color-mix(neutral-12 6%)`) and `bg-segment-thumb`
(`neutral-1` light / `neutral-5` dark).

---

## 3. Notification — held as drawn

Four row states, each an instance override on a correct published main. Measured
against the panel the rows sit in (`surface-overlay` = `#ffffff` light /
`#171717` dark):

| state | bound to | light | dark |
|---|---|---|---|
| Unread | `surface-base` | **1.000:1** | 1.111:1 |
| Read | `neutral/2` (primitive) | 1.090:1 | **1.000:1** |
| Unread hover | `pink/3` (primitive) | 1.244:1 | **1.040:1** |
| Read hover | `surface-panel-active` | 1.230:1 | 1.445:1 |
| *(current, for comparison)* Unread | `notification/unread-bg` → `accent/4` | 1.425:1 | 1.231:1 |

Four faults:

1. **Unread is invisible in light.** `surface-base` light is `#ffffff`, which is
   what the panel already is. The row only reads as unread because the *read*
   rows are grey — the model inverts from "unread is highlighted" to "read is
   dimmed", and then flips back in dark, where unread becomes `#0a0a0a` and
   reads as *recessed*. Two different mental models across two themes.
2. **Read is invisible in dark.** `neutral/2` in dark **is** `surface-overlay`
   in dark. Identical failure to `Table striped` and linear `Progress`, and to
   the field ground #303 caught: a structural differentiator painted with a
   container value.
3. **The hover order inverts in dark.** Unread hover 1.040:1 against read hover
   1.445:1 — pointing at the row that matters does less than pointing at the row
   that does not.
4. **`pink/3` is a raw hue.** 0.57.0 made colour a role across 12 components.
   Binding a hover to `pink/3` hardcodes Devalok pink straight through the
   `Brand` collection's Waybill mode.

The shipped model is better and is **already correct in Figma**:
`Component/Notification Unread :: notification/unread-bg` = `accent/4` (Tint) /
`accent/5` (Strong) / none, matching `UNREAD_STYLES` in
`shell/notification-center.tsx`. That file's comment at line 158 records
considering and rejecting step 3 — *"it clears `surface-panel` — true, but the
panel is not what an unread row competes with."* The proposal is that value.

**Keep:** the added 1px bottom border (`surface-border`) on each row. Genuine
improvement, no contrast cost, nothing else in the proposal depends on it.

---

## 4. Navigation

### 4.1 Bottom nav active label, `pink/11` → `pink/10` — held

| | light | dark |
|---|---|---|
| `pink/11` (current, = `accent-11`) | 8.770:1 | **8.693:1** |
| `pink/10` (proposed) | 6.701:1 | **2.899:1** |

The ramp inverts at step 11: `pink/11` dark is `#f48cae` (light-on-dark) while
`pink/10` dark is `#b3005c`, a saturated mid-tone that collapses on `#0a0a0a`.
Below WCAG AA 4.5:1 for text, on the primary affordance of the mobile nav. Light
would be fine on its own, which is why this is invisible to a light-only review.

### 4.2 Sidebar active `accent/4` → `accent/3` — held

| | light | dark |
|---|---|---|
| `accent/4` (current) | 1.425:1 | 1.367:1 |
| `accent/3` (proposed) | 1.244:1 | **1.155:1** |
| `surface-panel-hover` (the item's own hover) | 1.090:1 | **1.300:1** |

In dark the proposed active state is **quieter than its own hover** — pointing at
an inactive item makes it out-read the active one. Same shape as the five faults
`no-ungated-hover-over-selection` was written for, and it breaks the stated rule
that selections start at step 4. Current `accent-4` already only clears hover by
0.067 in dark; step 3 puts it under.

### 4.3 Sidebar active fg `pink/11` — accept the intent, fix the binding

`pink/11` resolves byte-identical to `accent/11` (`#88234d` light, `#f48cae`
dark; 7.052:1 / 7.524:1 on the tint). Zero visual change. It only costs palette
rebinding. Port as `text-accent-11`.

### 4.4 Sidebar item inline padding 8 → 12px — accept

`ui/sidebar.tsx` uses `p-ds-03` (8px, uniform). The specimen is `0/12/0/12` on a
fixed height. The value is right; the *model* differs, so this is a decision
rather than a find-replace.

### 4.5 Chrome edge → `surface-border` — held, on taste not measurement

| | light | dark |
|---|---|---|
| `surface-border-strong` (current) | 1.381:1 | 1.524:1 |
| `surface-border` (proposed) | 1.225:1 | 1.250:1 |

Applies to both the sidebar's right edge and the bottom navbar's top edge. A
deliberate softening of the one line separating chrome from canvas. Legitimate as
a taste call — a hairline reads at ratios the formula calls invisible — but it
needs a deviations entry if taken.

### 4.6 Tabs — no action

The active underline is `4/4/0/0`, which is what the note describes and what the
artifact carries. Tab item inline padding already matches code at every size:
8 / 16 / 24 = `px-ds-03` / `px-ds-05` / `px-ds-06`.

---

## 5. Schedule

### 5.1 Selection ring `accent/9` 2px → `*/border` (step 4) 1px — held

| | light | dark |
|---|---|---|
| `accent/9` 2px (current) | 4.914:1 | 3.372:1 |
| `accent/4` 1px (proposed), on the event fill | **1.297:1** | **1.321:1** |
| `accent/4` 1px, against the panel | 1.425:1 | 1.231:1 |

The ring is the *only* selection affordance on a schedule event — no checkmark,
no label change, no fill change. This takes it from clearly visible to a whisper,
and halves its width at the same time.

The specimen is also internally inconsistent: it keeps the 2px-ring geometry
(a 154×48 rectangle around a 150×44 event, which is what `ring-2` renders) while
setting a 1px stroke. Anyone porting from the artifact gets the offset wrong.

Third fault: the neutral variant binds raw `neutral/7` where its five siblings
use semantic `*/border`.

### 5.2 Event dot 8px → 6px — accept

Code is `h-ds-03 w-ds-03` = 8px; the artifact `Marker` ellipse is 6×6. Pure
geometry, no contrast cost.

### 5.3 Pre-existing, not this proposal

`eventColorMap` gives accent `bg-accent-2` and every other colour step 3. On a
panel: accent 1.099:1 light / 1.073:1 dark, success 1.216:1 / 1.069:1. Faint in
light and near-invisible in dark for all of them. Figma mirrors the code exactly,
so this is a code question, not a drift.

---

## 6. Slider — accept the track, resolve the thumb

Track `surface-panel-hover` → `neutral/3`:

| | light | dark |
|---|---|---|
| `surface-panel-hover` (current) | 1.090:1 | 1.300:1 |
| `neutral/3` (proposed) | 1.230:1 | 1.300:1 — **unchanged** |

`surface-panel-hover` in dark **is** `neutral/3`, so this is a light-only fix,
and the right one: an unfilled track is a groove, and a groove that matches its
ground is not a groove. Same class as `Table striped` and linear `Progress`.

Port as **`bg-surface-panel-active`**, not the raw primitive.

**Unresolved:** the specimens also swap the thumb from `surface-overlay` (white)
to `pink/9`, across both "Design option 1" and "Design option 2", and the note
says nothing about it. Which option is the ask has to come from the designers.

---

## 7. Toast

- The auto-dismiss groove (`surface-panel-hover` under the coloured bar) is
  **already shipped** — `ui/toast.tsx:115`.
- The new 1px stroke is bound to `neutral/2`: **1.090:1 light, 1.000:1 dark**.
  Invisible in dark, for the same reason as the notification read row. If a toast
  border is wanted, `surface-border` measures 1.225:1 / 1.326:1.
- The "changed" Toast is a **detached FRAME**, not an instance, and its `Content`
  child is 380px wide inside a 380px toast that still carries the 4px accent bar
  — 4px of overflow.

---

## 8. Already shipped — no action

- **Badge** "bg 3 → 2, border 7 → 4". Code: `--color-palette-subtle: var(--color-accent-2)`,
  `--color-palette-border: var(--color-accent-4)`. Figma: `Component/Badge ::
  accent/bg` Subtle = `accent/2`, `accent/border` = `accent/4`. Both sides done.
  The "Badge Changed" specimens bound to raw `pink/2` / `green/2` are now
  redundant *and* worse, because raw primitives do not follow the palette role.
- **Alert** "bg 3 → 2, border 7 → 4". `Component/Alert :: info/bg` Subtle =
  `info/2`, `info/border` = `info/4`; code `bg-palette-subtle border-palette-border`.
- **Form** — the whole block landed in #303: field ground, step-8 validation
  edges, uniform 12px inline padding, 0.45 disabled opacity, Switch track and
  travel, Radio dial sizing, Checkbox and Radio hover, Toast groove.
- **"Add check Icon"** — stale note. Every `State=Checked` Checkbox variant in the
  library already carries the `Check` glyph. The specimens are detached frames
  because a detached copy was easier than switching the variant.

---

## 9. Notes that disagree with their own artifact

Seventh, eighth, ninth and tenth occurrences; #303 hit three.

| Note | Artifact |
|---|---|
| Alert — "Left accent bar removed" | the accent bar is still there (4×68, `success/9`) |
| Bottom navbar — "border changed to Surface-base" | the stroke is `surface-border` |
| Badge outline — "border 7 to 5" | bound to step 4 |
| Slider — "Bg neutral 2 to 3" | also swaps the thumb to `pink/9`, unmentioned |

**The artifact wins**, as in #303.

---

## 10. Dead weight

- **Buttons Updated** — 13 zombies, no annotations at all, entirely superseded by
  the Button 330 → 55 collapse. Nothing to port.
- **Comparison** — two before/after dashboards, 2 zombies inside them.
- 13 stray `image N` rectangles and a `Project settings` frame parked at
  `x=11059, y=2925`.

---

## 11. What was actioned, same day

### Figma — done, and **pending a human republish**

| # | Change | Where |
|---|---|---|
| 1 | Three `VIDEO` stroke paints replaced with `surface-border` | `876:3532`, `876:3598`, `876:3679` |
| 2 | Mislabelled section `Tabs` renamed `Sidebar item` | `861:2499` |
| 3 | `control/opacity` Disabled `38` → `45` | `Component/Control State` |
| 4 | Created `field` (light `neutral-1` `#fcfcfc`, dark `neutral-2` `#171717`) and `field-hover` (light `neutral-2`, dark `neutral-3`) | `Semantic/Color` |
| 5 | `control/bg` Default → `field`, Hover → `field-hover`, Disabled → `field`. Read-only left on `surface-panel` | `Component/Control State` |
| 6 | Created `brand/error/8`, `brand/success/8`, and semantic `error/8` (`#d65752`/`#ba3535`) and `success/8` (`#519a55`/`#2f7f37`) | `Brand`, `Semantic/Color` |
| 7 | `field/border-color` Error → `error/8`, Success → `success/8`. **Warning deliberately left at step 7** — `FIELD-WARNING-EDGE-STEP-7` | `Component/Field` |
| 8 | `avatar/ring-color` Lead/Admin/Client step 7 → step 6 — `AVATAR-ROLE-RING-STEP-6` | `Component/Avatar Ring` |
| 9 | Switch Off track → `neutral/5`, Off hover → `neutral/6`, across all 9 Off variants. `neutral/6` gained `FRAME_FILL`/`SHAPE_FILL` scopes | Switch set |
| 10 | Switch resting stroke made **transparent at 2px**, not removed — `SWITCH-RESTING-STROKE-REMOVED`. Rationale added to the set description | Switch set |
| 11 | **sm Switch thumb travel fixed** — `State=On` thumb `x: 18 → 16` on all three Interaction variants, restoring the 2px inset that md and lg already had | `140:303/305/307` |
| 12 | `select/bg-base` → `field`, `select/bg-hover` → `field-hover`, **Default mode only** — Outline and Ghost keep their own grounds | `Component/Select` |

Items 11 and 12 were not on the plan. Figma reproduced the exact defect #303 fixed in
code: budget is `38 − 2×2 border − 20 thumb = 14`, the thumb sat at 18 with a
`rightGap` of **0** where md and lg both had 2.

Item 12 came out of verifying item 5 — Select routes through
`control/select-bg` → `select/bg-base` rather than `control/bg` directly, so
repointing `control/bg` missed it and Select alone would have stayed on the old
`#f5f5f5` ground. **Checkbox and Radio go through `field/bg-tint` and were
correctly left alone** — code has both on `bg-surface-panel-hover`, which is what
that variable already resolves to. Three different routes to a field ground is
itself worth flattening one day.

**Verified after the port**, resolving through the full chain in both themes:

| control | light fill | dark fill | edge vs fill |
|---|---|---|---|
| Input / Textarea / Combobox | `#fcfcfc` | `#171717` | 1.950 / 2.074 |
| Select (Default) | `#fcfcfc` | `#171717` | 1.950 / 2.074 |
| Checkbox / Radio | `#f5f5f5` | `#252525` | 1.835 / 1.772 |

Validation edges against the new field ground: **error 3.830 light / 3.101 dark,
success 3.354 / 3.580** — both clear WCAG 1.4.11's 3:1. Warning stays at 2.260 /
2.896, which is the recorded deviation.

**Two caveats on the new variables:**

- `brand/error/8` has **no `wb-red/8` primitive to point at**, so its Waybill mode
  falls back to Devalok's `red/8`. Worth knowing: `brand/error/7` handles the same
  gap with a raw `#ff00ff` magenta placeholder, which is a pre-existing defect in
  the Waybill ramp and is now the odd one out.
- `error/8` and `success/8` route through the Brand layer like their step-7
  siblings, so a rebrand carries them.

### Code — done

Changeset `quiet-grooves-speak-up`. Typecheck clean, lint 0 errors, 82 tests
across the four touched components passing.

- `shell/notification-center.tsx` — gated the unread hover (see below) and added
  the `surface-border` bottom rule
- `ui/slider.tsx` — track `surface-panel-hover` → `surface-panel-active`
- `composed/schedule-view.tsx` — event dot `h-ds-03` → `h-ds-02b`
- `ui/sidebar.tsx` — `SidebarMenuButton` `p-ds-03` → `px-ds-04 py-ds-03`

**A sixth `no-ungated-hover-over-selection` instance, which the rule cannot see.**
The notification row had an ungated `hover:bg-surface-panel-hover` over a
conditional `!isRead && UNREAD_STYLES[unreadStyle]`. Hovering an unread row
repainted it grey and made it identical to a hovered read row — the unread state
vanished under the cursor. The rule missed it because the conditional value is a
**map lookup, not a string literal**, so it had no second background to compare.

This also vindicates the designers: their instinct that unread-hover was broken
was correct, even though `pink/3` measures 1.040:1 in dark. Each wash now carries
its own hover one step up the ramp, and both stay above a hovered read row at
rest and on hover in both themes.

> **Rule gap worth closing:** `no-ungated-hover-over-selection` only fires when
> both backgrounds are string literals. Any conditional that resolves through a
> lookup table, a variable, or a helper is invisible to it. That is a large blind
> spot in a codebase that uses `Record<Variant, string>` maps everywhere.

### Blocked — needs your call

Two operations were refused by the harness's auto-mode classifier, and I did not
work around them:

1. **Deleting the duplicate `Notification center` set** (`876:3544`). Verified
   safe first: **zero instances anywhere in the document** reference it — every
   page was scanned individually. The real set (`750:774`) is intact. This is
   still the highest-priority item, because it publishes.
2. **Repairing the 18 zombie Button instances** via `swapComponent`. The repair
   script is written and the mapping verified — every zombie but one already
   carries its `Component/Intent` mode, and `Button/md/info/Loading` derives
   `Info` from its old name. Modes are read before the swap and restored after,
   since `swapComponent` drops them silently.

### Deliberately not done

**Deleting the `Buttons Updated` and `Comparison` sections.** Both are dead, but
removing other people's working canvas is a judgement call, not a cleanup.

---

## 12. What this pass changes about how we work

**A dark-only failure is invisible to the people proposing the change.** Six of
the held items here are fine in light and broken in dark, and a designer reviewing
in Figma sees a hybrid unless they set *both* `Semantic/Color` and
`Primitives/Color`. That is not a discipline problem — it is a tooling problem,
and the cost lands on whoever ports the spec.

**Binding a specimen to a raw primitive is how intent gets expressed here**, and
it is a reasonable gesture — it is the only way to say "this step, not that one"
without editing the shared variable. But it discards theme inversion and palette
role at the same time, and four of the proposals fail *only* because of what the
raw binding threw away, not because of the step that was chosen.
