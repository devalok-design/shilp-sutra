# ui/skeleton — finish-bar audit
Finish: 3/5   Market: PARITY   Rebuild: polish

Skeleton is a non-interactive feedback primitive (base `Skeleton` + seven sub-components:
Avatar, Text, Button, Input, Chart, Image, Group). It is genuinely clean on the anti-slop
tells — no accent rail, gradient text, glass/glow/blob, emoji, or pill-spam; neutral-only
semantic tokens; TW4-correct `bg-linear-to-r`; role radius tokens throughout. Tokens are real
and hardened: `--color-skeleton-base`/`-shimmer` carry light, dark, AND `forced-colors`
overrides (`semantic.css:305/634/816`), the `skeleton-shimmer` keyframe is a proper
`@theme` animation (`animations.css:28/82`), and `[data-skeleton] { animation:none }`
(`semantic.css:845`) gives a global reduced-motion kill switch.

The score is held at 3/5 by the same **structural composability drift** the 2026-07-01 baseline
flagged (all still present in current source): the seven sub-components each re-roll
`bg-skeleton-base` + radius + animation by hand instead of composing the base, there are **two
divergent shimmer recipes** that already differ behaviorally, the file mixes DS spacing tokens
with raw utilities, and only the base primitive is `aria-hidden`. None is a hard failure — it
ships, it is well-tested — but it's maintainability debt below the Card bar.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean of all slop tells; role radius tokens (`rounded-control/-inner/-pill/-t-control-inner`), neutral semantic tokens. One tell: `SkeletonInput` (skeleton.tsx:242) stacks `border border-skeleton-base/30` on a filled surface — double-edge, near-invisible, the only bordered sub-component. |
| accessibility | gap | Base sets `aria-hidden` (:65); `SkeletonGroup` gives `role=status`/`aria-busy`/sr-only label (:354). But Avatar/Text/Button/Input/Chart/Image set NO ARIA — standalone (stories do this often, e.g. `FormSkeleton`) they are bare decorative divs exposed to AT. Non-interactive so no focus/keyboard needed; contrast N/A (decorative). Forced-colors handled at token layer. |
| api-composability | gap | `forwardRef`+`displayName` on all 8, typed prop interfaces, sensible defaults, `Math.max(1,…)` guards (:157,:269). BUT seven sub-components re-roll the base recipe (:109,:168,:208,:242,:282,:311) instead of composing `Skeleton` — the StatCard-vs-Card drift. `variant` is shape-named (`rectangle/circle/text`) not the canonical `solid/soft/...` — defensible for a non-interactive shape primitive. No `asChild` — acceptable (always a div). |
| docs-dx | ✓ | `docs/components/ui/skeleton.md` exists and matches source: Props/Defaults/Example/Composability/Gotchas for all 8. Minor: `## Changes v0.1.0` says "`shape` variants" but the prop is `variant` (stale); sub-component JSDoc is thinner than the base's. |
| testing | ✓ | `describeConformance` + RTL + `vitest-axe`; covers line counts, `lines=0` guard, `lastLineWidth`, avatar sizes/shape, Group role/aria/sr-only/children. Gap: axe only runs on the Group-wrapped case; no test for standalone sub-component semantics or shimmer-string parity. |
| motion | ✓ | `pulse` (opacity) + `shimmer` (background-position, HW-accel) both `motion-reduce:animate-none`, plus global `[data-skeleton]` override. Linear easing is correct for an infinite loop; no bounce, no layout-prop animation. Gap only at the content-swap boundary (no crossfade to real content — see perceived-perf). |
| state-coverage | ✓ | For a placeholder, the deliberate states are the animation modes (`pulse`/`shimmer`/`none`) + count guards; empty/error/hover/focus N/A. `none` covers the paused/nested-loader case. Complete for the archetype. |
| content-resilience | ✓ | `lines`/`bars` guarded to ≥1; deterministic `BAR_HEIGHTS` (no random reflow); `lastLineWidth` full/¾/half; handles 1→10 lines. Minor: shimmer sweep is fixed L→R (`bg-linear-to-r`) — not mirrored in RTL (cosmetic). |
| theming-resilience | ✓ | Neutral-token based, so a brand accent-9 swap doesn't touch it (correct — skeletons should stay neutral). Role radius honors `[data-shape]`. Dark verified: base=`neutral-4`, shimmer=`neutral-3` — sweep stays visible on near-black (no elevation-vanish). Forced-colors mapped (GrayText/Canvas). |
| system-cohesion | gap | Two divergent shimmer recipes: CVA (:17) has `[background-attachment:fixed]`, the `animationClasses` helper (:81) does NOT — a real behavioral difference in how the sweep tracks on scroll. Mixed spacing vocabulary: Button/Input use `h-ds-sm/md/lg` but Avatar uses raw `h-8/h-10/h-12/h-16` and Text uses `h-3.5` — two dialects in one file. |
| craft | ✓ | Deterministic bar heights, `Math.max` guards, sr-only "…" continuation, forced-colors mapping, and the `[data-skeleton]` global kill switch are genuine unseen-detail craft. Undercut slightly by the shimmer-recipe divergence. |
| perceived-performance | gap | CSS-only animation (cheap, no JS/jank), instant paint. But no crossfade on content swap (abrupt hand-off to real content) and no dimension-inference-from-children (MUI/react-loading-skeleton have it) means consumers hand-size every skeleton → real CLS risk if the placeholder box ≠ loaded box. |
| market-benchmark | gap | PARITY. LEADS shadcn (one pulsing div) and Radix (no skeleton) comfortably. LAGS react-loading-skeleton + MUI Skeleton on theme-context cascade and auto-dimensioning. |
| cross-ds-adoption | ✓ | Clear, actionable imports identified below. |

## Top gaps (prioritized)
- [P1] api-composability / system-cohesion — 7 sub-components re-roll `bg-skeleton-base`+radius+animation and the shimmer recipe is defined **twice with a behavioral diff** (`[background-attachment:fixed]` present in CVA, absent in helper). → Introduce a shared internal `SkeletonBase` (or render `<Skeleton variant animation>`); delete `animationClasses`; route all animation through the CVA so fill/radius/animation have one source.
- [P1] accessibility — sub-components aren't `aria-hidden`; standalone they leak empty divs to AT. → Add `aria-hidden="true"` to each sub-component root (content is decorative); keep `SkeletonGroup` as the live region. Add an axe test for a standalone sub-component.
- [P2] visual-integrity — `SkeletonInput` double-edge (`border border-skeleton-base/30` on a fill). → Drop the border; let the fill be the shape, consistent with `SkeletonButton`.
- [P2] system-cohesion — raw `h-8/h-3.5/w-24` dimensions vs `h-ds-*` used elsewhere in the same file. → Move Avatar sizes and the Text line height onto `--spacing-ds-*` utilities, or document the deliberate raw scale.
- [P2] perceived-performance — no content-swap crossfade and no dimension inference. → Optionally expose a fade-out at the consumer boundary (`AnimatePresence`) and/or a way to infer size from children.
- [P2] visual-integrity — hand-rolled inline `<svg>` image glyph (:319-335) bypasses the Icon API. → Use a bare lucide/tabler glyph rendered directly (server-safe, no motion), sized via a token class.
- [P3] docs — `## Changes` says "`shape` variants" but the prop is `variant`. → Correct the changelog line.

## What it does well
- Zero anti-slop tells; strictly neutral semantic tokens that correctly stay accent-independent.
- Token hardening is exemplary: light + dark + `forced-colors` overrides AND a `[data-skeleton]` global reduced-motion kill switch — more than most peers ship.
- Both animations are `motion-reduce`-guarded and animate only HW-accelerated properties.
- Deterministic bar heights and `Math.max(1,…)` count guards prevent reflow/empty-render surprises.
- `SkeletonGroup` provides the correct `role="status"` + `aria-busy` + sr-only announce pattern.
- Genuinely composable surface: 7 shape primitives + a live-region wrapper cover the real layouts (list/table/card/form) shown in stories.

## Cross-DS adoption ideas
- **react-loading-skeleton** ships a `<SkeletonTheme>` context (baseColor / highlightColor / duration / borderRadius cascade) so a whole loading region is retinted from one provider — we have "no context cascade" (our own doc says so). A `<SkeletonProvider animation duration>` context would remove the per-component `animation` prop repetition.
- **react-loading-skeleton** `count` + inline wrapping renders N lines from one element; our `SkeletonText lines` covers the paragraph case but not arbitrary inline runs.
- **MUI Skeleton** infers width/height from its children (and from a Typography `variant`), eliminating the hand-sizing that creates CLS risk. A `<Skeleton>{realNode}</Skeleton>` measure-and-match mode would close our perceived-perf gap.
- **MUI** offers an `aspect-ratio` image skeleton and a `wave` animation distinct from `pulse`; our `shimmer` is the wave equivalent, but an explicit `aspectRatio` prop on `SkeletonImage` would beat hand-set `h-*`/`w-*`.

## Rebuild note
**Polish, not rebuild.** Visuals, tokens, motion, theming, and tests are at or above bar — there
is no structural teardown to do. The work is a targeted refactor: (1) collapse the seven
sub-components onto one shared `SkeletonBase` and delete the duplicate `animationClasses` map so
the shimmer recipe has a single source of truth; (2) add `aria-hidden` to every sub-component
root; (3) drop the `SkeletonInput` border; (4) tokenize the raw Avatar/Text dimensions. Each is
in-place and independently shippable. Optional stretch (moves toward LEADS): a `SkeletonProvider`
context and children-based dimension inference to match react-loading-skeleton/MUI.
