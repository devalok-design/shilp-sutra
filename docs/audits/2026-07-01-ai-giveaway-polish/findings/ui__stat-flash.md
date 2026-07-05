# ui/stat-flash — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:4 P3:2

StatFlash is a small, well-built decorative motion primitive. It honors reduced-motion, uses semantic tone tokens (no raw palette), real icons (no emoji), differentiated motion built from DS tokens, and is correctly `aria-hidden`. It is genuinely close to the bar. The findings below are polish/composability gaps, not AI tells — there are essentially no hard visual/verbal tells in this unit.

## Findings

### [P1][F5] Chip surface is re-rolled here AND duplicated verbatim in StatCard (drift risk)
- **Category:** composability / drift
- **Evidence:** stat-flash.tsx:126-130 — `'relative inline-flex items-center justify-center overflow-hidden rounded-control p-ds-02'` + `fill === 'solid' ? 'bg-accent-9 text-accent-fg' : 'bg-accent-3 text-accent-11'`; the identical chip recipe appears again in stat-card.tsx:321-326 (`'inline-flex items-center justify-center rounded-control p-ds-02'` + same `iconFill` solid/soft fork).
- **Why:** Two sources of truth for "the accent icon chip." StatCard's non-flash `accentStyle="icon"` branch hand-rolls the same surface instead of reusing StatFlash's chip, so a chip-style change (radius, padding, fill tokens) must be edited in two places — exactly the drift StatCard was supposed to kill by composing Card.
- **Fix:** Extract the chip shell (the wrapper `<span>` with `rounded-control p-ds-02` + soft/solid fill fork) into one shared element — e.g. an internal `IconChip`/`StatChip` that both StatFlash and StatCard's `accentStyle="icon"` branch render. StatFlash adds only the flash-overlay behavior on top.

### [P2][M2] `settle` and `fade` transitions are identical across speeds (partial uniform timing)
- **Category:** motion
- **Evidence:** stat-flash.tsx:59-63 — `fast` and `normal` both use `settle: springs.snappy, fade: tweens.fade`; only `slow` differs (`springs.gentle` / `tweens.elegant`). So `speed="fast"` vs `speed="normal"` change *only* `holdMs` (450 vs 650), not the settle/fade feel.
- **Why:** `fast`/`normal` are visually distinguished solely by hold duration; the entrance/settle motion is byte-identical. Borders on M2 (one timing reused where the scale implies three).
- **Fix:** Either give `fast` a snappier settle (e.g. shorter-duration spring) or document that speed only tunes hold time so the preset names set the right expectation.

### [P2][M4/H] No `flash` change re-triggers the flash; settle only re-runs on `holdMs`/reduced-motion change
- **Category:** motion / state-coverage
- **Evidence:** stat-flash.tsx:116-123 — effect deps are `[prefersReduced, hold]`; `setSettled(true)` is one-way and never reset. If a consumer changes `flash` (e.g. metric flips up→down on the same mounted chip), the new tone never flashes — it's already `settled`.
- **Why:** The state→identity animation only ever plays on mount. For a live-updating metric (the documented "live" use case) the flash silently won't replay on value change.
- **Fix:** Reset `settled` to `false` when `flash`/`resolved.tone` changes (add to deps and re-arm the timer), or document that StatFlash is mount-only and a consumer must remount (key change) to replay.

### [P2][H] Stories never exercise reduced-motion or the dark/forced-colors render
- **Category:** state-coverage
- **Evidence:** stat-flash.stories.tsx (whole file) — six stories cover presets/fill/speed/spec, but none demonstrate the `prefers-reduced-motion` path (settled-immediately, no flash) which is the component's main a11y guarantee, nor a forced-colors/dark check.
- **Why:** The reduced-motion branch (the documented accessibility behavior) and the high-contrast tone rendering are untested in stories — the matrix dims most likely to regress silently.
- **Fix:** Add a reduced-motion story (or a parameter/decorator note) and rely on the dark/forced-colors backstop; at minimum a story that asserts the settled identity is visible.

### [P2][H] Test suite doesn't assert the core behavior (flash → settle), only that nodes mount
- **Category:** state-coverage / docs
- **Evidence:** stat-flash.test.tsx:7-13 — asserts the chip wrapper + identity icon are "in the DOM (even mid-animation)" and fill classes; there is no test that the flash glyph appears then the identity settles, nor that reduced-motion skips the flash.
- **Why:** The component's entire reason to exist (transient tone glyph that resolves to identity, gated by reduced-motion) has no test coverage; a regression that broke the settle timer or the reduced-motion guard would pass.
- **Fix:** Add a fake-timer test: render, assert flash glyph present + settled false, advance `holdMs`, assert flash exits and identity is the only visible glyph. Add a reduced-motion test (mock `useReducedMotion → true`) asserting no flash overlay.

### [P3][F6] `flash` / `icon` are content props, not slots — borderline composability
- **Category:** composability
- **Evidence:** stat-flash.tsx:65-80 — `icon: IconInput` and `flash: FlashPreset | FlashSpec`. Both inject content into fixed regions via props.
- **Why:** Per F1 this *looks* like a prop-where-a-slot-belongs, but both regions are strictly single icons with motion choreography the component owns; a slot/`children` API would expose the internal AnimatePresence machinery. Treated as a deliberate primitive boundary, not a tell — flagged only for completeness.
- **Fix:** None recommended. Keep as props; the choreography is the value-add.

### [P3][I] `holdMs` accepts negative / non-finite numbers; no clamp
- **Category:** types
- **Evidence:** stat-flash.tsx:74,121 — `holdMs?: number` → `setTimeout(..., hold)`. A negative or `NaN` hold fires immediately / unpredictably.
- **Why:** Minor robustness gap; an out-of-range override degrades silently rather than clamping to a sane floor.
- **Fix:** `Math.max(0, holdMs ?? preset.holdMs)`. Low priority.

## Composability gaps
- The accent-icon chip surface is duplicated between StatFlash (stat-flash.tsx:126-130) and StatCard's `accentStyle="icon"` branch (stat-card.tsx:321-326) — no shared `IconChip` primitive. This is the one real composability/drift issue: StatCard composes `Card` for the outer shell but re-rolls the inner chip instead of composing StatFlash's shell. (F5)
- `flash`/`icon` are props not slots — acceptable for a choreography primitive (F6/F1 not a violation here).
- Component is a plain function, not `forwardRef`, and renders a `<span>` with no ref/`className`/`...rest` passthrough. Consumers can't attach a ref, add a class, or set `data-*`/`id` on the chip. For a primitive meant to be used "standalone too (list rows, badges, toasts)" per its own JSDoc, the lack of `className` + rest-prop forwarding is a real composability limit. (borderline P2 composability — folded into polish plan.)

## Motion gaps
- `fast` and `normal` speeds share identical settle+fade transitions; only hold duration differs (M2 borderline). (stat-flash.tsx:59-63)
- Flash plays on mount only; changing `flash` on a mounted chip does not replay the state→identity animation (M4 — missing feedback motion on update). (stat-flash.tsx:116-123)
- No motion gaps on the AI-tell axis: reduced-motion is respected (M3 clean), no bounce/overshoot default (settle is `snappy`/`gentle` springs, not `backOut`; M1 clean), animates only `opacity`/`scale` not layout props (M5 clean).

## Polish plan (ordered steps to reach the finish bar)
1. Extract a shared `IconChip` shell (wrapper span + `rounded-control p-ds-02` + soft/solid fill fork) used by both StatFlash and StatCard's `accentStyle="icon"` branch — kills the duplicated chip recipe (F5).
2. Add `forwardRef`, `className`, and `...rest` HTML-attribute passthrough to the chip `<span>` so the standalone use cases (list rows, badges) can style/identify it.
3. Re-arm the flash on `flash`/tone change (reset `settled`) or document mount-only + recommend a `key` remount for replay (M4).
4. Differentiate `fast` vs `normal` settle/fade, or document that speed tunes hold only (M2).
5. Add behavior tests: fake-timer flash→settle sequence + reduced-motion skips flash. Add a reduced-motion story.
6. Clamp `holdMs` to `>= 0` (I).

## Clean (rubric dims that pass)
- **V1 accent rail:** none — chip uses background fill, no colored stripe.
- **V2 double edge:** chip has background fill, no border+shadow combo.
- **V3 gradient text:** none — no `bg-clip-text`/transparent text anywhere.
- **V4 default framework palette:** clean — all colors are semantic tokens (`bg-success-9`, `text-accent-11`, `bg-accent-3`, `text-*-fg`), verified against tokens/semantic.css. No `indigo/violet/slate`.
- **V5 emoji icons:** clean — real Tabler icons (`IconArrowUp`, `IconCheck`, etc.) via the Icon API; no emoji in source/story/doc.
- **V6 blob/glass/glow / V7 rounded-everything / V8 pill spam:** clean — single `rounded-control` radius, no blur/glow, no badges.
- **V9 safe-face font / V10–V15:** n/a — no typography/hero/imagery in this primitive.
- **M1 bounce-by-default:** clean — settle uses `springs.snappy`/`gentle`, no overshoot easing.
- **M3 reduced-motion:** clean — `useReducedMotion()` short-circuits to settled identity, `initial={false}`. (stat-flash.tsx:103,116-123,135)
- **M5 layout-prop animation:** clean — animates `opacity`/`scale` only.
- **E1–E8 verbal tells:** clean — JSDoc and doc copy are direct and prescriptive; no em-dash tic abuse (em-dashes used are in prose, not as the stylistic connector pattern flagged), no AI-vocabulary, no hedging.
- **G1 surface drift:** n/a — it's a control-sized chip, not a card/panel; surface-1 rule doesn't apply.
- **G2 re-rolled tokens:** clean — uses `--spacing-ds-*`, `rounded-control`, semantic colors; no raw px/hex, no dead TW4 utilities.
- **G3 variant-axis drift:** tone axis is `success/error/warning/info/accent` (canonical color set); `fill` is `soft/solid`; `speed` is a deliberate motion preset, not a size axis. Acceptable.
- **H aria-hidden:** correct — chip is decorative (`aria-hidden="true"`), metric text carries meaning, documented.
- **J docs parity:** llms-full.txt props/defaults match the CVA-free source exactly (fill default soft, speed default normal, holdMs/settleTransition/flashTransition overrides). Accurate.
