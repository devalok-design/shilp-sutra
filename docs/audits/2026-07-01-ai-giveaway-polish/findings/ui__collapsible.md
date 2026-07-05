# ui/collapsible — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

Collapsible is a thin, honest wrapper over the vendored Radix Collapsible primitive. It
inherits Radix's correct a11y (trigger is a real `<button>`, `aria-expanded`, keyboard nav,
controlled/uncontrolled both supported) and uses our tokens (`animate-collapsible-*`) rather
than re-rolling anything. There are **no visual AI tells** (no accent rail, no gradient text,
no framework-palette accent, no emoji, no rounded-everything). The gaps are all in the motion
layer: a Framer `motion.div` wrapper that does nothing, and a missing affordance/state story.

## Findings

### [P1][M-dead-wrapper] Framer `motion.div` animates opacity 1 → 1 (inert wrapper)
- **Category:** motion
- **Evidence:** collapsible.tsx:23-29 — `<motion.div initial={false} animate={{ opacity: 1 }} transition={tweens.fade}>`
- **Why:** `initial={false}` tells Framer to skip the initial keyframe and mount at the `animate` target, so the element starts at opacity 1 and "animates" to opacity 1 — a guaranteed no-op. It produces zero visible fade. Its only effect is pulling the `framer-motion` runtime into anything that imports Collapsible and adding a wrapping `<div>` that breaks the content's direct-child contract with the Radix `Content` (e.g. `space-y-*` on the consumer's content, first/last-child selectors). The real expand/collapse motion is the CSS `animate-collapsible-down/up` height keyframe on the parent — the Framer layer contributes nothing. (Accordion ships the identical dead wrapper at accordion.tsx:111-117, so this is a family-wide copy-paste tell, not a one-off.)
- **Fix:** Either (a) delete the `motion.div` entirely and render `{children}` directly inside `CollapsiblePrimitive.Content` — the height keyframe already carries the motion; or (b) make the fade real by gating it on open state: `initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }}` driven off `data-state`. Option (a) is cleaner and drops a `'use client'` framer dependency from a component that doesn't need one.

### [P1][M3] No reduced-motion guard on the Framer opacity tween
- **Category:** motion
- **Evidence:** collapsible.tsx:23-29 — `transition={tweens.fade}` with no `useReducedMotion()` / `MotionConfig` gate; lib/motion.ts:58 exports an unused `withReducedMotion` helper.
- **Why:** The CSS height keyframe IS covered by the global `@media (prefers-reduced-motion: reduce)` reset (semantic.css:675-684, which forces `animation-duration: 0.01ms`). But Framer's JS-driven `animate` runs on rAF, **outside** that CSS media query — it is not neutralized by the global reset. Today this is harmless only because the tween is the 1→1 no-op above; the moment anyone "fixes" the fade (the obvious next step) it becomes a real unguarded animation. Flagging now so the fix lands with the guard. Card/StatCard's motion is JS too and has the same exposure, but those at least have intentional visible motion; here it's latent.
- **Fix:** If keeping any Framer motion, wrap with `const reduce = useReducedMotion()` and `transition={reduce ? { duration: 0 } : tweens.fade}` (or use the existing `withReducedMotion`). If you take the delete-the-wrapper fix above, this finding dissolves.

### [P2][H/state-coverage] No disabled state shown or tested
- **Category:** state-coverage
- **Evidence:** collapsible.tsx:10-12 re-export Radix `Root`/`Trigger` (which accept `disabled`); collapsible.test.tsx covers open/closed/controlled/keyboard/axe but never `disabled`; collapsible.stories.tsx has only `Default` + `DefaultOpen`.
- **Why:** Radix supports `disabled` on the root (and the trigger inherits it), but nothing demonstrates that the trigger goes inert + non-focusable, and there's no visual story for it. The finish bar (Card/StatCard) demonstrates its state matrix in stories. Collapsible shows only the two happy-path states.
- **Fix:** Add a `Disabled` story (`<Collapsible disabled>`) and a test asserting the trigger is `disabled`/does not toggle. No source change needed — just coverage.

### [P2][M4/F-affordance] No chevron affordance and no example wiring one up
- **Category:** motion / composability
- **Evidence:** collapsible.tsx — `CollapsibleTrigger = CollapsiblePrimitive.Trigger` (bare passthrough); doc collapsible.md:32 explicitly says "No built-in chevron — add your own icon + rotate via `data-state`"; neither story shows the rotate-on-open pattern.
- **Why:** A bare trigger is a legitimate design choice for a primitive (documented, gated — not a tell), but the rotating-chevron is THE expected disclosure affordance and the doc tells consumers to hand-roll it from `data-state`. With no story/example, every consumer reinvents `group-data-[state=open]:rotate-180` and the `transition-transform duration-moderate-02` (which Accordion already bakes in at accordion.tsx:80). That's drift waiting to happen.
- **Fix:** Add a `WithChevron` story showing the canonical pattern (`<CollapsibleTrigger className="group">…<Icon icon={IconChevronDown} className="transition-transform duration-moderate-02 ease-productive-standard group-data-[state=open]:rotate-180" /></CollapsibleTrigger>`), matching Accordion's chevron motion so the family stays consistent. Optionally export a small `CollapsibleChevron` helper. Story-only is the minimum.

### [P2][M2] CSS height keyframe easing/duration not aligned to the motion-token scale
- **Category:** motion
- **Evidence:** animations.css:23-24 — `--animate-collapsible-down: collapsible-down 200ms ease-out;` (raw `200ms ease-out`, not a named `--duration-*` / our easing token).
- **Why:** The motion system defines a duration scale (`--duration-moderate-01b` = 200ms, `ease-productive-standard`) and the JS mirror in lib/motion.ts; the keyframe hardcodes `200ms ease-out` instead of referencing the scale. It happens to equal `moderate-01b` numerically, so it's cosmetic drift, not a visible bug — but it's the kind of un-tokenized value G2 flags. Accordion's keyframe shares the issue.
- **Fix:** Reference the duration token / easing var in the `@theme` entry so the scale stays single-source (`collapsible-down var(--duration-moderate-01b) var(--ease-productive-standard)` or equivalent). Low priority; bundle this with the Accordion keyframe.

### [P3][J/docs] Doc "Defaults: none" + missing CollapsibleProps note
- **Category:** docs
- **Evidence:** collapsible.md:17-18 "## Defaults / none"; the component exports `CollapsibleProps` (collapsible.tsx:34) but the doc props table omits it; doc lists no `CollapsibleContent`/`CollapsibleTrigger` props.
- **Why:** Minor parity gap. The prop table is accurate for the root but doesn't mention the exported `CollapsibleProps` type or that `CollapsibleContent` forwards `className`/ref. Not load-bearing.
- **Fix:** Note the `CollapsibleProps` export and that `CollapsibleContent` accepts `className` + ref. Cosmetic.

## Composability gaps
- **Strong overall** — composes the vendored Radix primitive (does NOT re-roll open/close state, F5 clean), supports both `open` (controlled) and `defaultOpen` (uncontrolled) with `onOpenChange` (F6 clean), and `asChild` works on the trigger (story uses `<CollapsibleTrigger asChild><Button>`). No bespoke corner-props (F1 clean), no flat-prop bloat (F3 clean).
- The inert `motion.div` wrapper (M-dead-wrapper) is a mild composability hazard: it inserts a `<div>` between `CollapsiblePrimitive.Content` and `children`, so consumer styles that assume `children` are direct children of the Content box (e.g. `space-y-*`, `:first-child`) land on the wrapper instead. Deleting the wrapper also removes this.
- No `CollapsibleChevron` / disclosure-icon helper — the affordance is left entirely to the consumer (see P2 above). A tiny composable helper would prevent per-consumer reinvention.

## Motion gaps
- **M-dead-wrapper (P1):** Framer `motion.div` animates opacity 1→1 — pure no-op that ships the framer runtime + an extra DOM node for zero visual payoff.
- **M3 (P1):** Framer tween has no reduced-motion guard; the global CSS reset only covers the CSS height keyframe, not JS-driven Framer motion. Latent until the fade is made real.
- **M4 (P2):** No chevron/disclosure feedback motion demonstrated; the canonical rotate pattern is offloaded to consumers via the doc.
- **M2 (P2):** Keyframe uses raw `200ms ease-out` instead of the duration/easing tokens.
- M1 clean (no bounce/elastic default — `ease-out`/`tweens.fade` are calm). M5 clean (CSS keyframe animates `height` — which is the one acceptable case here, since Radix injects the measured `--radix-collapsible-content-height` and there's no transform equivalent for auto-height disclosure; this is the standard Radix pattern, not the M5 anti-pattern).

## Polish plan (ordered steps to reach the finish bar)
1. **Delete the inert `motion.div`** (collapsible.tsx:23-29) and render `{children}` directly inside `CollapsiblePrimitive.Content`. This kills M-dead-wrapper, removes the stray wrapper div, and drops the latent M3 exposure. (Apply the same fix to Accordion's twin wrapper in the same pass.) If a real cross-fade is desired instead, gate it on `data-state` AND `useReducedMotion()`.
2. **Add a `WithChevron` story** demonstrating the `group` + `group-data-[state=open]:rotate-180` + `transition-transform duration-moderate-02 ease-productive-standard` pattern, matching Accordion's chevron motion. Optionally ship a `CollapsibleChevron` helper export.
3. **Add a `Disabled` story + test** asserting the trigger is inert and non-focusable.
4. **Tokenize the keyframe timing** in animations.css (`--duration-moderate-01b` + `ease-productive-standard`) so it tracks the scale; do Accordion at the same time.
5. **Tidy the doc** — note the `CollapsibleProps` export and `CollapsibleContent` className/ref forwarding; drop "Defaults: none" or replace with the real Radix defaults.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no double edge, no gradient text, no indigo/violet/slate-as-brand, no emoji icons, no rounded-2xl/3xl spam, no blob/glass/glow, no pill spam. The component renders no surface of its own — it's structural.
- **V9–V15 visual reflexes:** n/a / clean (no hardcoded font, no decorative numbering, no eyebrow kicker, no hero).
- **S1–S4 structural / E1–E8 verbal:** doc + stories are terse and direct; no em-dash tic as connector, no contrastive negation, no AI vocabulary, no meta-hedging, no over-structuring. (Doc uses bold lead-ins but they're load-bearing labels, not filler.)
- **F2 asChild:** present on the trigger (story relies on it).
- **F5 composes base primitive:** yes — wraps Radix, doesn't re-roll.
- **F6 controlled/uncontrolled:** both `open` and `defaultOpen` supported, `onOpenChange` fired; tests cover both.
- **G1 surface:** n/a — renders no card/panel surface (no surface-1 violation possible).
- **G2 tokens:** uses `animate-collapsible-*` and `cn`; only nit is the un-tokenized keyframe timing (P2 above).
- **G3 variant axes:** n/a — no CVA variants (a primitive wrapper, correctly).
- **H a11y baseline:** Radix gives a real `<button>` trigger, `aria-expanded`, Enter/Space keyboard activation, focus-visible from Radix; tests assert all of these + axe-clean when expanded. Touch target inherited from consumer's trigger element.
- **I types:** `forwardRef` + correct `ElementRef`/`ComponentPropsWithoutRef` typing on Content; `CollapsibleProps` exported; `displayName` set; no `any`, no `React.FC`, no stringly-typed enums.
- **J docs:** story exists (publish gate met), doc exists with accurate root prop table and changelog history.
