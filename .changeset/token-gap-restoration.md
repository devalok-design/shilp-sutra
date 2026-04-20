---
"@devalok/shilp-sutra": minor
---

Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

**Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

**What's restored:**

- `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
- `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
- `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
- `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
- `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
- `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
- `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
- Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
- `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
- 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
- `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
- Missing `./ui/split-button` subpath export added to package.json

**Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

**Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.
