# PriorityIndicator

- Import: @devalok/shilp-sutra/composed/priority-indicator
- Server-safe: No
- Category: composed

## Props
    priority: Priority
    iconOnly?: boolean (icon-only chip, no visible text)
    display?: "compact" | "full" (@deprecated — use iconOnly)
    children?: ReactNode (override the label, e.g. i18n)

Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'low' | 'medium' | 'high' | 'urgent'

## Defaults
    iconOnly: false

## Example
```jsx
<PriorityIndicator priority="HIGH" />
<PriorityIndicator priority="low" iconOnly />
<PriorityIndicator priority="URGENT">Critical</PriorityIndicator>
```

## Composability
- **Composes `Badge`** — radius, color semantics, a11y labelling, and reduced-motion handling all come from one place (no bespoke re-roll).
- **Composes inside list rows, DataTable cells, Card headers, task panels** — anywhere a priority flag fits.
- **`iconOnly`** shows only the icon with a real accessible name (`role="img"` + `aria-label`), for tight cells. Omit it (default) for icon + label.
- **Severity by weight, not motion** — URGENT renders as a solid fill so the top tier reads at a glance; the others are soft. No animation (removes the prior perpetual pulse).
- **Case-insensitive priority** — accepts both UPPERCASE and lowercase; unknown values fall back to MEDIUM instead of throwing.
- **`children`** overrides the label for i18n / custom copy.
- Color semantics: LOW = slate (neutral), MEDIUM = warning, HIGH = error (soft), URGENT = error (solid).

## Gotchas
- Case-insensitive — "low" and "LOW" both work; unknown values fall back to MEDIUM
- `iconOnly` shows only the icon (accessible-named); default shows icon + text label
- `display` is deprecated — use `iconOnly`

## Changes
### v0.53.0
- **Changed** Recomposed on the `Badge` primitive (was a bespoke re-rolled chip): inherits pill radius, color semantics, accessible labelling.
- **Changed** URGENT is now a solid static fill; the perpetual scale-pulse is removed (was unguarded infinite motion, WCAG 2.2.2). Severity reads without animation.
- **Added** `iconOnly` (replaces deprecated `display`) and `children` (label override for i18n).
- **Fixed** Icon-only chip now has a real accessible name (`role="img"` + `aria-label`), not a mouse-only `title`. Unknown priority no longer throws.

### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
