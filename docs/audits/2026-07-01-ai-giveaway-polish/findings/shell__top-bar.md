# shell/top-bar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:5 P3:2

TopBar is genuinely composition-first (Left/Center/Right/Section/Title/UserMenu slots, auto grid/flex, `asChild` on the Radix triggers) and carries no hard visual AI tells — no accent rail, no gradient text, no indigo, no emoji-as-icon, correct surface for shell chrome, tokens throughout. It falls short of the Card bar in three ways: (1) `TopBar.IconButton` re-rolls the canonical `IconButton`/`Button` surface from scratch (F5 drift), (2) the `UserMenuItem` config object is a data-driven escape hatch with stringly-typed `color`/`icon` fields inside an otherwise composition-based component (F1/I/G3), and (3) motion is CSS-only with no reduced-motion story/token alignment while the rest of the system is on framer-motion + `springs`/`tweens`.

## Findings

### [P1][F5] TopBar.IconButton re-rolls the canonical IconButton instead of composing it
- **Category:** composability / drift
- **Evidence:** top-bar.tsx:198-223 — hand-built `<button>` with `'flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-pill border border-surface-border-strong bg-surface-raised-hover text-surface-fg-muted transition-[...] hover:bg-surface-raised-active active:scale-90 …'`. A canonical `IconButton` already exists (ui/icon-button.tsx:67 — composes `<Button>`, enforces `aria-label`, supports `shape`/`size`/`variant`/`color`).
- **Why:** This is exactly the drift StatCard fixed by composing Card — TopBar re-invents the surface/hover/press/focus vocabulary, so any Button token change (focus ring, disabled opacity, press scale) silently skips this button.
- **Fix:** Render the canonical `IconButton` internally (`variant="ghost" shape="circle" size="sm"`) and only add the tooltip wrapper + any topbar-specific chrome. Keep `icon`/`tooltip` props; drop the bespoke class string.

### [P1][V2] Double edge — border + surface fill on the icon button (and it also carries hover + press)
- **Category:** visual-tell
- **Evidence:** top-bar.tsx:209 — `rounded-pill border border-surface-border-strong bg-surface-raised-hover`. A visible full border AND a filled surface-3 background on a small control; the sibling `Center` search trigger in the story does the same (`border border-surface-border bg-surface-raised-hover`, stories:173).
- **Why:** The house pattern for secondary/icon actions is soft (tinted bg, no border) per CLAUDE.md; a bordered *and* filled chip is the "outline+fill" double treatment the rubric flags. `IconButton variant="soft"`/`ghost` gives the warmer, border-free look.
- **Fix:** Adopt `IconButton` (soft or ghost) — resolves this with F5. If keeping bespoke, drop the border and rely on the surface tint alone.

### [P1][F1] UserMenuItem is a data-driven config object in a composition-based component
- **Category:** composability
- **Evidence:** top-bar.tsx:43-60 `UserMenuItem` (label/icon/href/onClick/separator/color/badge/disabled) consumed via `userMenuItems?.map(...)` at top-bar.tsx:316-368. Doc explicitly states "Composition-based, NOT data-driven … No 'props config'" (top-bar.md:115) — the UserMenu contradicts the component's own stated contract.
- **Why:** Consumers can't compose a custom menu item (no way to render an arbitrary node, a `<Switch>`, a nested submenu) — they're boxed into the config shape. Card's lesson: content goes through slots (`<CardAction>`), not a fixed prop schema.
- **Fix:** Expose `TopBar.UserMenu` as a slot host that accepts `DropdownMenuItem` children (or a `children` render), keeping `userMenuItems` as a convenience overload. At minimum let an item carry a `render`/`node`.

### [P1][G3][I] Stringly-typed `color?: string` on UserMenuItem with an internal ad-hoc color map
- **Category:** types / vocabulary
- **Evidence:** top-bar.tsx:54 `color?: string`; resolved by an inline `colorMap` at top-bar.tsx:317-322 (`error/success/warning/info` → `text-*-11`), falling back silently to muted for anything else.
- **Why:** `color?: string` is the rubric's exact I-tell ("`color?: string`"). It admits invalid values that fail silently (no error, just muted), and the axis isn't the canonical `accent/neutral/success/warning/error/info`.
- **Fix:** Type it `color?: 'neutral' | 'success' | 'warning' | 'error' | 'info'` (canonical taxonomy) and drive off the existing semantic tokens.

### [P2][M3][M4] CSS-only motion, no framer-motion / reduced-motion parity with the system
- **Category:** motion
- **Evidence:** top-bar.tsx:209 `transition-[color,background-color,border-color,transform] … active:scale-90 duration-fast-01`. No `prefers-reduced-motion` guard and no use of the shared motion system (`springs`/`tweens`/`motionProps`) that Card/StatCard use. No entrance/exit on the dropdown beyond Radix defaults.
- **Why:** `active:scale-90` runs even under reduced-motion; the transform-scale press isn't gated. Rest of the family standardized on the motion tokens; this is a one-off.
- **Fix:** Either compose `IconButton` (inherits the system's press feedback + reduced-motion handling) or add `motion-reduce:transition-none motion-reduce:active:scale-100`. Confirm the `duration-fast-01`/`ease-productive-standard` utilities are the same tokens Button uses.

### [P2][H] No focus-visible ring on TopBar.IconButton; UserMenu ring uses raw ring classes not the system focus utility
- **Category:** a11y / state-coverage
- **Evidence:** top-bar.tsx:208-211 icon button has hover + `active:scale-90` but **no `focus-visible:` styling at all** (relies on UA outline). UserMenu trigger at top-bar.tsx:274 hand-rolls `outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2` instead of the `focus-ring` `@utility`.
- **Why:** Keyboard users get inconsistent focus affordance between the two buttons; the icon button may show only the browser default (or nothing if a reset strips it). The system has a `focus-ring` utility for exactly this.
- **Fix:** Compose `IconButton` (gets Button's focus-visible ring) and switch UserMenu to the `focus-ring` utility so both match.

### [P2][G2] Raw px values in the UserMenuItem badge
- **Category:** drift
- **Evidence:** top-bar.tsx:359 `h-[18px] min-w-[18px] … text-[10px]`; top-bar.tsx:363 `h-[8px] w-[8px]` for the dot.
- **Why:** Arbitrary px instead of DS spacing/size tokens — the rubric's G2 re-rolled-token tell. Badge/dot sizing should come from a token (or reuse the `Badge` component, which already solves count vs dot).
- **Fix:** Use `Badge` (`color`/`size="xs"`) for the count and a tokenized `StatusDot` for the dot indicator, or bind the sizes to `--spacing-ds-*`/`--size-*`.

### [P2][H] No disabled / loading state on TopBar.IconButton
- **Category:** state-coverage
- **Evidence:** top-bar.tsx:198-223 — spreads `...props` so `disabled` passes through to the raw `<button>`, but there's no disabled styling (opacity, cursor), no `aria-busy`/loading affordance, and no story/test covering a disabled icon button.
- **Why:** The state matrix (disabled, loading) is unhandled visually; a disabled search/AI button would look active. Canonical `IconButton` handles both.
- **Fix:** Compose `IconButton` (inherits disabled + loading), or add `disabled:opacity-action-disabled disabled:pointer-events-none`.

### [P2][J] Doc/source drift: doc says surface-2/3/4, source uses surface-raised(-hover/-active)
- **Category:** docs
- **Evidence:** top-bar.md:15 "bg-surface-2", top-bar.md:20 "bg-surface-3, hover:bg-surface-4"; source uses `bg-surface-raised` (top-bar.tsx:83) and `bg-surface-raised-hover`/`-active` (top-bar.tsx:209). Doc also lists `icon: ReactNode` (top-bar.md:43,58) but source types it `IconInput` (top-bar.tsx:47,45).
- **Why:** Rubric J — doc must match source. The surface-N naming is stale vocabulary and the icon type is wrong.
- **Fix:** Update doc to `surface-raised`/`-hover`/`-active` and `icon: IconInput`.

### [P3][I] TopBarRoot uses `React.Children.toArray(...).some(child.type === TopBarCenter)` for layout detection
- **Category:** types / structural
- **Evidence:** top-bar.tsx:74-77 — reference-equality on `child.type`.
- **Why:** Fragile: breaks if Center is wrapped, memoized, or re-exported; a known past Karm report touched TopBar.Section detection. Not a tell, but brittle vs. an explicit `layout` prop or context.
- **Fix (optional):** Accept an explicit `layout?: 'two-zone' | 'three-zone'` override, keeping auto-detection as default.

### [P3][G5] Story uses a bespoke bordered center-search button rather than a soft-styled control
- **Category:** vocabulary
- **Evidence:** stories:172-179 — `border border-surface-border bg-surface-raised-hover`.
- **Why:** Example teaches the outline+fill look for a non-primary control; soft is the house default. Minor since it's a story demo, not shipped default.
- **Fix:** Model the search trigger on `Button variant="soft"` or an `Input`-styled trigger.

## Composability gaps
- `TopBar.IconButton` does not compose the canonical `IconButton`/`Button` — re-rolls surface, hover, press, focus (F5). Biggest gap.
- `TopBar.UserMenu` is data-driven (`userMenuItems` config) inside a component that documents itself as composition-only — no way to compose an arbitrary menu item, submenu, or non-standard control (F1/F4). The built-in Profile/color-mode/logout items are hardcoded, not overridable.
- No `asChild` on `TopBar.Title` (an `<h2>`) or the zone wrappers — consumers wanting an `<h1>` or a link-wrapped title must override via className/tag manually. Radix triggers already use `asChild` correctly, so the primitive-composition story is otherwise good.
- Badge/dot rendered inline rather than composing `Badge`/`StatusDot`.

## Motion gaps
- CSS-only transitions; does not use the shared motion system (`springs`/`tweens`/`motionProps`) that Card + StatCard standardized on (M2 — one-off timing vocabulary).
- `active:scale-90` transform press has no `prefers-reduced-motion`/`motion-reduce:` guard (M3).
- No intentional entrance/exit beyond Radix dropdown defaults; icon buttons have hover+press but the dropdown open/close motion isn't tuned to the system (M4).

## Polish plan (ordered steps to reach the finish bar)
1. Rebuild `TopBar.IconButton` to compose the canonical `IconButton` (`variant="ghost"` or `"soft"`, `shape="circle"`, `size="sm"`) + tooltip wrapper. Resolves F5, V2, focus-visible, disabled/loading, and reduced-motion in one move.
2. Narrow `UserMenuItem.color` to the canonical `'neutral' | 'success' | 'warning' | 'error' | 'info'` union (I/G3).
3. Add a composition path to `TopBar.UserMenu` — accept `DropdownMenuItem` children (or an item `render`/`node`) so custom items aren't boxed into the config schema; keep `userMenuItems` as a convenience overload (F1).
4. Replace the inline badge/dot px classes with `Badge` + `StatusDot` (G2).
5. Add `motion-reduce:` guards (or inherit them via IconButton) and align the transition to the motion tokens Button uses (M3/M2).
6. Fix the doc: `surface-raised`/`-hover`/`-active` vocabulary and `icon: IconInput` (J).
7. Add stories/tests for disabled icon button, reduced-motion, RTL, and forced-colors to close the state matrix.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No colored stripe on the bar.
- **V3 gradient text / V4 default palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** all clean in shipped defaults. (The one gradient — `from-pink-7 to-red-7` at stories:215 — is a consumer mock logo in a story, not a component default, and uses brand palette steps; not a tell.)
- **G1 surface:** correct — shell chrome legitimately uses `bg-surface-raised` per the MANDATORY layering rule ("shell chrome (Sidebar, TopBar) → surface-1").
- **F2 asChild (on the parts that need it):** Radix Tooltip/DropdownMenu triggers correctly use `asChild`.
- **Composition core:** zone slots (Left/Center/Right/Section), auto grid↔flex, `TopBar.Title` responsive — solid, genuinely slot-based skeleton.
- **a11y baseline:** `aria-label` from `tooltip` on icon buttons, `type="button"`, email truncation via `TruncatedText`, axe-clean test, keyboard-reachable menu. UserMenu has a proper focus-visible ring (just not the shared utility).
- **Types:** `forwardRef` + `displayName` on every subcomponent; correct element-specific ref types (`HTMLElement`/`HTMLDivElement`/`HTMLButtonElement`/`HTMLHeadingElement`); no `any`; `IconInput` used for icons. (Only `color?: string` is stringly-typed.)
- **E-series verbal tells:** doc/JSDoc are direct and clean — no em-dash tic abuse, no AI vocabulary, no meta-hedging.
