# ai/ai-command-provider — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:1 P3:2

Context: this is a **headless context provider** — a `React.createContext` + `useAICommand()` hook + `<AICommandProvider>` wrapper. It renders no DOM, has no styling, no motion, no variants. Consequently the entire visual-tell surface (V1–V15), motion (M1–M5), structural (S1–S4), and most drift/vocabulary/state dims are **N/A** — you cannot ship a purple gradient in a `Provider`. The only live rubric dimensions are Types/API (I), Composability of the context contract (F6), and Docs parity (J). It is close to the finish bar for what it is; the findings are narrow and real.

## Findings

### [P1][I] `any` in exported public type params (`ComponentType<BlockComponentProps<any>>`)
- **Category:** types
- **Evidence:** ai-command-provider.tsx:9 — `customBlocks: Record<string, React.ComponentType<BlockComponentProps<any>>>`; repeated at :22 (`AICommandProviderProps.customBlocks`) and :27 (`EMPTY_BLOCKS`).
- **Why:** `any` in an *exported* prop/context surface (`AICommandContext`, `AICommandProviderProps` are both exported from index.ts) defeats type safety for consumers registering custom blocks — the rubric flags `any` in exported props (section I). `BlockComponentProps<T = Record<string, unknown>>` already has a safe default, so the `<any>` is a reflex, not a necessity.
- **Fix:** Use the type's own default: `Record<string, React.ComponentType<BlockComponentProps>>` (i.e. drop `<any>`, let it fall back to `Record<string, unknown>`). If a heterogeneous registry genuinely needs erasure, use `BlockComponentProps<Record<string, unknown>>` or `BlockComponentProps<never>` explicitly rather than `any`, and add a comment saying why. Same edit in all three spots.

### [P2][F6] `onAction` callback naming for non-input action semantics
- **Category:** composability
- **Evidence:** ai-command-provider.tsx:10 & :23 — `onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void`
- **Why:** Borderline. The canonical taxonomy (G3/F6) prefers `onValueChange`-style names for state and reserves `onX` for genuine DOM-ish events. `onAction` is defensible here (it *is* an action dispatch, not a value change), and it matches `BlockComponentProps.onAction` in types.ts:43, so it is at least internally consistent — that consistency is why this is P2 not P1. The nit: the shape `(actionId, type)` is stringly-typed on `actionId` (unavoidable — it's consumer-defined) but the `type` union is fine. No change strictly required; flag only if a family-wide callback-naming sweep happens.
- **Fix:** Leave as-is unless standardizing AI-layer callbacks. If touched, keep it identical to `BlockComponentProps.onAction` so the provider/block contract stays a single vocabulary.

### [P3][J] No `*.stories.tsx` and no per-component doc
- **Category:** docs
- **Evidence:** No `ai-command-provider.stories.tsx` (Glob empty); no `packages/core/docs/components/**/ai-command-provider.md`. A test exists at `__tests__/ai-command-provider.test.tsx` (2 cases: provides context, returns null without provider).
- **Why:** J flags "missing story for a public component (publish gate)." `AICommandProvider` + `useAICommand` ARE public (exported from `ai/index.ts:4-5`). Mitigating: a headless provider has nothing visual to render in Storybook, so the publish-gate spirit (visual/Chromatic backstop) is largely moot — the test already covers its whole behavior. This is why it's P3, not P1. It is still documented in `llms.txt` / `llms-quick.txt` (grep hits), so consumers can discover it.
- **Fix:** Either (a) add a minimal MDX/doc-only story showing the wiring pattern (`<AICommandProvider agent customBlocks onAction>` around a `BlockRenderer`), or (b) explicitly exempt headless providers from the story gate in `pre-publish-audit.mjs` with a comment, so the gate's intent stays honest.

### [P3][types] `useMemo` deps include a fresh-object fallback via `?? EMPTY_BLOCKS`
- **Category:** types
- **Evidence:** ai-command-provider.tsx:30-35 — `const blocks = customBlocks ?? EMPTY_BLOCKS` then `useMemo(..., [blocks, onAction, agent])`
- **Why:** Not a tell; a correctness nicety. `EMPTY_BLOCKS` is hoisted to a module constant (:27) precisely so the `?? ` fallback is referentially stable across renders — good. But `agent` (`{ name, icon }`) and `onAction` are consumer-passed; if a consumer inlines `agent={{ name: 'X' }}` the memo busts every render. That is the consumer's problem, not a component default, so it is not a flag against this unit — noted only so a reviewer doesn't "fix" the already-correct `EMPTY_BLOCKS` pattern. The lone blank line at :33 (empty eslint-disable-ish gap) is cosmetic.
- **Fix:** None required. Optionally document in JSDoc that consumers should memoize `agent`/`customBlocks` if they re-render hot.

## Composability gaps
- None structural. A provider correctly exposes its contract via `children` (F1/F4 satisfied — content flows through `children`, not bespoke corner props) and a `useAICommand()` reader hook. `asChild` (F2) is N/A — it renders no DOM element, only a context boundary.
- F6 (controlled/uncontrolled): N/A — a provider holds no internal state; it's purely a value pass-through with `useMemo`. There is no value/defaultValue axis to get wrong.
- One real contract nit (already in findings): the public generic uses `any` instead of the safer default type param — a *type-level* composability weakness for consumers extending the block registry.

## Motion gaps
- None. Headless — no animation surface. M1–M5 are all N/A (no entrance/exit, no hover/press, no layout animation, nothing to guard for reduced-motion).

## Polish plan (ordered steps to reach the finish bar)
1. Replace the three `BlockComponentProps<any>` with `BlockComponentProps` (or an explicit `Record<string, unknown>`/`never`) — removes the only genuine type tell. (I)
2. Decide the story-gate question: add a doc-only wiring story OR add a documented headless-provider exemption in `pre-publish-audit.mjs`. (J)
3. Optional: one JSDoc line on `AICommandProvider` noting `agent`/`customBlocks` should be memoized by hot consumers. (P3)
4. Leave `onAction` naming alone unless an AI-layer callback-vocabulary sweep runs; if it does, keep provider and `BlockComponentProps` in lockstep.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** N/A / clean — no DOM, no color, no border, no radius, no gradient, no emoji, no pills. Nothing to converge.
- **B. Visual reflexes (V9–V15):** N/A — no fonts, no numbering, no cards, no kickers, no hero, no imagery.
- **C. Motion (M1–M5):** N/A — headless.
- **D. Structural (S1–S4):** N/A — not a page/doc surface.
- **E. Verbal (E1–E8):** clean — JSDoc is minimal and factual; no em-dash tics, no AI vocabulary, no hedging, no placeholders. (The file has almost no prose.)
- **F. Composability (F1–F5):** clean — `children`-based, no bespoke slots, no base-primitive to re-roll (it's not a surface).
- **G. Drift/vocabulary (G1–G5):** N/A — no surface, no tokens, no variant axes, no `soft`/`outline` choice.
- **H. State coverage:** N/A — non-interactive, non-visual. Test covers both meaningful states (with-provider / without-provider).
- **I. Types (partial pass):** exported prop types are real interfaces (not `React.FC`), `AICommandContext` + `AICommandProviderProps` both exported; the one blemish is `<any>` (flagged). No stringly-typed enums beyond the necessary consumer-defined `actionId`.
- **J. Docs (partial):** present in `llms.txt`/`llms-quick.txt`; test exists and is accurate; only the story + per-component md are absent (P3, largely moot for a headless provider).
