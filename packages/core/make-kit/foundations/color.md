# Color

The kit ships an OKLCH 12-step ramp per color family (`1`=app-bg, `9`=solid/accent, `12`=hi-contrast text) plus semantic role tokens that map onto those steps. **Use the semantic role.** Reach for the numeric step only when authoring custom states.

## Philosophy

- ~90% of surfaces should be neutral. Accent is for the primary CTA and ~1 emphasis per screen.
- Never write hex / rgb / hsl. Never use Tailwind's stock palette utilities (`text-zinc-*`, `bg-blue-*`). They don't dark-mode-flip, they aren't themable.
- Status color (error / success / warning / info) is reserved for state communication, not for decoration.

## Decision tree — "what color do I use?"

```
Surface (background of a region)?
  → page bg                → bg-surface-base
  → card / widget / panel  → bg-surface-panel
  → sidebar / topbar       → bg-surface-sunken
  → dialog / popover / dropdown / input → bg-surface-overlay
  → tooltip                → bg-surface-inverted
  → disabled control       → bg-surface-disabled

Text on a surface?
  → primary body / heading → text-fg
  → secondary / metadata   → text-fg-muted
  → tertiary / hint        → text-fg-subtle
  → on inverted bg         → text-surface-inverted-fg
  → on accent-9 / solid    → text-accent-fg
  → on error / success / warning / info solid → text-{error|success|warning|info}-fg

Border?
  → standard hairline      → border-surface-border
  → emphasized             → border-surface-border-strong
  → subtle divider         → border-surface-border-subtle
  → state (form invalid)   → border-error-8 (or use Input state="error" instead)

Status?
  → error    → bg-error-3 / text-error-11 / border-error-7
  → success  → bg-success-3 / text-success-11 / border-success-7
  → warning  → bg-warning-3 / text-warning-11 / border-warning-7
  → info     → bg-info-3 / text-info-11 / border-info-7

Brand emphasis?
  → primary CTA           → use <Button> default (no className needed)
  → small accent tint     → bg-accent-3 / text-accent-11
  → link                  → text-link (auto-handles hover + visited)
```

## Semantic surface tokens

| Token | Use |
|---|---|
| `surface-base` | Page background. The "back wall" of the app. |
| `surface-panel` | Cards, widgets, panels, anything that sits **on** the page. |
| `surface-panel-hover` | Hover state on a `surface-panel` element. |
| `surface-panel-active` | Pressed / active state. |
| `surface-sunken` | Shell chrome (sidebar, topbar), board columns, segmented-control tracks. |
| `surface-overlay` | Floating layers — dialogs, popovers, dropdowns, inputs, toasts. |
| `surface-inverted` | Tooltips, inverted badges. Pair with `surface-inverted-fg`. |
| `surface-disabled` | Disabled controls. Pair with `surface-fg-disabled`. |
| `field` | Ground for a form control — Input, Textarea, Select, Combobox. Not a surface tier: the control is defined by its border, so the fill sits flush with whatever it is on. |
| `field-hover` | Hover state on a form control. |

Available as: `bg-surface-*`, `text-surface-*`, `border-surface-*`.

See `foundations/surfaces.md` for elevation rules and the shadow pairing matrix.

## Foreground / text tokens

| Token | Use |
|---|---|
| `text-fg` | Primary body + headings. |
| `text-fg-muted` | Secondary content, metadata, helper text. |
| `text-fg-subtle` | Tertiary content, placeholder text. |
| `text-surface-inverted-fg` | Text on `surface-inverted`. |
| `text-accent-fg` | Text on `bg-accent-9` (solid brand). |
| `text-{error\|success\|warning\|info}-fg` | Text on the solid color background. Brand-swap safe. |
| `text-link` | Anchor color (auto-hover + visited). |

## Border tokens

| Token | Use |
|---|---|
| `border-surface-border` | Default 1px line. |
| `border-surface-border-strong` | Emphasized line — section dividers, table headers. |
| `border-surface-border-subtle` | Hairline, lower contrast than default. |

## Accent ramp (12 steps)

Available as `accent-1` … `accent-12`. Apply via `bg-accent-N`, `text-accent-N`, `border-accent-N`. Steps map to roles:

| Step | Role |
|---|---|
| 1 | App background tint |
| 2 | Subtle background |
| 3 | Component background (e.g. soft Button rest) |
| 4 | Hover bg |
| 5 | Active / pressed bg |
| 6 | Border subtle |
| 7 | Border default |
| 8 | Border strong |
| 9 | Solid fill (primary CTA, badge solid) |
| 10 | Solid hover |
| 11 | Lo-contrast text |
| 12 | Hi-contrast text |

The same 12-step pattern repeats for `error-*`, `success-*`, `warning-*`, `info-*` (subset: 2, 3, 4, 5, 6, 7, 9, 10, 11).

## Component `color` prop — support matrix

The `color` prop accepts a different set per component, because each serves a different job. **The shared intent set — safe to pass to all three from one token — is `accent` · `error` · `success` · `warning` · `info` · `neutral`.**

| color | Button | Card | Badge |
|---|:---:|:---:|:---:|
| `accent` | ✅ | ✅ | ✅ |
| `error` | ✅ | ✅ | ✅ |
| `success` | ✅ | ✅ | ✅ |
| `warning` | ✅ | ✅ | ✅ |
| `info` | ✅ | ✅ | ✅ |
| `neutral` | ✅ | ✅ | ✅ |
| `default` | — | ✅ | ✅ |
| `teal` `amber` `slate` `indigo` `cyan` `orange` `emerald` | — | — | ✅ |
| `custom` (`--badge-color`) | — | — | ✅ |

- **Button / Card** carry the six **semantic intents** — they communicate *state or emphasis* (a destructive action, a warning panel). That set is aligned across both.
- **Badge** adds a **category palette** (`teal`, `amber`, `indigo`, …) plus `custom`, because badges label/categorize many peer items where hue is a taxonomy, not a status. Those category hues are intentionally **not** on Button/Card — a "teal primary button" would read as an intent that doesn't exist.
- To tint a Card + Badge + Button set from one variable, constrain the token to the shared intent set above.

## Theming — never hardcode

Consumers swap the accent by overriding `--color-accent-1` through `--color-accent-12` in a `:root { }` block placed **after** the kit's CSS import. Dark mode is derived algorithmically — no separate dark overrides needed.

```css
/* In consumer's global.css, after @import "@devalok/shilp-sutra/css"; */
:root {
  --color-accent-9: oklch(0.55 0.18 230); /* swap brand to blue */
  /* … the kit will compute related steps via OKLCH curves */
}
```

## Rules

- **Never** `bg-white` / `bg-black` / `bg-zinc-*` / `bg-pink-*`. Use semantic tokens.
- **Never** put a color directly on a Button via className. Set `color="error"` (or whichever).
- **Never** combine `border-*` and `shadow-*` tokens — shadow tokens contain a ring layer.
- **Never** use `text-fg` on `bg-accent-9`. Use `text-accent-fg` (brand-swap safe).
- **Never** invent step numbers. Steps 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12 exist. Step 8 exists only on accent / neutral.

## Forced-colors / Windows high-contrast

The kit auto-remaps every semantic color to system keywords (`Canvas`, `CanvasText`, `Highlight`, `LinkText`, `GrayText`) under `@media (forced-colors: active)`. As long as you use semantic tokens, high-contrast mode just works. Hardcoded hex breaks it.
