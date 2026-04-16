# Structural Audit Follow-ups — Plan

Three structural items from the 2026-04-17 post-world-class audit that need design decisions before execution. Each is a multi-day effort with breaking-change implications.

## 1. Variant vocabulary unification

**Problem**
Across Button/Badge/Alert/Card/Toggle/Banner, the same concept ("low-emphasis", "brand color", etc.) is spelled differently per component. Consumers cannot reason compositionally.

| Component | `variant` | `color` |
|---|---|---|
| Button | solid / soft / outline / ghost / link | accent / error / success / warning / neutral |
| Badge | subtle / solid / outline / soft | default / accent / error / success / warning / info / neutral + 8 named hues + custom |
| Alert | subtle / solid / outline (+ filled deprecated) | info / success / warning / error / neutral |
| Card | default / elevated / outline / flat | default / accent / error / success / warning / info / neutral |
| Toggle | default / outline | accent / error / success / neutral |
| Banner | (none — color only) | info / success / warning / error / neutral |

**Target vocabulary**

- `variant`: `solid` | `soft` | `outline` | `ghost` across all two-axis components.
  - Retire `subtle` (→ `soft`), `default` on Toggle (→ `ghost`), `filled` (already deprecated → `solid`).
  - Card gets an orthogonal `elevation` prop (`flat` | `raised` | `hover`) and aligns its `variant` to the canonical set. `default/elevated/flat` fold into `variant="solid"` × `elevation`.
  - Badge's extra hue palette (`teal`/`amber`/.../`custom`) stays — that's a Badge-specific extension, not a shared-color collision.

- `color`: `accent` | `error` | `success` | `warning` | `info` | `neutral` everywhere.
  - `default` removed (already done on Button). Alert/Banner `info` becomes interchangeable with `accent` where they currently mean brand — keep `info` as a distinct semantic for informational toasts/alerts (not "brand"), and introduce `accent` as an explicit brand alias where missing.
  - Toggle gains `warning` and `info`.

**Rollout plan** — two minors + one major

| Step | Version | Change |
|---|---|---|
| 1 | 0.36.0 | Add new canonical names as aliases. No old name removed. Dev-mode `console.warn` when deprecated name is passed. |
| 2 | 0.37.0 | Codemod script shipped: `pnpm dlx @devalok/shilp-sutra-codemod unify-variants`. Docs switched over. |
| 3 | 1.0.0 | Remove deprecated names. Breaking change documented in MIGRATION.md. |

**Effort**: ~1 week coding + codemod + migration docs. Needs a brainstorming session on the Card elevation split before step 1.

## 2. Forced-colors (Windows high-contrast) support

**Problem**
Zero `@media (forced-colors: active)` rules anywhere in `packages/core/src`. Windows users with high-contrast on lose focus rings, borders, and iconography because CSS custom properties are stripped in forced-colors mode.

**Approach**
Add a single block to `semantic.css` that maps all semantic tokens to system colors when `forced-colors: active`:

```css
@media (forced-colors: active) {
  :root {
    --color-surface-fg:         CanvasText;
    --color-surface-bg:         Canvas;
    --color-accent-9:           Highlight;
    --color-accent-fg:          HighlightText;
    --color-error-9:            Mark;
    --color-link:               LinkText;
    --color-surface-border:     CanvasText;
    /* ...and so on for all semantic tokens */
  }
  /* Force key interactive borders visible */
  button, [role="button"], input, select, textarea,
  [role="menuitem"], [role="option"], [role="tab"] {
    forced-color-adjust: none;
    border: 1px solid ButtonText;
  }
  /* Preserve focus ring via system color */
  *:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }
}
```

Also audit: focus ring fallbacks on Dialog/Sheet, icon-only buttons (they need visible borders), accent strips on Card.

**Effort**: 1 day to draft the token mapping + regression test across 10 core components in Windows Edge with high-contrast toggled on.

**Risk**: low. Purely additive CSS. No breaking changes.

## 3. RTL support

**Problem**
48 physical-direction Tailwind classes (`ml-*`/`mr-*`/`pl-*`/`pr-*`/`left-*`/`right-*`) in `packages/core/src/ui/*.tsx`; zero logical equivalents (`ms-*`/`me-*`/`ps-*`/`pe-*`); zero `rtl:` modifiers. Directional icons (chevrons, arrows) do not flip. A `dir="rtl"` body produces broken Sidebar, Breadcrumb, Stepper, DropdownMenu alignment.

**Approach**

Phase 1 — codemod (2 days):
- Tailwind 4 supports logical properties via `ms-*` / `me-*` / `ps-*` / `pe-*` / `start-*` / `end-*`.
- Automated replacement of `ml-` → `ms-`, `mr-` → `me-`, `pl-` → `ps-`, `pr-` → `pe-`, `left-` → `start-`, `right-` → `end-`.
- Manual review of edge cases where physical direction is actually intended (e.g., sticky sidebars that genuinely belong on the left regardless of locale).

Phase 2 — directional icons (1 day):
- Wrap chevron/arrow icons in Breadcrumb, DropdownMenu trigger, Stepper, Accordion with `rtl:rotate-180` or conditional icon selection.
- Sheet side="left" vs "right" semantics — consider accepting `side="start" | "end"` as the logical alternative.

Phase 3 — visual regression (1 day):
- Add `dir="rtl"` parameter to Storybook globals.
- Chromatic run with RTL variants of Sidebar, Breadcrumb, Stepper, DropdownMenu, Dialog, Sheet.

**Effort**: ~4 days total. Non-breaking (logical properties are backward-compatible with LTR).

**Risk**: medium. Requires visual verification on 20+ components. Would benefit from a Chromatic secret being configured first (per memory, this is pending).

---

## Recommended ordering

1. **Forced-colors** first — 1 day, zero breaking change, purely additive. Ships in the next minor.
2. **RTL** second — 4 days, non-breaking, but needs Chromatic set up first.
3. **Variant unification** third — ~1 week + codemod, spans two minors + a major. Requires the brainstorming session on Card elevation before step 1 kicks off.

None of the three should be attempted in the same week. Do them in sequence with a week of real-world use between each.
