# ai/blocks — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:5 P3:2

Scope: `packages/core/src/ai/blocks/*.tsx` (block-table, confirm, divider, error, info, loading, stat-row, success, text) + `index.ts`, plus the orchestrator `ai/block-renderer.tsx` and its story `ai/block-renderer.stories.tsx`, tests in `ai/__tests__/blocks/*`. There is **no per-component doc** at `docs/components/**/blocks.md` (or anywhere for the ai layer) — see J1.

The good news up front: the **motion system is genuinely well finished** here — every block reads `useMotion()`, branches on `reducedMotion`, and uses the shared `springs`/`tweens`/`durations` tokens (`springs.responsive` is damping-28, not an overshoot). That's the Card bar for motion. The problem is almost entirely **one repeated visual tell** plus **pervasive raw-spacing drift**.

## Findings

### [P0][V1] Accent rail is the shipped low-confidence indicator on 5 blocks
- **Category:** visual-tell
- **Evidence:**
  - `blocks/block-table.tsx:99` — `confidence === 'low' && 'border-l-2 border-warning-7 pl-3'`
  - `blocks/confirm.tsx:30` — `confidence === 'low' && 'border-l-2 border-warning-7 pl-3'`
  - `blocks/error.tsx:18` — `confidence === 'low' && 'border-l-2 border-warning-7 pl-3'`
  - `blocks/success.tsx:59` — `confidence === 'low' && 'border-l-2 border-warning-7 pl-3'`
  - `blocks/text.tsx:23` — `confidence === 'low' && 'border-l-2 border-warning-7 pl-3'`
- **Why:** A colored left stripe on a content block is the single most recognizable AI tell (V1) — the exact pattern we deliberately killed on Card in v0.44.0. It ships here as a *default* rendering path (any block with `confidence:'low'`, which is model-emitted, not consumer opt-in), so it's a default the component ships. It's also duplicated verbatim across 5 files (drift risk) and *asserted in tests* (`__tests__/blocks/confirm.test.tsx:102-103`), which cements it as intended API rather than an accident.
- **Fix:** Replace the rail with a non-rail low-confidence treatment shared in one place. Options: (a) a small `<Badge color="warning" size="xs">Low confidence</Badge>` in a corner/header, (b) a muted footnote line ("Based on limited data"), or (c) a subtle full `bg-warning-2` wash — never a `border-l-*` stripe. Extract to a single `LowConfidence` wrapper/helper so all blocks share it (kills the 5-way duplication too). Update the tests to assert the new treatment.

### [P1][G2] Raw Tailwind spacing everywhere instead of `--spacing-ds-*` tokens
- **Category:** drift
- **Evidence:**
  - `blocks/confirm.tsx:35` `mb-3`, `:39` `gap-3`, `:53` `mt-3`, `:63` `mt-2 p-3`
  - `blocks/error.tsx:22` `prose-sm` + `:27` `mt-2`
  - `blocks/success.tsx:71` `mt-2 gap-2`, `:78` `gap-1.5`
  - `blocks/text.tsx:21` `prose-code:px-1`
  - `blocks/loading.tsx:72` `gap-2`, `:96` `gap-2`, `:101` `gap-2`
  - `block-table.tsx:99` `pl-3`, `:142` `gap-1`
  - `block-renderer.tsx:38` `mt-2`
- **Why:** The DS spacing namespace is `--spacing-ds-*` (generates `p-ds-03` etc., per CLAUDE.md) precisely to avoid raw numeric spacing. StatCard/Card use `gap-ds-*`, `mt-ds-*`, `px-ds-*` throughout. These blocks fall back to bare `mb-3`/`gap-2`/`mt-2`, so their rhythm doesn't track the token scale — that's the "vibe-coded, not tokenized" tell and breaks the 3-tier cadence rule.
- **Fix:** Map each to the nearest DS token (`gap-3`→`gap-ds-03`, `mt-2`→`mt-ds-02`/`mt-ds-02b`, `p-3`→`p-ds-03`, etc.). `stat-row.tsx` already does this correctly (`gap-ds-05`) — use it as the in-file model.

### [P1][I1] `as` cast on Badge `color` defeats type safety
- **Category:** types
- **Evidence:** `block-table.tsx:28` — `<Badge variant="subtle" size="sm" color={badgeObj.color as 'default'}>` where `badgeObj` is typed `{ label: string; color: string }` (`:26`).
- **Why:** `color: string` is stringly-typed (rubric I: `color?: string`), then force-cast to `'default'` to silence the compiler. A row emitting `color: 'purple'` compiles and silently mis-renders; a typo isn't caught. This is the classic AI "cast until it builds" pattern.
- **Fix:** Type `BlockTableColumn`/cell badge color as the real Badge color union (`'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'default'`) in `types.ts`, and validate/fallback at runtime instead of casting.

### [P1][F5/F1] BlockTable, Confirm, Error, Success, Text re-roll their own surface wrapper instead of composing a base
- **Category:** composability
- **Evidence:** every block's outer element is a bespoke `<div className={cn(confidence...)}>` (`block-table.tsx:96`, `confirm.tsx:28`, `error.tsx:16`, `success.tsx:57`, `text.tsx:15`). The low-confidence styling, the wrapper element, and spacing are re-implemented per file.
- **Why:** This is the StatCard-vs-hand-rolled-card situation (F5). Because there's no shared block shell, the V1 rail got copy-pasted 5×; a future padding/surface change means editing 5 files. There's also no slot for consumers to inject a header/action (F1) — the blocks are closed.
- **Fix:** Introduce one internal `BlockShell` (or reuse a lightweight wrapper) that owns the outer element, the confidence treatment, and consistent spacing; each block renders its content into it. Single source of truth for the two cross-cutting concerns.

### [P1][H1] Sortable table headers announce sort but give no `:focus-visible` / interaction affordance beyond cursor
- **Category:** state-coverage / a11y
- **Evidence:** `block-table.tsx:117-141` — sortable `<TableHead>` gets `role="columnheader"`, `tabIndex={0}`, `onClick`, `onKeyDown`, `aria-sort`, and `cursor-pointer select-none` (`:122`) but **no focus-visible ring** and **no hover style**. The clickable target is a `<th>` styled only with cursor.
- **Why:** Keyboard users get focus but no visible focus indicator on the header (rubric H: focus ring lost). No hover feedback on an interactive element (M4). Contrast with Card/StatCard which carry focus + hover states.
- **Fix:** Add `focus-visible:ring-*` (the DS focus-ring utility) and a `hover:bg-surface-raised-hover` (or `text-surface-fg` weight shift) on sortable headers. Consider rendering a real `<button>` inside the `<th>` for correct semantics rather than making the `<th>` itself the tab stop.

### [P1][G5] Confirm "Cancel" uses `variant="ghost"`, and destructive confirm relies on `color` with default variant
- **Category:** vocabulary / drift
- **Evidence:** `blocks/confirm.tsx:40-49` — confirm is `<Button variant="solid" color={destructive ? 'error' : undefined}>`, Cancel is `<Button variant="ghost">`.
- **Why:** Per CLAUDE.md, non-primary actions should default to `variant="soft"` not ghost/outline unless in a toolbar or on a colored bg — this is a plain block on the page surface, so `soft` is the intended secondary. `ghost` reads as tertiary and under-weights the Cancel option in a confirm pair. Minor, but it's a stated-convention miss.
- **Fix:** `<Button variant="soft" onClick={handleCancel}>Cancel</Button>`. (Keep solid+error for the destructive confirm.)

### [P2][M4] Non-motion blocks (Info, Confirm, Error, Text) have no entrance/feedback motion of their own
- **Category:** motion
- **Evidence:** `info.tsx`, `confirm.tsx`, `error.tsx`, `text.tsx` render statically; only the *renderer* wraps them in a stagger (`block-renderer.tsx:99-108`).
- **Why:** Rendered directly (per-component import path, which the barrel explicitly encourages for error/text — `index.ts:11-16`), these blocks have zero entrance or interactive feedback. Table/stat-row/loading/divider/success all animate; the text/error/confirm/info family doesn't. Inconsistent within the family (M2-adjacent) and misses feedback motion when used standalone.
- **Why it's only P2:** in the common path (via BlockRenderer) they inherit the stagger, so it's a polish gap not a hard miss.
- **Fix:** Either document that these blocks are meant to be rendered through BlockRenderer, or give confirm/error a light `tweens.fade` entrance consistent with the others.

### [P2][V8] Info and text-badge patterns lean on Badge/Alert `variant="subtle"` consistently — but table badge falls back to a bare `<Badge>` with no semantic color
- **Category:** visual-tell (pill spam adjacent)
- **Evidence:** `block-table.tsx:33-37` — when a cell value isn't an object, it renders `<Badge variant="subtle" size="sm">{String(value)}</Badge>` for *any* value in a `variant:'badge'` column.
- **Why:** Turning every string in a badge-column into a pill is mild pill-badge spam (V8) and can wrap plain text ("Active", "N/A") in a neutral pill that carries no meaning. Deliberate for status columns, but the fallback applies it indiscriminately.
- **Fix:** Only render a Badge when a semantic color is resolvable; otherwise render plain text. Or require the object form for badge columns.

### [P2][G2] `block-table.tsx` uses HTML entity glyphs (▲ ▼) as sort indicators instead of the Icon API
- **Category:** drift / structural-tell
- **Evidence:** `block-table.tsx:145-149` — `<span aria-hidden="true">&#9650;</span>` / `&#9660;` for asc/desc.
- **Why:** The DS has a lucide/tabler Icon API (used in loading.tsx, stat-card via `Icon`). Unicode geometric glyphs render inconsistently across fonts/platforms and sit outside the icon sizing/color system. It's a small "reached for a character instead of the icon set" tell.
- **Fix:** Use `<Icon icon={IconChevronUp} size="xs" />` / `IconChevronDown` (or the sort-specific tabler icons) to match the rest of the layer.

### [P2][H2] Success undo countdown ring: `remaining` state resets are timer-driven but the ring animation duration is fixed to `undoTimeout`, decoupled from actual remaining time on re-render
- **Category:** state-coverage
- **Evidence:** `blocks/success.tsx:23` `useState(undoTimeout)`, `:29-42` interval decrements `remaining`; but the SVG ring at `:104-114` animates `strokeDashoffset` over the full `undoTimeout / 1000` seconds once on mount, independent of the `remaining` counter.
- **Why:** Two independent countdowns (numeric label from `remaining`, visual ring from a one-shot CSS/framer transition). If the component re-renders/pauses they can desync. Also the `aria-label` (`:76`) updates every 100ms via `remainingSeconds`, which will spam some screen readers.
- **Fix:** Drive the ring from the same `remaining` value (animate offset to `(1 - remaining/undoTimeout) * circumference`), and throttle/remove the per-second aria-label churn (announce once, or use `aria-live` politely).

### [P3][J1] No per-component doc for the ai/blocks layer
- **Category:** docs
- **Evidence:** `find docs -ipath "*block*"` → nothing; `docs/components/` has only `ui/`, `composed/`, `shell/` — no `ai/` dir. Every other layer has per-component `.md`.
- **Why:** Rubric J: per-component doc missing. Consumers (and AI agents reading llms-full) have no prop table for the block protocol, the confidence semantics, custom-block registration, or the per-component import paths that `index.ts` mandates.
- **Fix:** Add `docs/components/ai/block-renderer.md` covering the Block protocol, built-in types, `confidence`, `customBlocks`, and the error/text per-path import requirement.

### [P3][I2] `Record<string, React.ComponentType<BlockComponentProps<any>>>` and `WeatherCard as any` leak `any`
- **Category:** types
- **Evidence:** `block-renderer.tsx:23` `BlockComponentProps<any>`; `:48` `customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>`; story `block-renderer.stories.tsx:365,461` `WeatherCard as any`.
- **Why:** The custom-block registry is `any`-typed, so consumer custom blocks get no data-shape checking, and the story has to `as any` to register — a sign the public API forces the cast. Mild (custom blocks are inherently open), hence P3.
- **Fix:** Consider a generic `defineBlock<T>()` helper or `unknown` + a type guard so consumers register typed blocks without `any`.

## Composability gaps
- **F5 (P1):** block-table/confirm/error/success/text each hand-roll their outer `<div>` + confidence styling instead of composing one shared `BlockShell`. This is *why* the V1 rail is duplicated 5×.
- **F1 (P1):** blocks are closed — no slot to inject a header, action, or footer. ConfirmBlock hardcodes "Cancel" label and the two-button layout; a consumer can't add a third action or relabel Cancel without forking.
- **F6 (P2):** BlockTable owns sort state internally (`useState` at `:73-74`) with no `defaultSort`/`onSortChange` — fully uncontrolled, no controlled escape hatch. Fine for an AI-emitted table, but no way to persist/lift sort.
- **F2 (P3):** blocks don't need `asChild` (they're content, not polymorphic wrappers) — not a gap, noted for completeness.
- Custom-block registry is `any`-typed (I2) — composability via registration works but is untyped.

## Motion gaps
- **Strength, not a gap:** reduced-motion is respected in every animated block (`block-table.tsx:72,163-171`, `divider.tsx:16`, `loading.tsx:61,102-108`, `stat-row.tsx:29`, `success.tsx:103-114`, `block-renderer.tsx:61,95`). Springs are the shared tokens; `springs.responsive` (damping 28) is not an overshoot — no M1 bounce tell. This is the finish bar for M3.
- **M4 (P2):** static blocks (info/confirm/error/text) have no own entrance/feedback motion; they rely on the renderer's stagger and are motionless when imported directly.
- **M4 (P1, folded into H1):** sortable table headers have no hover/press feedback and no focus-visible ring.
- **M2 (minor):** loading step-reveal uses a fixed `durations.moderate01b` per step with `index*0.06` stagger — uniform, but that's appropriate for a step list, not a tell.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the accent rail (P0/V1).** Create one `BlockShell` (or `LowConfidence`) helper owning the outer element + a non-rail low-confidence treatment (badge or muted footnote or `bg-warning-2` wash). Route block-table/confirm/error/success/text through it. Update `confirm.test.tsx:97-112` (and any sibling test) to assert the new treatment. This simultaneously fixes F5 and the 5-way duplication.
2. **Tokenize spacing (P1/G2).** Replace all raw `mb-3`/`gap-2`/`mt-2`/`p-3`/`gap-1.5`/`pl-3` with `--spacing-ds-*` equivalents. Use stat-row.tsx as the model.
3. **Fix the Badge color type (P1/I1).** Widen `BlockTableColumn` badge color to the real Badge color union in `types.ts`; drop the `as 'default'` cast; runtime-fallback unknown colors.
4. **Interactive table headers (P1/H1).** Add focus-visible ring + hover feedback; prefer a real `<button>` inside `<th>`. Swap the ▲▼ entities for the Icon API (P2/G2).
5. **Cancel → soft (P1/G5).**
6. **Sync the undo ring to `remaining` and quiet the aria-label churn (P2/H2).**
7. **Add the ai/blocks doc (P3/J1)** with the Block protocol + import-path guidance.
8. **Consider typed custom-block registration (P3/I2)** and light entrance motion for the static blocks (P2/M4).

## Clean (rubric dims that pass)
- **M3 reduced-motion:** fully respected across every block — exemplary.
- **M1 bounce-by-default:** none; springs are damped, no overshoot tells.
- **V3 gradient text / V4 framework palette / V6 blob-glass / V7 rounded-everything:** none. Colors are semantic tokens (`warning-7`, `success-11`, `error-11`, `accent-9`, `surface-*`); radius uses `rounded-surface`/`rounded-pill`; no gradients except the legitimate sparkline fill in StatCard (out of this unit's scope, and a legit chart fill).
- **V5 emoji as icons:** none — real tabler icons in loading.tsx; the only glyphs are the sort arrows (flagged G2, not emoji).
- **E1–E8 verbal tells:** JSDoc/story copy is clean (no em-dash tic, no AI vocabulary, no meta-hedging). Story sample data is realistic, not "Lorem"/emoji.
- **H (a11y baseline):** strong — `role="status"`+`aria-busy` on loading, `aria-sort` on table, `sr-only` labels, keyboard handlers on sortable headers and (in StatRow→StatCard) button semantics, `aria-hidden` on decorative icons/rings. The gaps are focus-visible (H1) and aria churn (H2), not missing baseline.
- **State coverage:** loading (2 modes), error, success (+undo), empty (`stat-row.tsx:17` returns null; block-table empty-rows/empty-cols tested), unknown-block fallback (`block-renderer.tsx:35-43`) all handled.
- **F barrel hygiene:** the error/text markdown-peer split in `index.ts:11-16` is a deliberate, documented tree-shaking choice — a strength, not a drift.
