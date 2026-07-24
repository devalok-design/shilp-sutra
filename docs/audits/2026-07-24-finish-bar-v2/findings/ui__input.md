# ui/input — finish-bar audit
Finish: 4/5   Market: PARITY (Mantine Input)   Rebuild: polish

Source verified against `packages/core/src/ui/input.tsx`, `lib/field-state.ts`, stories, tests, doc, and prior baseline (`2026-07-01-ai-giveaway-polish/findings/ui__input.md`, which scored 4/5). Tokens confirmed present in `tokens/semantic.css` (`--color-surface-border-strong`, `--color-surface-raised-hover/-active`, `--action-disabled-opacity`, `--duration-fast-02`, `--ease-productive-standard`). No `card-strong` dead class, no framer motion, no `rounded-ds-*`/`rounded-full` in the component.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells; role radius (`rounded-control`); single edge (border-led wrapper, ring is a focus affordance not a resting double-edge); semantic tokens throughout. ONE drift: four raw arbitrary `w-[26px]/[30px]/[38px]/[46px]` icon-cell widths (input.tsx:38–43) bypass the `--spacing-ds-*` scale — magic numbers that can drift from the height tokens they should track. |
| accessibility | ✓ | `aria-invalid` on error, `aria-describedby`/`aria-required` auto-wired from FormField, `focus-within:ring-2 ring-accent-9 ring-offset-2`, `has-[:disabled]` opacity + not-allowed cursor, read-only styling. forced-colors block in semantic.css maps surface/border tokens to system colors. Minor: the box-shadow focus ring has no explicit `forced-colors:` outline fallback and can flatten in HCM; warning vs success differ only by border hue (helper text via FormField carries meaning). |
| api-composability | ✓ | Best-in-class. `forwardRef`+`displayName`, typed `HTMLInputElement`, shared `FieldState` with `@deprecated InputState` alias, native controlled+uncontrolled, `ReactNode` section slots with string→label / element→icon auto-inference + explicit `startSectionType`/`endSectionType` override, `wrapperClassName`/`className` split, composes `useFormField()` rather than re-rolling. `size` correctly omitted from HTML attrs to avoid native collision. |
| docs-dx | gap | Doc has Props/Types/Defaults/Example/Composability/Gotchas/Changelog and matches source. Small staleness: doc types the prop as `InputState` (the deprecated alias) instead of `FieldState`. Cosmetic. |
| testing | ✓ | `describeConformance` across all four sizes + RTL: placeholder, aria-invalid on/off, className→input routing, wrapper size class, section rendering, icon-padding removal, pointer-events default + clickable, state borders (error/warning/success), section-type inference + override, `rounded-control` on wrapper. Default story has a type-and-assert play test. |
| motion | gap | Only a CSS transition on color/bg/border/box-shadow at `duration-fast-02` (110ms, under 300ms) with `ease-productive-standard` (a real productive curve) — appropriate; inputs shouldn't animate in. Missing: `motion-reduce:transition-none` guard (or a documented global reduced-motion reset). Color-only fades are the least offensive case → minor. |
| state-coverage | ✓ | default / hover (`bg-surface-raised-active`) / focus-within / disabled / read-only / error / warning / success all deliberately designed and each shown in stories. Empty = placeholder styled via `placeholder:text-surface-fg-subtle`. No loading state — correct for a text leaf. |
| content-resilience | gap | `flex-1 min-w-0` lets the input scroll long values; sections `shrink-0`. But layout uses PHYSICAL properties (`border-r`/`border-l`, `rounded-l-[inherit]`/`rounded-r-[inherit]`, `pl-0`/`pr-0`) not logical (`border-inline-start`, `ps-`/`pe-`) — in RTL the start affix border/radius/padding land on the wrong side. Long label-section strings (`https://`, `per item`) have no truncation, but that's acceptable for affixes. |
| theming-resilience | ✓ | `ring-accent-9` swaps with brand accent; surface tokens invert correctly in dark (`raised-hover`=neutral-3 light, own dark override; `border-strong`=neutral-7 light / neutral-5 dark); radius via `rounded-control` role token honors `[data-shape]`; forced-colors block covers backgrounds + borders. No elevation-inversion trap (border-led, no sunken track). |
| system-cohesion | ✓ | Shares `FieldState`/`resolveFieldState`, `useFormField`, `IconProvider`, `rounded-control`, the accent focus-ring pattern, and duration/ease tokens with its form siblings. No bespoke drift beyond the magic-px widths. |
| craft | ✓ | Container-level focus ring wraps input+affixes as one unit; icons auto-size via `IconProvider` per input size; input drops `pl-0`/`pr-0` when an icon cell provides the visual gap; `rounded-l-[inherit]` keeps affixes flush with the wrapper radius; `select-none` on labels; `pointer-events-none` affix default with a per-side clickable escape; cursor affordances for disabled/read-only. |
| perceived-performance | ✓ | Native input = instant caret/echo; no layout shift; transitions are cheap color/box-shadow only (HW-friendly). No CLS from section presence (widths fixed). |
| market-benchmark | PARITY | vs **Mantine Input** (`leftSection`/`rightSection` + `sectionPointerEvents`): our section model is nearly identical and our string→label / element→icon auto-inference is a genuinely nice touch Mantine lacks. Ahead of **shadcn** (no section/affix API — manual composition). Slightly behind **React Aria TextField** / **Base UI** on RTL logical properties and built-in description/error-message + clear affordances. |
| cross-ds-adoption | ✓ (ideas) | See below. |

## Top gaps (prioritized)
- [P1] visual-integrity / system-cohesion — four raw `w-[26px]/[30px]/[38px]/[46px]` icon-cell widths (input.tsx:38–43) are the only magic numbers in the component and can drift from the `h-ds-*` height tokens they visually pair with → map each to a `--spacing-ds-*`-derived `w-ds-*` token (add a token if none lands on the value; don't hardcode px).
- [P2] content-resilience — physical `border-r`/`border-l`, `rounded-l/r-[inherit]`, `pl-0`/`pr-0` break the affix layout in RTL → switch to logical properties (`border-inline-start/end`, `rounded-s/e`, `ps-`/`pe-`).
- [P2] motion — wrapper transition has no reduced-motion guard → add `motion-reduce:transition-none` or confirm + document a global `prefers-reduced-motion` reset and downgrade.
- [P2] accessibility — no explicit `forced-colors:` outline fallback on `:focus-within`; verify the box-shadow ring survives Windows HCM, add an outline fallback + a forced-colors story.
- [P3] docs-dx — doc types the prop as deprecated `InputState`; update to `FieldState`.

## What it does well
- The section/affix API is the standout: `ReactNode` slots, automatic string→label (tinted bg + separator) / element→icon (fixed centered cell) inference, an explicit type override, and a per-side clickable toggle — this is the correct slot model, not the bespoke-prop anti-pattern.
- Deep FormField composition: state, `aria-invalid`, `aria-describedby`, `aria-required`, and `id` adoption all inherit from context with explicit props winning — zero re-rolled a11y wiring.
- Container-first architecture: one focus ring wraps input + affixes; `wrapperClassName` vs `className` cleanly separates chrome from the field.
- Thorough test + story matrix (describeConformance across sizes, all validation states, section-type inference/override, padding removal, pointer-events).

## Cross-DS adoption ideas
- **React Aria TextField** ships a first-class clearable affordance and description/error-message slots. We compose a ghost Button into `endSection` every time (see WithClearButton story) — a `clearable`/`onClear` prop would remove that boilerplate and standardize the clear UX.
- **Mantine** exposes `leftSectionPointerEvents`/`rightSectionPointerEvents` as an enum rather than our boolean `startSectionClickable` — a superset (`none | auto | all`) would cover the "visible but not focus-stealing" case our boolean can't express.
- **Base UI / React Aria** author affixes with logical properties out of the box — adopting `border-inline-start`/`ps-`/`pe-` closes our only RTL gap and costs nothing in LTR.

## Rebuild note
Polish, not rebuild. The architecture (container-first wrapper, FieldState composition, section slot model) is sound and market-competitive — nothing structural is wrong. Four in-place fixes get it to 5/5: tokenize the four icon-cell widths (P1), swap physical→logical properties for RTL (P2), add the reduced-motion guard (P2), and confirm/patch the forced-colors focus ring (P2). All are surgical class-level edits; none touch the API or break consumers.
