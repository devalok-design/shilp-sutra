# ui/label — finish-bar audit
Finish: 4/5   Market: PARITY (Radix/shadcn Label)   Rebuild: polish

Label is a thin, exemplary wrapper over the vendored `@primitives/react-label` that adds two things on top of the Radix base: a `required` asterisk and **FormField auto-wiring** (`htmlFor ?? fieldCtx.inputId`, `required ?? fieldCtx.required`). Source is clean and well-typed. The one real defect is a doc that has rotted into contradicting the source — the exact "docs can rot" failure this rubric exists to catch.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | All semantic tokens: `text-surface-fg`, `text-error-11`, `text-body-md` (real composite utility). Asterisk is a typographic `*` with `aria-hidden`, not an emoji. No radius/surface (label has no surface level → those sub-checks N/A). No slop tells. |
| accessibility | ✓ | Native `<label htmlFor>` = correct pattern; asterisk correctly `aria-hidden="true"` so SRs don't announce a stray "star"; `aria-required` is deliberately left to the control via FormField (documented in source). `peer-disabled:opacity-action-disabled`. |
| api-composability | ✓ | `forwardRef` + specific `ElementRef` ref type, `displayName` from primitive, `LabelProps extends ComponentPropsWithoutRef<Root>` (no `any`, no stringly enums), `required` addition, ReactNode children, explicit-`htmlFor`-wins fallback. Composes the base primitive, does not re-roll `<label>`. Exemplary. |
| docs-dx | ✗ | `docs/components/ui/label.md:18` states "**Label is NOT auto-wired by FormField** — you must explicitly pair…". The SOURCE does the opposite: `resolvedHtmlFor = htmlFor ?? fieldCtx.inputId`, `resolvedRequired = required ?? fieldCtx.required`. The doc actively misinforms consumers/agents. Doc also lacks Types/Defaults sections. |
| testing | gap | `describeConformance` + 5 behavior tests (text, htmlFor, required present/absent, children). No test covers the NEW auto-wire behavior (htmlFor + required inherited from FormField context) and no explicit axe play test. |
| motion | gap | Only motion is `transition-opacity duration-fast-01 ease-productive-standard` on the peer-disabled fade — opacity-only, DS tokens, sub-100ms. Missing a `motion-reduce:transition-none` guard. Lowest-risk motion in the system; borderline but flagged per rubric. |
| state-coverage | ✓ | default, required, disabled (peer-disabled) all designed. Hover/focus/press/loading/empty N/A for a non-interactive label. |
| content-resilience | gap | Children are ReactNode; asterisk appends inline. `ml-ds-01` on the asterisk is a **physical** margin — should be logical (`ms-ds-01`) so the spacing mirrors correctly in RTL. `leading-none` is fine for the common single-line case. |
| theming-resilience | ✓ | 100% semantic tokens; survives brand accent-9 swap; no radius/shape/density dependency; error asterisk tracks `text-error-11` in both themes. |
| system-cohesion | ✓ | Shares DS duration/easing tokens and the FormField context with its form siblings (Input, Select, etc.); no bespoke drift. |
| craft | gap | Nice: `aria-hidden` asterisk, explicit-wins fallback comment. Missing `peer-disabled:cursor-not-allowed` (shadcn ships it) so a disabled field's label still shows the default cursor. |
| perceived-performance | ✓ | Trivially instant; no layout shift; no async surface. |
| market-benchmark | ✓ | PARITY. Ahead of shadcn's Label on features (required indicator + FormField auto-wiring); on par with the Radix base it wraps. Only behind on the `cursor-not-allowed` micro-detail. |
| cross-DS ideas | gap | See below — React Aria / Base UI context-association and optional-marker patterns we don't have. |

## Top gaps (prioritized)
- [P1] docs-dx — `label.md:18` claims Label is NOT auto-wired by FormField; source IS auto-wired (`htmlFor ?? fieldCtx.inputId`, `required ?? fieldCtx.required`). → Rewrite the Composability section to describe the fallback (explicit `htmlFor`/`required` win, else inherited from FormField). Add Defaults note. Check make-kit/mcp-manifest for the same stale claim.
- [P2] testing — no coverage of the new context-inheritance behavior. → Add RTL tests: Label inside `<FormField inputId="x" required>` resolves `for="x"` and renders the asterisk with no explicit props; explicit props override context. Add an axe assertion.
- [P2] content-resilience — `ml-ds-01` is physical. → Switch to logical `ms-ds-01` for correct RTL mirroring of the required asterisk.
- [P3] motion — unguarded opacity fade. → Add `motion-reduce:transition-none`, or document as an intentional negligible exception.
- [P3] craft — no disabled cursor affordance. → Add `peer-disabled:cursor-not-allowed`.

## What it does well
- Textbook "compose, don't re-roll": thin wrapper over the vendored Radix Label; adds only the required indicator + FormField wiring.
- Correct a11y instincts — `aria-hidden` asterisk, `aria-required` deliberately delegated to the control, native `htmlFor` association.
- Clean, specific typing (`ElementRef`/`ComponentPropsWithoutRef`, exported `LabelProps`), `forwardRef` + `displayName`.
- Fully semantic tokens — brand- and theme-resilient with zero magic numbers.

## Cross-DS adoption ideas
- **shadcn Label** ships `peer-disabled:cursor-not-allowed` alongside the opacity dim — cheap craft win we lack.
- **React Aria (Adobe)** Label pairs with a `necessityIndicator` concept (render "(optional)" text OR a required "*", app-configurable) and localizes it — consider a DS-level optional/required marker convention instead of asterisk-only.
- **Base UI `Field.Label`** auto-associates with `Field.Control` by generated id with zero `htmlFor` wiring even outside a context provider — our auto-wire requires the FormField wrapper; a Field-scoped auto-id would remove the "you must pair htmlFor/id" footgun entirely.

## Rebuild note
Polish, not rebuild. Structure and API are at bar. The only genuinely wrong thing is the doc contradicting the source (P1) — a pure docs fix. The rest are one-line source touch-ups (logical margin, reduced-motion guard, cursor, disabled-cursor) plus a small test addition for the FormField-inheritance path. No structural change to the component itself.
