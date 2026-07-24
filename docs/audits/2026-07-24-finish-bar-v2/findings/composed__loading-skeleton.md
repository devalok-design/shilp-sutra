# composed/loading-skeleton — finish-bar audit
Finish: 2/5   Market: LAGS (MUI Skeleton / React Aria)   Rebuild: polish

Scope: `packages/core/src/composed/loading-skeleton.tsx` — exports `CardSkeleton`, `TableSkeleton`, `BoardSkeleton`, `ListSkeleton`. Composes `ui/Skeleton`. Co-located story + test + doc all present. Purely visual placeholder (no interaction); scored on all applicable axes.

**Headline:** this component **regressed** since the 2026-07-01 baseline (also 2/5). The card shells now paint their border with a **dead class `border-card-strong`** (lines 18, 59, 137) — the baseline used the valid `border-surface-border-strong` there. No `--color-card-strong` token and no `border-card-strong` `@utility` exist (only `--color-surface-border-card` + `@utility border-card`, utilities.css:342). In TW4 the bare `border` utility falls back to `currentColor`, so the card outlines render as a hard near-black 1px edge instead of the intended subtle card border. Meanwhile every pre-0.49 defect is still open: silent to assistive tech, forced-colors invisibility, dead stagger, no zero-clamp, `skeleton-base` token bypassed.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✗ | Dead `border-card-strong` on 3 card shells → currentColor fallback border. Fill uses `bg-surface-raised-hover` not `skeleton-base` (two skeleton vocabularies in one system). Magic-number widths `w-[128px]`/`w-[272px]`/`w-[56px]`. No accent rails/gradients/emoji/glass — clean there. |
| accessibility | ✗ | **P0.** No `role="status"`/`aria-busy`/`aria-live` on any root; every child `Skeleton` is `aria-hidden` (skeleton.tsx:65) so the whole loading region is silent to AT. `SkeletonGroup` (role=status, aria-busy, sr-only label; skeleton.tsx:351) ships in the base file and is unused. Fill override = `Canvas` in forced-colors → bars vanish in Windows HCM. |
| api-composability | gap | Clean: `forwardRef` + `displayName` on all four, exported typed prop interfaces, no `any`, sensible defaults. But re-rolls the Card surface instead of composing `<Card>`/`<CardContent>` (the drift StatCard fixed), no slot/`renderItem` escape hatch for custom item geometry, count-knob-only. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and prop tables match source. Doesn't note the surface is hand-rolled (not `<Card>`); changelog stale at v0.2.0; no mention of the a11y wrapper gap. |
| testing | gap | `describeConformance` ×4 + count/className/avatar-toggle assertions. No `vitest-axe` play test; tests assert on the magic literal `w-[272px]` (couples the suite to an arbitrary value); no zero/negative-count test. |
| motion | ✗ | `style={{ animationDelay }}` set on the non-animated wrapper `<div>`s (lines 84, 138, 183) — the pulse lives on the child `Skeleton`, so `animation-delay` is inert. Intended stagger never fires; all bars pulse in unison. Dead motion code. Reduced-motion respected only incidentally via base `Skeleton`'s `motion-reduce:animate-none`. |
| state-coverage | ✗ | `rows`/`columns`/`cardsPerColumn` feed `Array.from({length})` raw (no clamp). `rows={0}` → header only; negative/`NaN` → `RangeError`. Base `Skeleton` sub-parts DO clamp (`Math.max(1, …)`, skeleton.tsx:157,269) — inconsistent. No aria-busy loading semantics = the loading state itself isn't a designed state. |
| content-resilience | gap | Many rows/columns handled (`overflow-x-auto` board, `flex-1` table columns, varied `w-4/5`/`w-3/5`/`w-2/5` bars). Physical props (`border-b`, `px-`) not logical — RTL unmirrored (minor for a symmetric skeleton). Zero-count broken (see state-coverage). |
| theming-resilience | gap | Light/dark core works (`surface-raised-hover` has both). Radius via role tokens (`rounded-surface`/`-pill`/`-control`) so `[data-shape]` presets remap — good. But dead `border-card-strong` responds to no token in any theme, and `skeleton-base` bypass loses the forced-colors mapping. |
| system-cohesion | gap | Shares DS radius language + ds-spacing tiers with siblings, but drifts three ways: `surface-raised-hover` fill vs siblings' `skeleton-base` (StatCard uses skeleton-base), dead border token, re-rolled Card surface. Not "one voice in tune." |
| craft-unseen | gap | Genuine craft intent — tapering bar widths, per-row/card stagger, deterministic layout. Undercut by the stagger shipping dead and the border token shipping dead: two polish gestures that silently do nothing. |
| perceived-performance | gap | Server-safe (`// @server-safe`) → usable for SSR initial paint, real plus. No CLS-avoidance guarantee (fixed vs real-content widths); dead stagger means no progressive reveal; no skeleton→content crossfade. |
| market-benchmark | ✗ (LAGS) | vs MUI Skeleton / React Aria. Lag: no `aria-busy` loading region (React Aria/Adobe wrap automatically), broken animation, dead token, forced-colors invisibility. Match: server-safe, shape variety, base-primitive composition. No `wave` animation option (MUI has pulse+wave). |
| cross-ds-adoption | gap | See ideas below — concrete borrowable patterns from MUI, React Aria, Linear/Vercel. |

## Top gaps (prioritized)
- **[P0] accessibility** — Entire loading region silent to AT + bars invisible in forced-colors → wrap each root in `SkeletonGroup` (or apply `role="status" aria-busy="true"` + sr-only "Loading…", optional `label` prop), and stop overriding the fill so `skeleton-base`'s forced-colors mapping applies.
- **[P0] visual-integrity** — Dead `border-card-strong` (lines 18, 59, 137) renders a currentColor fallback border. Swap to the valid `border-card` (`--color-surface-border-card`) or restore `border-surface-border-strong` (still correctly used on interior dividers at lines 64, 82, 182). Release-context relevant since it's a token/utility drift.
- **[P1] api-composability + system-cohesion** — Compose `<Card>`/`<CardContent>` (as StatCard's loading branch, stat-card.tsx:241) instead of hand-rolling `rounded-surface border … bg-surface-raised p-*` in three exports; drop the `bg-surface-raised-hover` fill override and inherit `skeleton-base`.
- **[P1] motion** — Remove the inert `animationDelay`, or wire a real CSS-var stagger onto the animated element with a `motion-reduce` guard.
- **[P1] state-coverage** — Clamp count props (`Math.max(0, Math.floor(rows ?? default))`) so `rows={-1}`/`NaN` can't throw and `rows={0}` degrades cleanly.
- **[P2] testing** — Add a `vitest-axe` pass (will catch the missing status region once fixed); stop asserting on the `w-[272px]` literal.
- **[P2] visual-integrity** — Replace `w-[128px]`/`w-[272px]`/`w-[56px]` with `--spacing-ds-*` scale values (most bars already migrated to `w-ds-*`/`h-ds-*` since the baseline — finish the job).

## What it does well
- Visually restrained — no accent rails, gradient text, emoji, blob/glass/glow, or framework palette; all colors are semantic tokens.
- Clean types: `forwardRef` + `displayName` on all four, exported prop interfaces, no `any`/`React.FC`/stringly enums, sensible defaults.
- Server-safe (`// @server-safe`) — genuinely useful for Next.js app-router initial-paint skeletons.
- Radius uses role tokens throughout (`rounded-surface`/`-pill`/`-control`, bare `rounded`) — no `rounded-ds-*`/`rounded-full`, so no release-gate radius blocker and `[data-shape]` presets work.
- Content shape shows care: tapering bar widths, `overflow-x-auto` board, `flex-1` table columns, avatar toggle.

## Cross-DS adoption ideas
- **MUI Skeleton** offers a `wave` animation (a traveling gradient sweep) alongside `pulse` — our base `Skeleton` already has `shimmer`; expose it through these composed layouts (currently hardcoded to base default pulse) so consumers can pick.
- **React Aria / Adobe** ties skeletons to an `isLoading`/`aria-busy` region automatically — adopt an `isLoading`-coordinated wrapper (or at minimum always render the `SkeletonGroup` status region) so AT announcement is not opt-in.
- **Linear / Vercel** crossfade skeleton → real content on load (opacity transition) rather than a hard swap — a `motion-safe` crossfade on the content mount would remove the pop these placeholders currently precede.
- **A real staggered reveal** (what the dead `animationDelay` was reaching for) via a CSS custom property the pulse keyframe consumes, guarded by `motion-reduce` — cheap, and it's already half-wired.

## Rebuild note
**Polish, not rebuild.** Every defect is in-place fixable without structural teardown: (1) swap the dead `border-card-strong` for `border-card`; (2) wrap roots in `SkeletonGroup` for `role=status`/`aria-busy`; (3) drop the `bg-surface-raised-hover` override to inherit `skeleton-base` (fixes forced-colors in one move); (4) remove or correctly wire the stagger; (5) clamp counts; (6) optionally compose `<Card>` to kill the surface drift. The architecture (four count-driven layouts over one base primitive) is sound; the finish is what's missing. Note the P0 a11y failure caps the score at 2/5 regardless of the otherwise-clean type/visual surface.
