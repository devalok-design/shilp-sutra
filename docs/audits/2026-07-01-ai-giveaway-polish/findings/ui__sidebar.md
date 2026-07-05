# ui/sidebar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:6 P3:2

This is the shadcn `sidebar` block, re-tokenized to our surface/spacing/duration vocabulary. The token migration is genuinely thorough — no raw hex, no `bg-gradient-to-*`, no `w-[--var]`, surfaces are correct (`bg-surface-raised` for the panel chrome, which IS overlay/shell chrome so surface-raised is legitimate here, not a surface-1 violation). The AI-tell surface is clean. Where it falls short of the Card bar is **provenance vocabulary drift** (variant/size axes off the canonical taxonomy), **a randomness footgun** (`Math.random()` skeleton width — SSR-hostile), **motion gaps** (the active-indicator `layoutId` spring has no reduced-motion guard; `transition-transform`/`transition-colors` micro-feedback isn't on the duration scale), **raw arbitrary values** that slipped past the token sweep (`w-4`, `w-5`, `w-[2px]`, `-mt-8`, `top-1`, `after:-inset-2`), and **thin test/story coverage** (no story for `variant="floating"/"inset"`, the menu-button `outline` variant, RTL, or collapsed-icon tooltips behavior; no axe assertion).

## Findings

### [P1][G3] Menu-button `variant` axis is off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** sidebar.tsx:581-586 — `variant: { default: ..., outline: ... }` on `sidebarMenuButtonVariants`
- **Why:** Canonical `variant` axis is `solid/soft/outline/ghost/link`. This exposes only `default` + `outline`, where `default` is really a ghost (transparent bg, hover tint). A consumer reading the family expects `ghost`, not `default`; `default` as a variant *name* is exactly the `color="default"`-style smell G3 calls out.
- **Fix:** Rename `default` → `ghost` (it is one), keep `outline`. Or document why the sidebar menu-button deliberately diverges. Low-risk since it's an internal-ish nav primitive, but it reads as un-curated next to Button.

### [P1][G2] Raw arbitrary widths / offsets that escaped the token sweep
- **Category:** drift
- **Evidence:**
  - sidebar.tsx:369 — `w-4 -translate-x-1/2 ... after:w-[2px]` (SidebarRail)
  - sidebar.tsx:530 — `w-5` (SidebarGroupAction), :687 `w-5` (SidebarMenuAction), :709 `h-5 min-w-5` (SidebarMenuBadge)
  - sidebar.tsx:510 — `group-data-[collapsible=icon]:-mt-8`
  - sidebar.tsx:689,711 — `peer-data-[size=sm]/menu-button:top-1`
  - sidebar.tsx:531,688 — `after:-inset-2`
- **Why:** The rest of the file uses `ds-*` spacing tokens religiously; these bare Tailwind numerics are drift islands. `w-4`/`w-5`/`-mt-8`/`top-1` are not bound to `--spacing-ds-*`, so they don't move with the cadence and read as "copy-pasted from upstream, not re-tokenized."
- **Fix:** Map to `ds-*` (or `size-*` icon tokens) equivalents — e.g. `w-5` → an icon/control size token, `-mt-8` → a `-mt-ds-*`, `top-1` → `top-ds-*`. `after:w-[2px]`/`after:-inset-2` are hit-target/visual-rail details; either tokenize or annotate as deliberate.

### [P1][M3] Active-indicator `layoutId` spring has no reduced-motion guard
- **Category:** motion
- **Evidence:** sidebar.tsx:635-641 — `<motion.span layoutId="sidebar-active-indicator" ... transition={springs.smooth} />`; `useReducedMotion` is imported (:6) but only consumed in `SidebarSwipeWrapper` (:186), never here.
- **Why:** With `prefers-reduced-motion`, the active pill still slides/morphs between menu items via layout animation. M3 wants every animation reduced-motion-aware; the file already knows the hook exists but doesn't apply it to the most visible motion in the component.
- **Fix:** Gate the transition — `transition={isReduced ? { duration: 0 } : springs.smooth}` (read `useReducedMotion()` in `SidebarMenuButton`), or rely on a `MotionConfig reducedMotion` wrapper and confirm `layout` respects it.

### [P1][M5] `transition-transform` / `transition-colors` / `transition-[width]` without a duration token (uniform/implicit timing)
- **Category:** motion
- **Evidence:**
  - sidebar.tsx:530 — `transition-transform` (SidebarGroupAction), :687 `transition-transform` (SidebarMenuAction) — no duration, no easing token
  - sidebar.tsx:369 — `transition-colors ease-productive-standard` — has easing but no `duration-*`
  - sidebar.tsx:578 — `transition-[width,height,padding]` on menu-button — no duration/easing
- **Why:** M2/M5 — these inherit Tailwind's default 150ms linear-ish transition rather than the design system's `--duration-*` + `ease-productive-*` scale that the panel-width transition (:295,305) correctly uses. Inconsistent: some transitions tokenized, sibling ones bare.
- **Fix:** Add `duration-fast-02 ease-productive-standard` (or the appropriate scale token) to each. Match the panel's already-correct pattern.

### [P1][H/structural] `Math.random()` skeleton width — non-deterministic, SSR hydration hazard
- **Category:** state-coverage
- **Evidence:** sidebar.tsx:729-731 — `const width = useMemo(() => { return \`${Math.floor(Math.random() * 40) + 50}%\` }, [])`
- **Why:** `Math.random()` during render produces a different value on server vs client → React hydration mismatch warning for an SSR consumer (this package ships `'use client'` + an SSR smoke gate). It's also impure-in-render dressed up in a `useMemo` (memo doesn't make it deterministic). The "randomized skeleton width for realism" is itself a mild AI-slop reflex.
- **Fix:** Derive width from a stable input (index prop) or drop the randomization for a fixed `60%`/`80%` pair keyed off `showIcon`/a `widths` prop. At minimum move it into `useEffect`+state so SSR renders a stable default.

### [P2][F6] `SidebarMenuButton` `isActive` is controlled-only; no group selection model
- **Category:** composability
- **Evidence:** sidebar.tsx:600-606 — `isActive?: boolean` per button, no `value`/`onValueChange` at `SidebarMenu` level
- **Why:** Active state is hand-wired per item by the consumer. That's the shadcn contract and acceptable for a routing-driven nav, but it's below the Card bar's "full state model" — there's no uncontrolled or single-source selection, and the `layoutId` shared animation assumes exactly one active item with no enforcement.
- **Fix:** Acceptable to keep (routing owns active), but document the contract. Optionally offer a `SidebarMenu value/onValueChange` for non-routed menus.

### [P2][H] `SidebarMenuButton` has no disabled story/test despite styling for it
- **Category:** state-coverage
- **Evidence:** sidebar.tsx:578 — `disabled:pointer-events-none disabled:opacity-action-disabled aria-disabled:...`; no story or test exercises disabled, active, outline-variant, sub-menu, or skeleton states.
- **Why:** H wants applicable states demonstrated. Stories cover only default/active/collapsed; tests cover provider + 3 sub-components + the context throw. Disabled, `variant="outline"`, sub-menu, badge, skeleton, tooltip-on-collapse are all unshown.
- **Fix:** Add stories for disabled item, menu-button `outline` variant, sub-menu nesting, and the icon-collapsed tooltip. Add an axe assertion (vitest-axe) — currently none in the test file.

### [P2][H/a11y] `Sidebar` collapse uses `transition-[width]` animating a layout prop on the off-canvas/icon panels
- **Category:** motion
- **Evidence:** sidebar.tsx:295 `transition-[width]`, :305 `transition-[left,right,width]`
- **Why:** M5 — animating `width`/`left` triggers layout/reflow per frame rather than compositor-friendly transform. For a full-height sidebar this is the classic janky-resize path. It's the upstream shadcn approach and hard to avoid for a content-reflowing sidebar (transform can't reflow the inset), so this is a known-tradeoff P2, not a P0.
- **Fix:** Accept as deliberate (document it), or explore a transform-based collapse for the `icon` variant where width is fixed. At minimum ensure `prefers-reduced-motion` zeroes the duration.

### [P2][G4] Surface vocabulary: menu-button `outline` variant uses a raw `shadow-[0_0_0_1px_...]` ring instead of a border token
- **Category:** drift
- **Evidence:** sidebar.tsx:585 — `shadow-[0_0_0_1px_var(--color-surface-border)] hover:shadow-[0_0_0_1px_var(--color-surface-border-strong)]`
- **Why:** G2/G4 — an inline arbitrary box-shadow re-implements a 1px edge that the system expresses as `border border-surface-border`. It does reference the color *variable* (so not a hex tell), but it's a bespoke shadow spelling diverging from how Card/outline expresses edges, and bare `shadow-[…]` is the kind of thing the TW4 hygiene rule discourages.
- **Why it's not P1:** the color is token-bound, so it's a spelling/consistency nit, not a raw-value tell.
- **Fix:** Use `border border-surface-border hover:border-surface-border-strong` (matches Card `outline`), unless the ring-not-border choice is deliberate to avoid layout shift (then comment it).

### [P2][docs] No per-component doc; story title misfiles it under "Shell"
- **Category:** docs
- **Evidence:** No `docs/components/**/sidebar.md` found; sidebar.stories.tsx:20 — `title: 'Shell/Sidebar Primitive'` for a component that lives in `src/ui/`.
- **Why:** J — public components need a doc + a story whose taxonomy matches the layer. There is both a `src/ui/sidebar.tsx` and a `src/shell/sidebar.tsx`; the `ui` story filed under "Shell" muddies which is canonical. (Confirm whether `ui/sidebar` should even be a separate public export from `shell/sidebar` — possible duplication.)
- **Fix:** Add a sidebar doc with a prop table for the public sub-components; reconcile/clarify ui vs shell duplication; correct the story group or intentionally namespace it.

### [P3][V8/structural] Story uses single-letter "emoji" placeholders (`D`, `P`, `T`) as icons
- **Category:** structural-tell
- **Evidence:** sidebar.stories.tsx:30-42 — `{ label: 'Dashboard', emoji: 'D' }` rendered as `<span>{item.emoji}</span>`
- **Why:** Not a real emoji (so not a V5 hit), but using bare capital letters as stand-in nav icons is placeholder-grade and reads as un-finished demo content. The field is even mislabeled `emoji`. The system has a real Icon API (lucide/tabler) used elsewhere.
- **Fix:** Use real `<Icon icon={IconLayoutDashboard} />` etc. in stories; rename the field. Makes the demo look designed, and exercises the icon-collapse path properly.

### [P3][types] `useMemo` import only feeds the random-width footgun; `SidebarProps` exported type duplicates the inline `Sidebar` prop type
- **Category:** types
- **Evidence:** sidebar.tsx:811 — `export type SidebarProps = ...{ side; variant; collapsible }` hand-rewritten, separate from the inline generic at :224-230.
- **Why:** Two sources of truth for the same prop shape can drift (one could gain a prop the other lacks). Minor.
- **Fix:** Derive `SidebarProps` from the component (`React.ComponentProps<typeof Sidebar>`) so it can't drift.

## Composability gaps
- `isActive` is controlled-only per button (F6) — no `SidebarMenu`-level selection model; the shared `layoutId` indicator silently assumes exactly one active item.
- `tooltip` prop on `SidebarMenuButton` (:605) accepts `string | TooltipContent props` — reasonable, but it's a bespoke prop where `asChild` consumers can't compose their own trigger/content freely. Acceptable for the collapse-tooltip convenience.
- `asChild` coverage is good: `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuSubButton` all support it. No F2 gap.
- Possible duplication with `src/shell/sidebar.tsx` — two sidebars in one package risks a "which is canonical" composability/vocabulary split (verify intent).

## Motion gaps
- M3: active-indicator `layoutId` spring (:637) ignores `prefers-reduced-motion` though the hook is imported.
- M5: panel collapse animates `width`/`left` (:295,:305) — layout props, reflow per frame; known sidebar tradeoff, gate on reduced-motion at minimum.
- M2/M5: `transition-transform`, `transition-colors`, `transition-[width,height,padding]` (:530,:578,:687,:369) lack `--duration-*`/`ease-productive-*` tokens — inherit Tailwind defaults, inconsistent with the panel transition which is correctly tokenized.
- Good: `SidebarSwipeWrapper` (:186-199) disables drag under reduced motion — correct pattern, just not applied to the layout indicator.

## Polish plan (ordered steps to reach the finish bar)
1. Kill the `Math.random()` skeleton width (P1, SSR hazard) — derive from index/prop or use a fixed pair.
2. Apply `useReducedMotion()` in `SidebarMenuButton` to gate the `layoutId` indicator transition; confirm panel-width transition is reduced-motion-safe (P1/M3).
3. Rename menu-button `variant: default` → `ghost` to rejoin the canonical taxonomy (P1/G3), or document the divergence.
4. Tokenize the stray arbitrary values: `w-4/w-5/-mt-8/top-1/after:-inset-2/after:w-[2px]` → `ds-*`/icon-size tokens (P1/G2); convert the `outline` ring to a `border-surface-border` edge (P2/G4).
5. Add `duration-*`/`ease-productive-*` to the bare `transition-transform`/`transition-colors`/`transition-[width…]` (P1/M5).
6. Expand stories/tests: disabled item, `outline` menu-button, sub-menu, badge, icon-collapsed tooltip, RTL (`side="right"` icon mirroring), + a vitest-axe assertion (P2/H).
7. Add a per-component doc with a sub-component prop table; reconcile ui-vs-shell duplication and fix the story's "Shell/" group (P2/docs).
8. Replace single-letter placeholder "emoji" icons in stories with real Icon-API icons (P3).

## Clean (rubric dims that pass)
- **V1 accent rail:** none — active state is a full-bleed `bg-accent-2` pill (:638), not a left stripe. Good.
- **V2 double edge:** panel uses border-OR-shadow correctly (floating = `rounded-surface shadow-raised` :319; default = `border-r` :311). No border+shadow doubling.
- **V3 gradient text / V4 framework palette / V6 blob-glass-glow / V7 rounded-everything:** none. Uses `rounded-surface`/`rounded-control`, semantic `accent-*`/`surface-*` tokens throughout. No `indigo/violet/slate`, no `backdrop-blur`, no glow shadows.
- **V9 safe-face font:** none hardcoded — `font-medium`/`text-ds-*` tokens only.
- **G1 surface layering:** panel chrome is `bg-surface-raised` (:250,:267,:319) — sidebar is shell chrome, which the MANDATORY rule explicitly assigns to surface-1/raised tier. Inset content is `bg-surface-base` (:390). Correct, not a violation.
- **a11y baseline:** `aria-label="Sidebar"` on the `<aside>`, `sr-only` toggle label (:350), Ctrl/Cmd+B keyboard shortcut (:112), `focus-visible:ring-2` throughout, `aria-disabled` handling, `useSidebar` throws a clear error outside provider. Solid.
- **Controlled/uncontrolled (provider):** `SidebarProvider` correctly supports both `open`/`onOpenChange` (controlled) and `defaultOpen` (uncontrolled) (:74-102). Good — no F6 gap at the provider level.
- **E1–E8 verbal tells:** comments/JSDoc are plain and technical; no em-dash tic abuse, no AI vocabulary, no over-structuring.
