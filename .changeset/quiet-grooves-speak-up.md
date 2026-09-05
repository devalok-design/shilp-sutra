---
'@devalok/shilp-sutra': minor
---

Port the accepted half of the Figma `Updated Components` pass, and fix an unread
row that lost its wash on hover

Four changes came off the 2026-09-05 measured pass over the Figma library's
`Updated Components` page. Six other proposals on that page were declined on
contrast grounds and are recorded in
`docs/audits/2026-09-05-updated-components-pass.md` with the numbers they miss.

**NotificationCenter — an unread row no longer loses its tint when you point at
it.** The row carried an ungated `hover:bg-surface-panel-hover` alongside a
conditional `!isRead && UNREAD_STYLES[unreadStyle]`. The hover is `(0,2,0)` and
the wash is `(0,1,0)`, so hovering an unread row repainted it grey and rendered
it identically to a hovered read row — the unread state disappeared under the
cursor.

This is the same fault `no-ungated-hover-over-selection` was written for, and the
rule could not see it: the conditional value is a map lookup rather than a string
literal, so there was no second background to compare against. It is the sixth
instance of this pattern found in the library and the first the rule missed.

Each wash now carries its own hover, one step up the ramp:

| `unreadStyle` | rest | hover |
|---|---|---|
| `tint` | `accent-4` — 1.425 light / 1.231 dark | `accent-5` — 1.694 / 1.463 |
| `strong` | `accent-5` — 1.694 / 1.463 | `accent-6` — 2.095 / 1.691 |
| `none` | no wash | falls through to the shared hover, deliberately |

Both stay above a hovered read row (1.090 light / 1.170 dark) at rest *and* on
hover, in both themes.

Notification rows also gain a `surface-border` bottom rule (`last:border-b-0`),
which is the one part of the designers' notification proposal that carried no
contrast cost.

**Slider — the unfilled track is now a visible groove.** It was
`bg-surface-panel-hover`, which measures **1.090:1** against the panel it sits on
in light. A groove that matches its ground is not a groove; this is the same
light-only blindness that shipped in `Table striped` and linear `Progress`.
`bg-surface-panel-active` lifts light to **1.230:1**. Dark is unchanged, because
`surface-panel-hover` in dark already *is* that step — which is exactly why the
bug survived a dark-mode review.

**ScheduleView — the event dot drops from 8px to 6px** (`h-ds-03` → `h-ds-02b`).
Geometry only.

**Sidebar — `SidebarMenuButton` inline padding goes from 8px to 12px**
(`p-ds-03` → `px-ds-04 py-ds-03`). Block padding is unchanged, and the
icon-collapsed override (`group-data-[collapsible=icon]:p-ds-03!`) still wins, so
the rail is untouched.

No prop, prop type or export changes — visual and token only.
