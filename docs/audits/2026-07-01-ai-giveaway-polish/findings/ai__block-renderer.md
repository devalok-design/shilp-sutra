# ai/block-renderer — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

BlockRenderer is a small, clean dispatcher: it maps a `Block[]` protocol onto built-in/custom
block components and staggers their entrance. It is visually restrained — no gradients, no
accent rails, no emoji, no framework palette in its own default rendering. The gaps are
about **finish**, not tells: zero test/story/doc coverage (a publish gate), a couple of
re-rolled raw spacing values, reduced-motion only honored via an optional provider, and a
type-safety `any` leak in the block-component map.

## Findings

### [P1][J] No story, no test, no doc for a public component
- **Category:** docs / state-coverage
- **Evidence:** `packages/core/src/ai/` — Glob for `block-renderer.{test,stories}.tsx`, `**/block-renderer.md`, and `Grep BlockRenderer` across `*.{md,mdx,txt}` all return **No files found**. `BlockRenderer` is exported (`block-renderer.tsx:115`) and is part of the `ai` public layer.
- **Why:** Stories + tests are a stated publish gate (MEMORY: "Stories are a publish gate", "per-component docs coverage" is a `pre-publish-audit.mjs` hard gate). A public component with no story/test/doc cannot demonstrate its state matrix (empty blocks, unknown-type fallback, reduced-motion path, custom-block override, confidence pass-through) and drifts silently.
- **Fix:** Add `block-renderer.stories.tsx` (stories: default block list, empty `blocks={[]}`, unknown-type fallback, custom block override, `staggerDelay` variants, reduced-motion), `block-renderer.test.tsx` (renders each built-in, falls back on unknown type, prop `onAction`/`customBlocks` win over context, reduced-motion skips motion wrapper, axe-clean), and a `docs/components/ai/block-renderer.md` with a prop table matching the source.

### [P1][I] `React.ComponentType<BlockComponentProps<any>>` — `any` in an exported-facing type
- **Category:** types
- **Evidence:** `block-renderer.tsx:23` `const BUILT_IN_BLOCKS: Record<string, React.ComponentType<BlockComponentProps<any>>>`; `:48` `customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>` (public prop on `BlockRendererProps`); `:80` `const blockProps: BlockComponentProps<any>`. Same `any` in `types.ts` is not present — the leak is the `<any>` generic argument here and in `ai-command-provider.tsx:9,22`.
- **Why:** `I` bans `any` in exported props/handlers. `customBlocks` is a public prop typed with `BlockComponentProps<any>`, so consumer block components get no `data` type checking. `any` also disables the generic's payload guarantees.
- **Fix:** Use `BlockComponentProps<Record<string, unknown>>` (the interface's own default) instead of `BlockComponentProps<any>` for the registry/prop types. Where a block's `data` cast to `any` is truly needed at the call site, cast locally rather than widening the public map type.

### [P1][G2] Re-rolled raw spacing / stale numeric utilities in FallbackBlock
- **Category:** drift
- **Evidence:** `block-renderer.tsx:38` `<pre className="mt-2 text-ds-xs whitespace-pre-wrap">` — `mt-2` is a raw Tailwind numeric spacing, not the DS `--spacing-ds-*` namespace (should be `mt-ds-02` or similar per the CLAUDE.md namespace rule that DS spacing is `p-ds-03`, not `p-3`).
- **Why:** `G2` flags hardcoded/raw spacing instead of DS tokens. `mt-2` resolves against the consumer's numeric spacing scale, not ours, so it drifts from the rest of the component (which correctly uses `gap-ds-04`).
- **Fix:** `mt-2` → `mt-ds-02b` (or the closest DS token to the intended 8px). Keep `text-ds-xs` (that one is already a DS token).

### [P2][M3] Reduced-motion honored only when a `MotionProvider` is present
- **Category:** motion / state-coverage
- **Evidence:** `block-renderer.tsx:61` `const { reducedMotion } = useMotion()`; `:95` `if (reducedMotion) { return <div key={key}>{content}</div> }`. `motion-provider.tsx:16-20` — the default context value is `{ reducedMotion: false }`, so with **no** `MotionProvider` in the tree, `reducedMotion` is always `false` and the entrance animation runs regardless of the OS `prefers-reduced-motion` setting.
- **Why:** `M3` requires animation to respect reduced-motion. BlockRenderer is usable standalone (nothing forces a provider), and in that common case a reduced-motion user still gets the staggered `y:12→0` entrance. The guard is real but conditional on setup the component doesn't own.
- **Fix:** Fall back to Framer's own `useReducedMotion()` when the context is at its default, or wrap the motion path in `<MotionConfig reducedMotion="user">` locally, so reduced-motion is respected without requiring the consumer to mount `MotionProvider`. (Note: framer's `MotionConfig reducedMotion` also disables transform animations, so the explicit `if (reducedMotion)` branch stays useful as belt-and-suspenders.)

### [P2][M5] Entrance animates `y` (transform) — good — but stagger delay scales linearly with unbounded list length
- **Category:** motion
- **Evidence:** `block-renderer.tsx:104` `transition={{ ...springs.responsive, delay: index * (staggerDelay / 1000) }}`. With the default `staggerDelay = 50`ms, the 20th block waits ~1s, the 40th ~2s before it starts.
- **Why:** Not a layout-prop tell (it animates `opacity`+`y`, which is correct). But uniform per-index delay with no cap means long AI responses (many blocks) get a robotically long, ever-growing entrance cascade — a mild `M2` (uniform/robotic timing) smell at scale, and a UX drag for long transcripts.
- **Fix:** Cap the cumulative delay (e.g. `Math.min(index, 8) * (staggerDelay/1000)`) or only stagger the first N blocks; blocks past the fold appear immediately.

### [P2][H] Empty / null-content states not proven; `blocks` has no empty guard shown
- **Category:** state-coverage
- **Evidence:** `block-renderer.tsx:73-74` renders `blocks.map(...)` inside a `flex flex-col gap-ds-04` wrapper. With `blocks={[]}` this renders an empty flex container (harmless but an empty div with padding-less gap). No test/story covers it (see J finding). `FallbackBlock` handles unknown types, which is good.
- **Why:** `H` asks that empty state not crash and be demonstrated. It won't crash, but "renders an empty wrapper div" is an untested/undesigned state — a consumer may want to render nothing (or an empty-state slot) when there are zero blocks.
- **Fix:** Either early-return `null` on `blocks.length === 0`, or accept an `emptyState` slot. At minimum add a story asserting the empty case.

### [P2][F1] `onAction` / `staggerDelay` are config props; no slot for wrapping or empty/loading affordance
- **Category:** composability
- **Evidence:** `block-renderer.tsx:45-51` `BlockRendererProps` = `blocks`, `onAction`, `customBlocks`, `staggerDelay`, `className`. All content is driven by the `blocks` array; there is no `asChild`, no header/footer/empty slot, no way to override the per-block wrapper element.
- **Why:** `F1`/`F2` — for a renderer this is largely acceptable (it *is* a data-driven dispatcher, not a layout container), but the fixed `motion.div` wrapper and fixed outer `div` mean a consumer can't change the list semantics (e.g. render as `<ol>`/`role="list"`) or inject an empty state without forking. Minor for this component type.
- **Fix:** Consider an optional `as` / render-prop for the item wrapper, or at least document that custom blocks are the extension point. Not urgent.

### [P2][H] Confidence is threaded but never surfaced; no `aria-live` on the streamed region
- **Category:** state-coverage / a11y
- **Evidence:** `block-renderer.tsx:83` `confidence: block.confidence` is passed to every block, but the renderer itself renders blocks that appear/stagger in over time (AI response) with no `aria-live`/`role="log"` on the container (`:73`).
- **Why:** `H` — async content that appears incrementally should announce to assistive tech. AI responses are exactly the "content arrives over time" case an `aria-live="polite"` region is for.
- **Fix:** Add `role="log"` + `aria-live="polite"` (or `aria-relevant="additions"`) to the container div when blocks stream in, or document that the consuming chat surface owns the live region.

### [P3][G2] `z-[1]` pattern is fine but `springs.responsive` delay math recomputes per render
- **Category:** drift (minor)
- **Evidence:** `block-renderer.tsx:104` `delay: index * (staggerDelay / 1000)` — recomputed inline each render. Cosmetic.
- **Why:** Negligible; noted only for completeness. No token drift here (`springs.responsive` is a proper DS motion token).
- **Fix:** None required.

### [P3][docs] JSDoc absent on `BlockRenderer` and `BlockRendererProps`
- **Category:** docs
- **Evidence:** `block-renderer.tsx:45` `BlockRendererProps` and `:53` `BlockRenderer` have no JSDoc block (contrast Card/StatCard which carry rich `@example` JSDoc feeding llms-full.txt / make-kit).
- **Why:** `J` — the finish bar components document props inline; this one is bare, so llms.txt/make-kit have nothing to pull.
- **Fix:** Add a JSDoc summary + 2–3 `@example`s (default render, custom block, staggerDelay) matching the Card/StatCard style.

## Composability gaps
- No `asChild` / `as` on the outer container or per-block wrapper — list semantics (`role="list"`, `<ol>`) can't be changed without forking. Acceptable for a dispatcher but worth documenting the custom-block extension path.
- No empty-state slot; zero blocks silently renders an empty flex div.
- `customBlocks` typed with `BlockComponentProps<any>` gives consumer block authors no `data` type-checking — weakens the main composition surface.
- Does compose correctly at the right level otherwise: it delegates all surface/visual concerns to the individual block components (which themselves compose Alert, Card, etc.), so no F5 re-roll here.

## Motion gaps
- Reduced-motion is respected only when a `MotionProvider` wraps the tree; standalone usage animates regardless of OS preference (M3).
- Linear per-index stagger delay is uncapped — long block lists get an ever-growing entrance cascade (mild M2 at scale).
- Entrance is `opacity`+`y` (transform) — correct, not a layout-prop tell. No exit animation (blocks only mount here, so acceptable).

## Polish plan (ordered steps to reach the finish bar)
1. Add `block-renderer.test.tsx` + `block-renderer.stories.tsx` covering: each built-in block, unknown-type fallback, custom-block override, prop-wins-over-context for `onAction`/`customBlocks`, empty `blocks`, reduced-motion path, `staggerDelay` variants, axe-clean. (Publish gate.)
2. Replace `BlockComponentProps<any>` with `BlockComponentProps<Record<string, unknown>>` in the registry, the `customBlocks` prop, and `blockProps` (and mirror in `ai-command-provider.tsx`).
3. Fix `mt-2` → DS token (`mt-ds-02b`) in `FallbackBlock`.
4. Make reduced-motion self-sufficient: fall back to Framer's `useReducedMotion()` when context is default, or wrap the motion path in a local `MotionConfig`.
5. Cap the stagger delay (`Math.min(index, N)`), and decide empty-state behavior (early-return null or `emptyState` slot).
6. Add `role="log"` + `aria-live="polite"` to the streaming container (or document that the chat surface owns it).
7. Add JSDoc + `@example`s to `BlockRenderer`/`BlockRendererProps` in the Card/StatCard style.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none in default render — no accent rail, no double edge, no gradient text, no framework palette (`indigo/violet/slate`), no emoji icons, no blob/glass/glow, one radius vocabulary, no pill spam. The only gradient in the wider unit is the StatCard sparkline fill (legitimate chart fill, not this file).
- **V4:** no raw Tailwind palette as brand; colors come via composed blocks' semantic tokens.
- **E1–E8 verbal tells:** the FallbackBlock copy is `Unknown block type: ${type}` — plain, no AI vocabulary, no em-dash tic, no hedging. (No prose docs exist to violate — see J.)
- **G1 surface:** BlockRenderer renders a transparent flex container, delegating surfaces to blocks (Alert, Card). No surface-1-on-a-card violation.
- **G3/G4 vocabulary:** no CVA variants here to drift; config props (`staggerDelay`, `onAction`, `customBlocks`) are appropriately named (`onAction` uses a typed `(actionId, type)` signature, not stringly-typed).
- **F5:** does NOT re-roll surface/padding — correctly delegates to composed block components.
- **forwardRef + displayName:** present and correct (`:53`, `:113`).
- **M5:** animates transform/opacity, not layout props.
