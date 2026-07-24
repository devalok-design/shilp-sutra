# composed/activity-feed — finish-bar audit
Finish: 3/5   Market: LAGS(GitHub Primer Timeline)   Rebuild: polish

Prior baseline (2026-07-01) scored **2/5** with a P0 a11y failure. That P0 is **resolved** — the disclosure is now a real `<button type="button">` with `aria-expanded`/`aria-controls` and a `focus-visible` ring (lines 182–190). The component is now shippable, but a batch of the baseline's P1/P2 drift is still open, plus one new correctness defect (a dead declared prop).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean of accent-rails/gradient-text/emoji/glass; role radius (`rounded-pill`/`rounded-control`), semantic status dots. BUT magic numbers `text-[9px]` (line 161/165 — below readable size), `left-[3px]` (346/359), raw `gap-1`/`gap-3` off the `--spacing-ds-*` namespace (119/345/357), `mt-1.5 h-2 w-2` raw sizing, and `uppercase tracking-wider` group header (mild V14 reflex, 271). |
| accessibility | gap | P0 fixed (real button + aria-expanded/controls + focus-visible ring). Still: no `aria-busy` on loading (301), no `aria-live` for appended items, focus ring is raw `ring-accent-9` (no `focus-ring` util, no offset, forced-colors survival unverified), inline disclosure button is a sub-44px hit target (no `touch-target`). `<time dateTime>` is correct. |
| api-composability | gap | `forwardRef`+`displayName`, typed unions (no `any`), `ReactNode` for `action`/`detail`, `renderItem` escape hatch, exported `groupItemsByTime`. BUT: **`icon?: IconInput` is declared on `ActivityItem` (line 22) and documented, yet never rendered** — dead public prop. `showAll` is uncontrolled-only, one-way latch (297/374): no `showAll`/`onShowAllChange`/`defaultShowAll`, never resets when `items` identity changes. No `onItemClick`. |
| docs-dx | gap | Per-component doc now EXISTS (was missing at baseline) with Props/Defaults/Example/Composability/Gotchas/Changes; 16 stories. BUT no axe play-test story, no JSDoc on the `ActivityFeed`/`ActivityFeedProps` export (Card/StatCard have it), and the doc prop table lists the dead `icon` field as if functional. |
| testing | gap | Strong RTL + `describeConformance` + interaction coverage (truncate/load-more/expand/renderItem fallback+mixed/grouping with fake timers). BUT **no `vitest-axe`** assertion anywhere — the rubric requires it, and test:165 still asserts on the raw `.gap-1` drift class. |
| motion | gap | Item + GroupHeader `motion.div`s use `initial={false} animate={{opacity:1}}` → **inert**: the `delay: index * 0.03` stagger (348/361) is dead code that never fires. No `useReducedMotion`. Real motion is the CSS chevron rotate (good easing) + detail `animate-in fade-in slide-in-from-top-1` (has fade — not slide-no-fade) with no in-component reduced-motion guard. Non-offensive but the intended entrance animation ships broken. |
| state-coverage | gap | loading (skeleton), empty (prop or silent `null` default), hover/focus-visible/error(dot) covered. Empty returns `null` with no default affordance. `loading` swaps the **entire** feed for 3 skeletons — so a `hasMore`+`onLoadMore` paginated feed that flips `loading` wipes the existing list (jarring for load-more). |
| content-resilience | gap | `min-w-0`/`flex-wrap`/`shrink-0 whitespace-nowrap` handle long action text + timestamps well; zero/one/many fine. BUT **RTL is broken**: timeline rail is physical `left-[3px]` (not `start-*`/inset-inline), and the chevron uses physical `rotate-90` — rail lands on the wrong side and dots detach under `dir="rtl"`. |
| theming-resilience | gap | Survives accent swap (dots use `success/warning/error/info-9`), honors `[data-shape]` via role radius, dark-mode surface tokens invert cleanly. BUT `text-[9px]` won't scale with density, and surface-base hardcoding (below) misbehaves on a raised surface rather than on the page. |
| system-cohesion | gap | Composes Avatar/Button/Skeleton/Icon primitives, uses `tweens.fade`, role radius, semantic color — feels like the system. BUT `gap-1`/`gap-3` (raw numeric) diverge from the same file's `gap-ds-02`/`gap-ds-03`, and `bg-surface-base`/`ring-surface-base` (271/154/242) hardcode the page bg — drop the feed on a `Card`/`surface-raised` and the group-header chip + dot ring paint the wrong color and the divider-cut effect fails (baseline G1, still open). |
| craft | gap | Nice touches: dot `ring-2 ring-surface-base` "punches through" the timeline hairline; `<time>` semantics; chevron rotate. Undercut by dead motion code, uncomfortably tiny `text-[9px]` avatar text, and the fragile `left-[3px]` rail silently coupled to the dot's `w-2` center. |
| perceived-performance | gap | Expand is instant (local state); skeleton on load. No CLS. BUT no pending/optimistic state on the "Load more" button while `onLoadMore` resolves, and the full-list-to-skeleton swap (above) is a visible regression during pagination. |
| market-benchmark | ✗ (LAGS) | vs GitHub Primer `Timeline`: Primer renders a per-item **icon badge** on the rail — we declare `icon` and render nothing, so we're missing the timeline's signature affordance. We also lack an `aria-live` announce region for streamed/appended activity (the feed's whole reason to exist) and any real-time/optimistic append story. We match on grouping, avatars, compact, expandable detail, and the `renderItem` escape hatch. |
| cross-ds-adoption | gap | See ideas below — concrete borrows from Primer/Linear/Vercel. |

## Top gaps (prioritized)
- [P1] api-composability — **Dead `icon` prop**: `ActivityItem.icon` is declared + documented but never rendered → wire it into `ActivityEntry` (render an `Icon` badge on the rail, Primer-style) OR remove it from the type + doc. Shipping a no-op public prop is a correctness/trust defect.
- [P1] system-cohesion — `bg-surface-base`/`ring-surface-base` hardcode the page background; switch group-header chip + dot ring to `bg-inherit`/`ring-inherit` (or a surface-aware token) so the feed survives being placed in a Card.
- [P1] visual-integrity — Detokenize: `gap-1→gap-ds-01`, `gap-3→gap-ds-03`, kill `text-[9px]` (use a real DS text token), derive the timeline offset from the dot width instead of the `left-[3px]` magic number; update the test that asserts `.gap-1`.
- [P1] state-coverage / perceived-performance — `loading` swaps the whole feed for skeletons; scope it to initial load and give "Load more" its own pending state so pagination doesn't wipe visible items.
- [P2] api-composability — `showAll` uncontrolled-only one-way latch: add `showAll`/`onShowAllChange`/`defaultShowAll` and reset when `items` identity changes.
- [P2] accessibility — add `aria-busy={loading}` on the container and an `aria-live="polite"` (or visually-hidden announcer) for appended items.
- [P2] motion — remove the inert `initial={false}` + dead `delay` stagger, OR make entrance motion actually run behind a `useReducedMotion` guard with a capped delay; ensure `animate-in` honors reduced motion.
- [P2] content-resilience — RTL: `left-[3px]`→logical `start`/inset-inline; verify the chevron mirrors.
- [P2] testing/docs — add a `vitest-axe` assertion + an axe play-test story; add JSDoc to the exports to match Card/StatCard.

## What it does well
- Baseline P0 genuinely fixed: canonical disclosure button with `aria-expanded`/`aria-controls`/`focus-visible` — no more focus-invisible `span role="button"`.
- Composes DS primitives (Avatar/Button/Skeleton/Icon) rather than re-rolling them; role radius tokens (`rounded-pill`/`rounded-control`) mean no radius-gate ship-blocker.
- Semantic status colors only — no framework palette, no accent rails, no gradient text, no emoji.
- `renderItem` escape hatch + `CustomEntry` keep the dot/rail rhythm consistent for custom rows; `groupItemsByTime` is a clean exported pure util with solid fake-timer tests.
- Genuinely comprehensive stories (16) and interaction tests; per-component doc now present and accurate except the `icon` prop.
- Thoughtful `<time dateTime>` semantics, `min-w-0` truncation guards, and the dot ring "punch-through" on the timeline hairline.

## Cross-DS adoption ideas
- **GitHub Primer `Timeline`** renders a per-item icon/avatar **badge on the rail** and a `condensed` variant — we already declare `icon` but don't render it; wiring it delivers the missing signature affordance for free, and `compact` maps to Primer's `condensed`.
- **Linear / Vercel activity feeds** announce new items to SR users and append with a distinct enter animation — adopt an `aria-live` announcer + real (capped, reduced-motion-guarded) enter motion instead of the current inert wrappers.
- **Radix/Base UI collapsible** pattern for the expandable detail (animated height via `AnimatePresence`/`Collapsible`) would replace the CSS `animate-in` slide with an interruptible, reduced-motion-aware disclosure.
- **TanStack-style windowing** — for long feeds (the real activity-feed case) a virtualized list + an `onShowAllChange`/controlled expansion would beat the one-way `maxInitialItems` latch.

## Rebuild note
**Polish, not rebuild.** The structure (data-driven feed, dot+rail layout, grouping, renderItem hook) is sound and the a11y P0 is already cleared. The open work is in-place: (1) resolve the dead `icon` prop, (2) surface-inherit the chip/ring so it works on cards, (3) detokenize the magic numbers/raw gaps, (4) scope `loading` + add pending/`aria-live` for pagination, (5) fix or delete the inert motion, (6) RTL logical properties, (7) controlled `showAll` + `vitest-axe`. No structural change or API break required — every fix is additive or a swap behind existing behavior.
