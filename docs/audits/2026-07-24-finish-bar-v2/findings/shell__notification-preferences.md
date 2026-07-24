# shell/notification-preferences — finish-bar audit

Finish: 3/5   Market: LAGS(Linear/GitHub notification settings)   Rebuild: polish

A domain-specific settings surface (per channel/project notification rules). Props-driven, no internal fetching. Composes Card / Dialog / Select / Switch / Button / IconButton / Spinner primitives cleanly — structure is sound. Held back by unnamed inline controls (a11y), zero test coverage, a raw magic-number width, and a swallowed save-error path.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Surface layering correct-by-composition (Card primitive owns `bg-surface-raised`); role radius `rounded-surface`; no edge-soup, no slop tells. But `w-[130px]` raw arbitrary width on the row SelectTrigger (magic-number), and off-cadence spacing `ds-02b`/`ds-04` outside the ds-03/05/07 tiers. |
| accessibility | ✗ | Row `Switch` (`checked={!pref.muted}`) has **no accessible name** — no `aria-label`, and the adjacent "Active/Muted" `<span>` is not programmatically associated (WCAG 4.1.2, every row). Row min-tier `Select` also has no label/`aria-label` — SR announces the value with no "what". Delete `IconButton` is correctly labeled; the Add dialog form is exemplary (`htmlFor`/`id` on every field). Inline-control naming is the defect. |
| api-composability | gap | `forwardRef` + `displayName`; canonical Select `value`/`onValueChange`; all callbacks accept `Promise<void>`; controlled dialog internal. Weak spots: `channel`/`minTier` are stringly-typed (`string`, not unions); `CHANNEL_LABELS` is hardcoded to `IN_APP`/`GOOGLE_CHAT` and **silently falls back to IN_APP** for any unknown channel (wrong label, no error); no way to inject custom channel labels/icons. |
| docs-dx | gap | Doc exists, props match source, Composability/Gotchas present. Stories cover Empty/Loading/Default/Single/Many/AllMuted/Critical. Missing: no axe play test in stories; doc doesn't flag the hardcoded-channel limitation; a story is named "Many Rules (Scrollable)" but the component has no scroll container (see content-resilience). |
| testing | ✗ | **No `notification-preferences.test.tsx` exists.** Zero unit/RTL/`vitest-axe`/`describeConformance` coverage for a stateful shell component with a dialog, form, and per-row mutations. |
| motion | ✓ | Correctly restrained — a settings list is not a should-it-animate surface (frequency-inappropriate to animate). Dialog open/close motion + reduced-motion guard inherited from the Dialog primitive. No bespoke motion to critique. |
| state-coverage | gap | Loading (Spinner) and empty (helpful copy) are deliberately designed. Missing: **error state** — `handleAdd` swallows failure to `console.error` (line 135) and the dialog stays open with no user-facing message; no per-row pending/saving indicator on toggle/tier change; no disabled state while a mutation is in flight. |
| content-resilience | gap | Info `<p>` has `min-w-0 flex-1` but no `truncate` — long project titles wrap. Row is a fixed horizontal flex with `w-[130px]` select + switch + label + delete; no wrap/stack on narrow widths → horizontal overflow risk, and the "(Scrollable)" story is aspirational (no `max-h`/`overflow` region in source). RTL: physical `mr-ds-02b` instead of logical `me-*`. |
| theming-resilience | ✓ | All semantic tokens (`surface-fg`/`-muted`/`-subtle`, `surface-border-strong`, `bg-surface-raised`), role radius, no hardcoded colors — survives an accent-9 swap and `[data-shape]` presets. `forced-colors` covered by the tokens. Light↔dark handled by semantics. |
| system-cohesion | ✓ | Strong — composes DS primitives rather than re-rolling them; shares focus-ring/radius/spacing language via the primitives. Minor drift: manual `mr-ds-02b` on the Add-Rule icon instead of Button's own icon slot; `w-[130px]` instead of a size token. |
| craft | gap | Nice touches: empty-state copy, Active/Muted mirroring, `color="error"` delete. But **delete is immediate with no confirmation** for a destructive action; no row hover affordance; fixed-width tier select can clip localized labels. |
| perceived-performance | gap | Props-driven with no optimistic local state — mute toggle and tier change depend on the consumer re-rendering `preferences`; with async callbacks and no per-row pending indicator, the control feels unresponsive until the round-trip lands. |
| market-benchmark | LAGS | vs Linear / GitHub notification settings: they ship labeled inline controls, per-row save feedback, grouped/tabular density, keyboard traversal, and delete confirmation. We match on clean composition and empty/loading states but lag on inline-control naming, save/pending feedback, and destructive-action safety. |
| cross-DS adoption | — | See ideas below. |

## Top gaps (prioritized)
- **[P1] accessibility** — Row `Switch` and min-tier `Select` have no accessible name → wire `aria-label` (e.g. `Mute ${channelInfo.label} for ${projectName}` on the switch, `Minimum tier for …` on the select), or associate the visible "Active/Muted" text via `aria-labelledby`.
- **[P1] testing** — No test file. Add RTL coverage for empty/loading/default render, toggle→`onToggleMute`, tier change→`onUpdateTier`, delete→`onDelete`, dialog add flow→`onSave`, plus a `vitest-axe` pass (which would have caught the unnamed switch).
- **[P1] state-coverage** — Surface save failures instead of `console.error`-and-close: keep the dialog open, show an inline error, re-enable Save. Add a per-row pending state for async toggle/tier callbacks.
- **[P2] visual-integrity** — Replace `w-[130px]` with a size token (magic-number); move `ds-02b`/`ds-04` onto the ds-03/05/07 cadence.
- **[P2] content-resilience** — `truncate` the project title; make the row wrap/stack on narrow widths; either add the scroll container the "Scrollable" story implies or rename the story; use logical `me-*` for RTL.
- **[P2] craft** — Add a confirmation step (or undo) for delete; it's a destructive, un-guarded, single-click action.
- **[P2] api-composability** — Don't silently fall back to the IN_APP label for unknown channels; consider union types for `channel`/`minTier` and an optional label/icon map prop.

## What it does well
- Composes DS primitives faithfully — no re-rolled cards, no bespoke surfaces; surface layering and radius come free and correct from Card.
- Fully token-driven — no hardcoded colors or dead classes (uses the real `border-surface-border-strong`, not the phantom `border-card-strong`); theming/forced-colors resilient.
- Clean props-driven contract: `forwardRef`, canonical Select API, `Promise<void>` callbacks, no internal fetching.
- Deliberate empty and loading states; the Add-Rule dialog form is fully labeled and a11y-correct.
- Restrained motion — doesn't animate a list users edit repeatedly.

## Cross-DS adoption ideas
- **Linear notification settings** group rules under channel headers with a compact toggle column — we could add optional grouping (by project or channel) instead of one flat list.
- **GitHub notification settings** confirm/undo destructive removals inline — adopt an undo toast (Sonner) rather than immediate delete.
- **React Aria** ships `Switch`/`ToggleButton` with mandatory labeling ergonomics — mirror that by making the label association structural in this component so an unnamed inline control can't happen.
- **Vercel/Geist forms** pair every inline control with a persistent field label + saving/saved micro-state — adopt a per-row status affordance for optimistic feedback.

## Rebuild note
**Polish, not rebuild.** The architecture is right — it composes primitives, is fully tokenized, and is theming-resilient. Every defect is a local fix: add `aria-label`s to the two inline controls (P1 a11y), author the missing test file with an axe pass (P1), surface save errors instead of swallowing them and add per-row pending state (P1), and clean up the `w-[130px]` magic number / off-cadence spacing / truncation / delete-confirmation (P2). No structural change needed.
