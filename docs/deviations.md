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
| `SURFACE-BASE-GROUND` | Light canvas `#f5f5f5` | n/a | Setu `grounds`, tier 1 | open |

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

## Related, but not deviations

- **Waybill `brand/error` and `brand/info`** carry `#ff00ff` placeholders in the
  Figma `Brand` collection under the "Waybill (derived, unapproved)" mode. That is
  an unfilled gap awaiting a colour decision, not a knowingly-shipped shortfall.
- **Fixed, do not re-file:** Alert dismiss on solid (was 1.01:1), Badge category
  labels in dark (was 3.28–3.70), and Input/Textarea/Select/Combobox placeholders
  in light (was 4.14). All corrected and shipped; they are history, not exceptions.
