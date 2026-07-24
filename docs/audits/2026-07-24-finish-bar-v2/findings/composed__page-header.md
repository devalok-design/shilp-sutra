# composed/page-header — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

Server-safe page-top header: title + subtitle + breadcrumbs + actions slot on the
page background with a bottom hairline. **Materially improved since the 2026-07-01
baseline (3/5):** it no longer re-rolls Breadcrumb — it now composes the
`Breadcrumb*` family (`BreadcrumbNav/List/Item/Link/Page/Separator`), which
restores `<ol>/<li>` semantics + `aria-current="page"` and keeps the `// @server-safe`
annotation valid (Breadcrumb uses an inline glyph, no client `Icon`). Typography
now routes through the canonical composite utilities (`text-heading-md`,
`text-body-md`, `text-body-sm`) instead of hardcoded `text-ds-*`. Clean visuals,
solid a11y and tests. Remaining gaps are polish: string-only content props,
doc drift, RTL chevron, and a deliberate-but-undocumented no-motion stance.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Single `border-b border-surface-border-strong`, no shadow → no edge-soup. Semantic tokens throughout, `font-semibold` heading, composite type utilities. No rounded-*/radius tokens in component (N/A), no accent rail, no gradient/glow/emoji/pill-spam. |
| accessibility | ✓ | `<h1>` title; breadcrumb `<nav aria-label>` with `<ol>/<li>` + `aria-current` via composed Breadcrumb; focus ring inherited from the primitive. Minor: resolved-title duplicates the breadcrumb leaf text (SR reads it twice), and an all-empty header renders a bare bordered div. |
| api-composability | gap | `forwardRef`+`displayName`, typed props, extends `HTMLAttributes`, now composes Breadcrumb. But `title`/`subtitle` are `string` (can't drop a `<Badge>`/status dot beside the title), no compound slots (`PageHeader.Title/.Actions`), no `asChild` on the h1, and `titleClassName` is the escape-hatch this creates. |
| docs-dx | gap | Doc marks `title` as required `string` (source is `title?`), "Defaults: None" ignores the title→last-breadcrumb-label fallback, and omits the `extends HTMLAttributes` note. "Renders Breadcrumb internally" is now accurate (was false at baseline). |
| testing | ✓ | `describeConformance` + RTL tests for title/subtitle/breadcrumbs/link-as-anchor/derived-title/actions/wrap(#133)/className/titleClassName/precedence. No standalone axe play test in stories (conformance covers baseline a11y). |
| motion | gap | Zero motion by design (server-safe → can't pull framer-motion). Breadcrumb links carry `transition-colors`. Acceptable for a route-mount static header, but the no-motion decision is undocumented and there's no reduced-motion story to point to. |
| state-coverage | gap | Hover/focus on breadcrumb links are real; disabled/loading/error N/A. Empty state is degenerate (empty bordered div); title has no truncation strategy (relies on wrap), only `subtitle` is `line-clamp-2`. |
| content-resilience | gap | `min-w-0` title column + `flex-wrap` actions (mobile-safe, #133) + subtitle clamp are good. But RTL: the breadcrumb `ChevronGlyph` (`M9 6l6 6l-6 6`) is a fixed right-pointing SVG with no logical mirroring — arrows won't flip in RTL. Long title wraps (no clamp). |
| theming-resilience | ✓ | Fully semantic (`surface-fg`, `surface-fg-subtle`, `surface-border-strong`); survives accent swap; dark override (`--neutral-5`) + `forced-colors` (`CanvasText`) both defined for the border. No elevation-inversion risk (border on page bg, not a recessed track). |
| system-cohesion | ✓ | Composes Breadcrumb, uses shared spacing (`ds-02b/03/05/06`), color, and composite type tokens — no bespoke drift. Feels like one system. Minor: hand-writes the `<h1>` rather than composing the `Text` primitive, but uses the same `text-heading-md` utility so it stays single-sourced. |
| craft | ✓ | `min-w-0` guards truncation, `items-start` keeps actions top-aligned against a two-line title, `flex-wrap` drops actions to their own line on narrow, `resolvedTitle` fallback removes duplication. Genuine unseen-detail work. |
| perceived-performance | ✓ | Static server component, zero client JS for layout, no CLS, instant render. |
| market-benchmark | ✓ (PARITY) | vs Carbon/Atlassian PageHeader, Vercel/Geist, Linear. Ours is cleaner and lighter; shadcn has no page-header primitive. We lag Carbon/Atlassian on richness (integrated tabs row, back nav, actions overflow, sticky-condense). Net PARITY. |
| cross-DS-adoption | gap | Concrete borrow list below. |

## Top gaps (prioritized)
- [P1] api-composability — `title`/`subtitle` are `string`, so a Badge/status-dot/two-line title needs `titleClassName` hacks → **widen both to `ReactNode` (non-breaking widening)**; optionally add compound `PageHeader.Title/.Actions` slots and deprecate `titleClassName`.
- [P1] content-resilience — RTL breadcrumb arrows don't mirror (fixed-direction `ChevronGlyph` in `ui/breadcrumb.tsx`) → mirror the separator under `[dir=rtl]` (logical flip), which also lifts every Breadcrumb consumer.
- [P2] docs-dx — prop table drift: mark `title`/all props optional, document the title→last-breadcrumb fallback as default behavior, note `extends HTMLAttributes`.
- [P2] motion / state-coverage — decide + document the no-motion stance (fine for a server-static header); add RTL, empty, and forced-colors stories.
- [P2] docs — stories model bad consumer behavior: raw `<button>` with inline styles and hardcoded `#D33163` hex → use `<Button variant="soft">Export</Button>` + `<Button>Add</Button>` (per CLAUDE.md soft-over-outline).

## What it does well
- Composes the real Breadcrumb family (baseline's biggest gap, now closed) — inherits list semantics, `aria-current`, and server-safety.
- Restrained, tokenized visuals: one edge treatment (bottom hairline), no slop tells, dark + forced-colors handled.
- Mobile-safe action wrapping with `min-w-0` + `flex-wrap` (the #133 fix), top-aligned actions, and a smart title-from-breadcrumb fallback.
- Genuinely server-safe end to end; strong RTL-style test coverage via `describeConformance`.

## Cross-DS adoption ideas
- **Atlassian PageHeader** integrates an actions **overflow menu** when the cluster exceeds ~3 — we wrap instead; an overflow affordance for dense toolbars would beat wrapping.
- **Carbon / Atlassian** bake a **tabs / sub-nav row** into the header; we explicitly punt to a sibling Tabs. A `belowContent`/`tabs` slot would consolidate the common page-shell layout.
- **Linear / Vercel** do a **sticky-on-scroll condense** (title shrinks, breadcrumb collapses) — a stretch for a server component but a compelling client variant.
- **Carbon** offers a **back-navigation** leading slot for detail pages; we only have breadcrumbs. A `leading`/`back` slot would cover the drill-in pattern.

## Rebuild note
**Polish, not rebuild.** The structural debt the baseline flagged (Breadcrumb re-roll, typography re-roll, false doc) is already resolved in source. Remaining work is additive/non-breaking: widen `title`/`subtitle` to `ReactNode` and optionally add compound slots (deprecating `titleClassName`), mirror the breadcrumb chevron for RTL, correct the doc prop table, and upgrade the stories to DS `Button` + add RTL/empty/forced-colors coverage. No architectural change needed.
