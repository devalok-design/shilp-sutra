# ui/breadcrumb — finish-bar audit
Finish: 4/5   Market: PARITY (shadcn Breadcrumb)   Rebuild: polish

Compound text-nav (`nav → ol → li` with Link/Page/Separator/Ellipsis parts). Server-safe (`// @server-safe`), inline SVG glyphs instead of the client `Icon` — a deliberate change since the 2026-07-01 audit so `PageHeader` can compose it server-side. No CVA, no motion beyond a hover color transition. Accessibility is the strong suit; composability carries a few latent defects (all inherited from the shadcn source and unfixed since the last audit).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells; semantic tokens (`text-surface-fg-muted`, `accent-9`); radius **role** token `rounded-control-inner` (not `rounded-ds-*`/`full`) — clean. Sole blemish: `max-w-[20ch]` magic value, duplicated verbatim on Link (l.60) and Page (l.74). |
| accessibility | ✓ | `<nav aria-label="breadcrumb">`, semantic `ol/li`, `aria-current="page"` on Page, separators `aria-hidden role="presentation"`, ellipsis carries `sr-only "More"`, real `focus-visible:ring-2 ring-accent-9`. Exceeds shadcn (adds focus ring). Inline text links → WCAG 2.5.8 inline exception, so no 44px touch-target needed. |
| api-composability | gap | Several real defects: (1) **phantom `separator` prop** on root — declared in the type (l.25) but never destructured, so it flows through `...props` and spreads onto the `<nav>` DOM node (React unknown-attr warning + invalid HTML); (2) exported `BreadcrumbLinkProps` (l.107) omits `asChild` the component actually accepts (l.52); (3) `BreadcrumbEllipsis` has no `asChild` despite the doc teaching a DropdownMenu-trigger pattern; (4) Separator + Ellipsis are plain fns, not `forwardRef` like the other 5 parts. Core compound works and matches the peer, hence gap not ✗. |
| docs-dx | gap | Has Example / Composability / Gotchas and mostly matches source, but drift: doc l.12 says Separator is "auto-rendered" — there is **no** auto-insertion; every story/test places `<BreadcrumbSeparator/>` by hand. Defaults listed as "none" (fine). |
| testing | ✓ | 8 tests: axe, nav landmark + label, links + href, aria-current, separator presentation, ellipsis sr-only, root ref-forward, className merge. Good coverage. No `describeConformance`, and Separator/Ellipsis ref not tested (they don't forward). |
| motion | ✓ | Only `transition-colors duration-fast-01 ease-productive-standard` on link hover — token-bound, color-only, no layout animation, no reduced-motion guard needed. Correct restraint for a nav element; server-safe means no entrance motion (right call). |
| state-coverage | ✓ | hover (color→`surface-fg`), focus-visible (ring), current (font-medium + full fg). No disabled/active — appropriate for nav links. Empty/error/loading N/A for breadcrumb. |
| content-resilience | gap | `truncate max-w-[20ch]` + `flex-wrap` + `break-words` + `sm:gap` responsive; Ellipsis for deep paths. But truncation is **forced default** (clips a legit 21-char single crumb) with no prop escape hatch, and **no `title`/tooltip** on truncated crumbs so clipped text is unrecoverable by mouse. Chevron glyph does **not** mirror in RTL (static `M9 6l6 6l-6 6`, no logical direction). |
| theming-resilience | ✓ | All-semantic tokens + radius role token → survives brand accent-9 swap and `[data-shape]` presets. No surface/elevation, so no dark-mode inversion risk. |
| system-cohesion | gap | Shares focus-ring, radius role token, spacing cadence, duration/easing with siblings. But 2 of 7 parts skip `forwardRef` (family inconsistency), and the exported-type gap breaks the "typed props match surface" norm. Inline-glyph divergence from the `Icon` API is justified (server-safe) but is a bespoke path. |
| craft | gap | `min-w-0` before `truncate` (correct), `sm:gap-ds-03` optical bump, `break-words`, `sr-only More`, decorative glyphs `aria-hidden`. Solid. Miss: no `title` on truncated links (the detail users feel when a name clips), no cursor treatment. |
| perceived-performance | ✓ | Static, server-renderable, zero JS state, instant, no CLS, no jank. |
| market-benchmark | PARITY | This *is* shadcn's Breadcrumb + server-safe glyphs + focus ring + DS tokens. Leads shadcn on focus ring/tokens; carries shadcn's identical phantom-`separator` bug; lags Ark UI (real context + wired separator) and react-aria (responsive auto-collapse). Net parity. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P1] api-composability** — phantom `separator` prop leaks onto the `<nav>` DOM node (unknown-attr warning + invalid HTML) → either drop the prop (per-Separator `children` override already covers custom glyphs) or wire it through a `BreadcrumbContext` that Separator reads.
- **[P1] visual-integrity** — `max-w-[20ch]` magic value duplicated on Link + Page → hoist to one shared class const, and consider making truncation opt-in (a short crumb shouldn't clip by default).
- **[P2] content-resilience/RTL** — chevron glyph doesn't mirror in RTL and truncated crumbs have no `title` → use a logical/mirrored separator (or `rtl:-scale-x-100`) and add `title` on truncated text.
- **[P2] api-composability** — `BreadcrumbEllipsis` lacks `asChild` despite the documented DropdownMenu-trigger pattern; Separator + Ellipsis aren't `forwardRef` → add Slot + forwardRef, shed `aria-hidden`/`role="presentation"` when the ellipsis is used as an interactive trigger.
- **[P2] docs** — doc says Separator is "auto-rendered"; it is not → "chevron by default, override via children".
- **[P3] types** — export `BreadcrumbLinkProps` with `& { asChild?: boolean }` to match the real surface.

## What it does well
- Textbook a11y: correct landmark + label, semantic `ol/li`, `aria-current="page"`, decorative parts hidden from AT, ellipsis with an accessible "More" name, and a real focus-visible ring (not stripped).
- Genuinely server-safe — inline glyphs remove the client `Icon` dependency so `PageHeader` composes it without a "use client" boundary.
- Token discipline: spacing, typography, radius (role token), duration, easing all bound; the sole arbitrary value is `max-w-[20ch]`.
- Motion restraint: the one transition is color-only and correctly needs no reduced-motion guard.

## Cross-DS adoption ideas
- **Ark UI Breadcrumb** ships a context provider and a separator that's actually wired at the root — adopting that would let the (currently phantom) `separator` prop work family-wide instead of per-item.
- **React Aria / GitHub Primer** do responsive auto-collapse: crumbs collapse into the ellipsis based on available width, ellipsis opens a menu of the hidden ones. We hand-place the ellipsis and hand-pick what to hide — a `maxItems`/overflow-aware variant would beat the peer.
- **Most mature DSs** add `title` (or a tooltip) on truncated crumbs so clipped names stay recoverable — cheap craft win we're missing.
- **Logical-direction separators** (mirrored chevron in RTL) — a `rtl:-scale-x-100` or an `IconChevronEnd`-style logical glyph.

## Rebuild note
**Polish, not rebuild.** The structure (semantic compound, server-safe, strong a11y) is right and matches the best available peer — nothing structural is wrong. The work is a tight in-place pass: remove/wire the phantom `separator` prop (stop the DOM leak), de-duplicate `max-w-[20ch]` and make truncation opt-in with a `title`, add `asChild` + `forwardRef` to Ellipsis/Separator, mirror the RTL chevron, widen `BreadcrumbLinkProps`, and correct the "auto-rendered" doc line. None of these touch the render tree shape. Notably, none of the 2026-07-01 polish plan landed except the icon→glyph server-safe swap — this is the same backlog, re-verified against current source.
