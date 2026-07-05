# ui/tooltip — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

Tooltip is a thin, well-behaved wrapper over the vendored Radix Tooltip primitive. It composes the
primitive (does not re-roll positioning/portal), uses semantic tokens throughout (`bg-surface-inverted`,
`rounded-overlay-sm`, `shadow-floating`, `z-tooltip`, `px-ds-04`), and threads a proper
controlled/uncontrolled `open` shim. No visual AI tells (no accent rail, gradient, blob, glass, emoji,
default-palette color). The gaps are motion/state-coverage and a stale doc claim — not slop.

## Findings

### [P1][M3] No reduced-motion guard on the entrance/exit transform
- **Category:** motion
- **Evidence:** tooltip.tsx:102-106 — `initial={{ opacity: 0, scale: 0.95, ...slideInit }} ... transition={{ ...springs.snappy, opacity: tweens.fade }}` with no `useReducedMotion()` call anywhere in the file.
- **Why:** The scale + slide animate unconditionally unless an ancestor `MotionConfig reducedMotion="user"` exists (our `MotionProvider`), which is optional and not guaranteed in consumer apps. Sibling overlays guard themselves — `sheet.tsx:204` calls `useReducedMotion()` directly as a belt-and-suspenders. Tooltip does not, so on a vibe-coded consumer app with no MotionProvider, a reduced-motion user still gets the scale-pop.
- **Fix:** `const reduce = useReducedMotion()`; gate the transform: `initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, ...slideInit }}` (and matching `exit`), or collapse spring → `tweens.fade` only when `reduce`. Matches the sheet pattern.

### [P1][J] Doc claims a `<TooltipArrow>` export that does not exist
- **Category:** docs
- **Evidence:** docs/components/ui/tooltip.md:28 — "TooltipContent accepts `side`, `align`, `sideOffset`, and arrow via `<TooltipArrow>` (optional)." Source exports only `{ Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }` (tooltip.tsx:124). No `TooltipArrow` is defined or re-exported.
- **Why:** A consumer (or an AI agent reading the doc) will import a non-existent symbol and hit a build error. Docs must match source; source wins.
- **Fix:** Either drop the `<TooltipArrow>` clause from the doc, or add a `TooltipArrow = TooltipPrimitive.Arrow` re-export wired to the inverted surface fill. (Radix exposes `Tooltip.Arrow`; if we want it, export it and style its `fill`.)

### [P2][M4] No hover/focus feedback on TooltipContent itself; trigger has none added
- **Category:** motion / state-coverage
- **Evidence:** tooltip.tsx:72 — `const TooltipTrigger = TooltipPrimitive.Trigger` (bare passthrough). Content has only enter/exit, no `whileHover`/press — correct for an inert label, but there is no documented focus-visible story.
- **Why:** This is mostly fine (tooltip content is inert by contract). The gap is demonstration: no story/test exercises the keyboard-focus open path (focus the trigger → tooltip shows), only `hover` (stories.tsx:35) and forced `open`. Focus-triggered display is the a11y-critical path and is unproven.
- **Fix:** Add a story `play` step using `userEvent.tab()` to focus the trigger and assert the tooltip appears, mirroring the hover story.

### [P2][H] State matrix under-covered in stories/tests
- **Category:** state-coverage
- **Evidence:** stories.tsx has Default/Top/Right/Bottom/Left/CustomContent/AllSides — all light-mode, all hover/static. No dark-mode story, no forced-colors story, no reduced-motion story, no controlled-`open` story, no `defaultOpen` story.
- **Why:** Rubric H wants the applicable matrix demonstrated. Tooltip's surface is `bg-surface-inverted` (dark in light mode, light in dark mode) — the v0.22.0 changelog records a dark-mode text-invisibility bug (`text-accent-fg` collision) that a dark story would have caught. forced-colors mode on a portaled `shadow-floating` overlay is unverified.
- **Fix:** Add a dark-mode decorator story and a forced-colors note; add a controlled-`open`/`onOpenChange` story to demonstrate the shim that lives in `Tooltip` (tooltip.tsx:48-58) but is otherwise undocumented and only hit by one test.

### [P2][F6] Controlled/uncontrolled shim is real but undocumented and lightly tested
- **Category:** composability / docs
- **Evidence:** tooltip.tsx:48-58 — full `open`/`defaultOpen`/`onOpenChange` controlled shim with `internalOpen` mirror; doc (tooltip.md:24) mentions these props pass through to "Radix Tooltip" but does not state that our wrapper re-implements the controlled logic (to feed `AnimatePresence` via `TooltipContext`).
- **Why:** The shim exists only because `AnimatePresence` needs to read `open` to drive exit (tooltip.tsx:60, 87, 92). It works, but `defaultOpen` is never exercised by a test (only `open` controlled at line 34 and uncontrolled-closed). A regression in the mirror logic would ship silently.
- **Fix:** Add a `defaultOpen` test asserting initial-visible-then-dismissable, and a one-line doc note that the wrapper threads `open` to the animation layer (so consumers know `onOpenChange` fires on both controlled and uncontrolled transitions).

### [P3][types] `TooltipProvider` typed as `React.FC`; `sideOffset` map is loosely keyed
- **Category:** types
- **Evidence:** tooltip.tsx:14 `const TooltipProvider: React.FC<...>` and tooltip.tsx:42 `const Tooltip: React.FC<...>` — `React.FC` is discouraged per rubric I. tooltip.tsx:76 `const sideOffset: Record<string, {...}>` is keyed by `string` rather than the `'top'|'bottom'|'left'|'right'` union, so a typo `side` silently yields `{}` via the `?? {}` fallback (line 88).
- **Why:** `React.FC` is a flagged reflex (implicit children, no generic). The stringly-typed map weakens the side-offset guarantee.
- **Fix:** Drop `React.FC` in favor of an explicit `({ ... }: Props) =>` signature; key the offset map as `Record<'top'|'bottom'|'left'|'right', {x?:number;y?:number}>`.

## Composability gaps
- **TooltipArrow not exported.** The vendored primitive has an `Arrow` part; the doc advertises it; we neither expose nor style it. Either ship it (styled to `bg-surface-inverted`) or stop claiming it. (also logged as J above.)
- **No `SimpleTooltip` cross-link in this unit's doc.** `composed/simple-tooltip` is the 90%-case wrapper (llms-full.txt:6479+), but ui/tooltip.md never points to it; consumers hand-compose Provider+Root+Trigger+Content when one component would do. Minor — composed layer, not this file's bug.
- Otherwise composability is good: `asChild` is available on the trigger (it's the Radix Trigger), content uses `asChild` to fuse the `motion.div` with the primitive (tooltip.tsx:100), and the auto-provider (tooltip.tsx:25-35) removes the classic "tooltip silently doesn't render" footgun without forcing a bespoke prop.

## Motion gaps
- **M3 (P1):** no `prefers-reduced-motion` guard — relies on an optional ancestor `MotionConfig`. Sheet self-guards; tooltip should too.
- **M1: clean.** `springs.snappy` (stiffness 500 / damping 30 / mass 0.5) is near-critically damped — a quick settle, not a bounce/overshoot tell. Appropriate for a micro-overlay.
- **M2: clean.** Enter and exit are differentiated by `AnimatePresence` (exit uses the same spring + `tweens.fade` on opacity), not one uniform robotic duration.
- **M5: clean.** Animates `opacity`, `scale`, `x`, `y` (transform/opacity) — never layout props.
- **M4: borderline.** No hover/press feedback on content, but that is correct for an inert label; the only real gap is that the focus-open path is undemonstrated (see H/M4 finding).

## Polish plan (ordered steps to reach the finish bar)
1. Add `useReducedMotion()` and gate the transform (scale/slide) to opacity-only when reduced — close M3. (P1)
2. Resolve the `TooltipArrow` discrepancy: either export+style `TooltipPrimitive.Arrow` or remove the doc clause — close J. (P1)
3. Tighten types: drop `React.FC` on `Tooltip`/`TooltipProvider`; key the `sideOffset` map to the side union. (P3)
4. Stories/tests: add focus-open `play` step, `defaultOpen` test, dark-mode story, controlled-`open` story — close H + the F6 test gap. (P2)
5. Doc: note the wrapper threads `open` to the animation layer; cross-link `SimpleTooltip` for the common case. (P2)

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no border+shadow double-edge (uses `shadow-floating` only, no border — V2 clean), no gradient text, no indigo/violet/slate-as-brand, no emoji, no blob/glass/glow, single radius vocab (`rounded-overlay-sm` per the radius table), no pill spam.
- **V9–V15 reflexes:** none in source/stories. Type via tokens (`text-ds-sm`), no hardcoded font, no decorative numbering/kicker/hero/all-caps/AI imagery. The CustomContent story uses `bg-accent-9` for an avatar chip — a legitimate avatar fallback fill, not a brand-color tell.
- **G1 surface:** `bg-surface-inverted` is the correct level for a transient overlay label (not a card-on-page); not a surface-1 violation.
- **G2 tokens:** all spacing/radius/shadow/z via DS tokens; no raw px/hex, no dead-TW4 patterns (`bg-gradient-to-*`, `w-[--var]`, bare `shadow`).
- **G3 variant axes:** N/A — tooltip exposes no custom CVA variant axes; it forwards Radix positioning props. Nothing off-taxonomy.
- **F1/F2/F4/F5:** composes the base primitive, exposes `asChild` on trigger, no bespoke corner-prop, no compound/slot mixing.
- **E1–E8 verbal:** doc + JSDoc are direct and free of AI vocabulary, em-dash tics are used as normal punctuation (not as contrastive-negation connectors), no hedging/openers/tricolon padding.
- **a11y baseline:** axe-clean test present (tooltip.test.tsx:99); `role="tooltip"` verified; inert-content contract documented (tooltip.md:34).
