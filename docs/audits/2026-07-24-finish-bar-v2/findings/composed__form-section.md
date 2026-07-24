# composed/form-section — finish-bar audit
Finish: 3/5   Market: LAGS (Carbon FormGroup)   Rebuild: polish

FormSection is a small, clean layout grouping — no slop tells, tokens throughout, no radius-ds, no magic numbers, tests + stories + doc all present and matched. It sits below the bar on three fronts, all in-place fixable: a genuine correctness bug (`ref` dropped in the collapsible branch), a bespoke string-only API with duplicated open state and no controlled `open`, and a chevron spring with no reduced-motion guard. Source is unchanged since the 2026-07-01 baseline — every P1 it flagged is still live.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail/gradient/glow/emoji/pill-spam. Separator is a full-width `border-b border-surface-border-subtle` (not a colored rail). Tokens only (`py-ds-02`, `gap-ds-01`, `space-y-ds-04`). No `rounded-ds-*`/`rounded-full`, no arbitrary `p-[..]`/`h-[..]`. Minor: redundant `font-sans` on description (:43). No surface/shadow — correct, it's a grouping not a card. |
| accessibility | gap | Core purpose is grouping form fields, yet provides **zero programmatic grouping**: title is a bare `<span>` (:39), no `role="group"` + `aria-labelledby`, no heading semantics, no `<fieldset>`/`<legend>`. axe passes (fields still individually labelled) so not a P0, but AT gets no section outline entry. Collapsible trigger relies on Radix wiring; no explicit focus-visible ring set on the trigger. |
| api-composability | ✗ | (1) **`ref` dropped in collapsible mode** — `forwardRef` attaches ref only to the non-collapsible `<div ref={ref}>` (:76); the `Collapsible` branch (:52-73) has no `ref` → contract silently broken half the time. (2) `title`/`description` are `string`-only (:17-18) — no `ReactNode`, no header/action slot, can't inject a Badge/marker/button or render as a heading. (3) No controlled `open` prop; open state is duplicated in local `useState` (:50) purely to rotate the chevron, mirroring state `Collapsible` already owns. (4) `{...props}` typed as `HTMLDivElement` attrs is spread onto `Collapsible` Root (:54) — typing lie in that branch. `displayName` set. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. Minor: `defaultOpen`-only-when-collapsible coupling lives in Gotchas, not inline in the Props table. |
| testing | gap | describeConformance + axe + toggle interaction + `defaultOpen={false}` + className merge + no-button-in-static — solid. But **no ref test** (would have caught the dropped-ref bug) and no controlled-open test. |
| motion | gap | Chevron rotation `<motion.span animate={{rotate}}> springs.snappy` (:57-63) has **no reduced-motion guard** — `withReducedMotion` exists in `lib/motion` (:58) and is unused. Spring itself is effectively bounce-free (ζ≈0.95) so appropriate for a functional toggle. Could be driven off Collapsible's own `data-[state=open]` via CSS `group-data-[state=open]:rotate-180`, which would also delete the duplicate `isOpen` state and respect the global reduced-motion CSS for free. |
| state-coverage | gap | open/closed + default-open covered. No controlled `open`. Error state N/A (lives in child fields). Empty (no children) is fine. Trigger has no hover/press feedback beyond the chevron (acceptable for a section header). |
| content-resilience | ✓ | Long title/description wrap (`flex flex-col`); `justify-between` header is RTL-safe; down-chevron needs no mirroring; `space-y` works in RTL. String-only title limits rich content but that's the API axis, not survival. |
| theming-resilience | ✓ | No surface/shadow → no light↔dark elevation-inversion risk. Uses semantic border token; no accent used so survives an accent-9 swap; no radius so `[data-shape]` presets are N/A. |
| system-cohesion | gap | Shares `springs.snappy`, `Icon`, `Collapsible` primitives — good. But uses the margin-based `space-y-ds-04` model (:54,:67,:76,:79) where the Card family was deliberately moved to `flex flex-col gap-*` so children can't unbalance spacing. Plus redundant `font-sans`. |
| craft | gap | Chevron rotates smoothly; `group` class is set on the trigger but nothing consumes `group-hover`. Duplicated-state smell and dropped ref are the opposite of quiet craft. Data-state-driven chevron would be the cleaner move. |
| perceived-performance | ✓ | Instant; Collapsible owns the height animation; no layout shift; lightweight, no jank. |
| market-benchmark | LAGS | vs Carbon `FormGroup` (`<fieldset>`+`<legend>`, free semantic grouping) and Ant/Chakra section patterns (rich header + action slot + controlled collapse). We match on visual restraint but lag on semantic grouping and header composability. |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P0] api-composability — `ref` dropped in collapsible branch → forward `ref` to the `Collapsible` root (Radix Root forwards refs). One line; restores the advertised contract. (P0 because it's an actual correctness bug, not a polish miss.)
- [P1] api-composability — string-only `title`/`description`, no slot/action, no `ReactNode` → widen `title` to `ReactNode` + add a header `action?` slot escape hatch (mirror `CardHeader`/`CardAction`).
- [P1] api-composability — no controlled `open`; duplicated `isOpen` state → add `open?`/`onOpenChange` pass-through; drive chevron off `data-[state=open]` and delete the `useState`.
- [P1] motion — chevron spring unguarded for reduced-motion → wrap with `withReducedMotion`, or move rotation to the CSS `group-data-[state=open]` path (respects global reduced-motion CSS).
- [P1] accessibility — no programmatic grouping → add `role="group"` + `aria-labelledby` (title id), or render title as a heading; ideally `<fieldset>`/`<legend>` semantics.
- [P2] system-cohesion — `space-y-ds-04` → `flex flex-col gap-ds-04` to match the Card family gap model.
- [P2] testing — add a ref test (catches the P0 above) + controlled-open test.
- [P2] docs-dx — note the `defaultOpen`↔`collapsible` coupling inline in the Props table; drop redundant `font-sans` on the description.

## What it does well
- Zero AI-slop tells; disciplined token usage; no radius-ds/magic-number/edge-soup.
- Correctly declines a surface/shadow — it's a layout grouping, not a card (surface-layering N/A, handled right).
- Bounce-free `springs.snappy` on the chevron — appropriate for a functional toggle.
- Good test coverage of the collapsible interaction (toggle, default-open, unmount-on-collapse) + axe + conformance.
- Content is RTL-safe and wraps gracefully; no CLS.

## Cross-DS adoption ideas
- **Carbon `FormGroup`** groups via `<fieldset>`+`<legend>` — free, robust AT grouping. We could render the section as a labelled group (`role="group"` + `aria-labelledby`, or fieldset/legend) so screen readers announce the section boundary.
- **Ant Design / Chakra section patterns** ship a header **action slot** (link/button on the right of the title) and **controlled collapse**. Adopt a `<FormSectionHeader>`/`<FormSectionAction>` compound (mirroring our own `CardHeader`/`CardAction`) so headers can carry a Badge, "Required" marker, or an action.
- **Radix Collapsible data-state driven visuals** — drive the chevron entirely off `data-[state=open]` in CSS (what Radix's own examples do) instead of a mirrored React state, eliminating our duplicate-state smell and getting reduced-motion for free.

## Rebuild note
Polish, not rebuild. The structure (Collapsible + header + separator) is sound and visually clean; every gap is an in-place fix. Order: (1) forward `ref` in the collapsible branch [P0, one line]; (2) drive the chevron off `data-[state=open]` via CSS and delete `isOpen` [kills the duplicate state + unguarded spring together]; (3) add controlled `open?`/`onOpenChange`; (4) widen `title` to `ReactNode` + add a header action slot; (5) add `role="group"`/`aria-labelledby`; (6) `space-y` → `gap`; (7) ref + controlled-open tests, doc props-table note. No API break beyond additive props (title widening is a widening, not a narrowing — safe).
