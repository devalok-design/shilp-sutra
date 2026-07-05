# ui/code — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

Code is a small, disciplined typographic primitive. It is `@server-safe`, uses only
bound tokens (no raw px/hex, no framework palette, no gradients), has no accent rail,
no double-edge (each variant is edge-XOR-elevation), no emoji, and renders correct
semantic elements (`<code>` / `<pre><code>`). It ships tests (incl. `describeConformance`)
and 5 stories. The gaps are doc/JSDoc drift, the boilerplate JSDoc closer, and a couple
of composability/state polish items — none structural.

## Findings

### [P1][G — drift] JSDoc references stale "layer-03" vocabulary that doesn't match the code
- **Category:** drift / docs
- **Evidence:** `ui/code.tsx:11` — `renders as <code> with a subtle layer-03 background` while the actual class is `ui/code.tsx:54` `bg-surface-raised-hover`
- **Why:** "layer-03" is dead pre-surface-system vocabulary; the source paints `surface-raised-hover` (surface-3). The JSDoc lies about the token and reintroduces a naming system the DS retired.
- **Fix:** Change the JSDoc to "a subtle surface-3 tint (`bg-surface-raised-hover`)". Grep the rest of the file/family for other `layer-NN` references.

### [P2][E5 — verbal] Engagement-bait JSDoc closer shipped in source
- **Category:** verbal-tell
- **Evidence:** `ui/code.tsx:27` — `// These are just a few ways — feel free to combine props creatively!`
- **Why:** Classic AI filler/engagement-bait closer (also an E1 em-dash). It carries zero API information and is the same boilerplate line copy-pasted across Card/StatCard JSDoc — a systemic tell that ships in the npm tarball's `.d.ts`.
- **Fix:** Delete the line. If a closing note is wanted, state a real constraint (e.g. "Block variant does not syntax-highlight").

### [P2][E1 — verbal] Em-dash used as stylistic connector in JSDoc prose
- **Category:** verbal-tell
- **Evidence:** `ui/code.tsx:11-14` — `as <code> with ... — suitable for short snippets` and `as <pre> with a bordered, padded, horizontally-scrollable block for multi-line code samples` (em-dash connectors throughout the doc block)
- **Why:** E1 bans `—` as a stylistic connector; it's the most reliable verbal AI tell and it ships in published types.
- **Fix:** Replace connector em-dashes with a colon, comma, or sentence break. Reserve dashes for nothing here (no numeric ranges present).

### [P2][J — docs] Doc prop table omits the inherited `HTMLAttributes` surface and `ref`
- **Category:** docs
- **Evidence:** `docs/components/ui/code.md:7-9` lists only `variant` + `children`; the interface is `extends React.HTMLAttributes<HTMLElement>` (`ui/code.tsx:29`) and the component `forwardRef`s to `HTMLPreElement | HTMLElement` (`ui/code.tsx:33`).
- **Why:** Consumers can pass `className`, `id`, `data-*`, `ref`, etc.; the doc implies a closed two-prop surface. Minor parity gap vs CVA/source-wins rule.
- **Fix:** Add a one-liner "Also forwards all `HTMLAttributes` + `ref` to the rendered `<code>`/`<pre>`."

### [P3][F2 — composability] No `asChild` / element override on a typography primitive
- **Category:** composability
- **Evidence:** `ui/code.tsx:33-62` — always renders a literal `<code>` (inline) or `<pre><code>` (block); no Slot/`asChild`, and the block's inner `<code>` (`ui/code.tsx:45`) is unaddressable (can't receive className/lang attrs).
- **Why:** Low-value for a leaf typographic element, but a consumer wanting to attach a syntax-highlighter to the inner `<code>`, or render the inline token as a `<kbd>`/`<samp>`, has no hook. Card/StatCard set the composition bar; this is the one composition seam Code lacks.
- **Fix (optional):** Either accept it as a deliberate leaf (document it), or expose `codeProps`/`asChild` if a real consumer need appears. Not worth adding speculatively — flag, don't gold-plate.

### [P3][H — state-coverage] Block variant has no caption/copy affordance and no overflow indication beyond scroll
- **Category:** state-coverage
- **Evidence:** `ui/code.tsx:37-47` — block is a bare scrollable `<pre>`; `overflow-x-auto` is present (good) but there's no visual scroll affordance and no copy-to-clipboard slot.
- **Why:** Not a tell and not required for a typographic primitive, but a "finished" code block usually offers copy. The doc itself (`code.md:24`) correctly scopes this out ("not a syntax-highlighted code viewer").
- **Fix:** Leave as-is; the scope is documented. Note for a future `CodeBlock` composed component if copy/caption is wanted.

## Composability gaps
- No `asChild`/Slot and the inner `<code>` of the block variant is unaddressable (F2). Acceptable for a leaf, but it's the only composition seam missing relative to the Card bar.
- Does not compose a base primitive (F5) — but there is no surface/Card primitive a typographic chip should compose here; it correctly uses raw tokens. Not a real gap.
- Controlled/uncontrolled (F6): N/A — stateless.
- Prop count (F3): 1 custom prop (`variant`). Well under threshold. Clean.

## Motion gaps
- Component is `@server-safe` and intentionally static. M1 (bounce), M2 (timing), M3 (reduced-motion), M5 (layout-prop animation): N/A — no animation at all, which is correct for static code typography.
- M4 (missing feedback motion): Inline/block code are non-interactive text; no hover/press feedback is expected. The block variant is not a button. No gap.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the `layer-03` → `surface-raised-hover` JSDoc drift (`ui/code.tsx:11`).
2. Delete the engagement-bait closer line (`ui/code.tsx:27`) and de-dash the JSDoc prose (E1) — apply the same sweep to the shared boilerplate across the family.
3. Add the inherited-attributes/ref note to `docs/components/ui/code.md`.
4. Decide explicitly on `asChild`/inner-`code` addressability: either document "leaf, no override" or defer to a future composed `CodeBlock`. Do not add speculatively.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** clean — block is border-only (`border-surface-border-strong`, no shadow, `ui/code.tsx:40`), inline is border-only (`border-surface-border`, no shadow, `ui/code.tsx:54`); neither pairs border with elevation.
- **V3 gradient text / V6 blob-glass-glow:** none.
- **V4 framework palette:** none — only `surface-*` semantic tokens.
- **V5 emoji / V8 pill spam:** none in source, stories, or doc.
- **V7 rounded-everything:** uses the radius vocabulary deliberately — `rounded-surface` (block) and `rounded-control-inner` (inline), the latter explicitly documented for "inline Code" in `tokens/semantic.css:365`. Intentional, not a tell.
- **V9 safe-face font:** uses `font-mono` → bound to brand token `--font-mono` (`tokens/semantic.css:57`), not a hardcoded Inter/Geist. Clean.
- **G1 surface layering:** block code block sits ON the page as a panel → `bg-surface-raised` (surface-2) is correct; inline chip uses surface-3 tint inside text. Compliant with the MANDATORY layering rule.
- **G2 re-rolled tokens:** none — all spacing (`p-ds-05`, `px-ds-02`, `py-ds-01`), radius, type (`text-ds-sm`, `leading-ds-relaxed`), and color are tokens. No bare `shadow`/`rounded`/`bg-gradient-to-*`/`w-[--var]`/`theme()`. (The `leading-[150%]` arbitrary value was already fixed in v0.1.1 per `code.md:32`.)
- **G3 variant-axis drift:** `variant: 'inline' | 'block'` is a legitimate structural axis (not the solid/soft/outline color taxonomy), correct for a typographic element. No `primary`/`small`/`color="default"` smell.
- **I types:** clean — typed `CodeProps extends HTMLAttributes`, proper `forwardRef<HTMLPreElement | HTMLElement>`, `displayName` set, no `any`, no `React.FC`, no stringly-typed color.
- **H a11y:** renders correct semantic `<code>`/`<pre><code>`; `overflow-x-auto` on block (test-asserted, `code.test.tsx:28`); no focus ring to lose (non-interactive); no `<div onClick>`.
- **J stories/tests:** 5 stories incl. inline-in-paragraph + multiline + single-line block; `describeConformance` + 3 behavior tests covering element type and overflow. Story tagged `stable`.
