# ui/devalok-grain — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

> **Context note (read first).** This component *is* a brand texture — noise + directional gradient.
> Per the rubric, gradients/blur/sheen here are the **deliberate brand artifact**, not a tell: the
> gradient is gated behind an explicit `tint` prop, the noise is the documented "Devalok signature,"
> and the whole thing is `aria-hidden` decoration injected only when a consumer drops it in. So V3/V6
> (gradient/glow) are NOT flagged as visual tells — they are the component's reason to exist. What IS
> fair game: token drift (raw values where DS tokens exist), motion-system bypass, an `any` leak,
> composability, and verbal tells in JSDoc/stories. Those are where it falls short of the Card bar.

## Findings

### [P1][G2] Easing curve hardcoded as a raw cubic-bezier array instead of the DS token
- **Category:** drift
- **Evidence:** devalok-grain.tsx:127 — `transition: { duration: 0.6, ease: [0.2, 0, 0.38, 0.9] }`
- **Why:** `[0.2, 0, 0.38, 0.9]` is byte-for-byte `--ease-productive-standard` (semantic.css:398). The story even labels it "600ms ease-productive-standard entrance" (devalok-grain.stories.tsx:148) — intent is the token, code re-rolls the literal. If the token ever retunes, this drifts silently. Card/StatCard never inline curves; they pull from `lib/motion` (`springs.*`, `tweens.elegant`).
- **Fix:** Import from `./lib/motion`. Add an `entrance` tween there bound to the productive-standard curve at `durations.slow02`, or reference the curve via a shared const — don't repeat the 4 magic numbers.

### [P1][G2] Gradient/noise transition durations use raw Tailwind `duration-300`, off the DS duration scale
- **Category:** drift
- **Evidence:** devalok-grain.tsx:141, 149, 157 — `transition-opacity duration-300`
- **Why:** `duration-300` is a bare Tailwind utility (300ms), not part of the DS scale. CLAUDE.md states `--duration-*` does NOT auto-generate utilities; the DS exposes explicit `@utility duration-fast-01 … duration-moderate-02` (utilities.css:270-274, capping at 240ms). 300ms exists in no DS token, so hover/entrance feedback here runs at a tempo nothing else in the system uses — exactly the "uniform/off-scale timing" the motion rubric warns about (M2).
- **Fix:** Use a DS duration utility (`duration-moderate-02` for the hover crossfade) or drive opacity via framer + `durations.*` for consistency with the rest of the texture's motion.

### [P1][I] `as any` cast on motion wrapper props — `any` leak in component body
- **Category:** types
- **Evidence:** devalok-grain.tsx:136 — `{...(wrapperProps as any)}`
- **Why:** Rubric I bans `any` in component code. The neighboring `motion.ts` ships `motionProps<T>()` precisely to bridge the React↔Framer event-handler type clash without `any` (motion.ts:84). This widens to `any`, defeating that helper's purpose and the strict-TS posture.
- **Fix:** Type `wrapperProps` as the framer `MotionProps`/`HTMLMotionProps<'span'>` subset it actually is (just `initial`/`animate`/`transition`), or route through `motionProps`. The static-vs-motion `Wrapper` union is the real friction — split into two branches so each render path is typed without the cast.

### [P2][M2] Two parallel motion systems in one tiny component (framer entrance vs CSS-class hover) at mismatched tempos
- **Category:** motion
- **Evidence:** devalok-grain.tsx:127 (framer `duration: 0.6`) vs :141/149/157 (CSS `duration-300`); hover-noise via CSS var `--grain-hover-opacity` (:158,165) vs entrance via framer opacity.
- **Why:** Entrance is framer-driven and reduced-motion-aware; hover/tint crossfades are plain CSS transitions with no reduced-motion guard and a different (off-scale) duration. The Card bar is *one* intentional motion vocabulary. Here the two systems neither share durations nor share the reduced-motion gate (see next finding).
- **Fix:** Pick one. Either drive hover-intensify through framer with `durations.*`, or keep CSS but use a DS duration utility and accept the entrance is the only animated bit. Document why if intentional.

### [P2][M3] `hoverIntensify` / gradient CSS transitions have no `prefers-reduced-motion` guard
- **Category:** motion
- **Evidence:** devalok-grain.tsx:141,149,157 — `transition-opacity duration-300` with no reduced-motion handling. Only the framer *entrance* checks `useReducedMotion()` (:105,120).
- **Why:** Reduced-motion users still get the 300ms opacity ramp on hover and the dark/light gradient crossfade. The component correctly guards its entrance but leaves the CSS-class motion ungated — partial coverage reads as "the easy half was done."
- **Fix:** Gate the CSS transitions behind `motion-reduce:transition-none` (Tailwind variant) or fold them into the framer path that already respects `prefersReduced`.

### [P2][F2] Not a `forwardRef` component and forwards no ref — consumers can't ref the grain layer
- **Category:** composability
- **Evidence:** devalok-grain.tsx:97 — `export function DevalokGrain({...}: DevalokGrainProps)`; `DevalokGrain.displayName = 'DevalokGrain'` (:176) is set manually on a plain function.
- **Why:** Every sibling in this family (`Card`, `StatCard`, all of `lib`) uses `React.forwardRef`. This is a decorative `aria-hidden` layer so the practical need is low, but it's the only public `ui/*` export that isn't ref-forwarding, and it accepts no `className`/`style`/rest props either (see F-gap below) — so a consumer cannot reach the rendered node at all. Note Button detects it by `displayName` string match (button.tsx:427), so the manual displayName is load-bearing — keep it if refactoring.
- **Fix:** If a ref is wanted, wrap in `forwardRef<HTMLSpanElement>`. At minimum, accept and spread `className`/rest so the layer is tunable (see next).

### [P2][F1] Closed prop surface — no `className`/`style`/rest passthrough; every adjustment is a new bespoke boolean
- **Category:** composability
- **Evidence:** devalok-grain.tsx:97-104 — destructures only the 6 named props; no `...rest`, no `className`. Feature growth has been by adding flags: `sheen`, `animated`, `hoverIntensify` are each a bespoke boolean.
- **Why:** The Card-bar pattern is composition + a passthrough escape hatch, not an ever-growing boolean matrix. With no `className` a consumer can't nudge z-index, blend-mode, or opacity without forking. Three booleans is still under the F3 threshold, but the *trajectory* (closed surface, flag-per-feature) is the anti-pattern.
- **Fix:** Accept `className` (merge via `cn`) and `...rest: React.HTMLAttributes<HTMLSpanElement>` spread onto the wrapper. Keeps the API composable as needs grow.

### [P1][E3] AI-vocabulary + verbal tells in JSDoc and story copy
- **Category:** verbal-tell
- **Evidence:**
  - devalok-grain.tsx:36 — "for a **premium** 3D feel" (E3 marketing filler).
  - devalok-grain.tsx:69 — "warm, **tactile**, paper-like" (borderline; "tactile" is the brand word, acceptable, but paired with the texture-marketing register).
  - stories :25 — "gives surfaces a warm, **tactile**, paper-like feel"; :342-343 — "Warm. Tactile. Handcrafted. … connects digital interfaces to **physical craft**." Forced tricolon + brochure voice (E5/E7).
  - stories :264 — "Welcome to Karm / Your project management workspace, **crafted by Devalok**" — engagement-bait hero copy (E5).
- **Why:** The make-kit/authoring voice is "direct + prescriptive, no marketing copy" (CLAUDE.md). JSDoc that ships in `llms-full.txt` carrying "premium 3D feel" and tricolon brand-poetry is exactly the verbal-tell register the audit strips. "Tactile/paper-like" once as the brand descriptor is fine; the stacked adjectives + "crafted by" are the tell.
- **Fix:** Trim JSDoc to what it does ("adds an inset highlight on the top edge and shadow on the bottom"). Drop "premium," the "Warm. Tactile. Handcrafted." tricolon, and "crafted by Devalok" hero filler in stories.

### [P2][J] No per-component doc and no `*.test.tsx` — public export shipped without test coverage
- **Category:** docs / state-coverage
- **Evidence:** Glob for `packages/core/docs/components/**/devalok-grain.md` → none. No `devalok-grain.test.tsx` co-located (only `devalok-grain.tsx` + `.stories.tsx`). Exported publicly at index.ts:332.
- **Why:** Stories exist (publish gate satisfied) but there's zero test asserting the `aria-hidden`, the reduced-motion branch (static `span` vs `motion.span`), or the tint/no-tint gradient logic. The branch at :122 (`shouldAnimate ? motion.span : 'span'`) is exactly the kind of conditional that regresses silently. Card/StatCard both have tests.
- **Fix:** Add a smoke test: renders `aria-hidden="true"`, renders plain `span` when `prefers-reduced-motion`, emits tinted gradient only when `tint` set. Add a short doc page if the family has per-component docs.

### [P3][V14] All-caps eyebrow labels in story scaffolding
- **Category:** visual-tell (story-only)
- **Evidence:** devalok-grain.stories.tsx:189, 212 — `text-ds-xs … uppercase tracking-wider` section labels ("Solid buttons with grain").
- **Why:** Minor; stories only, not shipped component output. The uppercase-tracking eyebrow is the V12/V14 reflex, but it's demo chrome, low impact.
- **Fix:** Optional — use normal-case `text-surface-fg-subtle` labels to match the rest of the storybook.

### [P3][G2] `z-[1]` / `z-[2]` arbitrary z-index instead of the DS z-layer utilities
- **Category:** drift
- **Evidence:** devalok-grain.tsx:135 — `z-[1]`; stories use `z-[2]` throughout.
- **Why:** CLAUDE.md notes the DS has explicit `@utility z-popover` etc. for layering. `z-[1]`/`z-[2]` are local stacking within an `isolate` context so the blast radius is contained — but they're raw arbitrary values where the system prefers named layers. Low severity because these are genuinely local (isolated stacking context), not global z-fighting.
- **Fix:** Acceptable as-is given `isolate`; if tightening, document that these are intra-component and exempt.

## Composability gaps
- No `className` / `style` / `...rest` passthrough (F1) — closed surface; consumer cannot tune the layer without forking.
- Not `forwardRef` (F2) — only public `ui/*` export that doesn't forward a ref; consumers can't reach the node.
- Feature growth is flag-per-feature (`sheen`, `animated`, `hoverIntensify`) — trending toward a boolean matrix rather than composition. Still under the F3 8-prop threshold but worth watching.
- Coupling-by-string: Button identifies the grain via `displayName === 'DevalokGrain'` (button.tsx:427) rather than a stable marker. The `data-grain` attribute already exists (:133) and would be a more robust contract than the displayName string — but that's a Button-side fix, noted for cross-ref.

## Motion gaps
- Easing hardcoded as raw `[0.2, 0, 0.38, 0.9]` rather than the `--ease-productive-standard` token / a `lib/motion` preset (M2/drift).
- Two motion systems at mismatched tempos: framer entrance at 600ms vs CSS `duration-300` hover/gradient crossfades (M2).
- `duration-300` is off the DS duration scale entirely (max DS utility = `duration-moderate-02` 240ms; framer max = `slow02` 700ms) — 300ms is a one-off.
- Reduced-motion only guards the framer entrance; the CSS-class hover/gradient transitions are ungated (M3). Needs `motion-reduce:transition-none` or fold into the framer path.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the hardcoded easing.** Add an `entrance`/`textureReveal` preset in `lib/motion` bound to the productive-standard curve + `durations.slow02`; import it. Remove the `[0.2,0,0.38,0.9]` literal.
2. **Put hover/gradient transitions on the DS scale + reduced-motion-gate them.** Replace `duration-300` with a DS duration utility and add `motion-reduce:transition-none`, or move the crossfades into the framer path so one system + one reduced-motion gate covers everything.
3. **Remove the `as any`.** Type `wrapperProps` as the framer prop subset, or branch the static/motion render paths so each is typed cleanly. Reuse `motionProps` if a spread bridge is still needed.
4. **Open the prop surface.** Accept `className` (merge via `cn`) + `...rest` spread onto the wrapper; consider `forwardRef<HTMLSpanElement>`. Keep `data-grain` and the manual `displayName` (Button depends on the latter).
5. **Strip the verbal tells.** Rewrite JSDoc to plain mechanics ("inset highlight top, shadow bottom"); drop "premium," the "Warm. Tactile. Handcrafted." tricolon, and "crafted by Devalok" hero copy in stories.
6. **Add a test.** Assert `aria-hidden`, the reduced-motion static-`span` branch, and tint-gated gradient rendering. Add a per-component doc if the family has them.

## Clean (rubric dims that pass)
- **V1 accent rail** — none. No left/top colored stripe.
- **V3 / V6 gradient + glow** — present but these ARE the brand artifact: gradient gated behind explicit `tint`, noise is the documented signature, sheen is opt-in (`sheen={false}` default), all `aria-hidden`. Deliberate, not a tell. The neutral gradient is even deliberately suppressed on light surfaces ("looks like a dark smudge," :138).
- **V4 framework palette** — clean. Tints come via `var(--color-accent-9)` etc. and oklch; no `indigo/violet/slate`.
- **V5 emoji** — none in source or stories.
- **V7 rounded-everything** — uses `rounded-[inherit]` to match parent; no reflexive `rounded-3xl`.
- **M1 bounce-by-default** — entrance is a plain opacity tween, no overshoot/spring bounce. Good restraint for a texture layer.
- **a11y baseline** — correctly `aria-hidden="true"` (:134) and `pointer-events-none` (:135); purely decorative, no interactive semantics to break.
- **Entrance reduced-motion** — the framer entrance branch respects `useReducedMotion()` (:105,120) and falls back to a static `span`. (The CSS-class transitions don't — see M3.)
- **G1 surface** — n/a; it's a child overlay, not a surfaced container, so the surface-layering rule doesn't apply.
- **G3 variant-axis** — no `variant`/`size`/`color` CVA axis; `intensity`/`surface` are domain-appropriate scalar names, not the canonical taxonomy being mis-mapped.
- **Stories** — comprehensive (10 stories: default, intensity, tints, animated, hover, on buttons/badges/cards, sheen, full demo); publish-gate satisfied.
