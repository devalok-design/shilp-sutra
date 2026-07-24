# composed/schedule-view — finish-bar audit
Finish: 3/5   Market: LAGS (FullCalendar / React Aria Calendar / Google Calendar-class)   Rebuild: rebuild (targeted structural)

Prior baseline (2026-07-01): **2/5**. The 0.49 rework genuinely resolved the headline gaps that made it a 2 — accent rail killed (now a shape-based `<Dot>`), `primary`→`accent` vocabulary, focus-visible rings on slots+events, and the unguarded infinite framer pulse (now `<Dot pulse>` which carries `motion-reduce:animate-none`). Net up to 3, but a **new regression** (dead-class border) plus unaddressed a11y/content structural gaps cap it there.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No rail/gradient/glow/emoji — clean. BUT `border border-card-strong` (:312) is a **dead class** — no `border-card-strong` `@utility` and no `--color-card-strong` token exist (only `border-card` at utilities.css:342). `border` sets width, `border-card-strong` matches nothing → border-color falls back to `currentColor`, so the container edge renders as text color in BOTH themes. Regression: prior used the valid `border-surface-border-strong`. Also `bg-surface-raised` (old vocab) where a page panel should be `surface-2`. |
| accessibility | ✗ | Focus rings, `aria-label`s, `role="region"`, `aria-hidden` time column, Dot reduced-motion — all present. But the interaction model is wrong: every slot is an individually tab-stopped `<button>` even when `onSlotClick` is undefined → **~140 tab stops in week view** (20/day × 7), no `grid`/`gridcell` roles, no roving tabindex, no arrow/Home/End nav. Slot cells (~24px at default) and short events (a 15-min block ≪24px) miss the WCAG 2.2 (2.5.8) 24px target floor. Calendar peers use a grid pattern with arrow-key nav; this floods the AT tree instead. |
| api-composability | gap | `forwardRef`+`displayName`, fully typed (no `any`), DS `color` union, stateless prop-driven (correct — controlled/uncontrolled N/A for a display grid). Gaps: no `renderEvent`/children escape hatch (event body is hardcoded `title`-only), no header/toolbar slot, and it re-rolls the surface rather than composing `<Card>` (the StatCard drift pattern, flagged F5 in the baseline, still open). |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas/Changes and matches source; `color` union and `endHour`-exclusive gotcha are accurate; changelog now tracks 0.49. Minor: no note that the root is a bespoke surface (not Card). |
| testing | gap | `describeConformance` + 7 behavior tests (region labels, hour labels, event render, onEventClick, className merge, week columns). Missing: a `vitest-axe` assertion, an `onSlotClick` test, and any keyboard-nav test. |
| motion | gap | Correctly minimal for a data grid; only CSS `transition-colors` / `transition-[box-shadow]` on `ease-productive-standard`. Reduced-motion now honored via `<Dot>`. Gaps: no press feedback (`active:scale`) on the clickable event/slot buttons; slot hover has no explicit `duration` token while events use `duration-fast-02` (inconsistent, prior M2). |
| state-coverage | gap | hover + focus-visible designed. But empty state is lazy (renders a bare grid, no "no events" affordance despite an EmptyState story); no **selected-event** state (a calendar should show which event is active); no active/pressed or loading state. |
| content-resilience | ✗ | **No overlapping-event layout** — two events at the same time both render `absolute left-ds-01 right-ds-01` and stack directly on top of each other (illegible). Not RTL-safe: physical props throughout (`border-r`, `text-right`, `pr-ds-02`, `left-ds-01`/`right-ds-01`, `-left-[5px]`) — no logical properties. Fixed `h-[480px]` squeezes slots to unreadable heights on wide hour ranges (docs admit clipping). Long titles handled via `line-clamp-2`. |
| theming-resilience | gap | accent-9 swap and error-9 now-line survive. But the dead-class border breaks the container edge in both themes, and `bg-surface-raised` (= neutral-1, near-black in dark) is used for the whole panel where `surface-2` is the card tier — reads flat/wrong against a `surface-1` page in dark. |
| system-cohesion | gap | Uses DS tokens, the `Dot` primitive, and DS easing — mostly in tune. Out of tune: dead-class border, `surface-raised` (legacy vocab) vs the `surface-1..4` system, `rounded-control` where sibling cards use `rounded-surface`, and it hand-rolls the card shell instead of composing `<Card>`. |
| craft | gap | Nice touches: proportional event sizing, `line-clamp-2`, `cursor-pointer`, dot+line "now" signal, today-column tint. Rough edges: now-dot centered with magic negatives (`-left-[5px] -top-[4px]`, `mt-[3px]`) instead of transforms; now-line uses raw `z-10` not the `z-layer` utility. |
| perceived-performance | gap | Instant hover feedback, no CLS, synchronous layout, 140 buttons render without jank. But the now-indicator is computed from a mount-time `new Date()` with no interval — the "current time" line **never ticks**, so it's stale the moment after render, undercutting the whole live-schedule point. |
| market-benchmark | ✗ (LAGS) | vs FullCalendar / React Aria Calendar / Google Calendar: we lag on grid a11y (arrow-key nav), overlapping-event column layout, a live/auto-updating now-line, auto-scroll-to-now, drag-to-create/resize, and custom event rendering. We match on: semantic color coding, slot-click-to-create hook, day/week toggle. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P0] accessibility** — Re-architect slot/event navigation to a `grid`/`row`/`gridcell` pattern with roving tabindex + arrow/Home/End keys; render slots as non-interactive `aria-hidden` grid lines when `onSlotClick` is absent (kills ~140 phantom tab stops in week view). Enforce a min interactive height so short events/slots clear the 24px target floor.
- **[P0] visual-integrity/theming** — Replace the dead `border-card-strong` (:312) with a real utility (`border-card`, or `border-surface-border-strong` as before). This is a trivial, high-visibility fix — the container border currently paints as `currentColor`. Systemic: same dead class in `ai/command-bar.tsx` and `composed/command-palette.tsx` (see flags).
- **[P1] content-resilience** — Add overlapping-event column layout (split the width across concurrent events) so double-booked slots stay legible.
- **[P1] content-resilience** — RTL: swap physical props (`border-r`, `text-right`, `left/right-ds-01`, `-left-[5px]`) for logical equivalents; the whole grid mirrors wrong today.
- **[P1] api-composability** — Compose `<Card>` for the shell (surface/radius/border from one place) and add a `renderEvent` render prop + a header/toolbar slot.
- **[P2] visual-integrity** — Detokenize magic numbers: `w-[60px]`, `h-[480px]`, `mt-[3px]`, `-left-[5px]`, `-top-[4px]` → size/spacing tokens or transform-based centering; make height a prop (or intrinsic + scroll). `h-[480px]`/`w-[60px]` risk tripping the `check-arbitrary-sizing` gate.
- **[P2] state/perf** — Live-tick the now-indicator on an interval; add a selected-event state and a real empty-state affordance; add `active:scale` press feedback.
- **[P2] testing** — Add a `vitest-axe` pass + `onSlotClick`/keyboard tests.

## What it does well
- Clean of the classic AI tells — the prior accent rail is gone, replaced by a color-blind-safe shape signal (solid `<Dot>` + ambient tint), which is a genuinely thoughtful call.
- Color coding uses the full semantic DS union (`accent/success/warning/error/info/neutral`) with a sensible `accent` fallback — no raw palette, no off-taxonomy `primary` anymore.
- Reduced-motion is correctly delegated to the `<Dot>` primitive (`motion-reduce:animate-none`) rather than re-rolled.
- Solid typing and ref forwarding; stateless prop-driven design is the right model for a display grid.
- Docs are accurate against source with an honest scope statement ("not a full calendar app — no month view, no drag-to-create").

## Cross-DS adoption ideas
- **Google Calendar / FullCalendar** lay concurrent events into side-by-side columns within the slot — import an overlap-resolution pass over `dayEvents` before positioning. Our biggest legibility miss.
- **React Aria Calendar** models the grid as `role="grid"` with roving tabindex + arrow-key cell navigation — adopt this to replace 140 sequential tab stops and get free forced-colors/AT semantics.
- **FullCalendar's `eventContent`** render prop lets consumers inject attendees/icons/status into an event block — we hardcode `title`. Add `renderEvent`.
- **Google Calendar's auto-scroll-to-now + a minute-ticking now-line** — pair a `setInterval` re-render with an initial `scrollIntoView` on the now-line so the live indicator is actually live and in view.
- **Mobiscroll/Nylas** expose drag-to-create and event resize; even without full drag, a documented `onSlotClick`-driven create flow (already half-present) plus keyboard "Enter to create on focused slot" would close the interaction gap.

## Rebuild note
**Rebuild (targeted structural).** The visual shell and color system are largely there, but two structural problems can't be polished in place: (1) the a11y interaction model — moving from 140 individually-tabbable slot buttons to a `grid` pattern with roving tabindex + arrow nav, and conditionally non-interactive slots — changes how slots and events are rendered and keyboarded; (2) overlapping-event layout requires reworking the event-positioning math from fixed full-width `absolute` blocks to column-partitioned placement. Fold in the Card composition, `renderEvent`/header slots, RTL logical props, and a live now-line during the same pass. The dead-class border and the magic numbers are trivial polish that should be fixed immediately regardless of the larger rebuild timing.
