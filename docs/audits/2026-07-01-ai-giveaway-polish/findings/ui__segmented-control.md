# ui/segmented-control — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:4 P2:5 P3:1

## Findings

### [P0][H] tab/tablist ARIA pattern used for a panel-less view toggle (no tabpanels)
- **Category:** a11y
- **Evidence:** segmented-control.tsx:127 `role="tablist"`; :146-147 `role="tab"` + `aria-selected`; doc segmented-control.md:40 "short labels, no associated content panel"
- **Why:** The WAI-ARIA tabs pattern requires each `tab` to control a `tabpanel` via `aria-controls`; here there are none. A screen reader announces "tab, 1 of 3" and looks for panels that don't exist. For a mutually-exclusive option toggle the correct semantics are `radiogroup`/`radio` (single-select) or a toolbar of toggle buttons — the doc itself says there is no panel, which is exactly the case where tab roles are wrong.
- **Fix:** Switch to `role="radiogroup"` on the container + `role="radio"` + `aria-checked` on each option (keep roving tabindex + arrow keys, which radiogroup also expects). Update tests + doc.

### [P1][H] Touch targets below 44px at every size (28 / 32 / 40px)
- **Category:** a11y
- **Evidence:** segmented-control.tsx:35-37 `sm: 'h-7 ...'` (28px), `md: 'h-8 ...'` (32px), `lg: 'h-10 ...'` (40px); touch-target utility exists at tokens/utilities.css:181 (`min-height:44px`)
- **Why:** Every variant ships below the 44px touch minimum the rubric (H) and our own `@utility touch-target` define; the largest size still misses by 4px.
- **Fix:** Either apply `touch-target` (min 44px hit area, visual height can stay) to the option buttons, or raise `lg` to `h-11` and document the small/medium sizes as desktop-density only.

### [P1][G2] Raw Tailwind sizing + magic-number arbitrary values instead of ds tokens
- **Category:** drift
- **Evidence:** segmented-control.tsx:35-37 `h-7 / h-8 / h-10`, `h-3.5 w-3.5 / h-4 w-4`; :131 `p-[3px]`; :164/175/181 `z-[1]`
- **Why:** Card/StatCard use `py-ds-*`, `gap-ds-*`, `h-ds-*` and the `z-layer` utility. Here heights, icon boxes, the track inset (`p-[3px]` is an off-cadence magic number) and z-index are re-rolled with raw/arbitrary values, drifting from the token vocabulary the finish bar enforces.
- **Fix:** Map heights to ds size tokens (or `touch-target`), the `p-[3px]` track inset to a ds spacing token, and `z-[1]` to a named z utility. Icon boxes already get sizing from `IconProvider` — the `h-4 w-4` wrapper is redundant.

### [P1][F6/G3] Controlled API uses `selectedId`/`onSelect`, not the canonical `value`/`onValueChange` (+ no uncontrolled mode)
- **Category:** vocabulary
- **Evidence:** segmented-control.tsx:27-28 `selectedId: string; onSelect: (id: string) => void`; doc segmented-control.md:42 "Fully controlled — there's no `defaultSelectedId`"
- **Why:** Rubric F6 — non-input single-select should fire `onValueChange` and offer a `defaultValue`/uncontrolled mode; `onSelect` collides with the native DOM `onSelect` (it is even `Omit`-ed from HTMLAttributes at :23 to avoid the clash, which is a tell that the name is wrong). Sibling selection components (Tabs, ToggleGroup) use `value`/`onValueChange`.
- **Fix:** Rename to `value`/`onValueChange`, add `defaultValue` for an uncontrolled mode (align with Tabs/Radix vocabulary). Breaking — stage behind a deprecation alias.

### [P1][M3] No reduced-motion guard on the sliding-pill `layoutId` animation
- **Category:** motion
- **Evidence:** segmented-control.tsx:163-170 `motion.span layoutId="segment-pill" transition={pillSpring}`; `pillSpring` at :55; `withReducedMotion`/MotionConfig exist in lib/motion.ts:58 but are unused here
- **Why:** The pill slides on every selection with a spring and no `useReducedMotion()` / `MotionConfig` fallback. Users with `prefers-reduced-motion` get the full spatial slide — the one motion this component ships, ungated.
- **Fix:** Gate the spring via `useReducedMotion()` (snap with duration 0) or rely on a `MotionConfig reducedMotion="user"` provider; the helper already exists.

### [P2][G3] Variant axis name `default` is off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** segmented-control.tsx:14 `type SegmentedControlVariant = 'default' | 'solid'`
- **Why:** Canonical `variant` axis is solid/soft/outline/ghost/link. The `default` value is actually a soft/raised pill (`bg-surface-overlay shadow-raised`) on a sunken track — it should read `soft`, not `default`. `solid` is correct.
- **Fix:** Rename `default` → `soft` (the rubric's CLAUDE.md soft-default preference also fits a tinted/raised pill). Keep `solid`.

### [P2][J] Doc prop-type drift: `icon` typed `ComponentType` in doc, `IconInput` in source
- **Category:** docs
- **Evidence:** doc segmented-control.md:16 `icon?: ComponentType<{ className?: string }>` vs source segmented-control.tsx:20 `icon?: IconInput`
- **Why:** Source wins; `IconInput` is wider than `ComponentType`. Stale doc misrepresents the accepted icon type.
- **Fix:** Update doc Types line to `icon?: IconInput`.

### [P2][J] Story argTypes still list removed `variant="accent"`
- **Category:** docs
- **Evidence:** segmented-control.stories.tsx:53 `options: ['default', 'solid', 'accent']`; doc changelog segmented-control.md:52 "Removed (BREAKING) deprecated `variant="accent"`" in v0.38.0
- **Why:** The control dropdown still offers `accent`, which no longer exists in the union — selecting it renders an undefined variant (falls back / breaks `pillStyles[variant]`).
- **Fix:** Drop `'accent'` from the story argTypes options.

### [P2][V2] Track pairs a 1px border with an inset shadow (soft double-edge)
- **Category:** visual-tell
- **Evidence:** segmented-control.tsx:132 `bg-surface-raised-hover border border-surface-border-subtle shadow-inset`
- **Why:** Rubric V2 — edge OR elevation, not both. The sunken-track inset shadow is a legitimate "sunken chrome" choice, but stacking an explicit border on top of it double-defines the edge. Borderline (inset, not a drop shadow), hence P2 not P0.
- **Fix:** Let `shadow-inset` carry the edge and drop the border, or keep the border and drop the inset shadow — pick one, consistent with the surface system.

### [P2][F1] No per-option composition: badge/count/asChild not expressible
- **Category:** composability
- **Evidence:** segmented-control.tsx:16-21 `SegmentedControlOption = { id, text, icon? }`; render at :143-182 is fixed icon+text
- **Why:** Data-driven `options` is a documented deliberate choice (doc :39), but it caps composability — a consumer cannot put a count badge, a custom node, or polymorph an option into a link. The finish-bar siblings (Tabs) allow children.
- **Fix:** Accept `text: React.ReactNode` (currently `string`) at minimum, or add an optional `render`/children escape hatch. Low urgency given the documented scope.

### [P3][H] `ring-offset-2` with no explicit ring-offset color on a tinted track
- **Category:** a11y
- **Evidence:** segmented-control.tsx:154 `focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2`
- **Why:** The offset gap inherits the track's `bg-surface-raised-hover`; on the `solid` selected pill the offset sits over `bg-accent-9`, reducing the visual gap. Minor, focus is still visible.
- **Fix:** Set `ring-offset-surface-raised-hover` (or the track token) so the offset ring reads consistently across selected/unselected.

## Composability gaps
- `text` is `string` only — no `ReactNode`, so no per-option badge/count/custom node (segmented-control.tsx:18).
- No `asChild`/polymorphism per option — options can't become links (common for view-mode routing).
- No uncontrolled mode (`defaultValue`) — must be fully controlled (doc :42).
- Controlled handler `onSelect`/`selectedId` diverges from the family's `value`/`onValueChange` vocabulary; `onSelect` is `Omit`-ed from HTMLAttributes to dodge the native collision (a naming smell).

## Motion gaps
- M3: sliding-pill `layoutId` spring has no `prefers-reduced-motion` guard (segmented-control.tsx:163-170); `withReducedMotion` helper exists but is unused.
- M4 (minor): unselected→hover is a `transition-colors` only; no press/active feedback on the buttons themselves (the pill slide carries selection feedback, so acceptable).
- M1 clean: `pillSpring` (stiffness 400 / damping 30) has a documented "minimal overshoot" intent — not a bounce tell.
- M5 clean: pill animates via `layoutId` (transform), not width/left.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the a11y semantics (P0):** move from tablist/tab to radiogroup/radio (`aria-checked`), keep roving tabindex + arrows; update tests (`getByRole('radio')`) and doc.
2. **Hit 44px touch targets (P1):** apply `touch-target` or raise heights; keep visual density via padding.
3. **Reduced-motion guard (P1):** gate `pillSpring` with `useReducedMotion()` / rely on `MotionConfig`.
4. **Token hygiene (P1):** replace `h-7/h-8/h-10`, `h-4 w-4`, `p-[3px]`, `z-[1]` with ds spacing/size/z tokens.
5. **Vocabulary alignment (P1/P2):** rename `selectedId`/`onSelect` → `value`/`onValueChange` (+ `defaultValue`), rename variant `default` → `soft` (staged with deprecation aliases).
6. **Resolve the track edge (P2):** drop either the border or the inset shadow.
7. **Doc + story parity (P2):** fix `icon` type to `IconInput`; remove `accent` from story argTypes.
8. **Composability (P2):** widen `text` to `ReactNode`.

## Clean (rubric dims that pass)
- V1 (no accent rail), V3 (no gradient text), V4 (uses semantic `accent-9`/surface tokens, no raw indigo/slate), V5 (no emoji — real `@tabler` icons via Icon API), V6 (no glass/glow/blob), V7 (single `rounded-pill` vocabulary, appropriate for a segmented control), V8 (no pill-badge spam).
- E1-E8: source/JSDoc/doc copy is direct and free of AI vocabulary, em-dash tics, hedging.
- M1 (no bounce-by-default), M5 (transform-based pill, not layout props).
- Keyboard nav is complete (Arrow/Home/End + wrap), roving tabindex correct, focus-visible ring present, disabled blocks click + keyboard. Tests + stories + axe coverage are solid.
- `forwardRef` + `displayName` present; props typed (no `any`, no stringly `color?: string`); `IconInput` used for icons.
