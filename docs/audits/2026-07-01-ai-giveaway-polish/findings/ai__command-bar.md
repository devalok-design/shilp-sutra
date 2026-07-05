# ai/command-bar — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:6 P3:2

Source: `packages/core/src/ai/command-bar.tsx` (906 lines). Story: `command-bar.stories.tsx`. **No `*.test.tsx` and no per-component doc exist.** llms.txt covers it (import path + usage).

The single most conspicuous thing here is the `GradientBorderWrap` processing treatment: an animated multi-stop gradient border **plus** a blurred outer glow. It is brand-colored and gated behind `state="processing"`, so it's a *choice* not a raw framework-palette tell — but it (a) hardcodes the brand hexes instead of the existing brand-gradient tokens, (b) reaches for the exact glow+blur "AI is thinking" motif, and (c) the animation itself is partly non-functional per its own comment. That's the cluster that keeps this below the Card bar, alongside the fact that hero/inline re-roll the surface instead of composing `<Card>`, and there are zero tests.

## Findings

### [P1][G2] Processing gradient hardcodes brand hex instead of the brand-gradient tokens
- **Category:** drift
- **Evidence:** command-bar.tsx:81 — `background: 'linear-gradient(var(--gradient-angle, 0deg), #D33163, #9B5DE5, #C850C0, #D33163)'` (repeated at :101 for the glow)
- **Why:** `semantic.css:538` already defines `--gradient-brand-light: linear-gradient(135deg, var(--pink-7), var(--purple-9))` (and `-dark`), built from primitives that follow consumer brand swaps. The raw hex literals are duplicated in two places and will NOT re-color when a consumer overrides the accent/brand ramp — the rest of the component (`text-accent-9`, `border-accent-7`) does follow. Same three hexes live in `devadoot-icon.tsx` as `BRAND_PINK`/`BRAND_PURPLE`/`BRAND_MAGENTA` — three copies of the palette, no single source.
- **Fix:** Reference `var(--gradient-brand-light)` / `--gradient-brand-dark` (or a new `--gradient-brand-flow` token if the 4-stop loop is needed). If the animated angle needs raw stops, promote them to a token so the palette has one home.

### [P1][F5] hero + inline re-roll the surface instead of composing `<Card>`
- **Category:** composability
- **Evidence:** command-bar.tsx:757 — `'bg-surface-raised rounded-overlay-lg shadow-raised p-ds-07'` (hero container); inline (:805) rolls its own `w-full` wrapper; floating correctly composes `Dialog`/`DialogContentRaw`.
- **Why:** This is exactly the drift StatCard fixed by composing `<Card>` — surface/radius/elevation/padding are re-declared inline. `rounded-overlay-lg` on a raised panel also mixes overlay radius with a non-overlay surface (Card uses `rounded-surface`). Two of the three variants each re-roll the shell.
- **Fix:** Render the hero/inline shell as `<Card variant="elevated">` (or `flat` for inline) so surface, radius, elevation, and gap model live in one place. Keep floating on Dialog.

### [P1][H] No tests at all + no `aria-busy`/`aria-live` for the async states
- **Category:** state-coverage / a11y
- **Evidence:** no `command-bar.test.tsx` in `packages/core/src/ai/`. In source, processing sets only `readOnly={isProcessing}` (:544) and shows a spinner (:571); there is no `aria-busy` on the input/region and no `aria-live` region announcing idle→processing→responded.
- **Why:** A 906-line interactive component with controlled/uncontrolled open state, keyboard nav, and 4 async states ships with zero unit tests (publish gate per CLAUDE.md). A screen-reader user gets no announcement that a query is being processed or that a response arrived; the spinner is purely visual.
- **Fix:** Add `command-bar.test.tsx` (submit, filter, keyboard nav, floating open/close, disabled, reduced-motion). Add `aria-busy={isProcessing}` to the input row and an `aria-live="polite"` status node that announces "Processing…" / "Response ready".

### [P1][G3] Off-taxonomy `variant` and `state` axes
- **Category:** vocabulary
- **Evidence:** command-bar.tsx:149 — `variant?: 'hero' | 'inline' | 'floating'`; :138 — `state?: 'idle' | 'typing' | 'processing' | 'responded'`
- **Why:** Canonical `variant` = solid/soft/outline/ghost/link; here it encodes *layout*, which reads as a different concept sharing the same prop name across the library. `state` is a bespoke enum where `size`/`color` are the family axes. (This may be defensible as a domain component, but it's vocabulary drift and should be a deliberate, documented exception.)
- **Fix:** If layout must stay a prop, consider `layout`/`surface` naming to free `variant` for the canonical axis, or document the exception. At minimum drop the dead `'typing'` state (see below).

### [P1][F1] Bespoke content props for fixed regions; `hints` should be a slot
- **Category:** composability
- **Evidence:** command-bar.tsx:154–159 — `greeting`, `hints`, `agentName`, `agentIcon` inject content into fixed slots. `hints` renders a hardcoded button row (:772–789).
- **Why:** `greeting`/`hints` are content the consumer will want to style/replace (icons in hints, links, a "clear history" affordance). A string-array `hints` prop can't carry that. This is the `title`-prop-vs-slot pattern Card moved away from.
- **Fix:** Accept a `hints` render slot / children convention, or a `<CommandBarHints>` sub-component. Keep the string-array as a convenience overload.

### [P2][V6] Processing glow: blurred gradient halo behind the bar
- **Category:** visual-tell
- **Evidence:** command-bar.tsx:98–113 — `<motion.div className="absolute inset-0 -z-10" style={{ ...filter: 'blur(8px)' }} animate={{ opacity: [0.3,0.5,0.3], ... }}>`
- **Why:** A pulsing blurred colored glow behind the input is the archetypal "AI is thinking" glassmorphism/glow motif (V6). It's brand-colored and gated behind `processing`, so it's a choice — but it's the default processing rendering and layers glow on top of the already-animated border. Two infinite loops (border + glow) run for the whole processing window.
- **Fix:** Keep the moving brand border (that reads as intentional state feedback) but drop the blurred halo, or make the halo opt-in. One feedback signal, not two.

### [P2][M2] The gradient-angle animation is faked / partly dead per its own comment
- **Category:** motion
- **Evidence:** command-bar.tsx:84–95 — comment: "Using CSS custom property animation via backgroundPosition as proxy"; it animates `backgroundPosition` while the gradient uses `var(--gradient-angle, 0deg)` which is **never** animated or `@property`-registered, so the angle is always the `0deg` fallback. The real motion is `backgroundPosition` on a `300% 300%` bg.
- **Why:** The `--gradient-angle` machinery is inert misdirection — the effect works by accident via backgroundPosition, and the comment admits the intended technique isn't wired. Confusing to maintain; the "flowing around the border" intent isn't what actually runs.
- **Fix:** Either register `--gradient-angle` via `@property` and animate it (true conic flow), or delete the dead var and keep the backgroundPosition sweep with an honest comment.

### [P2][M2] Uniform infinite `ease: 'linear'` loops, no duration-scale token
- **Category:** motion
- **Evidence:** command-bar.tsx:89–95, 105–112 — `duration: 4` / `duration: 3`, `ease: 'linear'`, `repeat: Infinity`, raw seconds not `durations.*`.
- **Why:** Raw magic durations (3s, 4s, 8px blur) bypass the motion token scale (`durations`, `--duration-*`); linear infinite loops are the robotic-timing tell (M2). Everything else in the file uses `springs`/`tweens`.
- **Fix:** Pull loop durations from a named constant; keep them out of the reduced-motion path (already handled at :69).

### [P2][types] `agentIcon` is a dead prop; `'typing'` state is never used
- **Category:** types / state-coverage
- **Evidence:** command-bar.tsx:258 destructures `agentIcon` but it is rendered nowhere (grep: only the type decl at :159 + the destructure). `state: 'typing'` (:138) is declared but no branch reads it — only `processing`/`responded` are handled.
- **Why:** Exported API surface promises an agent icon and a typing state that do nothing. Consumers wire them up and see no effect; false affordance + dead code.
- **Fix:** Either render `agentIcon` (e.g. left of the search icon in hero) or remove it; remove `'typing'` from the union or give it behavior.

### [P2][types] `agentIcon?: React.ReactNode` is off the icon-API unification
- **Category:** types
- **Evidence:** command-bar.tsx:159 — `agentIcon?: React.ReactNode`
- **Why:** CLAUDE.md's 0.40.0 icon unification standardizes icon slots on `IconInput` (as StatCard/CardAction do). `ReactNode` is the widest type; this prop is inconsistent with the family (and, per the narrowing HARD RULE, tightening it later to `IconInput` would be breaking — better to align now while it's dead).
- **Fix:** Type as `IconInput` and route through `normalizeIcon` if/when it's rendered.

### [P2][J] No per-component doc; component has no test to gate on
- **Category:** docs
- **Evidence:** no `packages/core/docs/components/**/command-bar.md`; no `command-bar.test.tsx`.
- **Why:** llms.txt has an entry but there's no prop table doc and no test coverage — below the Card/StatCard bar (both have tests + full JSDoc prop docs).
- **Fix:** Add tests (see P1[H]); ensure the autodocs prop table is accurate once dead props are removed.

### [P3][V2] Focus treatment stacks `border-accent-7` + `shadow-ring`
- **Category:** visual-tell
- **Evidence:** command-bar.tsx:510 — `isFocused && !isProcessing && 'border-accent-7 shadow-ring'`
- **Why:** A tinted border AND a ring on focus is borderline double-edge, but both are legitimate focus affordances (ring is the a11y focus indicator, border is the color shift). Low risk; noting for consistency with Input's focus pattern.
- **Fix:** Confirm this matches the Input/TextField focus treatment; if Input uses ring-only, drop the border swap for parity.

### [P3][G2] Raw-value kbd heights
- **Category:** drift
- **Evidence:** command-bar.tsx:880, 888 — `h-[20px]` on the floating footer kbd chips (elsewhere `h-ico-md` is used, :867).
- **Why:** One-off arbitrary pixel height where an icon/spacing token would do; minor inconsistency (two kbd chips use `h-[20px]`, two use `h-ico-md`).
- **Fix:** Use a single sizing token for all footer kbd chips.

## Composability gaps
- hero and inline variants re-roll the surface (`bg-surface-raised rounded-overlay-lg shadow-raised p-ds-07`) instead of composing `<Card>` — the exact drift StatCard eliminated (F5). Only floating composes a base primitive (Dialog).
- `greeting` / `hints` / `agentName` / `agentIcon` are bespoke content props injecting into fixed regions; `hints` (string[]) can't carry rich content and should be a slot / sub-component (F1).
- `agentIcon` declared + destructured but never rendered — a promised slot that does nothing.
- `variant` prop name is spent on layout, blocking the canonical solid/soft/outline axis and diverging from the rest of the family (G3).
- No `asChild` on the hero/inline root; consumers embedding the bar as a `<form>` or `<section>` can't polymorph it (F2, minor for this component).

## Motion gaps
- The `--gradient-angle` conic-flow technique described in the comment is not actually wired (var never animated/`@property`-registered); the effect runs via `backgroundPosition` by accident. Dead motion machinery (M2).
- Two concurrent `repeat: Infinity` loops during processing (moving border + pulsing blurred glow) with raw `duration: 4`/`3` and `ease: 'linear'` — off the `durations`/`springs`/`tweens` token scale, robotic uniform timing (M2). The blurred halo is the V6 glow motif.
- Positive: reduced-motion IS respected throughout (`useMotion()`, `noInit`, `noMotionTransition`, and a static `bg-accent-9` fallback in `GradientBorderWrap`). This is the strongest part of the component.
- Command-result item entrance staggers (`delay: itemIndex * 0.03`) and group stagger (`groupIdx * 0.06`) are intentional and reduced-motion-guarded — clean.

## Polish plan (ordered steps to reach the finish bar)
1. Replace the two hardcoded gradient hex triplets with the `--gradient-brand-*` tokens (or one new `--gradient-brand-flow` token); delete the duplicate palette so it follows brand swaps. (P1 G2)
2. Compose `<Card>` for the hero/inline shell instead of re-rolling `bg-surface-raised rounded-overlay-lg shadow-raised`. (P1 F5)
3. Add `command-bar.test.tsx` covering submit, filter, keyboard nav, floating controlled/uncontrolled, disabled, reduced-motion; add `aria-busy` + an `aria-live` status region for the processing/responded transitions. (P1 H)
4. Remove the dead `agentIcon` (or render it) and the unused `'typing'` state; if kept, type icon slots as `IconInput`. (P2 types)
5. Simplify the processing feedback to one signal: keep the moving brand border, drop or gate the blurred glow halo; pull loop durations from named constants; fix or remove the inert `--gradient-angle` machinery. (P2 V6/M2)
6. Convert `hints` to a slot/sub-component; reconsider `variant` naming (`layout`?) so the canonical `variant` axis is free, or document the exception. (P1 F1/G3)
7. Add a per-component doc with an accurate prop table once dead props are gone. (P2 J)

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no colored left/top stripe.
- **V3 gradient text:** none — no `bg-clip-text text-transparent` on any heading/metric.
- **V4 framework palette:** the gradient hexes are the Devalok brand palette (pink→purple→magenta, explicitly "no blue"), not indigo/violet framework defaults. Not a V4 tell (it's a G2 token-drift issue instead).
- **V5 emoji icons:** none — all icons are Tabler via the Icon API.
- **V7 rounded-everything:** uses the radius vocabulary (`rounded-control`/`rounded-surface`/`rounded-overlay-lg`), no `rounded-3xl` sprawl.
- **V8 pill spam / V10–V15:** none.
- **E1–E8 verbal tells:** JSDoc and comments are direct and technical; no em-dash tic as connector, no AI vocabulary, no meta-hedging, no chatbot artifacts. Story greeting copy is fine.
- **M3 reduced-motion:** fully respected across every animation (strongest dimension).
- **G1 surface:** hero/inline use `bg-surface-raised` (correct for a panel), input row `bg-surface-overlay`, floating overlay via Dialog — surface levels are correct; stories place the bar on `bg-surface-1` pages.
- **F6 controlled/uncontrolled:** floating `open`/`defaultOpen`/`onOpenChange` correctly implements both modes with an `openRef` for the keybinding toggle — done right.
- **H keyboard nav:** ArrowUp/Down, Enter (select vs submit vs Cmd+Enter), Escape, last-query recall, active-descendant wiring, `role="combobox"`/`listbox`/`option` — thorough and correct.
