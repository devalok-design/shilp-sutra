# Deviations register

Deliberate departures from a measurable standard.

**Why this file exists.** A measured threshold is one input, not the verdict. Some
decisions are taken on aesthetic grounds and are right even though a number says
otherwise — a 1px hairline can read clearly to the eye at a ratio a contrast
formula calls invisible, because the formula measures luminance difference, not
edge perception. Those calls are legitimate.

What is *not* legitimate is losing them. An unrecorded deviation gets rediscovered
six months later as a bug, "fixed" by someone who doesn't know it was chosen, and
the argument runs again. So: **make the call, then record it here with the number
it misses.**

**The rule:** if you knowingly ship a value that fails a stated threshold, it gets
an entry. Fixing a deviation means deleting its entry, not editing the number.

Each entry has a stable ID. Reference it from code (`// deviation: <ID>`) and from
any gate that needs to skip a known case.

---

## Live deviations

| ID | Area | Measured | Standard | Decided |
|---|---|---|---|---|
| `BADGE-OUTLINE-BORDER` | Badge `outline` border step | 1.26:1 | WCAG 1.4.11 non-text, 3.0 | 2026-08-24 |
| `BADGE-SUBTLE-BORDER` | Badge `subtle` border step | 1.26:1 | — (refinement only) | 2026-08-24 |
| `ALERT-SUBTLE-BORDER` | Alert `subtle` border step | 1.26:1 | — (refinement only) | 2026-08-24 |
| `SURFACE-BASE-GROUND` | Light canvas `#f5f5f5` | n/a | Setu `grounds`, tier 1 | open |
| `AVATAR-RING-RADIUS` | Figma ring corner radius | `scale/lg` = 10 | derive from `role/control` + 4 | 2026-08-24 |
| `WARNING-RAMP-CHROMA` | `warning/background` saturation | chroma 74.2 | siblings at 21.9–33.5 | 2026-08-26 |

---

### `BADGE-OUTLINE-BORDER` — outline border at step 4

**What.** `colorMap[*].border` moves from step 7 to step 4, per the Badge work by
Yogin and Goutham (2026-08-24). On `outline` the fill is transparent, so this
border is the only thing defining the badge.

**Measured**, worst of the ten ramps that use numbered steps:

| Border step | Light on `surface-base` | Dark on `surface-base` |
|---|---|---|
| 4 (adopted) | **1.26** | **1.41** |
| 5 | 1.47 | 1.67 |
| 7 (previous) | 2.35 | 2.45 |
| 8 | 3.17 | 3.50 |

**Why it stands.** Aesthetic call. The hairline is perceivable to the eye at this
weight even though the luminance ratio is low, and WCAG 1.4.11 targets information
required to *identify a user interface component* — a static badge is not an
interactive control, and its meaning is carried by its label, not its edge.

**Note the baseline.** Step 7 was already at 2.35 and also failed 3.0. This change
did not introduce the shortfall; it deepened a pre-existing one. Do not file the
old value as a regression from this change.

**What would change the answer.** If Badge ever becomes interactive (a filter chip,
a removable token with a hit target), the border becomes component-identifying and
3.0 applies properly. Step **8** is the first that clears it on every ramp in both
themes — step 10 does not (2.94 in dark, because dark step 10 is deliberately
darker than 9 for hover).

**Structural note.** `subtle` and `outline` currently share one `border` key per
colour row in `colorMap`, so they cannot hold different steps without splitting it
into two keys. Any decision that wants them to differ needs that split first.

---

### `BADGE-SUBTLE-BORDER` — subtle border at step 4

**What.** Same token change, seen from `subtle`, where the fill (now step 2) carries
the shape and the border is refinement rather than structure.

**Measured.** Border step 4 against its own step-2 fill: **1.26** light, **1.32**
dark.

**Why it stands.** Deliberate quieting of the badge. Nothing depends on this edge
being found — the filled shape is the affordance. No WCAG criterion applies to a
decorative inner hairline.

**Adopted alongside** the fill change step 3 → 2, which is a straight improvement:
worst-case label contrast rises from 6.36 to 7.13 in light and 7.50 to 8.41 in
dark. That part is not a deviation.

---

### `ALERT-SUBTLE-BORDER` — subtle border at step 4

Same call as `BADGE-SUBTLE-BORDER`, applied to Alert's four numbered colours
(info, success, warning, error) on 2026-08-24. Fill moves step 3 → 2 and border
step 7 → 4; the rationale, the measurement and the conditions that would change
the answer are all identical, so they are not repeated here.

**Alert's `outline` variant is NOT affected.** Unlike Badge, Alert uses compound
variants, so `subtle` and `outline` hold separate class strings. `outline` keeps
border step 7. That leaves Alert outline and Badge outline on different steps —
a real inconsistency between two components, flagged rather than resolved
unilaterally.

`neutral` is unchanged; it uses `surface-raised` and `surface-border-strong`.
---

### `WARNING-RAMP-CHROMA` — warning is louder than its siblings

**What.** `warning/background` carries two to three times the chroma of the other
three status backgrounds. Measured in OKLCh (×1000):

| | light | dark |
|---|---:|---:|
| `info/background` | 21.9 | 25.2 |
| `success/background` | 25.6 | 30.6 |
| `error/background` | 33.5 | 37.9 |
| **`warning/background`** | **74.2** | **44.3** |

**Why it stands.** Deliberate, decided 2026-08-26. Amber means attention, and a
warning that reads as loud as an error or as quiet as an info is arguably the
worse outcome. In a UI showing mixed statuses, "Review" is meant to catch the eye.

**Not an accessibility issue.** Text contrast on all four backgrounds is
comfortable — 6.4–7.0 in light, 7.6–9.0 in dark. This is a consistency
departure only.

**Pre-existing.** Nothing in the 2026-08-26 surface work created this. It became
visible when the shell specimens were bound to the real status tokens instead of
the hand-picked pastels they had been drawn with; before that, nobody was looking
at the four chips side by side.

**What would change the answer.** If warning ever needs to sit inside a dense
run of chips where every status appears at once, the shouting stops being useful
and starts being noise. A de-saturated version was built and rejected — it is on
the Figma showcase page under `DECISIONS` (`#efe0cb` light, `#2d1e0f` dark, at
chroma 32.0 / 35.0) if the question reopens.

---

### `SURFACE-BASE-GROUND` — light canvas is `#f5f5f5`

**Status: open.** Recorded here because it is a known, deliberate hold rather than
an oversight.

`--color-surface-base` resolves to `neutral-2` (`#f5f5f5`) in light. Setu's
`grounds` segment is **tier 1, status `defined`**, `posture: light-first`,
`default: #ffffff`, with `#f8f4f5` as the only other allowed ground. `#f5f5f5` is
on neither list, so every site page and consumer surface reads off-brand against
the brand file.

**Why it is not a one-line fix.** Light-mode elevation is carried by a 0.02 L gap:

| Token | Light value | L |
|---|---|---|
| `surface-base` | `neutral-2` | 0.97 |
| `surface-raised` | `neutral-1` | 0.99 |
| `neutral-0` (unused here) | `#ffffff` | 1.00 |

Moving base to `neutral-1` makes it identical to `surface-raised` and every card,
dialog and chrome surface dissolves into the page. Moving it to `neutral-0` leaves
nothing lighter for cards, so elevation has to come from borders or shadow instead
of fill, or the model inverts.

**The real question** is scope: Setu's grounds are authored for a print- and
document-first studio, and Setu itself notes the product UI may define things the
brand file does not. Whether a product-UI canvas must obey the document ground rule
is the decision. The DS site pages are unambiguously Devalok surfaces; a consumer
app dashboard is arguable.

---

### `AVATAR-RING-RADIUS` — ring radius is hand-derived, not computed

**Resolved from a raw value to a bound token (2026-08-24), but the coupling
remains.**

**What.** The Avatar ring sits 4px outside the media box (`ring-2 ring-offset-2`
in code). Its outer radius must therefore be the media radius plus 4. On the
Rounded shape that is `role/control` (6) + 4 = **10**.

Figma now expresses this with a dedicated `avatar/ring-radius` variable in
`Component/Avatar Shape`, aliased per mode: Circle → `role/pill`,
Square → `scale/none`, Rounded → `scale/lg` (10). No raw numbers remain.

**What still deviates.** `scale/lg` equals 10 by coincidence, not by derivation.
Figma variables hold values, not expressions, so `role/control + 4` cannot be
bound. If `role/control` ever moves off 6, the ring radius will not follow and
the ring will visibly mismatch the avatar corner. Nothing detects that today.

**Code is unaffected.** There the ring is a Tailwind `ring-*` utility, which
follows the element's own radius automatically and stays correct by construction.
This is a Figma-representation concern only.
---

### `PALETTE-EDGE-WHISPER` — coloured container edges sit at step 4

**The call.** The palette's `border` role resolves to ramp **step 4**, not step 7.
Every coloured container edge in the system — Card, Alert, Banner, Slider, Badge,
and Button's outline variant — is therefore a whisper rather than a line.

**The numbers**, against white:

| ramp | step 4 (shipped) | step 7 (previous) |
|---|---|---|
| error | **1.42:1** | 2.83:1 |
| success | **1.37:1** | 2.57:1 |
| info | **1.38:1** | 2.64:1 |
| warning | **1.49:1** | 2.31:1 |
| accent | **1.42:1** | 2.86:1 |

The plain, uncoloured decorative edge already shipped is **1.23:1**. So a coloured
edge at step 4 lands within roughly 0.2 of an uncoloured one: the hue is present,
but carries very little information at a glance.

**Why anyway.** Chosen deliberately after seeing these figures. The lighter edge is
the intended look — containers that read as tinted regions rather than as boxes
with outlines. The system already disagreed with itself here before the palette
work (Badge used 4 while Card, Banner, Slider and Alert used 7); this resolves the
disagreement toward the lighter end rather than leaving both in place.

**What it costs.** An error Card and a plain Card are nearly indistinguishable by
edge alone. Anything relying on the edge to signal intent needs a second cue —
fill, icon or text.

**Related:** `PALETTE-CONTROL-EDGE-BELOW-AA`, which this makes worse but did not
cause.

---

### `PALETTE-CONTROL-EDGE-BELOW-AA` — outlined controls miss WCAG 1.4.11

**The threshold.** WCAG 2.2 SC 1.4.11 (Non-text Contrast) requires **3:1** for the
visual boundary of a user-interface component. An outlined Button's edge is that
boundary.

**What we ship.** Below it on every colour — and below it before the palette work
too:

| | contrast vs white |
|---|---|
| step 7 — the previous value | 2.31 – 2.86:1 |
| step 4 — the current value | 1.37 – 1.49:1 |
| `surface-border-interactive` (neutral controls) | **2.00:1** |

Note the third row. The token *named* for interactive edges — used by Button
outline on neutral, and by the field controls — is itself 2.00:1. That predates
the palette work entirely and was not introduced by it.

**Why it is not a blocker today.** Our outlined controls are not edge-only: they
carry a text label at full contrast, and focus is a 2px accent ring that passes
comfortably. The failing boundary is decorative reinforcement rather than the sole
affordance. That is an argument for tolerating it, not for it being correct.

**What would close it.** A dedicated control-edge role at a step that clears 3:1 —
roughly step 8 on the chromatic ramps, and a darker neutral — applied to outlined
Button, inputs, checkbox, radio and switch. Deliberately out of scope of the
colour-role work: it is an accessibility change that needs its own visual review.

**Partly addressed 2026-08-28 — but the DEFAULT still deviates, so this entry
stays open.** `data-contrast="high"` on any ancestor now moves the neutral control
edge to step 8 / step 9, measured **3.64:1 in light and 3.93:1 in dark**, which
clears the threshold:

```html
<html data-contrast="high">
```

The visual review this entry called for happened (Figma → `Decisions — please
pick`, Q1). The decision was to keep the softer edge as the default and make
compliance opt-in, so that products which want the calmer look are not forced
off it.

**Be clear about what that costs.** A consumer who never sets the attribute ships
a control edge that fails SC 1.4.11, and most consumers will never set it — a
design system's default is, in practice, most people's product. The counter-case
(ship compliant by default, let teams opt *out* via the same one-line token
override they already have) was put and not taken. Recording it here so the
trade-off is owned rather than rediscovered.

The chromatic ramps are untouched: `data-contrast` moves the neutral control edge
only, so outlined Button on a colour still sits at 1.37–1.49:1 per the table
above.

---

## Related, but not deviations

- **Waybill `brand/error` and `brand/info`** carry `#ff00ff` placeholders in the
  Figma `Brand` collection under the "Waybill (derived, unapproved)" mode. That is
  an unfilled gap awaiting a colour decision, not a knowingly-shipped shortfall.
- **Fixed, do not re-file:** menu-item hover in light (`MENU-ITEM-HOVER`, was
  invisible — every menu item now takes `surface-panel-hover`, distinct from the
  `surface-overlay` ground in both themes), Alert dismiss on solid (was 1.01:1), Badge category
  labels in dark (was 3.28–3.70), and Input/Textarea/Select/Combobox placeholders
  in light (was 4.14). All corrected and shipped; they are history, not exceptions.
