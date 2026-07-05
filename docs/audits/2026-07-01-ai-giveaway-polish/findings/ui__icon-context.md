# ui/icon-context — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:0 P3:1

## Summary
`icon-context.tsx` is a pure headless React context primitive: a typed `IconContext`, a memoized `IconProvider` that renders only `<IconContext.Provider>` (no DOM surface of its own), and a `useIconContext()` hook. It carries **zero rendered output**, no CVA, no tokens, no Tailwind classes, no motion, no copy. Consequently the visual (V1–V15), motion (M1–M5), structural (S1–S4), and most drift (G1–G2, G4–G5) rubric dimensions are **N/A by construction** — there is nothing to render, so there is nothing to converge toward an AI look. This is the headless sibling to the finish exemplars rather than a competitor to them, and it is correctly modeled as such (it is explicitly story-exempt in `scripts/pre-publish-audit.mjs:845`, so the absent `.stories.tsx` is intentional, not a gate miss).

The unit is clean. The only finding is a P3 verbal-tell nit in its doc prose.

## Findings

### [P3][E1] Em-dash used as a stylistic connector in doc prose
- **Category:** verbal-tell
- **Evidence:** `packages/core/docs/components/ui/icon-context.md:32` — `**Low-level context primitive** — rarely used directly.`; `:33` — `IconProvider is the escape hatch for that.` preceded by `:32` connector dashes; 11 total `—` in a 46-line doc (`grep -c — = 11`).
- **Why:** Most of the 11 are legitimate definition-list dashes in the Exports block (`IconContext — React.Context<…>`), which are a label→definition pattern, not a tell. But several in the **Composability**/**Gotchas** prose use `—` as a rhetorical connector ("primitive — rarely used", "context primitive — your consumer code MUST…" at `:34`), which is the E1 pattern the rubric flags for docs/copy.
- **Fix:** In the prose bullets only, replace connector em-dashes with a period or a comma ("Low-level context primitive. Rarely used directly."). Leave the Exports definition-list dashes — those are structural, not stylistic. Low priority; this is a doc-voice nit, not a shipped-default tell.

## Composability gaps
None. This *is* the composability primitive other components build on:
- `IconProvider` nests correctly (inner overrides outer), confirmed by the doc contract (`icon-context.md:36`) and consumed that way across the codebase (Button, IconGroup, StatCard's icon chip at `stat-card.tsx:332,342`, etc.).
- The hook degrades safely: `useIconContext()` returns `{}` when no provider is mounted, and consumers resolve their own defaults (`icon.tsx:95–96` — `size ?? ctx.size ?? 'md'`). This is the documented contract (`icon-context.md:34`) and is the right design for a headless context.
- No bespoke-prop-vs-slot issue (F1): the provider's only "content" prop is `children`, which is correct.
- No `asChild` need (F2): it renders no DOM element, so there is nothing to polymorph.
- F5 (composing the base primitive) is the dimension this component *enables* for everyone else — StatCard re-uses `IconProvider` rather than re-rolling icon sizing (`stat-card.tsx:9,332,342`), exactly the drift-avoidance the rubric praises.

## Motion gaps
None applicable. The component renders no DOM and triggers no animation, so M1–M5 do not apply. (Motion correctly lives downstream in `Icon`, which guards every preset with `useReducedMotion()` — `icon.tsx:99,122,181` — but that is out of this unit's scope.)

## Polish plan (ordered steps to reach the finish bar)
The unit is already at the finish bar for a headless primitive. Optional, non-blocking:
1. (P3) Soften the connector em-dashes in the doc's Composability/Gotchas prose bullets (`icon-context.md:32–34`); keep the Exports definition-list dashes.
2. (optional, types) Consider exporting `IconProviderProps` as a named type for parity with other components' prop-type exports — currently the provider's props are an inline intersection (`icon-context.tsx:18` — `IconContextValue & { children: React.ReactNode }`). Not a rubric violation (no `any`, no stringly-typed enums, no narrowing), purely an API-surface nicety. The doc already documents the prop shape correctly.

## Clean (rubric dims that pass)
- **V1–V15 (visual tells):** N/A — renders no DOM/surface. No accent rail, no gradient, no palette, no emoji, no blob/glass, no rounding, no pills. Nothing to converge.
- **M1–M5 (motion):** N/A — no animation in this unit.
- **S1–S4 (structural):** N/A — not a page/doc layout; the doc itself is minimal and load-bearing (no colored section backgrounds, no page-chrome filler, no SaaS skeleton).
- **E2–E8 (verbal):** Clean. No contrastive negation, no AI-vocabulary words (checked against the E3 list), no meta-hedging, no empty openers/closers, no chatbot artifacts/placeholders, no forced tricolon, no over-structuring. The doc prose is direct and prescriptive.
- **F1–F6 (composability):** Clean / N/A — see Composability gaps above. This is the base context primitive itself.
- **G1–G5 (drift/vocabulary):** Clean / N/A — no surface (G1), no tokens or hardcoded px/hex/shadow (G2), no variant axes to drift (G3), no surface vocabulary (G4), no button defaults (G5). `IconSize` (`xs/sm/md/lg/xl/2xl`) and `IconStroke` (`light/regular/bold`) are sensible domain enums, not the canonical CVA `size`/`variant` axes, so G3 does not apply.
- **H (state coverage):** N/A — non-interactive, renders no focusable element. The memoized value (`icon-context.tsx:20`) is correct.
- **I (types):** Clean. `IconContextValue`, `IconSize`, `IconStroke` all exported (`icon-context.tsx:5–11`, barrel `ui/index.ts:29`). No `any`, no `React.FC`, no stringly-typed `color?: string`, no narrowing. `IconProvider` is a plain function component with no `forwardRef`/`displayName` — correct, since it forwards no ref and renders no DOM element (a `displayName` would be cosmetic only).
- **J (docs parity):** Clean. Doc (`docs/components/ui/icon-context.md`) matches source exactly: exports, prop shapes (`size`/`stroke`/`children`), the empty-object fallback contract, and the memoization note all align with `icon-context.tsx`. Story is intentionally absent (story-exempt at `pre-publish-audit.mjs:845`). Test (`__tests__/icon-context.test.tsx`) covers default-size propagation, explicit-override, stroke propagation, and is axe-clean.
