# ui/textarea — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

## Findings

### [P1][M4] `motion.textarea` with zero motion — pointless motion wrapper
- **Category:** motion
- **Evidence:** textarea.tsx:80 — `<motion.textarea ... {...motionProps(props)} />` ; no `initial`/`animate`/`whileFocus`/`whileHover`/`whileTap`/`transition` anywhere in the component.
- **Why:** It renders a Framer Motion element but defines no animation — all cost (extra runtime, the `motionProps()` type-cast that erases prop types to `Record<string, unknown>`, framer dependency in a leaf input), no behavior. The hover/focus feedback is done entirely in CSS (`hover:bg-*`, `focus-visible:ring-*`). Either it should carry intentional feedback motion (e.g. `whileFocus` ring grow consistent with the motion system) or it should be a plain `<textarea>`. Input.tsx — the sibling it explicitly mirrors — uses a plain DOM `<input>`, so this is also drift from its own family.
- **Fix:** Drop `motion.textarea` → plain `<textarea>` and drop `motionProps`/`framer-motion` import (matches Input). If feedback motion is wanted, add a deliberate `whileFocus`/`transition` from `springs`/`tweens` instead of an inert wrapper.

### [P1][G4] Surface vocabulary drift from Input on focus border
- **Category:** drift / vocabulary
- **Evidence:** textarea.tsx:20 `focus-visible:border-accent-7` vs input.tsx:19 `focus-within:border-surface-border`. Also the no-state focus ring is `ring-accent-9` in both, but the bordered edge resolves differently between the two siblings.
- **Why:** Textarea and Input share `InputState` and are documented as the same family ("same pattern as Input"), yet their focus edge treatment diverges — Textarea tints the border accent on focus, Input keeps a neutral border under the accent ring. A form mixing both shows inconsistent focus chrome.
- **Fix:** Pick one focus-edge convention for the input family and apply to both (recommend Input's `border-surface-border` + accent ring, so the ring alone carries focus accent).

### [P2][G2] Hardcoded `min-h-[NNpx]` arbitrary values instead of spacing/size tokens
- **Category:** drift
- **Evidence:** textarea.tsx:27-30 — `min-h-[48px]`, `min-h-[60px]`, `min-h-[80px]`, `min-h-[120px]`.
- **Why:** Raw px arbitrary values rather than the `--spacing-ds-*` / size tokens the design system mandates (Input uses `h-ds-xs-plus`/`h-ds-sm`/`h-ds-md`/`h-ds-lg`). These four magic numbers can drift from the size scale and aren't theme-able.
- **Fix:** Map to spacing tokens (`min-h-ds-*`) or add textarea-specific min-height tokens, mirroring how Input expresses heights via `h-ds-*`.

### [P2][H] `xs` size below 44px touch target + undocumented in JSDoc
- **Category:** state-coverage / a11y / docs
- **Evidence:** textarea.tsx:27 `xs: 'min-h-[48px] ...'` is the smallest (48px min — OK), but the JSDoc at textarea.tsx:41 lists only `sm | md | lg`: `**Sizes:** \`sm\` (min 60px) | \`md\` (min 80px, default) | \`lg\` (min 120px)`. The CVA ships an `xs` variant the docstring never mentions.
- **Why:** Prop-surface drift inside the component's own JSDoc — `xs` is a real shipped size (tests cover all four: textarea.test.tsx:9 `sizes: ['xs','sm','md','lg']`) but the authored doc omits it. JSDoc is what tooltips/llms surface. (48px min-height itself meets the 44px target, so a11y is fine there.)
- **Fix:** Add `xs` (min 48px) to the JSDoc Sizes line.

### [P2][H] No focus-visible / reduced-motion / forced-colors / RTL coverage in stories or tests
- **Category:** state-coverage
- **Evidence:** Stories cover default/value/error/warning/success/disabled/readonly/label (textarea.stories.tsx:22-104). Tests cover render/change/disabled/rows/3 states/readonly (textarea.test.tsx). Neither demonstrates focus-visible ring, required, forced-colors, or dark. `AllStates` story (textarea.stories.tsx:83) omits the focus and required states.
- **Why:** The finish bar (rubric H) wants the applicable state matrix demonstrated. Focus ring and required are part of an input's contract and are not shown. (Card/StatCard bar shows their states.)
- **Fix:** Add a focus-visible + required + dark coverage story; assert the focus ring class and `aria-required` wiring in a test.

### [P2][F6] Resize is `resize-y` by default with no documented escape via prop
- **Category:** composability
- **Evidence:** textarea.tsx:13 `'flex w-full font-sans resize-y'`; the only way to disable is `className="resize-none"` (documented in llms-full.txt:4502, but not in the source JSDoc).
- **Why:** Minor — forcing `resize-y` and only offering `className` override is acceptable, but a `resize?: 'none'|'vertical'|'horizontal'|'both'` prop (or noting the override in JSDoc) would be cleaner. Not a strong gap.
- **Fix:** Document the `resize-none` override in the source JSDoc, or expose a `resize` prop. Low priority.

### [P3][E1] Em-dash stylistic connectors in JSDoc
- **Category:** verbal-tell
- **Evidence:** textarea.tsx:38 "...validation state coloring, sharing the same `InputState` type as `<Input>`." and textarea.tsx:42 `\`sm\` (min 60px) | \`md\` (min 80px, default) | \`lg\` (min 120px) — all are vertically resizable.` — em dash used as a stylistic connector.
- **Why:** E1 flags `—` as a stylistic connector (the AI em-dash tic). Present in author-facing JSDoc. Low impact — consistent with house docstring style across the library, so borderline a choice.
- **Fix:** Replace stylistic `—` with a period/colon if enforcing E1 corpus-wide. Defer unless doing a sweep.

### [P3][E5] Boilerplate closing line in JSDoc
- **Category:** verbal-tell
- **Evidence:** textarea.tsx:63 `// These are just a few ways — feel free to combine props creatively!`
- **Why:** Engagement-bait closer (E5) — the same canned sentence appears in Card.tsx:110 and StatCard.tsx:63, so it is a deliberate house pattern, not a one-off tell. Flagging for the corpus sweep, not as a unit defect.
- **Fix:** If the audit decides to strip it, strip it library-wide (it's in the exemplars too); otherwise leave as-is.

## Composability gaps
- `motion.textarea` does not compose the base DOM primitive the way Input does (Input renders plain `<input>`); the motion wrapper adds nothing and erases prop types via `motionProps`. (F5-adjacent — re-rolling a motion element with no payoff.)
- No `asChild`/Slot — acceptable for a native form control (consumers rarely polymorph a `<textarea>`); not flagged.
- Controlled/uncontrolled: fine — passes `value`/`defaultValue`/`onChange` straight through to the native element (F6 satisfied for the input semantics).
- No auto-resize / character-count slot, but that scope belongs to MessageInput/RichChatInput per llms-full.txt:1420; correct to keep Textarea minimal. Not a gap.

## Motion gaps
- M4 — inert `motion.textarea` with no animation props; either give it intentional `whileFocus` feedback or make it a plain element (primary motion finding).
- M3 — no `prefers-reduced-motion` handling, but since there is currently no JS motion, this is moot until/unless feedback motion is added. If motion is added, gate it (the repo has `withReducedMotion` in lib/motion.ts:58).
- Hover/focus feedback exists via CSS transitions (`transition-colors duration-fast-01`) — that part is fine and token-bound.

## Polish plan (ordered steps to reach the finish bar)
1. Replace `motion.textarea` with a plain `<textarea>`, remove `framer-motion` + `motionProps` imports (mirror Input.tsx). This restores prop types and matches the family. (Resolves M4, the F5-adjacent gap, half of G4.)
2. Reconcile focus-edge treatment with Input — use `border-surface-border` + accent ring on focus for both, so the family reads consistently (G4).
3. Swap `min-h-[NNpx]` arbitrary values for `min-h-ds-*` spacing tokens (or add textarea min-height tokens), matching how Input expresses heights (G2).
4. Add `xs` to the JSDoc Sizes line (docs parity, H).
5. Add focus-visible + required + dark stories and a focus-ring/aria-required test to complete the state matrix (H).
6. (Optional) Expose a `resize` prop or document the `resize-none` override in the source JSDoc (F6).

## Clean (rubric dims that pass)
- V1–V8 visual hard-tells: none. No accent rail, no gradient text, no emoji icons, no glass/glow, single `rounded-control` radius, no pill spam.
- V2 double-edge: clean — uses `border` only, no shadow on the control (edge model, correct for an input).
- V4 palette: uses semantic tokens (`accent-9`, `error-7`, `surface-*`) — no raw Tailwind indigo/violet/slate.
- G1 surface: `bg-surface-raised-hover` / `read-only:bg-surface-raised` — correct, an input control belongs on surface-1-family chrome per the layering rule; not a card.
- G3 variant-axis: `size` uses canonical `xs/sm/md/lg`; `state` (default/error/warning/success) matches the shared `InputState` taxonomy. No `filled`/`primary`/`small`.
- H a11y wiring: `aria-invalid` on error (textarea.tsx:81), `aria-describedby` + `aria-required` merged from FormField context (textarea.tsx:76-77), `focus-visible:ring-2` ring, `disabled`/`read-only` handled. Native `<textarea>` = real keyboard/focus semantics.
- I types: clean `forwardRef<HTMLTextAreaElement, TextareaProps>`, `displayName` set, `state?: InputState` (not stringly-typed), omits native `size` correctly. No `any` in the public surface (the `motionProps` `Record<string,unknown>` is internal).
- J docs parity (llms-full.txt): size/state names + `md` default match the CVA source. (Only the in-source JSDoc omits `xs` — flagged above.)
- Tests on `describeConformance` with all four sizes (textarea.test.tsx:8-10).
