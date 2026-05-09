# Lens 2 — Type Coherence

**Compiled:** 2026-05-09 (principal-architect audit)
**Scope:** 508 TypeScript/TSX files in `packages/core/src` (excluding `primitives/` — vendored Radix has documented `@ts-nocheck` per CLAUDE.md)
**Rubric:** [`00-best-practices.md`](./00-best-practices.md) § 7 (Type safety) + § 5 (forwardRef typing) + § 3 (controlled props)

## Executive summary

Of 508 scanned files, **18 have type-coherence findings (3.5%)**. The codebase demonstrates **best-in-class type discipline**:

- **Zero instances of `any`** in public API exports
- **Zero `@ts-ignore` / `@ts-expect-error`** outside primitives
- **126 / 126 components export their `Props` types**
- **95%+ `displayName` coverage** on `forwardRef` components
- **No `React.FC` on ref-accepting components**

**All findings are P2–P3 (post-1.0 cleanup).** No P0 or P1 violations.

## Pattern compliance

| Pattern | Status | Notes |
|---|---|---|
| Discriminated unions for state machines | ✅ | Spinner: `state: 'spinning' \| 'success' \| 'error'`. Button: `processing: boolean \| 'ambient' \| 'working' \| 'urgent'` |
| forwardRef + precise ref typing | ✅ except Stack | Button → `HTMLButtonElement`, Spinner → `HTMLSpanElement`. Stack uses `HTMLElement` (loses generic specificity in `as` polymorphism) |
| Controlled / uncontrolled prop pairing | ✅ | Dialog/Popover use `open`/`defaultOpen`/`onOpenChange`. DatePicker `value`/`defaultValue`/`onValueChange`. Input native `value`/`onChange` |
| Public Props type exports | ✅ | All 126 components export `XxxProps` |
| Suppressions outside primitives | ✅ | Zero `@ts-nocheck`/`@ts-ignore` outside vendored Radix |
| `Omit<>` chains bounded | ✅ | No unbounded chains; Button uses single-layer `Omit<ButtonHTMLAttributes, 'color'>` |

## Findings

| # | Severity | Pattern | Component(s) | Issue | Fix | Effort |
|---|---|---|---|---|---|---|
| 1 | P2 | forwardRef typing | `ui/stack.tsx:83` | Polymorphic ref typed `HTMLElement` instead of generic `T extends ElementType`. `<Stack as="button">` loses `.focus()` autocomplete on the ref | Use TkDodo's component-factory pattern OR conditional ref typing per `as` value | M |
| 2 | P2 | Stringly-typed enum | `ui/charts/pie.tsx` | `color?: string` instead of canonical semantic union | Switch to `color?: 'accent' \| 'neutral' \| 'success' \| 'warning' \| 'error' \| 'info'` (shared `ChartColor` type) | S |
| 3 | P2 | Stringly-typed enum | `ui/charts/gauge.tsx` | Same as #2 | Same as #2 | S |
| 4 | P2 | Stringly-typed enum | `ui/charts/sparkline.tsx` | Same as #2 | Same as #2 | S |
| 5 | P2 | Stringly-typed enum | `ui/charts/radar.tsx` | Same as #2 | Same as #2 | S |
| 6 | P2 | Dead path in type | `ui/icon.tsx:25` | `size?: string \| number` allows numeric input but no numeric class map exists in implementation | Drop `\| number` from union, keep only token strings | S |
| 7-19 | P3 | React.FC usage | 13 files: alert-dialog, dialog, dropdown-menu, hover-card, popover, sheet, context-menu, navigation-menu, menubar, tabs, accordion, collapsible, tooltip | `React.FC` used on root provider wrappers. Acceptable for non-rendering providers but is a deprecated pattern. No implicit children, no ref support if pattern needs to evolve | Convert to function-style component declaration with explicit `Props` interface. No behavior change; consistency win | S each, batch L |
| 20 | P3 | [arch-judgment] ButtonGroup type duplication | `ui/button-group.tsx` | Re-declares `variant`/`color`/`size` enums that already exist in `buttonVariants`. Drift risk if Button taxonomy changes | Inherit from `VariantProps<typeof buttonVariants>` | S |

## Pattern observations beyond rubric

**Discriminated unions** are well-applied where state matters (Spinner, Button.processing). One pattern to watch: components with multiple boolean flags (`loading?: boolean; disabled?: boolean; readOnly?: boolean`) could be modeled as discriminated `state: 'idle' \| 'loading' \| 'disabled' \| 'readonly'` for stronger guarantees, but this is a stylistic preference — current pattern is industry standard.

**Polymorphic typing** (`as` prop) is a known TypeScript pain point. Stack's pragmatic `HTMLElement` ref typing trades type specificity for build simplicity. A factory-pattern fix exists but adds complexity. Recommend deferring unless concrete consumer pain emerges.

**No `React.FC` on components with refs** — verified across all forwardRef'd components. The 13 React.FC instances above are all on context provider components that don't accept refs and don't render DOM directly. Cosmetic.

## Validation methodology

- Exhaustive grep across 508 files for: `any`, `React.FC`, `displayName`, `forwardRef`, `Omit`, `@ts-*`, `HTMLElement`, `color\?: string`, `size\?: string`
- Manually validated Button, Spinner, Stack, DataTable, Combobox against rubric
- Cross-referenced CLAUDE.md ("83 `@ts-nocheck` in vendored primitives") — count holds; no leakage outside primitives

## Verdict

**shilp-sutra type coherence is production-ready.** Zero architecture-level type violations. All findings are post-release polish opportunities. Confidence: high.
