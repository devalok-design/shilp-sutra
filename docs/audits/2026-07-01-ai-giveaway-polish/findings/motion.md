# motion — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:2 P1:3 P2:4 P3:4

Scope: the motion unit lives at `packages/core/src/motion/` (provider, primitives, stories, tests) plus the shared JS motion tokens at `packages/core/src/ui/lib/motion.ts` (re-exported by `motion/index.ts`), the mdx doc at `packages/core/src/ui/motion.mdx`, and the overview stories at `packages/core/src/ui/motion.stories.tsx`. All were audited. There is **no** per-component doc at `packages/core/docs/components/**/motion.md`.

The runtime foundation (tokens, provider, primitives) is genuinely well built — reduced-motion is first-class, refs forward, types are strong, tests exist. It would score 4/5 on the runtime alone. It drops to **3/5 because two shipped, published stories are outright broken** (reference a removed API and an invalid enum value), plus doc/source drift on preset defaults and a factual overclaim in the showcase hero. Stories are a hard publish gate (CLAUDE.md), so broken ones are P0.

## Findings

### [P0][J] `ui/motion.stories.tsx` references removed `Fade` component + wrong `open` prop — two stories throw at runtime
- **Category:** docs / state-coverage
- **Evidence:**
  - `packages/core/src/ui/motion.stories.tsx:781` — `<MotionFade open={step === 'success'}>` — the primitive's prop is `show`, not `open`. The mdx migration table (`ui/motion.mdx:291`) explicitly states `open` was renamed to `show`.
  - `packages/core/src/ui/motion.stories.tsx:862,885,914` — `<Fade open={!loading}>` — `Fade` is **never imported** in this file (imports at `:36` are `MotionFade, MotionCollapse, MotionScale, MotionSlide`). This is a `ReferenceError: Fade is not defined` at render.
- **Why:** The `Scenario: Form Submission` and `Scenario: Dashboard Loading` stories will crash / fail the story test suite. The stories are supposed to demonstrate the very migration (`open`→`show`, drop `Fade`) they get wrong. Stories are a publish gate.
- **Fix:** Replace `<Fade open={x}>` → `<MotionFade show={x}>` and `<MotionFade open={x}>` → `<MotionFade show={x}>` (no new import needed). Run `run-story-tests` on `Foundations/Motion Overview`.

### [P0][G3] `ui/motion.stories.tsx` passes invalid `direction="bottom"` to MotionSlide
- **Category:** types / drift
- **Evidence:** `packages/core/src/ui/motion.stories.tsx:701` — `<MotionSlide show={slideOpen} direction="bottom">`. `MotionSlide`'s `direction` union is `'up' | 'down' | 'left' | 'right'` (`primitives.tsx:138`). `offsets["bottom"]` is `undefined`, so `initial`/`exit` spread `...undefined` → the slide silently does nothing (fades only). It is also a TS error against the exported prop type.
- **Why:** A foundation story demonstrating the slide primitive shows no slide, and it's type-invalid — undermines the "our motion is intentional" story the file is selling. Copy at `:704` also says "top/bottom/left/right", contradicting the API.
- **Fix:** Use `direction="down"` and change the copy to `up/down/left/right`.

### [P1][G2] Tween easing curves don't mirror the DS `--ease-*` tokens
- **Category:** drift
- **Evidence:** `packages/core/src/ui/lib/motion.ts:42` — `elegant: { … ease: [0.25, 0.1, 0.25, 1] }`; `:44` — `layout: { … ease: [0.25, 0.1, 0.25, 1] }`; `:38,40` — `ease: 'easeOut'`.
- **Why:** The JS motion layer is documented as "mirrors CSS `--duration-*` tokens" (`:4`) for durations, but the **easing** side is invented: `[0.25,0.1,0.25,1]` is generic CSS `ease-in-out`, not any named DS curve (`--ease-productive-standard`, `--ease-productive-entrance`, `--ease-expressive-*`, `--ease-bounce`). CSS animations use the tokens; FM animations use a different curve — the same "elegant" motion looks different in a CSS-driven vs FM-driven component. Single-source-of-truth drift.
- **Fix:** Add JS mirrors of the ease tokens (e.g. `export const eases = { productiveStandard: [0.2,0,0.38,0.9], … } as const`) and reference them in `tweens` instead of ad-hoc arrays / `'easeOut'`. FM tweens and CSS `@theme` eases then stay in lockstep.

### [P1][F6] `withReducedMotion()` is public API but dead — competes with the real reduced-motion path
- **Category:** composability / types
- **Evidence:** `packages/core/src/ui/lib/motion.ts:58` — `export function withReducedMotion(transition)`; re-exported at `motion/index.ts:1`. Grep across `src` shows **zero** consumers; every real component uses `useMotion().reducedMotion` + `<MotionConfig>` (`motion-provider.tsx:39`).
- **Why:** Two competing reduced-motion APIs ship publicly: (a) the wired `MotionProvider`/`MotionConfig`/`useMotion` path and (b) an orphan `withReducedMotion(t)` that only sets `duration: 0` — a near-no-op on a *spring* (springs are stiffness/damping driven). It invites consumers down a manual path the library itself abandoned. Fails "one vocabulary."
- **Fix:** Delete `withReducedMotion` (`@deprecated` + CHANGELOG since it's exported) and point at `MotionConfig`/`useMotion`; or make it spring-aware (`{ type: 'tween', duration: 0 }`) and actually use it. Prefer deletion.

### [P1][J] Doc/JSDoc drift on default presets + fade duration
- **Category:** docs
- **Evidence:**
  - `MotionScale` default is `snappy` (`primitives.tsx:65`) but story `TokenBadge` at `ui/motion.stories.tsx:680` labels it `springs.gentle`.
  - `MotionCollapse` default is `gentle` (`primitives.tsx:184`) but `ui/motion.stories.tsx:661` labels it `springs.snappy`.
  - `MotionSlide` default is `smooth` (`primitives.tsx:140`) but `ui/motion.stories.tsx:698` labels it `springs.gentle`.
  - `tweens.fade` = `durations.fast02` = **110ms** (`ui/lib/motion.ts:38`, comment says 110ms) but mdx table says `150ms` (`ui/motion.mdx:64`).
  - Story caption "All four spring presets" (`motion-primitives.stories.tsx:216`) while the grid renders **5** via `Object.keys(springs)`; `motion-showcase.stories.tsx:184` enumerates "(snappy, smooth, bouncy, gentle)" omitting `responsive`. Source has 5 (`motion.ts:21-32`).
- **Why:** Rubric J — preset/timing/count values in docs must match source (source wins). Readers copying a `TokenBadge` get the wrong preset; the mdx tables also omit the `responsive` spring and the `elegant`/`layout` tweens (`motion.ts:31,42-44`) entirely.
- **Fix:** Correct the three story preset labels, fix fade to 110ms, change "four"→"five" (or "every preset"), add `responsive`/`elegant`/`layout` rows to the mdx tables + a Helpers section for `stagger()`/`withReducedMotion()`/`motionProps()`.

### [P2][M2] Uniform enter/exit timing — no exit differentiation
- **Category:** motion
- **Evidence:** Every primitive uses one transition for both `animate` and `exit` (`primitives.tsx:81` Scale, `:117` Pop, `:163` Slide all pass a single `transition={{ ...spring, opacity: tweens.fade }}`).
- **Why:** M2 ("no enter/exit differentiation"). A spring-physics exit identical to the entrance feels heavy on dismissal; exits generally want to be faster/flatter. There's no way to snap the exit without hand-rolling `motion.div`.
- **Fix:** Give primitives a faster tween-based exit, or accept an optional `exitTransition`. Low-risk, high-polish.

### [P2][M5] `MotionCollapse` animates `height` (a layout prop) as its default
- **Category:** motion
- **Evidence:** `packages/core/src/motion/primitives.tsx:192-194` — `initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}`.
- **Why:** M5 flags animating `height`/`width`/`top`/`left`. Height-to-`auto` has no transform equivalent and FM special-cases it, so this is the *accepted* technique (comment at `:181` acknowledges it), but it's the one primitive that triggers layout per frame and can jank on large subtrees. `overflow:hidden` is correctly retained.
- **Fix:** Keep it, but document it as the deliberate layout-animation exception and note the perf caveat / `layout`-prop alternative where a measured height exists. Flagged for completeness, not a required change.

### [P2][J] No per-component doc + no llms/make-kit entry for the motion foundation
- **Category:** docs
- **Evidence:** Glob `packages/core/docs/**/motion*` → no files. Motion is a public export (`@devalok/shilp-sutra/motion`) with `springs`, `tweens`, `MotionProvider`, and 7 primitives, but has no markdown reference / prop table alongside the other components (only Storybook mdx + stories).
- **Why:** The finish bar requires tests + stories + **docs** matching source. Consumers/AI agents must reverse-engineer the primitive props (`preset`, `whileInView`, `viewportOnce`, `viewportMargin`, `direction`, `layout`, `layoutId`) from stories.
- **Fix:** Add `docs/components/motion.md` (or a foundations doc) with token tables, `MotionProvider` reduced-motion modes, and primitive prop tables, cross-checked against source.

### [P2][docs] mdx primitives import path may not be a declared subpath export
- **Category:** docs
- **Evidence:** `ui/motion.mdx:78,293` instruct `import … from '@devalok/shilp-sutra/motion/primitives'`. The barrel is `motion/primitives-index.ts`. Whether `./motion/primitives` is a declared entry in package.json `exports` was not verified in this pass — if not, the documented import fails (the 0.40 barrel cleanup tightened exports).
- **Why:** Docs must reference real published subpaths.
- **Fix:** Confirm `@devalok/shilp-sutra/motion/primitives` is in package.json `exports`; if the public path is `@devalok/shilp-sutra/motion`, update the mdx.

### [P3][M3] Generic primitives don't self-guard reduced-motion (provider-gated only)
- **Category:** motion / a11y
- **Evidence:** `packages/core/src/motion/primitives.tsx` — no primitive reads `useMotion()`/`useReducedMotion()`; all rely on an ancestor `<MotionConfig>` (from `MotionProvider`). `check-motion-provider.ts:12` ships a one-time dev `console.info` that tolerates the provider being absent. The mdx overstates this: "No action needed from consumers … `MotionProvider` handles it globally" (`ui/motion.mdx:249`) — only true *with* the provider.
- **Why:** Used without `MotionProvider` (an explicitly tolerated case), the primitives animate at full motion and ignore OS `prefers-reduced-motion` — reduced-motion is opt-in-by-provider, not fail-safe.
- **Fix:** Have each primitive read `useReducedMotion()` (FM's hook works standalone) and collapse `initial/animate/exit` to opacity/instant when set; or correct the mdx to state `MotionProvider` is required for the a11y guarantee.

### [P3][E4/E5] Showcase hero copy is marketing-flavored and contains a factual overclaim
- **Category:** verbal-tell
- **Evidence:** `packages/core/src/motion/motion-showcase.stories.tsx:371-374` — "Every animation in Shilp Sutra is now powered by Framer Motion … **Zero CSS keyframe animations remain** for interactive components."
- **Why:** "Zero CSS keyframe animations remain" is false — `tokens/animations.css` ships live `@keyframes` (skeleton-shimmer, progress-indeterminate, caret-blink, etc., and the sparkline in StatCard uses one). The blanket "Every animation is now powered by" reads as release-note marketing; Storybook autodocs is consumer-facing.
- **Fix:** "Spatial motion (position/scale) uses Framer Motion springs; opacity/color use tweens. Looping/keyframe effects (skeleton, progress, caret) stay in CSS." Drop "Every"/"Zero … remain".

### [P3][E1] Em-dash-as-connector in Storybook prose
- **Category:** verbal-tell
- **Evidence:** `motion-showcase.stories.tsx:199` "…for real exit animations — smooth scale + fade…"; `:371` "…powered by Framer Motion — physics-based springs…"; `motion-primitives.stories.tsx:92` "…bouncy spring preset — watch for the overshoot."
- **Why:** E1 flags `—` as a stylistic connector in prose. (Section *titles* like "Button Press — whileTap spring" are label separators and fine.) Low severity, story-only.
- **Fix:** Use periods / restructure the prose sentences; leave title separators.

### [P3][G2] `stagger()` helper is exported but unused (dead API, duplicates MotionStagger logic)
- **Category:** drift / composability
- **Evidence:** `packages/core/src/ui/lib/motion.ts:49` — `export function stagger(delay = 0.04)`; re-exported at `motion/index.ts:1`. `MotionStagger` re-implements the same variants inline (`primitives.tsx:224-229`) instead of calling it; no other consumer.
- **Why:** Another orphan public export duplicating logic the component already owns; grows the "one vocabulary" surface with something nothing uses.
- **Fix:** Have `MotionStagger` consume `stagger()` (dedupe to one definition), or drop it from the public surface. Prefer having the component use it.

## Composability gaps
- **Two redundant reduced-motion mechanisms** (F6): wired `MotionProvider`/`useMotion`/`MotionConfig` vs. the dead `withReducedMotion(t)`. Consolidate to one canonical path.
- **`stagger()` vs `MotionStagger` duplicate the same variants** — helper isn't the source of truth for the component (F5-flavored internal drift). Compose the helper.
- **`MotionCollapse` is missing `whileInView`/`viewportOnce`/`viewportMargin`** while Fade/Scale/Pop/Slide/Stagger all accept them (`primitives.tsx:184` omits them). Inconsistent primitive API — a collapse can't be viewport-triggered like siblings. Add for parity or document the reason.
- **No `asChild`/Slot on primitives** — they always render a wrapping `motion.div`. A consumer wanting to animate an existing element (`<section>`, a Card) must nest a div. Consider `asChild` (via `motion.create` + Slot) on Fade/Scale so they can polymorph the animated node (F2 — soft).
- **No mount-suppression control** except `MotionCollapse`'s `AnimatePresence initial={false}` (`:188`); others animate on first mount with no `animateOnMount` opt-out (common SSR/hydration need).
- Otherwise well-composed: `forwardRef` + `displayName` on all, `...rest` spread onto `motion.div`, `preset` enum prop, `cn` merge. No bespoke corner-props, no >8-prop flat explosion.

## Motion gaps
- **No enter/exit timing differentiation** (M2, P2): all primitives reuse one transition for both directions; exits should be faster/flatter.
- **`MotionCollapse` animates `height`** (M5, P2): unavoidable for auto-height but it's the flagged layout-prop pattern shipped as default — document the exception.
- **Reduced-motion is provider-gated, not fail-safe** (M3, P3): generic primitives animate fully if `MotionProvider` is absent; the mdx claims it's automatic. Have primitives read `useReducedMotion()` directly.
- **RTL:** `MotionSlide` horizontal offsets are hardcoded physical px (`primitives.tsx:143-146` `left:{x:16}`, `right:{x:-16}`) — not mirrored under RTL. Document as physical or derive sign from `dir`.
- **Bounce-by-default (M1) — essentially clean.** `MotionPop`'s overshoot (`springs.bouncy`, damping 15) is opt-in by choosing the Pop primitive (whose purpose is overshoot); Fade/Scale/Slide default to non-overshoot. `springs.bouncy` is not the global default. One nit: the mdx `MotionPop` example (`ui/motion.mdx:120-122`) pairs bouncy pop with a `Badge>New!<` — the AI-motion + pill combo to avoid in docs; swap the example.
- **Feedback motion present (M4) — clean.** Real enter+exit via `AnimatePresence` on every primitive.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the broken stories (P0):** in `ui/motion.stories.tsx` replace all `<Fade open=>` / `<MotionFade open=>` with `<MotionFade show=>`; change `direction="bottom"` → `"down"`. Re-run `run-story-tests` on `Foundations/Motion Overview`.
2. **Kill doc/source drift (P1/J):** correct the three wrong `TokenBadge` labels (Scale=snappy, Collapse=gentle, Slide=smooth), fix mdx fade to 110ms, "four"→"five" presets, add `responsive`/`elegant`/`layout` rows + Helpers section to the mdx.
3. **Kill the dead APIs (P1):** delete/`@deprecate` `withReducedMotion` (F6); dedupe `stagger()` into `MotionStagger` (G2).
4. **Mirror the ease tokens in JS (P1/G2):** add an `eases` const matching `--ease-*` and use it in `tweens`.
5. **Differentiate exits (P2/M2):** faster tween-based exit or an `exitTransition` prop.
6. **Make primitives reduced-motion fail-safe (P3/M3):** read `useReducedMotion()` and degrade even unwrapped; correct the mdx overstatement.
7. **Add `MotionCollapse` viewport props + `animateOnMount` + RTL-aware slide (P2/P3)** for API parity and correctness.
8. **Fix the showcase hero copy (P3/E):** drop "Zero CSS keyframes remain" / "Every … now powered by"; de-em-dash the prose.
9. **Write `docs/components/motion.md` (P2/J):** token tables, provider modes, primitive prop tables, matched to source. Verify the `/motion/primitives` subpath export before publishing the mdx import instructions.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** clean — no accent rails, no gradient text, no framework-palette brand colors, no emoji-as-icon, no glass/glow/blob, no rounded-everything, no pill spam. Story demo Boxes use semantic `bg-accent/success/warning/error` tokens, not raw Tailwind.
- **B. Visual reflexes (V9–V15):** clean — no hardcoded Inter/Geist, no decorative numbering as default (the stagger demo numbers a genuine sequence), no eyebrow kickers, no all-caps default.
- **C. Motion M1/M4:** clean — opt-in overshoot (not global default), real enter+exit feedback.
- **F1, F3, F4, F5:** clean — slot-free primitives compose via children + `...rest`; no >8-prop flat explosion; no re-rolled surface; `preset` is a proper enum.
- **G1 (surface), G4, G5:** N/A — motion-token/provider layer, no surfaces or CVA surface vocabulary to drift.
- **H (state coverage):** provider/primitives are non-interactive wrappers; story toggle buttons use real `<button>`, `role="radiogroup"/"radio"`, `aria-checked` (`motion-primitives.stories.tsx:113-129`); reduced-motion has a dedicated story.
- **I (types):** strong — `as const` token objects; exported `SpringPreset`/`TweenPreset`/`DurationPreset`; `forwardRef` typed to `HTMLDivElement`; no `any` in public signatures (`motionProps` deliberately returns `Record<string, unknown>` with documented rationale, `ui/lib/motion.ts:73-86`). SSR-safe (`// @server-safe` on `motion.ts:1`).
- **Tests:** springs/tweens/stagger/withReducedMotion covered; all primitives have render/show-false/ref/className tests; provider covers all reduced-motion modes incl. the no-provider default (`motion-provider.test.tsx:89`).
