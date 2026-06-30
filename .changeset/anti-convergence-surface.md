---
"@devalok/shilp-sutra": minor
---

Anti-convergence surface & elevation pass — components no longer stack a visible border and a drop shadow on the same element (the DS's own make-kit Guidelines rule #6: the shadow tokens already carry a 1px ring).

**BREAKING — `StatCard` `accent` prop removed.** The colored left-rail (`accent="success" | "error" | …`) is gone (it was the single most recognizable AI design tell — an accent rail on a rounded, shadowed card). Replace with the new accent system, or drop it (the `delta` already carries trend direction + colour):

```diff
- <StatCard label="Revenue" value="$48k" accent="success" />
+ <StatCard label="Revenue" value="$48k" accentStyle="tint" />
+ <StatCard label="Revenue" value="$48k" icon={<IconCurrencyDollar />} accentStyle="icon" />
```

**New — `StatCard` surface, accent & motion (all composable, all opt-in):**

- `surface="raised" | "flat"` (default `raised`) — elevation-led (ring-in-shadow, no border) or border-led (border, no shadow).
- `accentStyle="none" | "icon" | "tint"` (default `none`) + `iconFill="soft" | "solid"`.
- `flash` + `flashSpeed` — opt-in entrance animation: a toned state glyph (`'up' | 'down' | 'goal' | 'record' | 'alert' | 'live'`, or `{ tone, icon }`) flashes, then settles to the metric's `icon`. Gated by `prefers-reduced-motion`.

**New — `StatFlash` component.** The state→identity flash primitive used by StatCard's `flash`, exported standalone for use in list rows, badges, etc. Composable speed (`speed` preset + `holdMs` / `settleTransition` / `flashTransition` overrides).

**Visual changes (non-breaking):**

- Overlays (Dialog, AlertDialog, Popover, HoverCard, Dropdown/Context/Menubar menus, Select, Combobox, Autocomplete, NavigationMenu, Toast, ColorInput picker, SplitButton menu, DataTable bulk actions, floating Sidebar) drop their explicit `border`; the shadow's own ring carries the edge. `--shadow-floating` / `--shadow-overlay` ring strengthened (0.04 → 0.09); dark mode uses a light ring via the new `--shadow-edge-ring` token.
- `Card` `default` / `elevated` are now ring-in-shadow (no border). Use `variant="outline"` for a border-led card.
- `StatCard` base no longer stacks border + shadow.
- `InputOTP` cells are border-led (dropped the redundant `shadow-raised`).
