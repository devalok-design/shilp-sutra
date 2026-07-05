# ai/devadoot-icon — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:2

This is a brand-identity animated mark (the Devalok chakra). The core design bet — "the color IS the animation" (gradient-as-identity, Gemini-inspired) — is a *deliberate, documented choice*, not a reflex. The chakra path, the pink↔purple palette, and the reduced-motion static fallback are all real design decisions and score clean. What drags it below the Card bar is drift, not slop: every color and every motion value is a hardcoded literal (no token binding), the icon-glow/shimmer stack is exactly the "glow" visual reflex even if state-gated, there's no test, no doc page, and the `size` prop breaks the DS size vocabulary. Nothing here is a P0 hard tell.

## Findings

### [P1][G2] All brand colors are hardcoded hex, not tokens
- **Category:** drift
- **Evidence:** devadoot-icon.tsx:33-39 — `const BRAND_PINK = '#D33163'` … `BRAND_ROSE='#E8457A'` `BRAND_PURPLE='#9B5DE5'` `BRAND_MAGENTA='#C850C0'` `BRAND_BRIGHT='#FF6B9D'` `ERROR_RED='#E5383B'`, plus inline `s2: '#FF6B6B'` at :91.
- **Why:** The mark is brand identity but its colors are frozen literals — they can't follow the semantic token system, won't adapt to theme changes, and drift from `accent-*`/`error-*` if the brand palette moves. `#FF6B6B` / `#FF6B9D` don't map to any documented DS token.
- **Fix:** Read from CSS custom properties (`getComputedStyle` on the DS `--color-accent-9`, `--color-error-9`, etc.) or expose a small brand-gradient token set in `tokens/`. At minimum, source the base stops from the semantic accent/error scale so light/dark and brand shifts propagate.

### [P1][J] No test file
- **Category:** docs
- **Evidence:** no `devadoot-icon.test.tsx` co-located in `packages/core/src/ai/` (Glob returned nothing; only `.tsx` + `.stories.tsx` exist).
- **Why:** Public exported component (`src/ai/index.ts:11`) with four animation states, a reduced-motion branch, and `React.memo`. Zero coverage of the reduced-motion fallback (the one branch that must render deterministic static SVG for a11y/SSR) or of `aria-hidden` presence. Stories are a publish gate; tests are the DS norm (2100+ tests).
- **Fix:** Add `devadoot-icon.test.tsx`: assert static `<path fill="#...">` renders when `useMotion().reducedMotion` is true, assert `aria-hidden="true"` on the root in both branches, assert `size` maps to width/height, and axe-clean.

### [P1][J] No per-component doc page
- **Category:** docs
- **Evidence:** Glob `packages/core/docs/components/**/devadoot-icon*` → no files. No mention in `llms.txt` / `llms-full.txt` (grep found only the barrel export).
- **Why:** Public component absent from the AI-readable docs and the component docs tree — fails the per-component docs-coverage gate and leaves agents/consumers with only the JSDoc.
- **Fix:** Add the component to `llms-full.txt` (props: `state`, `size`, `className`; the four states) and a docs page, or explicitly allowlist it as internal-only if it's not meant for consumer use.

### [P1][G3/I] `size` prop is a raw number, off the DS size vocabulary
- **Category:** types
- **Evidence:** devadoot-icon.tsx:25 `size?: number` (default `20`); story drives `16/20/24/32/48` raw px.
- **Why:** Every other DS component uses the `xs|sm|md|lg|xl` size axis; a bare pixel number is a one-off vocabulary that won't align to the icon-size scale (`Icon size="sm"` etc.). Consumers can pass `size={17}` and land off-grid.
- **Fix:** Either accept the canonical `size?: 'xs'|'sm'|'md'|'lg'|'xl'` mapped to the icon size tokens, or (if raw px is genuinely needed for the agent-icon slot) keep `number` but document it as an escape hatch and offer the named scale as the primary path.

### [P2][V6] Glow blur + white shimmer overlay = the "glow" visual reflex
- **Category:** visual-tell
- **Evidence:** devadoot-icon.tsx:99 `const glowBlur = state === 'processing' ? 3 : ...`; :157-163 `feGaussianBlur` glow filter; :166-181 blurred semi-transparent glow copy pulsing `opacity:[0.2,0.45,0.2]`; :184-197 `fill="white"` shimmer overlay pulsing.
- **Why:** Blurry glowing halo + white shimmer sweep is textbook AI-glow (V6). It's *state-gated* (only processing/error) and part of a deliberate identity, which softens it — but a glowing colored blur behind a mark is still the single most "AI" of the visual layers here. Worth a design gut-check that the glow reads as intentional feedback, not decoration.
- **Fix:** If kept, tie glow intensity/blur to a motion/elevation token rather than magic `3 / 2.5`. Consider whether the white shimmer earns its place or just adds "sparkle." Keep the glow strictly bound to active processing so idle never glows (it currently doesn't — good).

### [P2][G2] Motion durations / spring configs are magic numbers, not motion tokens
- **Category:** drift
- **Evidence:** devadoot-icon.tsx:51 `duration: state==='processing' ? 4 : 12`; :99 blur `3 / 2.5`; :122 `{ type:'spring', stiffness:500, damping:15 }`; :125 `{ duration: 0.3 }`; :142-152 `duration: processing?3:5`; :177 `duration:3`; :193 `duration:2.5`.
- **Why:** DS ships `springs`/`tweens`/`durations` tokens (`ui/lib/motion.ts`) exactly so components don't hand-roll timing. Here nearly every value is a literal. The code even *comments* "Near springs.bouncy (400/15/0.5)" (:121) then hardcodes 500/15 anyway — acknowledged drift.
- **Fix:** Use `springs.bouncy` for the responded pop (or add a named preset if 500/15 is genuinely wanted), and pull the fade/glow durations from `durations.*`. The long idle/processing loop durations (4s/12s) are legitimately bespoke to the identity — those can stay but should be named constants with a comment.

### [P2][M1] Responded pop overshoots by default
- **Category:** motion
- **Evidence:** devadoot-icon.tsx:113 `state==='responded' ? { scale:[1.18,1] }` with :122 spring `stiffness:500, damping:15` (low damping = overshoot).
- **Why:** Bounce/overshoot on entrance is the M1 reflex. Here it's *gated to the "responded" celebration state* and documented as celebration feedback, so it's largely defensible — but 1.18 scale + damping 15 is a noticeable bounce. Flagging so synthesis can confirm it reads as "arrival," not "boing."
- **Fix:** Keep the pop but consider the shared `springs.bouncy` values, and verify it's motion-reduced-safe (it is — the whole animated branch is skipped when `reducedMotion`).

### [P2][H] `size` is not clamped / no invalid-input guard; no `title`/label option
- **Category:** state-coverage
- **Evidence:** devadoot-icon.tsx:64 `size = 20` used directly as `width`/`height`; root is always `aria-hidden="true"` (:78, :105).
- **Why:** The mark is always `aria-hidden`, which is correct when it sits next to a text label (as in CommandBar), but there's no opt-in accessible name for when it's used standalone as the *only* indicator of agent state (idle/processing/error convey meaning). A purely decorative icon that also encodes live state is an a11y gap for screen-reader users.
- **Fix:** Add an optional `label?: string` / `aria-label` passthrough that, when provided, drops `aria-hidden` and sets `role="img"` + `aria-label`; consider `aria-live` guidance in docs for the state-as-status use.

### [P3][V4] `#FF6B6B` / `#FF6B9D` are generic web reds/pinks, not brand-anchored
- **Category:** visual-tell
- **Evidence:** devadoot-icon.tsx:38 `BRAND_BRIGHT='#FF6B9D'`; :91 error `s2:'#FF6B6B'`.
- **Why:** These read as off-the-shelf "friendly coral" values rather than derived from the brand scale. Minor — subsumed by G2 — but worth confirming they're deliberate brand stops, not eyeballed.
- **Fix:** Derive from `accent`/`error` scale steps or document them as intentional gradient highlights.

### [P3][docs] JSDoc header says "no blue" but describes processing as pink→purple→blue elsewhere
- **Category:** docs
- **Evidence:** devadoot-icon.tsx:10 doc comment "processing: gradient sweep (pink → purple → blue → pink cycle)" vs :33 `// Brand colors — pink ↔ purple palette, no blue` and actual processing stops `BRAND_PINK, BRAND_PURPLE, BRAND_MAGENTA` (no blue).
- **Why:** Internal doc drift — the top JSDoc still describes a blue phase that the code deliberately removed.
- **Fix:** Update the file-header JSDoc to match the shipped pink↔purple palette.

## Composability gaps
- **F1/F2 (minor):** It's a leaf icon, so slots/`asChild` mostly don't apply — but there's no way to swap the SVG path or supply `title`/`role` for the standalone-status case (see H). Not re-rolling a base primitive is fine here (there's no icon base to compose for an animated brand mark).
- No `ref` forwarding: `React.memo` component takes no `ref`; consumers can't get the root `<span>`. Low impact for an icon but inconsistent with the DS `forwardRef`+`displayName` norm (it does set `displayName` at :215).

## Motion gaps
- **Clean:** reduced-motion is genuinely respected — `useMotion().reducedMotion` short-circuits to a static SVG (:71-86). This is the M3 requirement met properly.
- **M1:** responded pop overshoots (scale 1.18, damping 15) — gated to celebration state, defensible but noticeable.
- **G2/M2:** all timings are magic numbers instead of `springs`/`tweens`/`durations` tokens; the code comments its own drift ("Near springs.bouncy … stiffer pop") then hardcodes it.
- **M5:** clean — animates `scale`/`x`/`opacity`/`stopColor`/`stdDeviation`, never layout props.

## Polish plan (ordered steps to reach the finish bar)
1. **Token the colors (G2).** Source gradient stops + error from the semantic scale (CSS vars or a brand-gradient token set); delete the frozen hex literals. This is the highest-value fix and unblocks theming.
2. **Token the motion (G2/M2).** Replace the responded spring with `springs.bouncy` (or a named preset), pull fade/glow durations from `durations.*`; leave only the intentional long idle/processing loop durations as named constants.
3. **Add the test (J).** Cover the reduced-motion static branch, `aria-hidden`, `size`→dimensions, and axe.
4. **Add docs (J).** llms-full.txt entry + component doc page (or explicit internal-only allowlist).
5. **Fix the size vocabulary (G3).** Offer the canonical `xs|sm|md|lg|xl` scale; keep `number` as a documented escape hatch if the agent-icon slot needs it.
6. **Standalone-status a11y (H).** Optional `label`/`aria-label` → `role="img"`, drop `aria-hidden` when provided.
7. **Design gut-check the glow/shimmer (V6)** and update the stale "no blue" JSDoc (:10).

## Clean (rubric dims that pass)
- **V1 accent rail** — none. **V2 double-edge** — n/a (no card surface). **V3 gradient text** — the gradient is on an SVG brand *mark*, deliberate and documented (Gemini-inspired identity), not on a heading/metric → not a tell.
- **V4** — palette is brand pink/purple/magenta, no indigo/violet/slate framework-default (the two coral hexes are the only nit, P3).
- **V5 emoji / V7 rounded-everything / V8 pill-spam** — none.
- **M3 reduced-motion** — respected with a real static fallback (the standout strength).
- **M5** — transform/opacity/color only, no layout-prop animation.
- **E-series verbal tells** — JSDoc + story copy are plain and specific; no em-dash tic (uses `--` and `→` sparingly), no AI vocabulary, no hedging.
- **Structural** — story file is well-organized (individual states, all-states, sizes, interactive, in-context integration); good coverage of visual states.
