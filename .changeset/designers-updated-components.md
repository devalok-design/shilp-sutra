---
'@devalok/shilp-sutra': minor
---

Ship the `Updated Components` design pass as drawn

Everything Yogin and Goutham specified on the Figma `Updated Components` page,
ported to code. A visual before/after of all twelve proposals — light and dark
side by side — is on the `Decisions — 2026-09-05` page of the library file.

**NotificationCenter gains `recede`, and it is the new default.** Instead of
unread stepping forward with an accent wash, read rows step *back*: unread keeps
the plain ground, read takes a grey, and every row gets a divider.

`unreadStyle` keeps its existing three values untouched — `tint`, `strong` and
`none` behave exactly as before, so an app that picked one explicitly is
unaffected. `recede` is added alongside them and becomes the default, so apps on
the default move to the new design.

Measured against the overlay the list sits in:

| | rest | hover |
|---|---|---|
| unread | `surface-base` — 1.000 light / 1.111 dark | `accent-3` — 1.244 / 1.040 |
| read | `neutral-2` — 1.090 light / 1.000 dark | `surface-panel-active` — 1.230 / 1.445 |

Two of those are 1.000:1 by design — in light the unread row is the same white
as the panel, and in dark the read row is the same grey. The row that matches
the panel is the one meant to disappear into it. The dividers carry row
structure in both cases, which is why they are unconditional rather than part
of the style.

**Sidebar.** The active item moves to `accent-3` with `accent-11` text, and
inline padding goes 8px → 12px (block padding and the collapsed icon rail are
unchanged). The animated active indicator and the sub-button move with it —
they render the same state and would otherwise disagree.

**Bottom navbar.** The active item's label moves to `accent-10`, and the top
edge from `surface-border-strong` to `surface-border`.

**ScheduleView.** The event dot drops 8px → 6px, and the selection ring becomes
a 1px step-4 edge in place of the 2px `accent-9` ring.

The spec draws that ring 2px outside a 2px-radius block, so its corners land at
4px. A CSS ring follows its element's radius, and reproducing the offset needs
`ring-offset-*` with a solid colour — which would punch a panel-coloured halo
through any overlapping event and through the today column's accent ground. The
ring therefore sits on the block at its existing 2px radius. There is no 4px
radius role token; the scale goes 2px to 6px.

**Toast** gains a 1px `neutral-2` hairline. **Slider**'s handle moves from white
to `palette-solid`, following the two design options on the page.

Nothing here changes a prop type or an export. `unreadStyle` gains a value,
which is a widening — existing code keeps compiling.
