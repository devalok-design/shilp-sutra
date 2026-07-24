# ui/sheet — finish-bar audit

Finish: 3/5   Market: PARITY (shadcn/Radix; lags Vaul on drawer polish)   Rebuild: polish

Edge-anchored sliding panel built on the Radix Dialog primitive (`@primitives/react-dialog`),
with a compound API (`Sheet` / `Trigger` / `Content` / `Header` / `Title` / `Description` /
`Footer` / `Close` / `Portal` / `Overlay`), four `side` variants, a `responsive` auto-bottom-sheet
on mobile, and swipe-to-dismiss. Foundation is strong; the gaps are content overflow, a sub-spec
touch target, and incomplete reduced-motion.

## Scores

| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | **Edge-soup**: `shadow-overlay` (= `shadow-lg-internal`, opens with `var(--shadow-edge-ring)`) stacks under the explicit `border-l/-r/-t/-b border-surface-border-strong` on the panel edge — two edge treatments on the same line. Also `gap-ds-05` in `sheetVariants` is **inert** (no `flex`/`grid` on the panel — shadcn's sheet keeps `flex flex-col`, we dropped it). Otherwise clean: role radius tokens, `bg-surface-overlay`, no slop tells. |
| accessibility | gap | Radix foundation solid — focus trap, Escape, `SheetTitle`/`SheetDescription` auto-wired ARIA, `forced-colors` tokens defined. **But** the auto close button is `min-h-ds-xs min-w-ds-xs` = **24×24px**, well below the 44px bar; the DS `touch-target` util is not applied. Focus ring `ring-2 ring-accent-9` has no offset. |
| api-composability | ✓ | Canonical Radix vocabulary (`open`/`onOpenChange`/`defaultOpen`), `asChild` on Trigger/Close, `forwardRef` + `displayName` on every part, `SheetContentProps` exported, controlled + uncontrolled via `useControllableOpen`. Minor: panel width is hardcoded (`w-3/4 sm:max-w-sm`) — no `size`/width prop, consumers must reach for `className`. |
| docs-dx | gap | Doc has Props/Compound/Example/Composability/Gotchas/Defaults/Changes, but is **stale vs source**: Props lists only `side` — omits the `responsive` prop and the entire mobile bottom-sheet + swipe-to-dismiss behavior. |
| testing | gap | Only two tests (axe + Escape close). No `describeConformance`; no coverage of side variants, controlled mode, close-button click, `responsive`, or swipe-dismiss. Stories cover 4 sides + mobile with one play test. |
| motion | gap | Good bones: `springs.smooth` (damping ratio ≈0.97, effectively bounce-free) for the slide, `tweens.fade` for the overlay, HW-accel transform/opacity only, `AnimatePresence` + `forceMount` exit. **But** `useReducedMotion()` guards only `drag` — the slide + overlay fade still animate for reduced-motion users (the `withReducedMotion()` helper exists in `lib/motion` and is unused here). `active:scale-90` on the close button is heavy (−10% vs the ~−3% norm). |
| state-coverage | ✓ | Open/closed, close-button hover/active/focus-visible/disabled, mobile drag handle. Loading/empty/error are N/A for a container overlay. |
| content-resilience | ✗ | **No overflow strategy** — no `overflow-y-auto`, no `flex-col min-h-0`; content taller than the viewport clips with no scroll (peers make the body scrollable). **RTL not handled**: physical `left-0`/`right-0`/`border-l`/`right-ds-5` instead of logical (`inset-inline`, `border-s/e`) — left/right sheets and the close button don't mirror. |
| theming-resilience | ✓ | Focus uses `accent-9` (survives brand swap); `surface-overlay`, `surface-border-strong`, and `overlay` all have `.dark` overrides in `semantic.css`; role radius tokens (`rounded-control-inner`, `rounded-pill`) honor `[data-shape]`. It's an overlay, so no sunken-track elevation-inversion risk. |
| system-cohesion | ✓ | Shares `springs.smooth` (same as Dialog), the shared motion lib, role radius tokens, `accent-9` focus ring, and the same Radix Dialog base as Dialog. No bespoke spring/radius drift. |
| craft | ✓ | Standout: mobile swipe-to-dismiss with combined offset (>30% height) **and** velocity (>500) thresholds, a drag handle affordance, `dragElastic 0.2` + `dragConstraints top:0` (can't over-drag open). Composed ref merges internal + forwarded ref cleanly. |
| perceived-perf | ✓ | Transform + opacity only, portal-rendered, interruptible spring, proper exit animation, no layout shift. |
| market-benchmark | PARITY | vs shadcn/Radix Sheet: **parity-plus** — we add mobile auto-bottom-sheet (`responsive`) and velocity swipe-dismiss they don't ship. vs **Vaul** (drawer gold standard): we **lag** on snap points, background-scale, in-body scroll-lock, and nested drawers. |
| cross-ds | — | See below. |

## Top gaps (prioritized)

- **[P1] content-resilience** — no scroll for tall content → clips at the viewport edge. Add `flex flex-col` + an `overflow-y-auto` body region (and revive the currently-inert `gap-ds-05` by making the panel a flex column, matching shadcn).
- **[P1] accessibility** — 24px close button is below the 44px touch target. Apply the `touch-target` util (or bump `min-h/w` to `ds-xl`/44px) and add a focus-ring offset.
- **[P1] content-resilience (RTL)** — swap physical positioning for logical properties (`inset-inline-*`, `border-s/e`, `end-ds-05` for the close button) so left/right sheets mirror correctly.
- **[P2] motion** — extend the reduced-motion guard past `drag`: gate the slide/overlay transitions through `withReducedMotion()` (or a `MotionConfig reducedMotion`) so reduced-motion users get an instant show/hide. Soften `active:scale-90` toward `scale-[0.97]`.
- **[P2] visual-integrity** — resolve the shadow-ring + explicit-border double edge on the panel line (drop one; keep the border as the panel↔page divider and let the shadow live on the outer edges).
- **[P2] docs/testing** — document `responsive` + mobile swipe in the Props table; add `describeConformance` and interaction tests for sides, controlled mode, and swipe-dismiss.

## What it does well

- Correct Radix Dialog foundation — focus trap, Escape, auto-wired title/description ARIA, `forced-colors` support — for free and correctly composed (not re-rolled).
- Mobile swipe-to-dismiss with dual offset+velocity thresholds and a drag handle is genuine, above-shadcn craft.
- `responsive` auto-converts any side to a thumb-reachable bottom sheet on mobile — a thoughtful default most peers leave to the consumer.
- Fully token-driven: role radius, surface-overlay, accent focus, shared spring — strong system cohesion, no drift.
- The panel slides in from a full `100%` off-screen offset with **no fade** — which is the *correct* drawer behavior (Vaul/Radix/iOS all do this); the overlay fades independently. (Noted so the `slide-no-fade` scan isn't mis-triggered: it is not a defect here.)

## Cross-DS adoption ideas

- **Vaul — snap points**: multi-detent drawers (peek → half → full). We ship none; MEMORY notes snap-points landed in a separate ResponsiveModal (#115), so the pattern exists in-house to port here.
- **Vaul — background scale + scroll-lock**: scale/round the page behind the sheet and lock body scroll while allowing an inner scrollable region. Would directly fix the P1 overflow gap and add polish.
- **Vaul — non-dismissible / controlled dismiss**: a `dismissible={false}` escape hatch for destructive-confirm drawers.
- **Radix Dialog — `onOpenAutoFocus`/`onCloseAutoFocus`**: expose/document these (the primitive supports them) so consumers can control initial focus and return focus.
- **shadcn — configurable width**: a `size` prop or width token instead of hardcoded `w-3/4 sm:max-w-sm`.

## Rebuild note

**Polish, not rebuild.** The structure is right — Radix Dialog base, compound API, shared tokens/spring, and a genuinely good mobile drag layer. Every gap is an in-place fix: make the panel a scrollable flex column (fixes overflow + the inert `gap-ds-05`), enlarge the close-button hit area to 44px, switch physical→logical properties for RTL, extend the reduced-motion guard to the slide/fade, de-duplicate the panel-edge shadow/border, and refresh the doc + tests. No API break required (an optional `size` prop and Radix focus-callback passthrough are additive).
