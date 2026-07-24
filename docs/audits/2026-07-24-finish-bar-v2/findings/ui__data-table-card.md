# ui/data-table-card — finish-bar audit

Finish: 3/5   Market: PARITY   Rebuild: polish

`DataTableCards` renders TanStack rows as vertically stacked cards below the `sm`
breakpoint (`mobileView="card"`), consuming the same table instance via
`useDataTableContext`. Not exported to consumers — driven internally by `<DataTable>`.
Visuals and system cohesion are genuinely solid; the drag is on tests, an inaccurate
doc, and dropped behavior parity with table mode.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Composes `Card variant="outline"` (bg-transparent + `border-surface-border-strong`, `shadow-none`) — one edge treatment, no edge-soup. `bg-surface-border-subtle` hairline divider, `text-body-sm`/`text-surface-fg-*` role tokens, `gap-ds-0x` cadence. No `rounded-ds-*`/`rounded-full`, no `border-card-strong`, no magic numbers. |
| accessibility | gap | `role="list"`/`"listitem"`, divider `aria-hidden`, checkbox has `aria-label="Select row"`. But label/value pairs are generic `div`/`span` — should be `<dl>/<dt>/<dd>` for SR key-value semantics; and header falls back to raw `column.id` when the header isn't a string (announces `_amount`-style ids). |
| api-composability | gap | Props typed cleanly, composes primitives. But it silently ignores `onRowClick` AND `renderExpanded` from context — behavior that works in table mode is dead in card mode (see parity gaps). |
| docs-dx | ✗ | `docs/components/ui/data-table-card.md` is WRONG: says it "renders the card wrapper around DataTable (border, shadow, rounded corners)". Actual component renders per-row stacked cards for mobile — not a wrapper, no shadow. Source-vs-doc mismatch. |
| testing | ✗ | No `data-table-card.test.tsx`, no `data-table.test.tsx`, and no story exercises `mobileView="card"`. Loading/empty/selected/parity all untested. |
| motion | N/A | Layout sub-component; no motion expected. No framer usage (so no slide-no-fade risk). |
| state-coverage | gap | loading (shape-matched skeleton) ✓, empty ✓, selected (`ring-2 ring-accent-9`) ✓. No distinct error state (empty doubles as no-results — acceptable). No hover/active affordance because row-click is dropped. |
| content-resilience | gap | `min-w-0`/`flex-1`/`shrink-0` guard overflow well. But: `column.id` label fallback is ugly for non-string headers; dead `if (hideBelow==='md'\|\|'lg')` block (lines ~106–116) does nothing; `text-right`/`justify-between` are physical, not logical (`text-end`) — weak RTL. |
| theming-resilience | ✓ | Outline card (transparent bg) + surface/border/accent role tokens survive an accent-9 swap, `[data-shape]` presets (radius via Card role tokens), and light↔dark — no recessed track to invert. |
| system-cohesion | ✓ | Reuses Card/Checkbox/Skeleton; shares spacing/surface/type tokens; honors the make-kit dense-list rule (outline not shadow, cited in a comment). One voice. |
| craft | gap | Real care (overflow guards, `aria-hidden` divider, shrink-0, dense-list rationale comment), undercut by the dead `hideBelow` block and the `column.id` label fallback. |
| perceived-performance | ✓ | Skeleton matches the real card shape (no CLS), instant selection feedback, no jank. |
| market-benchmark | PARITY | vs MUI DataGrid / Carbon / TanStack. Having a native responsive card fallback is *ahead* of MUI DataGrid (no built-in stacked mode). But Carbon's responsive tables use real description-list semantics and ours drops row-click/expansion + has zero tests — nets to parity. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] docs-dx — doc describes a different component (a "wrapper with shadow/rounded"). Rewrite to describe the mobile stacked-card behavior, the `_select`/`_expand` filtering, and the `hideBelow` handling.
- [P0] testing — add a story with `mobileView="card"` + a matchMedia mock, and RTL tests for loading/empty/selected + selection toggle. Card mode is completely uncovered.
- [P1] api-composability / state — wire `onRowClick` and `renderExpanded` from context so mobile card view has the same interactivity as table view (clickable card + expandable detail); add hover/active affordance when clickable.
- [P1] accessibility — switch label/value pairs to `<dl>/<dt>/<dd>`; require a string header (or a `mobileLabel` meta) instead of leaking `column.id`.
- [P2] content-resilience — delete the no-op `hideBelow==='md'|'lg'` block; use logical `text-end` for RTL.

## What it does well
- Clean primitive composition — Card + Checkbox + Skeleton, zero re-rolled surfaces.
- Correct edge discipline: outline variant means one border, no shadow-ring + border stacking.
- Shape-matched skeleton (heading + 3 lines) → no layout shift on load resolve.
- Deliberate dense-list decision (outline over shadow) with the reasoning left in a comment.
- Overflow handled properly (`min-w-0 flex-1` primary, `shrink-0` checkbox/label).

## Cross-DS adoption ideas
- Carbon / MUI stacked responsive tables use `<dl>` description-list markup for key-value rows — adopt for SR semantics.
- TanStack column meta could carry `mobilePrimary` / `mobileLabel` / `mobileHidden` flags so the card layout is author-controlled rather than "first content cell = primary, everything else = pairs".
- Vaul-style expandable card detail would let the dropped `renderExpanded` surface as a tap-to-expand on mobile.
- MUI DataGrid density presets — a compact card variant for long lists.

## Rebuild note
Polish, not rebuild. Structure and visuals are sound. Scope: (1) rewrite the doc to
match reality; (2) add a card-mode story + RTL tests (loading/empty/selected/toggle);
(3) consume `onRowClick`/`renderExpanded` from context for behavior parity with table
mode; (4) `<dl>` semantics + string-header requirement; (5) remove the dead `hideBelow`
block and use logical alignment for RTL.
