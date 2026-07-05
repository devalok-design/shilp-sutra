# composed/activity-feed — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:6 P3:2

## Findings

### [P0][H] Clickable action is a `<span role="button">` nested inside another interactive row, with no focus-visible ring
- **Category:** a11y
- **Evidence:** activity-feed.tsx:180-200 — `<span ... onClick={handleActionClick} role={item.detail ? 'button' : undefined} tabIndex={item.detail ? 0 : undefined} ...>{item.action}</span>`
- **Why:** A `span` carrying `role="button"`/`onClick` is keyboard-focusable but ships **no `:focus-visible` ring** — focus is invisible. It is also a sub-44px hit target (inline text), and the expandable disclosure exposes no `aria-expanded`/`aria-controls`, so SR users get no state. This is the rubric's hard a11y baseline (H: "`<div onClick>` instead of `<button>`", "focus ring removed without `:focus-visible` replacement; lost in forced-colors").
- **Fix:** Render the disclosure as a real `<button type="button">` (or our `Button variant="ghost"`), add `aria-expanded={expandedDetail}` + `aria-controls={detailId}`, give the detail region `id={detailId}`, and add a `focus-visible:ring-2 focus-visible:ring-focus-ring` (or `focus-ring` utility). Forced-colors: ensure the ring survives (don't rely on `hover:underline` alone).

### [P1][G2] Raw Tailwind spacing (`gap-1`/`gap-3`) instead of the `--spacing-ds-*` namespace
- **Category:** drift
- **Evidence:** activity-feed.tsx:119 `compact ? 'gap-1' : 'gap-3'`; :352 and :364 same; :149/:245 use `gap-ds-02`/`gap-ds-03`. Tests even assert on it (test:165 `.gap-1`).
- **Why:** The system's spacing namespace is `--spacing-ds-*` (CLAUDE.md: "Spacing is `--spacing-ds-*`"). `gap-1`/`gap-3` resolve to consumer numeric spacing, not DS tokens — inconsistent with the same file's own `gap-ds-02`/`gap-ds-03` and a drift the audit flags (G2).
- **Fix:** `gap-1 → gap-ds-01`, `gap-3 → gap-ds-03` (verify the px equivalents). Update the test assertion accordingly.

### [P1][G2] Hardcoded pixel sizes for dot, avatar, icon, timeline offset, and font size
- **Category:** drift
- **Evidence:** activity-feed.tsx:153 `mt-1.5 h-2 w-2` (dot); :160 `h-5 w-5 text-[9px]` + :164 `text-[9px]` (avatar); :123 `h-4 w-4` (skeleton icon); :353/:366 `left-[3px]` (timeline line); :247-249 dot duplicated.
- **Why:** `text-[9px]` and `left-[3px]` are arbitrary raw values; `h-2 w-2`/`h-5 w-5`/`h-4 w-4`/`mt-1.5` are raw Tailwind sizing, not DS size/spacing tokens (G2). The `left-[3px]` magic number silently couples the timeline rail to the dot's `w-2` center — fragile.
- **Fix:** Express the dot/avatar/icon via DS size tokens where available; derive the timeline offset from the dot width rather than a hardcoded `3px`; replace `text-[9px]` with a DS text token (`text-ds-xs` or smaller token) or a defined value.

### [P1][F5] Re-rolls its surface/structure instead of composing the base primitive
- **Category:** composability
- **Evidence:** whole component renders a bare `<div className={cn('relative', className)}>` (activity-feed.tsx:308/317/344); no use of `Card`/`CardContent`. Group header paints its own `bg-surface-base` chip (:278).
- **Why:** This is the StatCard-fixed drift (F5) — a composed widget that re-rolls its own layout/surface rather than composing `<Card>`/base. ActivityFeed legitimately may not always sit in a Card, but it offers **no** way to delegate surface, and its group-header label hardcodes `bg-surface-base` (assumes the page bg, will look wrong on a `surface-2` card — see G1).
- **Fix:** Either compose `<CardContent>` for padding/rhythm, or document that the consumer wraps it in a Card and make the group-header chip background inherit (`bg-inherit`/transparent) rather than hardcoding `bg-surface-base`.

### [P1][G1] Group-header label and dot ring hardcode `surface-base`, breaking on a raised surface
- **Category:** drift
- **Evidence:** activity-feed.tsx:278 `bg-surface-base px-ds-03 ...` (label chip that masks the `<hr>` behind it); :153/:249 `ring-2 ring-surface-base` on the dot.
- **Why:** Both assume the feed sits directly on the page background (`surface-base`). Dropped into a Card (`surface-raised` / `surface-2`), the chip and dot ring paint the wrong color and the divider "cut" effect fails. Surface layering rule (G1).
- **Fix:** Use `bg-inherit`/`ring-inherit` (or expose a surface-aware token) so the chip and ring match whatever surface the feed is placed on.

### [P1][F6] `maxInitialItems` / "Show all" is uncontrolled-only with a one-way latch and no callback
- **Category:** composability
- **Evidence:** activity-feed.tsx:304 `const [showAll, setShowAll] = React.useState(false)`; :381 `onClick={() => setShowAll(true)}` — sets true, never resets; no `showAll`/`onShowAllChange` prop.
- **Why:** Controlled/uncontrolled gap (F6). Consumers can't control or observe expansion, can't collapse it again, and if `items` changes the latch stays open. No `defaultShowAll`/`showAll`/`onShowAllChange` surface.
- **Fix:** Add optional controlled `showAll` + `onShowAllChange` (and a `defaultShowAll`), or at minimum reset the latch when `items` identity changes.

### [P2][M3] No reduced-motion guard on the per-item stagger or the CSS keyframe detail animation
- **Category:** motion
- **Evidence:** activity-feed.tsx:355/:368 `transition={{ ...tweens.fade, delay: index * 0.03 }}` (stagger by index); :221 `animate-in fade-in slide-in-from-top-1` (CSS, not framer).
- **Why:** framer-motion only respects reduced-motion if a consumer mounts `MotionConfig reducedMotion` — there's no `useReducedMotion()` here, and the staggered `delay: index * 0.03` on a long feed means a reduced-motion user can wait visibly for late items. The `animate-in` CSS animation is entirely outside framer's control. Rubric M3.
- **Fix:** Gate the stagger delay behind `useReducedMotion()` (collapse delay to 0), and ensure the `animate-in` keyframes are disabled under `@media (prefers-reduced-motion: reduce)` (verify the project's `animate-in` utility honors it; if not, guard locally).

### [P2][M2] Linear per-index stagger has no cap — late items in a long/grouped feed animate at unbounded delay
- **Category:** motion
- **Evidence:** activity-feed.tsx:355/:368 `delay: index * 0.03`; grouping path resets index per group but a flat 50-item feed delays the last item ~1.5s.
- **Why:** Uniform multiplicative delay with no ceiling is the "robotic timing" smell (M2) and produces a slow cascade on large feeds — the common real-world case for an activity feed.
- **Fix:** Cap the delay (`Math.min(index, N) * 0.03`) or only stagger the first N entrances; static items (re-renders) shouldn't re-animate at all.

### [P2][M4] Items re-animate their entrance on every render (no `AnimatePresence`/`initial={false}` discipline)
- **Category:** motion
- **Evidence:** activity-feed.tsx:355/:368 each item is a `motion.div` with `initial={{opacity:0}} animate={{opacity:1}}` keyed by `item.id`; "Show all" / "Load more" inject new items but there's no enter/exit choreography.
- **Why:** New items appended via Load More pop in with no exit/enter differentiation, and existing items can replay `initial` on parent re-render. M4 (missing/incorrect feedback motion) + the new-content case an activity feed exists for is unhandled.
- **Fix:** Wrap the list in `AnimatePresence`, set `initial={false}` for already-present items, animate only genuinely new entries.

### [P2][H] No `aria-busy` on the loading state; no `aria-live` for newly loaded items
- **Category:** a11y
- **Evidence:** activity-feed.tsx:307-311 loading returns `<div ... ><LoadingSkeleton/></div>` with no `aria-busy`; the load-more path appends items with no live region.
- **Why:** Rubric H: "loading with no `aria-busy`; async with no `aria-live`." An activity feed updating asynchronously is exactly the case for a polite live region.
- **Fix:** Add `aria-busy={loading}` to the container; consider `aria-live="polite"` (or a visually-hidden announcer) on the list region for appended items.

### [P2][H] Empty state returns `null` — silent disappearance, no default
- **Category:** state-coverage
- **Evidence:** activity-feed.tsx:314-323 — if `items.length === 0` and no `emptyState`, returns `null`.
- **Why:** Rubric H lists empty-state coverage. Returning `null` is defensible but undocumented and means the component vanishes with zero affordance; the Card bar shows empty states. (Test at :43 asserts this behavior, so it's intentional — hence P2 not P1.)
- **Fix:** Either keep `null` but document it, or ship a minimal default empty state (muted "No activity yet") that consumers can override.

### [P2][V14] `uppercase tracking-wider` on every group header
- **Category:** visual-tell
- **Evidence:** activity-feed.tsx:278 `text-ds-xs font-medium uppercase tracking-wider text-surface-fg-subtle`
- **Why:** All-caps + letter-spacing as the default label treatment is the rubric's V14 reflex. It's mild here (small muted divider label, a common pattern) so P2, but it's reached-for-by-default all-caps.
- **Fix:** Acceptable as a deliberate divider style, but consider sentence-case with weight/color carrying the hierarchy to match the system's "all-caps sparingly" stance. Confirm it's an intentional choice, not reflex.

### [P3][I] `onClick` handler typed as bare `() => void`; loses event access
- **Category:** types
- **Evidence:** Not on ActivityFeed itself, but the `ActivityItem.action` click path (:185 `onClick={handleActionClick}`) swallows the event; and item-level interactivity is implicit (no `onItemClick(item)` API).
- **Why:** Minor API gap — consumers can't get the event or a typed per-item click callback; they must route through `renderItem`. (P3, future.)
- **Fix:** Consider an `onItemClick?(item: ActivityItem, e): void` prop for the common "click an entry" case rather than forcing `renderItem`.

### [P3][J] No per-component doc / no `docs/components/**/activity-feed.md`
- **Category:** docs
- **Evidence:** Glob for `docs/**/activity-feed*` → no files. Story exists (`activity-feed.stories.tsx`) so the publish-gate story requirement is met.
- **Why:** Rubric J (per-component doc missing). Lower severity since the JSDoc-on-export convention isn't even present here either (the component export has no JSDoc block, unlike Card/StatCard).
- **Fix:** Add a JSDoc block to `ActivityFeed`/`ActivityFeedProps` (Card/StatCard both have rich JSDoc) and/or a per-component doc with a prop table.

## Composability gaps
- **F5 — doesn't compose `Card`/base.** Renders a bare `div`; group-header and dot ring hardcode `surface-base`, so it can't be safely dropped onto a raised surface. No surface delegation.
- **F6 — uncontrolled-only "Show all".** No `showAll`/`onShowAllChange`/`defaultShowAll`; one-way latch never resets on `items` change.
- **F1/slots — `emptyState`, `renderItem`, `groupLabels` are props, not slots.** `emptyState` and a custom item renderer are reasonable as props, but there is no compound API (e.g. `ActivityFeed.Item`, `ActivityFeed.Group`) — everything funnels through `renderItem(item, index) => ReactNode | undefined`, which is a render-prop escape hatch rather than composable children. Borderline; acceptable for a data-driven feed but worth noting against the Card-bar slot model.
- **No `asChild` (F2):** N/A — feed isn't a polymorphic single element; not a gap.
- **Internal sub-components (`ActivityEntry`, `CustomEntry`, `GroupHeader`, `LoadingSkeleton`) are private**, so the dot/timeline layout can't be reused or themed by consumers.

## Motion gaps
- **M3:** No `useReducedMotion()` — staggered framer delays and the `animate-in` CSS keyframe (detail expand) are unguarded except by a consumer-supplied `MotionConfig`.
- **M2:** Unbounded `delay: index * 0.03` → slow cascade on long feeds; no cap, no enter/exit differentiation.
- **M4:** No `AnimatePresence`; appended (Load More) items don't get distinct enter motion and existing items can replay `initial` on re-render.
- Chevron rotate (:178) and detail crossfade are fine and intentional. The fade tween (`tweens.fade`) is a proper system token — clean.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the disclosure a11y (P0):** swap the clickable `<span role="button">` for a real `<button>` with `aria-expanded`/`aria-controls`, a `focus-ring`, and a forced-colors-safe focus indicator. Update tests.
2. **Detokenize → tokens (G2):** `gap-1→gap-ds-01`, `gap-3→gap-ds-03`, replace `text-[9px]`, `left-[3px]`, `h-2 w-2`, `h-5 w-5`, `mt-1.5` with DS size/spacing tokens; derive the timeline offset from the dot width.
3. **Surface-correctness (G1/F5):** change the group-header chip and dot ring from `bg-surface-base`/`ring-surface-base` to `inherit` so the feed works on any surface; document Card composition (or compose `CardContent`).
4. **Motion (M2/M3/M4):** add `useReducedMotion()` guard, cap the stagger delay, wrap items in `AnimatePresence` with `initial={false}` for existing items; guard the `animate-in` keyframe under reduced-motion.
5. **State coverage (H):** add `aria-busy` to loading, consider `aria-live` for appended items, document/decide the empty `null` behavior.
6. **API (F6):** add controlled `showAll`/`onShowAllChange` (+`defaultShowAll`); reset latch on `items` change.
7. **Docs (J):** add JSDoc to the export to match Card/StatCard; consider a per-component doc with prop table.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. Dots are status indicators, timeline is a centered hairline — not a left-rail-on-a-card tell.
- **V2 double edge:** no border+shadow combo (no elevated surface at all).
- **V3 gradient text / V4 framework palette:** none — uses semantic `success-9`/`warning-9`/`error-9`/`info-9`/`surface-*` tokens, no raw indigo/violet/slate, no `bg-clip-text`.
- **V5 emoji icons:** none — uses tabler icons via the `Icon` API (`IconChevronRight`); story/test data is plain text.
- **V6 blob/glass/glow, V7 rounded-everything (uses `rounded-pill`/`rounded-control` deliberately), V8 pill spam:** clean.
- **E1–E8 verbal tells:** story/test copy is plain ("created the task", "left a comment"); no em-dash tic in copy, no AI vocabulary, no meta-hedging.
- **G3 variant-axis drift:** N/A — no variant/size/color CVA axis; `compact` boolean + `color` on items use the canonical color names (default/success/warning/error/info).
- **Tests + stories:** solid coverage — conformance harness, grouping, truncation, load-more, renderItem fallback/mixed, empty, loading, custom labels; 14 stories incl. compact, avatars, colored dots, grouped, custom render.
- **Type safety:** `forwardRef` + `displayName` present; props extend `HTMLAttributes<HTMLDivElement>`; `ActivityItem`/`GroupLabels`/`ActivityFeedProps` exported; `color` is a string union, not `string`; no `any`, no `React.FC`.
