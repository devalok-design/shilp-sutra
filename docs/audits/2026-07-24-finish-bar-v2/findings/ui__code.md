# ui/code — finish-bar audit
Finish: 3/5   Market: LAGS(Radix Themes Code)   Rebuild: polish

Code is a small, disciplined `@server-safe` typographic primitive (`<code>` inline / `<pre><code>` block). It was 4/5 on the 2026-07-01 baseline. Since then a token-binding regression shipped and none of the baseline polish items were applied, so it drops to 3.

**Root regression (P0):** the block variant's `border-card-strong` (`code.tsx:40`) is a **dead class**. There is no `@utility border-card-strong` and no `--color-card-strong` token — only `@utility border-card` (`tokens/utilities.css:342` → `--color-surface-border-card`) and `--color-surface-border-strong` exist. In TW4 an unmatched color utility emits nothing, so `border-color` falls back to `currentColor` = `text-surface-fg` (neutral-12). The block code border therefore renders at **full text contrast** — a near-black hairline in light, near-white in dark — instead of the subtle 30%-neutral-5 card edge. The 2026-07-01 baseline had `border-surface-border-strong` (a real token) here; a rename to `border-card-strong` introduced the bug. The inline variant's `border-card` (`code.tsx:54`) is fine. This dead class is **systemic**: it also appears in data-table-header, data-table-pagination, command-palette, error-boundary, loading-skeleton, page-skeletons, schedule-view, notification-center, and top-bar.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✗ | `border-card-strong` dead class → block border renders as `currentColor` (full text-contrast) in both themes. Otherwise clean: no accent rail, no gradient/glow, role radius (`rounded-surface`/`rounded-control-inner`), spacing on cadence, no shadow so no edge-soup. |
| accessibility | ✓ | Correct semantic `<code>`/`<pre><code>`; non-interactive so no ARIA/focus needed; `overflow-x-auto` on block. Minor: the scrollable block region has no keyboard focus (WCAG 2.1.1 scrollable-region), P2. |
| api-composability | ✓ | Typed `CodeProps extends HTMLAttributes`, `forwardRef<HTMLPreElement \| HTMLElement>`, `displayName`, `ReactNode` children, no `any`. `variant: inline\|block` is a legit structural axis. No `asChild`/Slot and block's inner `<code>` is unaddressable — acceptable for a leaf. |
| docs-dx | gap | Doc (`code.md`) omits the inherited `HTMLAttributes`+`ref` surface (baseline P2, still open). JSDoc still says "layer-03 background" (dead vocab; actual class is `surface-raised-hover`) and still ships the engagement-bait closer "feel free to combine props creatively!" + em-dash connectors into the published `.d.ts`. |
| testing | ✓ | `describeConformance` + 3 behavior tests (element type, `<pre><code>` nesting, `overflow-x-auto`). No explicit `vitest-axe` assertion, but low value on a non-interactive element. |
| motion | N/A | Intentionally static / `@server-safe`. Correct — code text must never animate. |
| state-coverage | ✓ | Non-interactive; hover/active/focus/disabled/loading/empty/error are N/A and correctly absent. No copy affordance on block, but explicitly scoped out in the doc. |
| content-resilience | gap | Block handles long lines via `overflow-x-auto` (good). Inline `<code>` has no `overflow-wrap`/`break-words` — a long unbroken token (URL, API key) can overflow a narrow parent instead of breaking. |
| theming-resilience | gap | Inline themes correctly (`border-card` bound). Block border does NOT track the theme border token (same dead-class root cause) — it stays `currentColor` across brand-accent swaps, `[data-shape]`, and light↔dark, so it's harsh in both themes. Radius role tokens correctly honor `[data-shape]`. |
| system-cohesion | ✓ | Shares DS radius language, surface tokens, spacing tiers, and `font-mono` with siblings. (Ironically the dead `border-card-strong` is "cohesive" only in that many siblings repeat the same mistake.) |
| craft | gap | Nice touches: `leading-ds-relaxed` on block, positive tracking on small type, `rounded-control-inner` (2px, documented for inline Code). Undercut by the shipped full-contrast border and the inline no-wrap gap. |
| perceived-perf | ✓ | Pure CSS, zero JS, SSR-safe, no layout shift, no jank. Best-possible for the archetype. |
| market-benchmark | ✗ | LAGS. Radix Themes `Code` offers `variant` (solid/soft/outline/ghost), `color`, `size`, `weight`; Nextra/Primer code blocks offer copy button + filename caption + line highlight. We ship inline+block only. |
| cross-ds-adoption | gap | Concrete imports available (see below) — we currently take none of them. |

## Top gaps (prioritized)
- [P0] visual-integrity / theming — `border-card-strong` (`code.tsx:40`) is a dead class → block border = `currentColor`, full text-contrast in both themes → change to `border-card` (matches inline + Card), or add an `@utility border-card-strong { border-color: var(--color-surface-border-strong) }` if a stronger edge is intended. Then sweep the 9 other files using the same dead class.
- [P1] docs-dx — remove stale "layer-03" from JSDoc (`code.tsx:11`) → say "subtle surface-3 tint (`bg-surface-raised-hover`)"; delete the engagement-bait closer (`code.tsx:27`); de-em-dash the JSDoc prose (ships in `.d.ts`).
- [P2] docs-dx — `code.md` prop table should note it forwards all `HTMLAttributes` + `ref` to the rendered `<code>`/`<pre>`.
- [P2] content-resilience — add `break-words`/`overflow-wrap-anywhere` to the inline variant so long unbroken tokens wrap instead of overflowing narrow parents.
- [P2] accessibility — block scrollable region has no keyboard focus (WCAG 2.1.1); consider `tabindex=0` + `role="region"` + `aria-label` when content is scrollable, or document the limitation.

## What it does well
- Correct semantic elements (`<code>` inline, `<pre><code>` block) with `overflow-x-auto` for horizontal scroll (test-asserted).
- Clean, minimal, well-typed API: `forwardRef`, `displayName`, `extends HTMLAttributes`, `ReactNode` children, single structural `variant` axis, no `any`.
- Role-based radius (`rounded-surface`, `rounded-control-inner`) and on-cadence spacing (`p-ds-05`, `px-ds-02`, `py-ds-01`) — no `rounded-ds-*`/`rounded-full`, no arbitrary `p-[..]`/`h-[..]`.
- Single edge treatment per variant (border, no shadow) — no edge-soup; `font-mono` bound to the brand token, not a hardcoded mono.
- `@server-safe`, zero JS, no layout shift — ideal perceived performance for the archetype.
- Good story coverage (5): inline, inline-in-paragraph, block, multiline block, single-line block.

## Cross-DS adoption ideas
- **Radix Themes `Code`** carries `variant` (solid/soft/outline/ghost), `color`, `size`, and `weight` — inline code can then take a semantic tint (e.g. a soft error tint for a deprecated token). We could add an optional `color`/`size` prop to the inline variant without touching the block API.
- **Nextra / GitHub Primer / Shiki code blocks** ship a copy-to-clipboard button, an optional filename caption bar, and a line-number gutter / line-highlight slot. Rather than bloat this leaf primitive, spin these into a future composed `CodeBlock` that wraps `<Code variant="block">` (matches the doc's own "not a syntax-highlighted viewer" scope note).
- **Radix / Primer** address the inner `<code>` of the block so a syntax highlighter can attach — expose an optional `codeProps`/`asChild` seam only if a real consumer need appears (do not gold-plate speculatively).

## Rebuild note
Polish, not rebuild. The structure (two-variant typographic primitive) is correct and market-appropriate. Required work is small and in-place: (1) fix the `border-card-strong` dead class on the block variant — a one-token change — and sweep the 9 sibling files carrying the same dead class DS-wide; (2) clean the JSDoc (drop "layer-03" + the engagement-bait closer + em-dashes) since it ships in published types; (3) add the inherited-attributes/ref note to the doc; (4) optionally add inline `break-words` for long tokens. No API change, no structural change, no motion needed.
