# ui/navigation-menu — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:5 P3:2

NavigationMenu is a thin, well-mannered wrapper over the vendored Radix primitive. It composes the primitive (doesn't re-roll keyboard/portal/state), uses semantic surface tokens (`bg-surface-overlay`, `bg-surface-raised-hover`), the disabled token (`opacity-action-disabled`), and the shared motion lib (`springs`, `tweens`). No accent rail, no gradient text, no framework palette, no emoji, no glass/blob. The gaps are all polish-grade: a bespoke MutationObserver-driven motion bridge, a dead decorative motion element, missing reduced-motion handling, several hardcoded magic values, and a thin/stale doc + story (single story, no panel-open story, no state coverage).

## Findings

### [P2][M3] No reduced-motion guard on any of the three animated subcomponents
- **Category:** motion
- **Evidence:** navigation-menu.tsx:133-138 — `<motion.div key={motionDir} initial={initial} animate={animate} transition={{ ...springs.smooth, opacity: tweens.fade }} />`; also :196-202 (viewport overlay) and :254-260 (indicator). No `useReducedMotion()`, no `withReducedMotion(...)`, no MotionConfig check.
- **Why:** The content panel slides a full `13rem` (≈208px) horizontally on every open — exactly the kind of large translate a vestibular-sensitive user needs suppressed. `withReducedMotion` already exists in `./lib/motion` and is unused here.
- **Fix:** Gate the slide distance / spring on `useReducedMotion()` (framer) — collapse `x` to `0` and run opacity-only, or wrap the transition in `withReducedMotion(...)`. Matches the system's own helper.

### [P2][M4/structural] Dead decorative motion overlay in the Viewport that renders nothing
- **Category:** motion
- **Evidence:** navigation-menu.tsx:196-202 — `<motion.div aria-hidden className="absolute inset-0 pointer-events-none" initial={false} animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }} ... />` — the element has no background, no border, no children; `aria-hidden` + `pointer-events-none`.
- **Why:** It animates opacity/scale on an empty, transparent, non-interactive box — visually a no-op. It also drives a whole `useState` + `MutationObserver` (:165-183) whose only consumer is this invisible element. The intended scale+fade was presumably meant to apply to the actual `Viewport`, not a sibling overlay; as shipped the viewport itself has no entrance motion.
- **Fix:** Either animate the real `NavigationMenuPrimitive.Viewport` (make it a `motion(...)` element with the scale+fade) and delete the overlay + its observer, or remove the dead element entirely. Don't ship motion machinery that paints nothing.

### [P1][G2/F5] Bespoke MutationObserver-per-subcomponent motion bridge instead of the system pattern
- **Category:** structural-tell / composability
- **Evidence:** Three near-identical `useRef` + `composedRef` + `useState` + `MutationObserver` blocks: Content :79-110, Viewport :155-183, Indicator :215-243. Each manually observes Radix `data-motion`/`data-state` to drive framer.
- **Why:** This is hand-rolled plumbing that re-implements what Radix's own CSS `data-[motion]`/`data-[state]` selectors or an `AnimatePresence`-based pattern would do declaratively. It triples the surface area for bugs (initial-value race, observer leak, `key={motionDir}` remount thrash) and diverges from how the rest of the system animates Radix overlays. Card/StatCard express motion declaratively via framer props, not by spying on DOM attributes.
- **Fix:** Drive the slide direction from Radix's `data-motion` via CSS data-attribute variants (TW4 `data-[motion=from-start]:...`) or a single shared hook, not a per-component observer. Reduces three observers to zero or one reusable primitive.

### [P2][G2] Hardcoded magic slide distance `13rem` (× off-token, mirrors LTR-only)
- **Category:** drift
- **Evidence:** navigation-menu.tsx:67-73 — `'from-start': { x: '-13rem', ... }`, `'from-end': { x: '13rem', ... }`, etc. `13rem` is a raw value with no token backing and no comment on where it came from.
- **Why:** It's an arbitrary off-scale distance (not on the `--spacing-ds-*` cadence, not a duration/easing token) and it's a fixed pixel-ish translate that won't track actual panel width. Also see H/RTL below — the sign is hardcoded LTR.
- **Fix:** Either derive the offset from the viewport width (`--radix-navigation-menu-viewport-width`) or pull from a spacing token; comment the intent.

### [P2][H] No RTL handling — slide direction is hardcoded LTR
- **Category:** a11y / state-coverage
- **Evidence:** navigation-menu.tsx:67-73 — `from-start` → `-13rem`, `from-end` → `+13rem`. The mapping of "start"→negative-x assumes LTR; in RTL "start" is on the right and the slide should invert. No `dir`/`useDirection` consultation.
- **Why:** Radix emits logical `from-start`/`from-end`, but the component translates them to physical `x` with a fixed sign, so the directional slide plays backwards in RTL.
- **Fix:** Resolve `x` sign against document direction (or use a logical transform). The rubric's RTL row applies — directional motion must mirror.

### [P2][J] Doc is thin and stale; story has no panel-open / state coverage
- **Category:** docs / state-coverage
- **Evidence:** navigation-menu.md has no prop table (only a compound-tree + one example) and a `## Changes` log that stops at v0.18.0 while the component now ships the observer/framer machinery; navigation-menu.stories.tsx:19-100 has a single `Default` story — panels are closed at rest, so the story never shows the Content slide, Viewport, or Indicator motion, and there's no disabled/RTL/dark/reduced-motion story.
- **Why:** Below the Card bar (which has multiple stories + accurate prop docs). The most visible behavior (the animated dropdown) is invisible in the only story, and the doc doesn't document `NavigationMenuProps`/`NavigationMenuContentProps` props or the `asChild` link pattern in a prop table.
- **Fix:** Add stories with a panel forced/opened (and an Indicator story), plus disabled-trigger and dark/RTL variants. Refresh the doc's Changes log and add a brief prop/sub-component reference.

### [P2][G2] Scattered raw positional values (`top-[1px]`, `top-[60%]`, `h-2 w-2`)
- **Category:** drift
- **Evidence:** navigation-menu.tsx:60 `className="relative top-[1px] ml-ds-02 ..."` (chevron nudge); :259 `className="relative top-[60%] h-2 w-2 rotate-45 ..."` (indicator diamond).
- **Why:** `top-[1px]`, `top-[60%]`, and bare `h-2 w-2` are off-token raw values. The indicator diamond size especially should ride a spacing/size token for consistency with the rest of the kit.
- **Fix:** Replace `h-2 w-2` with a `size-ds-*` token; keep optical nudges (`top-[1px]`) only with a comment explaining the optical alignment, or fold into the icon component.

### [P3][I] `motionDir` typed as `string | null`, then cast into the variants keyspace
- **Category:** types
- **Evidence:** navigation-menu.tsx:89 `useState<string | null>(null)`, then :113 `contentSlideVariants[motionDir as keyof typeof contentSlideVariants]`. Same loose-string-then-cast on Viewport/Indicator `data-state`.
- **Why:** Stringly-typed DOM attribute funneled through an unchecked `as` cast — a typo or unexpected Radix value indexes into the variants map with no compile-time safety.
- **Fix:** Narrow to the known union (`'from-start' | 'from-end' | 'to-start' | 'to-end' | null`) and validate before indexing.

### [P3][V2] Indicator diamond carries both a shadow and sits on borders — minor double-edge smell
- **Category:** visual-tell
- **Evidence:** navigation-menu.tsx:259 — `bg-surface-border shadow-raised-hover` on the 8px rotated diamond caret.
- **Why:** A `shadow-raised-hover` (a card-elevation shadow) on a tiny 8px caret is a heavyweight shadow for a decorative pointer; borderline V2/over-elevation. Low impact (it's a caret), hence P3.
- **Fix:** Drop to a lighter shadow token (or none) for the caret; the elevation belongs to the viewport panel, not its pointer.

## Composability gaps
- **Good:** Composes the vendored Radix primitive directly (F5 clean) — `NavigationMenuItem` and `NavigationMenuLink` are passthrough re-exports; keyboard/portal/state are inherited, not re-rolled. `asChild` works on `NavigationMenuLink` (shown in the story) because it forwards to the primitive.
- **Gap (F1-adjacent):** `NavigationMenuTrigger` hardcodes the `IconChevronDown` caret as a fixed child (:59-60) with no way to suppress or swap it. A trigger that wants no caret (or a different affordance) can't opt out — this is a baked-in decoration that should be a prop/slot (`showCaret?` or an icon slot). Minor since the caret is the conventional affordance.
- **Gap:** The three animated subcomponents wrap an extra `motion.div`/observer layer (Content :133, Viewport overlay :196) that consumers can't reach or override — motion is opaque, not composable.

## Motion gaps
- **M3:** No reduced-motion handling anywhere despite a 13rem translate; `withReducedMotion` helper exists and is unused.
- **M4:** Viewport entrance motion is effectively missing — the scale+fade is applied to a dead aria-hidden overlay, not the real viewport, so the panel itself just pops in.
- **M5 (minor/clean-ish):** Real animations use transform (`x`, `scale`) + opacity — not layout props — which is correct. The `layout` prop on the Indicator (:255) is framer's transform-based FLIP, acceptable for the sliding caret. Viewport height is a CSS-var transition from Radix, not framer animating `height`.
- **Bespoke bridge:** MutationObserver-driven state is fragile (initial race, `key={motionDir}` forces a full remount of content on every direction change, which can interrupt the very animation it's trying to play).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the viewport motion:** make `NavigationMenuPrimitive.Viewport` itself the animated element (scale+fade) and delete the dead overlay `motion.div` + its `useState`/`MutationObserver` (:165-202).
2. **Add reduced-motion:** wire `useReducedMotion()` (or `withReducedMotion`) into Content, Viewport, Indicator — collapse the slide to opacity-only when set.
3. **Replace the per-component MutationObserver bridge** with CSS `data-[motion=*]` variants (or one shared hook); remove the `key={motionDir}` remount.
4. **RTL:** resolve the slide `x` sign against direction so `from-start`/`from-end` mirror.
5. **Tokenize magic values:** `13rem` → width-derived or token; `h-2 w-2` → `size-ds-*`; comment the `top-[1px]` optical nudge.
6. **Stories + docs:** add a panel-open story, an Indicator story, disabled/dark/RTL variants; refresh the doc Changes log and add a prop reference.
7. **Types:** narrow `motionDir`/`data-state` unions and drop the `as keyof` casts.

## Clean (rubric dims that pass)
- **V1 accent rail:** none.
- **V3 gradient text:** none.
- **V4 framework palette:** uses semantic tokens (`accent-9`, `surface-overlay`, `surface-raised-hover`, `surface-border`) — no raw indigo/violet/slate.
- **V5 emoji:** none; uses `IconChevronDown` via the Icon API.
- **V6 blob/glass/glow:** none — solid `bg-surface-overlay` panel, no backdrop-blur.
- **V7 rounded-everything:** uses `rounded-control`/`rounded-overlay`/`rounded-tl-control-inner` tokens, not `rounded-3xl`.
- **G1 surface:** correct — overlay panel is `bg-surface-overlay` (overlay is a surface-1-class chrome per the layering rule), trigger hover is `surface-raised-hover`. No card-on-surface-1 violation.
- **G3 variant axis:** no CVA variants on this component (pure primitive wrapper) — nothing to drift.
- **a11y baseline:** real `<button>` triggers, `disabled:` token, `focus-visible:ring-2 ring-accent-9`, axe test passes, keyboard (Enter) test passes, ref forwarding + displayName on all subcomponents.
- **E1–E8 verbal:** doc + JSDoc are direct, no em-dash tics in prose, no AI vocabulary, no placeholders.
- **F2 asChild:** present via the Radix `Link` passthrough (used in story).
