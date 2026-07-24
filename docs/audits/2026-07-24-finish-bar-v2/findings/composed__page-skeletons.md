# composed/page-skeletons — finish-bar audit
Finish: 2/5   Market: LAGS(Vercel/Geist Skeleton)   Rebuild: polish

Three static, server-safe full-page loading layouts (`DashboardSkeleton`, `ProjectListSkeleton`, `TaskDetailSkeleton`) assembled from `ui/Skeleton` bars. No CVA, no interactivity, no own motion. Many axes score N/A — but the ones that matter for a skeleton (visual fidelity to the loaded UI, a busy announcement, perceived perf) are the ones with problems.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✗ | **Dead class `border border-card-strong` on all 4 card tiles** (lines 22, 35, 99, 141). No `border-card-strong` utility / `--color-card-strong` token exists (utilities.css:342 defines only `@utility border-card`). TW4 falls back to `currentColor` → a hard foreground-color border on every tile. Prior audit shows this was a valid `border-surface-border-strong` — a regression. Also: card tiles use `rounded-overlay-lg` (16px Dialog radius) not `rounded-surface` (10px Card radius); `shimmer` const overrides `bg-skeleton-base` with `bg-surface-raised-hover`. |
| accessibility | ✗ | Root divs have no `role="status"` / `aria-busy` / `aria-live`; `SkeletonGroup` (which exists for exactly this) is unused. Every `<Skeleton>` is `aria-hidden`, so AT users get **nothing** during a full-page load — the highest-value place for a busy announcement. No interactive elements, so keyboard/focus N/A. |
| api-composability | gap | Clean `forwardRef` + `displayName` + typed `ComponentPropsWithoutRef<'div'>` props on all three. But hand-rolls the Card surface (surface+border+radius+padding) 4× instead of composing `<Card>` — the StatCard drift. No count/slot props; layout fully fixed. Doesn't reuse `SkeletonAvatar`/`SkeletonText`/`SkeletonGroup` siblings that already encode these shapes. |
| docs-dx | gap | Doc claims "Built on LoadingSkeleton + ui/Skeleton" and "compose LoadingSkeleton pieces" — false; source imports only `ui/Skeleton`. Props/Example/Gotchas otherwise fine. Stories + tests now exist (prior P3 resolved). |
| testing | gap | `describeConformance` ×3 + render/structure/className/ref tests. No `vitest-axe` play test; structural assertions query brittle class strings (`[class*="flex items-center gap-ds-05 py-ds-03"]`). No dark / reduced-motion visual lock. |
| motion | gap | Inherits Skeleton's `pulse` with `motion-reduce:animate-none` guard (good, respected). But the `shimmer` const is a misnomer — it sets a color, not motion, and overrides the skeleton fill token. Never opts into the real `animation="shimmer"` sweep. Uniform pulse is acceptable for a skeleton. |
| state-coverage | N/A | A skeleton represents a single state (loading). Hover/active/disabled/empty/error don't apply. |
| content-resilience | gap | Fixed counts (4 stats / 6 projects / 5 rows) with no props to tune → mismatch risk when the real page differs. Text-line widths use fraction utils (`w-3/4`, `w-2/3`) nicely, but mixed with ~7 raw `w-[112px]/[128px]/[192px]` magic numbers. Avatar overlap uses `-space-x-ds-03` (physical, not logical) — minor RTL wrinkle; grids are RTL-safe. No text so no truncation concern. |
| theming-resilience | gap | Surface/skeleton tokens are theme-aware, radius role tokens honor `[data-shape]`. BUT the dead `border-card-strong` → `currentColor` does not track the border-token system in either theme (renders foreground-heavy), and the `bg-surface-raised-hover` fill override stops bars tracking `--color-skeleton-base` in dark. |
| system-cohesion | ✗ | Re-rolled card surface + Dialog radius on card-shaped blocks + fill override + a diverged/dead border token = multiple drifts from how the DS's real Card/StatCard render. The placeholder no longer pre-echoes the loaded UI it stands in for. |
| craft | gap | Nice touches: staggered `w-3/4`/`w-2/3` text widths, `mx-auto` calendar cells, negative-space avatar stack, deterministic grid. Undermined by the visible dead-class border. |
| perceived-performance | ✓ | Server-safe, zero JS, static markup → instant render in a Next `loading.tsx`, no CLS, pulse gives liveness. This is the component's real strength. |
| market-benchmark | ✗ (LAGS) | vs Vercel/Geist, MUI, react-loading-skeleton, and best-in-class product skeletons (LinkedIn/YouTube): peers match the loaded layout precisely and announce busy state. Ours ships a visible border bug and no `aria-busy` → lags on both fidelity and a11y. |
| cross-ds-adoption | gap | See ideas below. |

## Top gaps (prioritized)
- [P0] visual-integrity — `border border-card-strong` is a dead class on 4 tiles → hard `currentColor` border in both themes. → Replace with `border-card` (the real hairline utility) or, better, compose `<Card>` / a shared server-safe surface-class constant.
- [P1] accessibility — no busy announcement on full-page loads. → Wrap each root in `SkeletonGroup` (or add `role="status" aria-busy="true"` + sr-only "Loading dashboard…").
- [P1] system-cohesion / api — hand-rolled card surface (4×) + `rounded-overlay-lg` (Dialog) on card tiles diverges from Card/StatCard. → Compose `<Card>` (or shared class); switch to `rounded-surface`; drop the `bg-surface-raised-hover` fill override and let `<Skeleton>` own `bg-skeleton-base`.
- [P2] content-resilience — ~7 raw `w-[Npx]` magic numbers remain; fixed counts. → Move to `w-ds-*` tokens; consider optional `count`-style props.
- [P2] docs — "Built on LoadingSkeleton" is false. → Correct to "assembled from `ui/Skeleton`"; document the fixed 4/6/5 counts.
- [P2] motion — `shimmer` const is a color, not motion. → Rename to `skeletonTint` or remove; opt into `animation="shimmer"` explicitly if a sweep is wanted.

## What it does well
- Server-safe (`// @server-safe`, no `'use client'`, no framer import) → drop straight into `loading.tsx` for instant, zero-CLS route feedback. This is its whole reason to exist and it nails it.
- Clean typing hygiene: `forwardRef` + `displayName` + exported prop interfaces on all three, no `any`.
- Reduced-motion honored via the inherited Skeleton default.
- Deterministic, considered layout — staggered text-line widths and avatar overlap read like real content, not uniform gray blocks.
- No accent rails / gradients / glass / emoji / pill-spam. Radius uses role tokens only (no `rounded-ds-*`/`rounded-full` — passes the release gate).

## Cross-DS adoption ideas
- **react-loading-skeleton** exposes `count` and inherits parent font/line-height so a bar auto-sizes to the text it replaces — we could add `statCount`/`projectCount`/`rowCount` props (or expose the regional builders) so the placeholder matches the real page instead of a fixed 4/6/5.
- **Vercel/Geist & MUI** derive skeleton dimensions from the actual typography scale — we could map bar heights to `text-ds-*`/`h-ds-*` roles (label ≈ `text-ds-sm`, value ≈ `text-ds-3xl`) instead of raw px, so bars track the type ramp.
- **MUI Skeleton** unifies on one shimmer/wave token system across every placeholder — we should let the real `<Skeleton animation>` own fill + motion rather than overriding it per call site, so all skeletons on a page shimmer identically.
- **LinkedIn/YouTube** page skeletons are byte-for-byte the loaded layout (same component, content hidden) — composing the real `<Card>` here would guarantee the placeholder can never desync from the loaded card.

## Rebuild note
**Polish, not rebuild.** The structure (three static server-safe layouts) is right and the perceived-perf story is excellent. Every defect is class-level: swap the dead `border-card-strong` for `border-card` (or compose `<Card>`), add a `SkeletonGroup`/`role=status` wrapper, correct the card radius to `rounded-surface`, drop the fill override + rename the misleading `shimmer` const, detokenize the remaining `w-[Npx]` bars, and fix the "Built on LoadingSkeleton" doc line. No API or architecture change required — but the dead-class border is a genuine visible bug and should be treated as P0.
