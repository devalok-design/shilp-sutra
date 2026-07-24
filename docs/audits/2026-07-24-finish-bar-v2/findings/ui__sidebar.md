# ui/sidebar — finish-bar audit
Finish: 3/5   Market: PARITY (shadcn sidebar)   Rebuild: polish

Large compound component (24 exports) that is a faithful re-tokenization of the
shadcn `sidebar` block onto our surface/spacing/duration/radius vocabulary. The
token migration is thorough — role radius tokens throughout (`rounded-control`,
`rounded-surface`, `rounded-overlay-lg`), correct `bg-surface-chrome` for shell
chrome (legitimately its own tier, not a surface-1 violation), semantic
`accent-*`/`surface-*` colors, no hex, no dead TW3 classes. It even beats shadcn
on two counts: mobile swipe-to-close (`SidebarSwipeWrapper`) and an animated
`layoutId` active-indicator. It falls short of the finish bar on: **zero test
coverage for this file**, **motion hygiene**, **an SSR hydration footgun**
(`Math.random()` skeleton width), **vocabulary drift** (menu-button
`default`/`outline` vs canonical `ghost`/`soft`/`outline`), **stray magic
numbers**, and a **duplicate `shell/sidebar.tsx`** that muddies which is canonical.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean of slop/edge-soup; correct surface-chrome + role radius. But off-cadence magic numbers: `w-4`/`w-5`/`h-5`/`min-w-5` (:369,530,687,709), `-mt-8` (:510), `top-1` (:689,711), `+2px` inside a calc (:310). Spacing-cadence drift. |
| accessibility | ✓ | `aria-label="Sidebar"`, `sr-only` toggle label, Ctrl/Cmd+B shortcut, `focus-visible:ring-2` everywhere, `aria-disabled`, tooltip-on-collapse, provider throws clear error. Action buttons expand hit area on mobile via `after:-inset-2 after:md:hidden`. Minor: collapsed icon buttons are 32px (`size-8`), below 44px, but desktop-only. |
| api-composability | gap | Good `asChild`/`forwardRef`/`displayName` coverage; controlled+uncontrolled provider. But menu-button `variant: default\|outline` is off the canonical `solid/soft/outline/ghost/link` taxonomy (`default` is a ghost); `isActive` is per-button controlled-only (acceptable for routed nav) with no `value`/`onValueChange` menu-level model; `SidebarProps` (:811) hand-duplicates the inline `Sidebar` prop type — two sources of truth. |
| docs-dx | gap | Doc now exists (props/compound/hook/example/composability/gotchas) — improvement over the 2026-07-01 baseline which found none. But only documents `SidebarMenuButton` props (24 exports, one prop table); no `floating`/`inset`/RTL coverage; story misfiled `title: 'Shell/Sidebar Primitive'` for a `src/ui/` component. |
| testing | ✗ | **No `packages/core/src/ui/sidebar.test.tsx` exists.** The only sidebar test is `src/shell/sidebar.test.tsx` (the duplicate). Zero unit/RTL/axe coverage for this file — no `describeConformance`, no interaction test, no vitest-axe assertion. |
| motion | ✗ | `layoutId="sidebar-active-indicator"` spring (:635-641) has NO reduced-motion guard — `useReducedMotion` is imported (:6) but consumed only in the swipe wrapper (:186). `springs.smooth` (stiffness 300 / damping 30 / mass 0.8) is under-damped = bouncy on a *functional* nav indicator (Emil: functional toggles want `bounce:0`). `transition-transform`/`transition-colors`/`transition-[width,height,padding]` (:530,578,687,369) carry no `--duration-*` token → inherit TW defaults. Panel collapse animates `width`/`left` (:295,305) = per-frame reflow. Good: swipe wrapper disables drag under reduced motion. |
| state-coverage | gap | `Math.random()` skeleton width (:729-731) — impure-in-render dressed in `useMemo`, produces server≠client → hydration mismatch in an SSR package. Disabled/active/outline are styled but never storied or tested. Empty/error nav states n/a for a routed nav. |
| content-resilience | ✓ | `[&>span:last-child]:truncate` + `overflow-hidden` handle long labels; icon-collapse hides overflow cleanly; `side="right"` rotates layout and swipe handles both sides; `tabular-nums` on badge. RTL is handled via `data-side` selectors. |
| theming-resilience | ✓ | Semantic `accent-*`/`surface-*` tokens + role radius survive an accent swap and `[data-shape]` presets; `surface-chrome` is an independently tunable tier; active `bg-accent-2` pill reads in both themes; no elevation-inversion trap (chrome, not a recessed track). |
| system-cohesion | gap | **A second `src/shell/sidebar.tsx` exists** — two sidebars in one package is a "which is canonical" cohesion split. Menu-button `default` naming drifts from Button's taxonomy. Otherwise shares the DS spring registry, focus-ring, radius, and spacing tokens with siblings. |
| craft | ✓ | Context-aware resize cursors on the rail (`cursor-w-resize`/`e-resize`, flipping on collapse state, :370-371), swipe-to-close with velocity threshold, morphing active indicator, `tabindex={-1}` rail as a non-tab-stealing hit target, tooltip only when collapsed. Genuine attention to detail. |
| perceived-performance | gap | Skeleton loading state exists (good), but `Math.random()` width causes a hydration flash; `width`/`left` collapse animation can jank via reflow on a full-height panel; the `layoutId` morph itself is smooth. |
| market-benchmark | PARITY | vs shadcn sidebar (the origin block). We match its API/structure, lead on mobile swipe-to-close + animated indicator, and inherit its `Math.random()` skeleton bug. Not behind; not decisively ahead. |
| cross-DS adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P0] testing** — No test file for `ui/sidebar` at all (tests are only on the `shell/sidebar` duplicate) → add `sidebar.test.tsx`: provider controlled/uncontrolled, `useSidebar` throw, toggle via trigger + Ctrl/Cmd+B, `isActive` rendering, `asChild` passthrough, collapsed-tooltip visibility, + a vitest-axe assertion.
- **[P1] motion** — Gate the `layoutId` indicator on `useReducedMotion()` (hook already imported); switch the indicator transition to a bounce-free spring/`{duration,bounce:0}`; add `duration-*`/`ease-productive-*` to the bare `transition-*` classes to match the panel's already-tokenized transition.
- **[P1] state-coverage** — Kill `Math.random()` skeleton width (SSR hydration hazard); derive from an index/prop or a fixed 60%/80% pair.
- **[P1] system-cohesion** — Reconcile `ui/sidebar` vs `shell/sidebar` duplication; declare one canonical, deprecate/alias the other.
- **[P2] api-composability** — Rename menu-button `variant: default` → `ghost` with a deprecated alias (it is a ghost); derive `SidebarProps` from `ComponentProps<typeof Sidebar>` to kill the duplicate type.
- **[P2] visual-integrity** — Tokenize `w-4`/`w-5`/`h-5`/`-mt-8`/`top-1`/`+2px` to `ds-*`/icon-size tokens; convert the `outline` menu-button's raw `shadow-[0_0_0_1px_…]` ring to `border border-surface-border`.
- **[P2] docs-dx** — Fix the `Shell/` story misfiling; document `floating`/`inset`/RTL and the full sub-component prop surface.

## What it does well
- Anti-slop clean: no edge-soup, accent rails, gradient text, glass/glow/blob, or rounded-everything. Role radius tokens only.
- Correct surface layering — `surface-chrome` for the panel (its own tunable tier), `surface-base` for the inset.
- Strong a11y baseline: labelled landmark, sr-only toggle, keyboard shortcut, focus-visible rings, collapse tooltips, provider error guard.
- Real craft: state-aware resize cursors, velocity-thresholded swipe-to-close, morphing active indicator, non-tab-stealing rail.
- Full controlled/uncontrolled provider with cookie persistence for cross-route state.

## Cross-DS adoption ideas
- **shadcn/Vaul** — pair the mobile drawer with a velocity-projected snap (Vaul's momentum model) so a fast flick closes proportionally; today the close threshold is a flat 30%/500px.
- **Radix/Ark nav** — offer an optional `SidebarMenu` `value`/`onValueChange` roving-selection model for non-routed menus, so consumers who aren't router-driven get single-source active state (and the `layoutId` indicator gets a single-active invariant instead of relying on the consumer).
- **cmdk** — a built-in `SidebarInput`-driven filter/command surface over `SidebarMenu` items would make the search input (already present) functional rather than decorative.
- **React Aria** — adopt its focus-restoration + arrow-key roving between menu items (`Home`/`End`, `ArrowUp`/`Down`) so keyboard nav within the menu matches the rest of the DS's navigation components.

## Rebuild note
**Polish, not rebuild.** The structure, surface layering, radius vocabulary, and
a11y baseline are sound — this is a competent shadcn re-tokenization with genuine
additions. The gaps are all in-place fixes: add a test file (P0), gate + de-bounce
the motion (P1), remove the `Math.random()` SSR footgun (P1), resolve the
`ui`-vs-`shell` duplicate (P1, the one structural decision needed), then the
vocabulary/magic-number/docs nits (P2). No structural teardown warranted.
