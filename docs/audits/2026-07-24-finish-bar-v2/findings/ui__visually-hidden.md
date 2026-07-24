# ui/visually-hidden — finish-bar audit
Finish: 4/5   Market: PARITY (Radix VisuallyHidden)   Rebuild: polish

Leaf a11y primitive: `<span className={cn('sr-only', className)} {...props} />`, `forwardRef` to `HTMLSpanElement`, `// @server-safe`. Non-visual utility — motion/visual/state/theming axes are N/A by design and are not penalized (per task rule).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Renders nothing visible; canonical Tailwind `sr-only`. No slop tells. Component source is one span — no radius, surface, shadow, or spacing decisions to drift. (Stories use `rounded-control` role token + `w-10/h-10` scale utilities — clean, no `rounded-ds-*`/`rounded-full`, no arbitrary `p-[..]`/`h-[..]`.) |
| accessibility | ✓ | This *is* the a11y primitive. `sr-only` = off-screen-but-readable; axe-clean test present. Correct semantics; forwards all span attrs so `id`/`aria-*` pass through. Minor: no focusable-reveal path (skip-link `focus:not-sr-only`) — a consumer concern, not a defect. |
| api-composability | gap | No `asChild`/Slot. The documented canonical use (`<DialogTitle asChild><VisuallyHidden>…`) pushes polymorphism onto the parent. `Slot` is already vendored + re-exported (`ui/lib/slot.ts`) — the fix is cheap. Otherwise clean: `forwardRef`, `displayName`, specific ref type, `className` merge, props spread. Empty-interface (`extends HTMLAttributes {}`) is an `no-empty-object-type` smell that disappears once `asChild` adds a real member. |
| docs-dx | gap | Per-component doc now exists (Props/Example/Composability/Gotchas/Changes) and is accurate ("standard span attributes"). But stories still demo hand-rolled icon buttons with emoji/HTML-entity glyphs (✏ `&#9998;`, 🗑 `&#128465;`, bare `X`/`+`) and never show the canonical `DialogTitle asChild` pairing the doc calls the primary use — live demo diverges from written guidance, and the glyphs teach a non-Icon pattern. |
| testing | ✓ | Thorough for a leaf: renders children, `sr-only` class, custom-className merge, span tagName, ref forwarding, axe-clean-in-button. `describeConformance` N/A (no CVA). |
| motion | N/A | Static a11y primitive — no entrance/exit/feedback motion is appropriate. Correctly has none. |
| state-coverage | N/A | Invisible by design; no hover/active/focus/disabled/loading/empty/error states apply. |
| content-resilience | ✓ | Accepts arbitrary `ReactNode` children via `HTMLAttributes`; off-screen so no overflow/truncation/length concern; `sr-only` is direction-agnostic (RTL-safe). |
| theming-resilience | N/A | No color/radius/shape/density/elevation surface — survives any brand/shape/theme swap trivially. |
| system-cohesion | ✓ | Same `cn` + `forwardRef` pattern as siblings; canonical `sr-only`. Note: a Radix `react-visually-hidden` primitive is vendored (`primitives/react-visually-hidden.js`) but unused — this hand-rolls the lighter `sr-only` variant, which is a defensible choice, not drift. |
| craft | ✓ | Specific `HTMLSpanElement` ref (not `HTMLElement`), `// @server-safe`, `sr-only`-first merge order so consumer classes can still extend. Radix edge over us: inline styles work even if the `sr-only` utility isn't in the consumer's CSS (ours ships it, so moot in practice). |
| perceived-perf | N/A | Trivial synchronous render; no interaction, async, or layout-shift surface. |
| market-benchmark | gap | Matches Radix on the core job (hide accessibly, forward props/ref). Lags Radix specifically on `asChild`; lags React Aria's `useVisuallyHidden` on the focusable-reveal (skip-link) option. Narrow, ergonomic gaps — not correctness. |
| cross-ds | ✓ | Concrete imports identified below. |

## Top gaps (prioritized)
- [P2] api-composability — no `asChild`; documented `DialogTitle` use needs parent `asChild` → add `asChild?: boolean` backed by the already-vendored `Slot` (`ui/lib/slot.ts`), merging `sr-only` onto the child; this also fills the empty-interface smell.
- [P2] docs-dx — stories use emoji/entity glyphs and never demo the canonical `DialogTitle asChild` (or skip-link) pattern → swap glyphs for real `Icon` components (ideally the `IconButton` + `VisuallyHidden` pairing) and add a story showing the load-bearing DialogTitle/skip-link use.
- [P3] accessibility — no first-class focusable-reveal (skip-to-content) path → optional `focus:not-sr-only` recipe or a documented example; low priority, consumer can do this today.

## What it does well
- Correctly minimal: one `<span className="sr-only">`, no re-rolled offscreen px/clip hack, no bespoke tokens.
- Right ergonomics: `forwardRef`, `displayName`, specific ref type, prop spread, `className` merge, exported props type.
- `// @server-safe` and no context/cascade — composes into anything, SSR-safe.
- Test coverage is genuinely complete for a leaf primitive, including an axe pass.

## Cross-DS adoption ideas
- **Radix `VisuallyHidden`** ships `asChild` (Slot) — adopt it so consumers can visually-hide an arbitrary element (`<VisuallyHidden asChild><h2>…</h2></VisuallyHidden>`) without an extra wrapper span. We already vendor the `Slot` needed.
- **React Aria `useVisuallyHidden`** supports `isFocusable` (reveal on focus) for skip links — consider an opt-in `focusable`/`focus:not-sr-only` recipe.
- **Radix inline-style approach** is robust even when no CSS class is loaded; our `sr-only` dependency is safe because we ship the utility, but worth a doc note for consumers who tree-shake aggressively.

## Rebuild note
Polish, not rebuild. The primitive is structurally correct and at the finish bar for its job. Two small in-place changes close the gaps: (1) add `asChild` via the existing vendored `Slot`, giving the documented `DialogTitle` pattern a first-class path and eliminating the empty-interface smell; (2) refresh stories to drop emoji/entity glyphs for real `Icon`s and demo the canonical `DialogTitle asChild`/skip-link use so the live demo matches the doc. No source restructure, no API break.
