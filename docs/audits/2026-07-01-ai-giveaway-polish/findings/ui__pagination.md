# ui/pagination — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

Pagination is visually clean — no accent rail, no gradient, no emoji, no raw framework palette, tokens used throughout, proper `nav`/`ul`/`li`/`button` semantics, real keyboard nav, `aria-current="page"`, `aria-label`s, and a sr-only ellipsis label. It is not AI slop. The gaps are finish-bar gaps: hardcoded English labels, a sub-44px touch target, CSS scale animation without a reduced-motion guard, a controlled-only convenience wrapper with no uncontrolled mode and a non-canonical handler name, no size/color axes, thin stories, and a broken doc example. None are P0.

## Findings

### [P1][H] Interactive page buttons are 36px — below the 44px touch target
- **Category:** a11y / state-coverage
- **Evidence:** pagination.tsx:72 — `h-ds-sm-plus w-ds-sm-plus` ; semantic.css:321 — `--spacing-ds-sm-plus: 36px;`
- **Why:** Rubric H requires interactive targets ≥ 44px; 36×36 fails on touch. PaginationEllipsis (line 125) shares the same 36px box (fine, it's non-interactive), but Link/Previous/Next are tap targets.
- **Fix:** Either bump to a 44px box at a coarse-pointer breakpoint (`@media (pointer: coarse)` / a `touch-target` utility) or add the existing `touch-target` safe-area utility around the hit area while keeping the 36px visual. Don't just enlarge the glyph — keep visual density, expand the hit box.

### [P1][F6] PaginationNav is controlled-only — no uncontrolled mode, non-canonical handler name
- **Category:** composability
- **Evidence:** pagination.tsx:221-231 — requires `currentPage` + `onPageChange: (page: number) => void`; no `defaultPage`, no internal state path.
- **Why:** Rubric F6: a stateful convenience wrapper that supports `value`-style control but not `defaultValue` forces every consumer to wire `useState` even for trivial cases. Handler is `onPageChange` not the canonical `onValueChange`/`onCurrentPageChange` pair, and there's no `defaultCurrentPage` for uncontrolled use.
- **Fix:** Make `currentPage` optional with a `defaultCurrentPage` fallback and an internal `useControllableState`-style hook; keep `onPageChange` firing in both modes. (Naming: `onPageChange` is defensible for a page index — lower priority than the missing uncontrolled mode.)

### [P1][M3] `active:scale-95` transform with no reduced-motion guard
- **Category:** motion
- **Evidence:** pagination.tsx:72 — `... transition-colors ... active:scale-95`
- **Why:** Rubric M3: any motion default must respect `prefers-reduced-motion`. This is a CSS transform (not framer-motion, so it bypasses MotionConfig), and `transition-colors` won't animate the scale anyway — the press-scale snaps with no transition and ignores reduced-motion. Sibling components (progress.tsx, skeleton.tsx, status-dot.tsx) gate animation with `motion-reduce:`.
- **Fix:** Add `motion-reduce:active:scale-100` (or `motion-reduce:transform-none`) and include `transition-transform` so the press feedback is an actual eased micro-motion rather than an instant snap, consistent with Button's press feedback.

### [P2][V5/J] Hardcoded "Previous" / "Next" English labels — not slottable, not localizable
- **Category:** composability / docs
- **Evidence:** pagination.tsx:96 — `<span>Previous</span>` ; pagination.tsx:111 — `<span>Next</span>` ; aria-labels also hardcoded English (lines 90, 106).
- **Why:** Not an AI tell, but a finish gap: a design-system primitive that bakes English copy can't be localized and offers no slot to override the label or hide it (icon-only). PaginationNav (line 251, 275) gives no way to pass through localized labels.
- **Fix:** Let `children` override the default label (render `children ?? <><Icon/><span>Previous</span></>`) and expose label props (or a `labels` prop on PaginationNav) so consumers can localize both the visible text and `aria-label`.

### [P2][H] No `disabled`/`active`/`focus`/RTL/forced-colors coverage in stories
- **Category:** state-coverage
- **Evidence:** pagination.stories.tsx:20-72 — only `Default` and `WithActive`; both static, no PaginationNav story, no disabled Prev/Next, no focus-visible/hover/forced-colors/RTL demonstration.
- **Why:** Rubric H wants the state matrix demonstrated in stories OR tests. Tests cover disabled + active + aria, but the chevron icons in Previous/Next are directional and there is no RTL story proving they mirror; no forced-colors story; the headline `PaginationNav` (the "use this for 95% of cases" API per the doc) has zero stories.
- **Fix:** Add a `PaginationNav` interactive story (with `useState`), a `Disabled` edge story (page 1 / last page), and RTL + forced-colors decorator stories. Drop the icons through the Icon API's RTL mirroring or verify chevrons flip.

### [P2][docs/J] Doc example references undefined `p` — broken snippet
- **Category:** docs
- **Evidence:** pagination.md:24 — `onClick={() => setPage(p - 1)}` and md:34 — `setPage(p + 1)`; `p` is never defined (the loop var is `page`).
- **Why:** Rubric J docs parity: a copy-paste example that won't compile. Looks like a half-renamed `page`→`p`.
- **Fix:** Use `page - 1` / `page + 1` (and clamp), matching the `page` variable used on line 29.

### [P2][G3] No `size` or `color` axis — diverges from the Card-bar family vocabulary
- **Category:** vocabulary / drift
- **Evidence:** pagination.tsx:58-62 — `PaginationLinkProps` exposes only `isActive` + `asChild`; size/density is fixed at `h-ds-sm-plus`.
- **Why:** Card/StatCard ship `size` axes; data-dense tables often want a compact pagination. Not wrong to omit, but it's a finish-bar inconsistency — there's no `size="sm"` for tight table footers despite the doc pointing consumers at DataTable footers (md:44).
- **Fix:** Consider a `size` axis (sm/md) on PaginationLink + PaginationNav passthrough, sharing the canonical taxonomy. Lower priority — only if a compact density is actually needed.

### [P2][V2] Active page fill has no hover/pressed feedback differentiation
- **Category:** state-coverage / motion
- **Evidence:** pagination.tsx:73-75 — active branch is `bg-accent-9 text-accent-fg` with no `hover:`/`active:` variant; only the inactive branch gets `hover:bg-surface-raised-hover`.
- **Why:** The current page button still receives pointer events (it's a real `<button>` with `onClick` in PaginationNav, line 264-267) but gives no hover/press affordance, reading as inconsistent with the inactive buttons. Minor.
- **Fix:** Either add a subtle `hover:bg-accent-10` to the active state, or make the active page non-interactive (it's the current page — clicking is a no-op anyway), and reflect that with `aria-disabled`/no onClick.

### [P3][I] `PaginationItem` adds an empty `cn('', className)`
- **Category:** types / cleanliness
- **Evidence:** pagination.tsx:40 — `className={cn('', className)}`
- **Why:** The empty-string first arg is dead — `PaginationItem` is a pass-through `<li>` with no base classes. Harmless but signals copy-paste from a templated component.
- **Fix:** `className={cn(className)}` or drop `cn` entirely (`className={className}`).

### [P3][F2] PaginationPrevious/Next don't expose `asChild` despite forwarding to PaginationLink
- **Category:** composability
- **Evidence:** pagination.tsx:85-115 — both accept `PaginationLinkProps` (which includes `asChild`) and spread `...props` into `PaginationLink`, so `asChild` technically threads through — but it's undocumented and the hardcoded `<Icon/>` + `<span>` children fight a single Slot child.
- **Why:** Passing `asChild` to Previous/Next would break because Slot expects a single child but these inject two (icon + label). The capability looks available via the prop type but isn't actually usable.
- **Fix:** Either document that `asChild` is unsupported on Previous/Next, or wrap their icon+label in a fragment-safe single-child pattern so `asChild` works (render the anchor as the Slot and put icon+label inside it).

## Composability gaps
- PaginationNav is controlled-only; no `defaultCurrentPage` / uncontrolled mode (F6).
- "Previous"/"Next" labels and their aria-labels are hardcoded English with no slot/prop override (no localization, no icon-only variant).
- `asChild` is typed on Previous/Next but unusable (two children vs Slot's single-child contract) — capability advertised, not delivered.
- No `size` axis to compose a compact pagination for dense table footers, despite the doc steering consumers toward DataTable footers.
- PaginationNav exposes no slot/render-prop for custom page-button rendering — the doc says reach for the compound API instead, which is reasonable, but there's no `renderPage` escape hatch on the wrapper.

## Motion gaps
- `active:scale-95` is a raw CSS transform: no `transition-transform` (so it snaps, no eased feedback) and no `motion-reduce:` guard (M3). It also bypasses framer-motion/MotionConfig, so it's inconsistent with Card/StatCard/Button press feedback.
- No hover/press transition on the active page button (M4 — missing feedback motion on an interactive element).
- No entrance motion when pages change (acceptable for pagination; not flagging).

## Polish plan (ordered steps to reach the finish bar)
1. **Touch target (P1):** expand the interactive hit box to ≥44px on coarse pointers while keeping the 36px visual density.
2. **Reduced-motion + real press feedback (P1):** add `transition-transform motion-reduce:active:scale-100` to PaginationLink; consider aligning press feedback with Button.
3. **Uncontrolled mode (P1):** add `defaultCurrentPage` + internal controllable state to PaginationNav so trivial cases don't need external `useState`.
4. **Localizable labels (P2):** let `children` override Previous/Next text and expose label/aria-label props (or a `labels` object on PaginationNav).
5. **Fix the doc example (P2):** `p` → `page`, add clamping.
6. **Stories (P2):** add a stateful PaginationNav story, a disabled edge story, RTL (chevron mirroring) and forced-colors decorators.
7. **Active-button behavior (P2):** make the current page non-interactive or give it hover/press feedback.
8. **Cleanup (P3):** drop the empty `cn('', …)` in PaginationItem; clarify/repair `asChild` on Previous/Next.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double edge:** none (buttons are fill/hover only). **V3 gradient text:** none. **V4 framework palette:** uses `accent-9`/`surface-*` semantic tokens, no raw indigo/slate. **V5 emoji:** none — real lucide/tabler icons via the Icon API. **V6 blob/glass/glow:** none. **V7 rounded-everything:** `rounded-control`, single radius vocabulary. **V8 pill spam:** none.
- **G1 surface:** no surface misuse (transparent nav, hover uses `surface-raised-hover`). **G2 tokens:** all spacing/radius/color via `ds-*`/semantic tokens; no raw px/hex; no dead TW3 utilities. **G3 axes:** `isActive`/`asChild` are appropriate boolean props, no `primary`/`filled`/`small` drift.
- **E1–E8 verbal:** JSDoc and doc are clean — one trailing "feel free to combine props creatively!" boilerplate line in JSDoc (pagination.tsx:219) is mild filler but appears repo-wide; not a unique tell here. No em-dash tic, no AI vocabulary, no over-structuring.
- **a11y baseline:** `nav[role=navigation][aria-label]`, `aria-current="page"`, per-button `aria-label`, `aria-hidden` + sr-only on ellipsis, real `<button>` keyboard nav, focus-visible ring consistent with Button. Tests assert all of these. **forwardRef + displayName:** present on every sub-component. **Types:** properly extends `ButtonHTMLAttributes`/`ComponentPropsWithoutRef`; no `any`, no `React.FC`, no stringly-typed enums; `generatePagination` typed with a `PageItem` union.
- **Tests:** thorough — generatePagination unit coverage (edge cases, siblingCount), interaction (click/prev/next/clamp), aria, ref, conformance suite.
