# composed/multi-select-popover — finish-bar audit
Finish: 3/5   Market: LAGS(Base UI / cmdk)   Rebuild: polish

Source: `packages/core/src/composed/multi-select-popover.tsx`
Test: `packages/core/src/composed/multi-select-popover.test.tsx`
Story: `packages/core/src/composed/multi-select-popover.stories.tsx`
Doc: `packages/core/docs/components/composed/multi-select-popover.md`
Prior baseline: `docs/audits/2026-07-01-ai-giveaway-polish/findings/composed__multi-select-popover.md` (3/5 — re-verified, **all major gaps still present in source**; nothing fixed in 0.49/0.50/0.52).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells (no accent rail, gradient text, glass/blob, emoji). Composes real `Popover`, correct `bg-surface-overlay` (surface-1 tier is right for overlays), semantic `accent-2`/`accent-11`, valid `border-surface-border-strong`, `rounded-pill` role token. Only blemish: `max-h-[240px]` + inline `width ?? 240` magic numbers. |
| accessibility | ✗ | `role="listbox"` div has **no accessible name** (no `aria-label`/`labelledby`). **Split focus model**: option `<button>`s are individually tabbable AND the input drives `aria-activedescendant` — double focus source, can double-announce. Arrow nav (`ArrowDown/Up`) lands `focusedIndex` on **disabled rows** (counted in `filteredItems.length`), then Enter no-ops = dead keystroke. No `Home`/`End`. No `aria-disabled` alongside `disabled`. |
| api-composability | gap | Good: `forwardRef`+`displayName`, canonical `value`/`onValueChange`, typed exported interfaces, no `any`, composes `Popover` (not a re-roll). Gaps: **controlled-only** (no `defaultValue`/uncontrolled fallback — every story+test hand-rolls `useState`); `renderItem` render-prop instead of compound slots; no footer/action-bar slot ("Clear all"/"Done") and no `asChild` on content. |
| docs-dx | gap | Doc prop table matches source accurately. But no Keyboard/A11y section; `onSearch`/`searchDebounce`/`maxSelections` FIFO documented in prose only. Manifest parity OK. |
| testing | gap | RTL covers open/filter/empty/select/deselect/maxSelections/groups. Missing: **no `vitest-axe`**, no `describeConformance`, no keyboard-nav test, no async `onSearch`/loading test, no disabled-item test. |
| motion | ✗ | **No `useReducedMotion` guard anywhere** (per-item slide+fade AND the check `springs.snappy` scale-in both play regardless of OS setting — every sibling gates motion). Per-item `delay: index * 0.02` **re-fires on every search keystroke** (rows remount on filter → cascading wipe = decorative, jittery, non-communicative). Entrance itself is HW-safe (transform+opacity) and does fade (not slide-no-fade). |
| state-coverage | gap | hover / focused / selected / disabled / loading (Spinner) / empty all deliberately styled. Holes: FIFO `maxSelections` replace silently drops oldest check with no feedback motion; disabled + keyboard = dead keystroke. Error state N/A. |
| content-resilience | gap | `truncate` on label + description, `min-w-0` correct, scroll for many, empty message handled. But entrance offset `x: -8` is **physical not logical** → not RTL-mirrored; long i18n labels truncate (no wrap option). |
| theming-resilience | ✓ | All semantic tokens (`accent-*`, `surface-*`), `rounded-pill` role token survives `[data-shape]`, `forced-colors` handled by the token layer (`surface-border-strong`→`CanvasText`). Survives accent-9 swap. Overlay elevation not theme-fragile. |
| system-cohesion | gap | Shares `springs.snappy`, focus-ring, spacing cadence, and composes the DS `Popover`/`Icon`/`Spinner`. Drift: the per-row entrance stagger + unguarded motion is a **bespoke outlier** vs siblings that all read `useReducedMotion`; magic-number sizing. |
| craft | gap | Nice touches: `scrollIntoView({block:'nearest'})` on focus, debounced async, spinner, `cursor-not-allowed`. Rough: raw `<img alt="">` instead of composing `Avatar` (no fallback initials, no `loading="lazy"`), split focus model. |
| perceived-performance | ✓ | Instant local filter, debounced (300ms) async with visible Spinner, no layout shift, scroll-into-view keeps focus visible. No virtualization but list sizes are small by design. |
| market-benchmark | ✗ | LAGS Base UI Combobox / cmdk / React Aria multi-select: they ship a single coherent focus model, `Home`/`End`, disabled-skip, typeahead, virtualized listbox, and a named listbox. We lag on the a11y model and virtualization. |
| cross-DS-adoption | gap | Concrete imports available (below). |

## Top gaps (prioritized)
- **[P0] motion** — No `useReducedMotion` guard on any animation; per-item stagger replays on every keystroke → gate all motion (`initial={reduce ? false : {...}}`, `delay: reduce ? 0 : ...`) and **remove the per-row entrance on filtered rows** (animate the list once on open, not per-row per-render).
- **[P1] accessibility** — Commit to ONE focus model: virtual focus via the input, make option buttons `tabIndex={-1}`; add `aria-label` to the listbox; skip disabled rows when advancing `focusedIndex`; add `aria-disabled`; add `Home`/`End`.
- **[P1] api-composability** — Add uncontrolled mode: make `value`/`onValueChange` optional, add `defaultValue?: string[]`, internal `useState` fallback (mirror `Popover`'s own pattern). Kills the `useState` boilerplate in every consumer.
- **[P2] state-coverage / motion** — Give the FIFO `maxSelections` replacement visible feedback (`AnimatePresence` exit on the bumped check) so the user sees what got dropped.
- **[P2] testing/docs** — Add `vitest-axe` + keyboard-nav test + async/disabled/empty stories; add a Keyboard/A11y section to the doc.
- **[P2] visual-integrity/system-cohesion** — Tokenize `max-h-[240px]` and the `240` default width (magic numbers, systemic tell).
- **[P3] craft** — Compose `Avatar` for the image row (fallback initials, ring) instead of raw `<img>`; add `loading="lazy"`.

## What it does well
- Composes the real `Popover`/`PopoverTrigger`/`PopoverContent` primitives — no re-roll of overlay surface/shadow (avoids the StatCard/Card drift anti-pattern).
- Canonical `value` / `onValueChange` naming and clean typed exported interfaces (`MultiSelectItem`, `MultiSelectGroup`), `forwardRef` + `displayName`, zero `any`.
- Genuinely useful data-layer breadth: flat items OR groups, local filter OR debounced async `onSearch` with loading Spinner, `renderItem` escape hatch, `maxSelections` FIFO — a lot of real functionality behind one prop surface.
- No visual slop tells at all; correct surface tier, semantic tokens, role radius. Entrance uses opacity:0 (proper fade — not the `slide-no-fade` tell).

## Cross-DS adoption ideas
- **cmdk / Base UI Combobox**: single virtual-focus model (input owns `aria-activedescendant`, rows non-tabbable) with disabled-skip and `Home`/`End` — fixes our split model in one move.
- **Base UI / React Aria**: **virtualized listbox** + async loading/empty states as first-class — we have async but no virtualization; large member lists will jank.
- **React Aria multi-select**: typeahead-to-focus (type a letter, focus jumps) beyond substring filter.
- **Radix/Base UI**: a **footer/action slot** for "Clear all" / "Select all" / "Done" — the single most common multi-select need our monolithic API has nowhere to put.
- **shadcn multi-select popover**: selected chips reflected in the trigger + a count badge pattern worth a documented recipe.

## Rebuild note
**Polish, not rebuild.** The structure is sound — it correctly composes `Popover` and the data layer is genuinely capable. Every failing axis is fixable in place: (1) gate all motion behind `useReducedMotion` and drop the per-keystroke stagger; (2) unify the focus model (input-driven virtual focus, `tabIndex={-1}` rows), add the listbox `aria-label`, skip disabled rows, add `Home`/`End`; (3) add uncontrolled `defaultValue`; (4) tokenize the two magic numbers. No structural teardown needed. The a11y holes are P1 (basic click-select and focus-visible work; the overlay is keyboard-operable), so the score holds at 3/5 — shippable with real gaps — rather than dropping to a rebuild.
