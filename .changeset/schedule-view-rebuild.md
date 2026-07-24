---
"@devalok/shilp-sutra": minor
---

**ScheduleView rebuild (finish-bar).** Fixes the P0 a11y flood, the overlapping-event illegibility, the stale now-line, and the surface/border regression.

- **No more phantom tab stops.** Slots are focusable/keyboard-navigable only when `onSlotClick` is set; otherwise they're inert grid lines. A read-only week view previously exposed ~140 sequential tab stops. Interactive slots now use **roving tabindex + Arrow/Home/End** navigation (RTL-aware) — one tab stop into the widget.
- **Overlapping events** partition into side-by-side columns (greedy interval colouring) instead of stacking on top of each other.
- **Live now-line** — ticks every minute and scrolls into view on mount (was frozen at mount time).
- **Surface fix** — shell uses the `surface-2` card tier + `rounded-surface` + a real border (was `surface-raised` + the dead `border-card-strong` class).
- **RTL** — logical properties throughout; now-dot centered via transform.
- **New props:** `selectedEventId` (rings the active event), `renderEvent` (custom event body), `header` (toolbar slot), `emptyState`, `height`.

Non-breaking: `view`/`date`/`events`/`onEventClick`/`onSlotClick` unchanged; new props additive.

Scope note: full ARIA grid-matrix semantics (`role="grid"` with row/column indices) were intentionally not adopted — the component stays a labelled `region` with keyboard-navigable slots, which is honest and lint-clean rather than a partial/broken grid.
