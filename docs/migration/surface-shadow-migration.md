# Surface & Shadow Token Migration Guide

## Overview

Starting with `@devalok/shilp-sutra@0.23.0`, the design system replaces numeric surface and shadow tokens with **semantic names** that describe purpose rather than position in a hierarchy.

The old system used numbered tokens (`surface-1` through `surface-4`, `shadow-01` through `shadow-05`) which required memorizing what each number meant. The new system uses descriptive names (`surface-base`, `surface-raised`, `shadow-floating`, `shadow-overlay`) that tell you what the token is for. This makes code more readable and helps AI agents and new contributors pick the correct token without consulting a lookup table.

**Backward compatibility:** Old CSS custom properties (`--color-surface-1`, `--shadow-01`, etc.) are preserved as aliases in `semantic.css`. Old Tailwind classes (`bg-surface-1`, `shadow-01`) also still resolve correctly via the preset. However, the pre-publish audit now flags old names in component source files, and they will be removed in a future major version.

---

## Complete Find-Replace Table

### Surface Classes

| Old Class | New Class | When to Use |
|-----------|-----------|-------------|
| `bg-surface-1` | `bg-surface-base` | Page background |
| `bg-surface-1` | `bg-surface-sunken` | Shell chrome (sidebar, topbar), board columns, recessed wells |
| `bg-surface-1` | `bg-surface-overlay` | Dialogs, popovers, dropdowns, inputs, floating elements |
| `bg-surface-2` | `bg-surface-raised` | Cards, widgets, panels |
| `bg-surface-3` | `bg-surface-raised-hover` | Hover states on raised elements |
| `bg-surface-4` | `bg-surface-raised-active` | Active/pressed states |
| (new) | `bg-surface-inverted` | Tooltips, inverted badges |
| (new) | `bg-surface-disabled` | Disabled elements |

**Border, text, ring variants follow the same pattern:**

| Old | New |
|-----|-----|
| `border-surface-1` | `border-surface-base` |
| `border-surface-2` | `border-surface-raised` |
| `border-surface-3` | `border-surface-raised-hover` |
| `border-surface-4` | `border-surface-raised-active` |
| `text-surface-1` | `text-surface-base` |
| `text-surface-2` | `text-surface-raised` |
| `ring-surface-1` | `ring-surface-base` |
| `ring-surface-2` | `ring-surface-raised` |

### Shadow Classes

| Old Class | New Class | Notes |
|-----------|-----------|-------|
| `shadow-01` | `shadow-raised` | Cards, buttons |
| `shadow-02` | `shadow-raised-hover` | Hover lift on cards |
| `shadow-03` | `shadow-floating` | Popovers, menus, tooltips |
| `shadow-04` | `shadow-overlay` | Dialogs, sheets |
| `shadow-05` | (removed) | Was unused; use `shadow-overlay` instead |
| (new) | `shadow-glow` | Selection/focus accent glow |
| (new) | `shadow-inset` | Toggle/segmented track deboss |
| (new) | `shadow-ring` | Focus ring (2px accent ring) |
| (new) | `shadow-ring-sm` | Subtle separator (1px border ring) |

### New Tokens (No Predecessor)

| Token | Purpose |
|-------|---------|
| `bg-surface-sunken` | Recessed areas: sidebar, topbar, board columns, segmented track |
| `bg-surface-overlay` | Floating elements: dialogs, popovers, dropdowns, inputs |
| `bg-surface-inverted` / `text-surface-inverted-fg` | Tooltips, inverted UI elements |
| `bg-surface-disabled` / `text-surface-fg-disabled` | Disabled elements |
| `border-surface-border-subtle` | Hairline dividers, subtle separators |
| `bg-backdrop` | Dialog/sheet backdrop overlay color |
| `shadow-glow` | Selection/focus accent glow |
| `shadow-inset` | Toggle/segmented track deboss |
| `shadow-ring` / `shadow-ring-sm` | Focus ring / subtle separator |

---

## Before/After Code Examples

### 1. Card Component

**Before:**
```tsx
<div className="bg-surface-2 rounded-ds-lg shadow-01 p-ds-05">
  <h3 className="text-surface-fg">Card Title</h3>
  <p className="text-surface-fg-muted">Description</p>
</div>
```

**After:**
```tsx
<div className="bg-surface-raised rounded-ds-lg shadow-raised p-ds-05">
  <h3 className="text-surface-fg">Card Title</h3>
  <p className="text-surface-fg-muted">Description</p>
</div>
```

### 2. Dialog / Modal

**Before:**
```tsx
<div className="bg-surface-1 rounded-ds-xl shadow-04 p-ds-06">
  <h2>Edit Profile</h2>
  <p>Make changes to your profile.</p>
</div>
```

**After:**
```tsx
<div className="bg-surface-overlay rounded-ds-xl shadow-overlay p-ds-06">
  <h2>Edit Profile</h2>
  <p>Make changes to your profile.</p>
</div>
```

### 3. Sidebar / Shell Chrome

**Before:**
```tsx
<aside className="bg-surface-1 border-r border-surface-border h-full">
  <nav>...</nav>
</aside>
```

**After:**
```tsx
<aside className="bg-surface-sunken border-r border-surface-border-subtle h-full">
  <nav>...</nav>
</aside>
```

### 4. Input with Focus State

**Before:**
```tsx
<input className="bg-surface-1 border border-surface-border rounded-ds-md
  focus:ring-2 focus:ring-accent-7 focus:border-accent-7" />
```

**After:**
```tsx
<input className="bg-surface-overlay border border-surface-border rounded-ds-md
  focus:shadow-ring focus:border-accent-7" />
```

### 5. Toast Notification

**Before:**
```tsx
<div className="bg-surface-1 shadow-03 rounded-ds-lg border border-surface-border p-ds-04">
  <span className="text-surface-fg">Changes saved!</span>
</div>
```

**After:**
```tsx
<div className="bg-surface-overlay shadow-floating rounded-ds-lg p-ds-04">
  <span className="text-surface-fg">Changes saved!</span>
</div>
```

---

## Component Decision Matrix

Use this table to determine which surface/shadow combination to apply:

| Building a... | Surface | Shadow | Border |
|---------------|---------|--------|--------|
| Page / layout | `surface-base` | none | none |
| Shell chrome (sidebar, topbar) | `surface-sunken` | `shadow-raised` | `border-subtle` (dividers) |
| Card / widget / panel | `surface-raised` | `shadow-raised` | none (ring in shadow) |
| Card flat/outline variant | `surface-raised` | none | `border-default` or `border-strong` |
| Interactive card hover | `surface-raised` (unchanged) | `shadow-raised-hover` | none |
| Board column / well | `surface-sunken` | none | none |
| Popover / menu / dropdown | `surface-overlay` | `shadow-floating` | none (ring in shadow) |
| Dialog / modal / sheet | `surface-overlay` | `shadow-overlay` | none (ring in shadow) |
| Tooltip | `surface-inverted` | `shadow-floating` | none |
| Toast / notification | `surface-overlay` | `shadow-floating` | none |
| Input control (rest) | `surface-overlay` | none | `border-default` |
| Input control (hover) | `surface-overlay` | none | `border-strong` |
| Input control (focus) | `surface-overlay` | `shadow-ring` | `border-accent` |
| Input control (error) | `surface-overlay` | none | `border-destructive` |
| Button (solid) | accent colors | `shadow-raised` | none |
| Button (ghost/outline) | transparent | none | `border-default` |
| Button (disabled) | `surface-disabled` | none | `border-subtle` |
| Segmented track | `surface-sunken` | `shadow-inset` | none |
| Selected item | current surface | `shadow-glow` | none |
| Dragging item | `surface-raised` | `shadow-overlay` | none |

**Hard rule: never combine explicit border + shadow ring.** Every shadow level includes a `0 0 0 1px` ring layer. Adding a CSS `border` on the same element creates a 2px edge (1px ring + 1px border). Choose one or the other, never both:
- Has shadow -> no border (ring provides the edge)
- No shadow -> use border (flat/outline variants, inputs)

---

## CSS Variable Changes

For consumers using CSS custom properties directly (not Tailwind classes):

### Surface Variables

| Old Variable | New Variable | Notes |
|-------------|-------------|-------|
| `--color-surface-1` | `--color-surface-base` | Deprecated alias still works |
| `--color-surface-2` | `--color-surface-raised` | Deprecated alias still works |
| `--color-surface-3` | `--color-surface-raised-hover` | Deprecated alias still works |
| `--color-surface-4` | `--color-surface-raised-active` | Deprecated alias still works |

### New CSS Variables (no predecessor)

| Variable | Purpose |
|----------|---------|
| `--color-surface-sunken` | Shell chrome, board columns |
| `--color-surface-overlay` | Floating elements (diverges in dark mode) |
| `--color-surface-inverted` | Inverted background (tooltip, dark badge) |
| `--color-surface-inverted-fg` | Foreground text on inverted surface |
| `--color-surface-disabled` | Disabled element background |
| `--color-surface-fg-disabled` | Disabled element text |
| `--color-surface-border-subtle` | Hairline dividers |
| `--color-backdrop` | Dialog/sheet backdrop overlay |

### Shadow Variables

| Old Variable | New Variable | Notes |
|-------------|-------------|-------|
| `--shadow-01` | `--shadow-raised` | Deprecated alias still works |
| `--shadow-02` | `--shadow-raised-hover` | Deprecated alias still works |
| `--shadow-03` | `--shadow-floating` | Deprecated alias still works |
| `--shadow-04` | `--shadow-overlay` | Deprecated alias still works |

### New Shadow Variables

| Variable | Purpose |
|----------|---------|
| `--shadow-color` | Shadow tint base (light: neutral, dark: darker) |
| `--shadow-strength` | Shadow opacity multiplier (light: 1, dark: 2) |
| `--shadow-transition` | Standard shadow transition timing |
| `--shadow-glow` | Selection/focus accent glow |
| `--shadow-inset` | Toggle/segmented track deboss |
| `--shadow-ring` | Focus ring (2px accent) |
| `--shadow-ring-sm` | Subtle separator (1px border) |

---

## Breaking Changes

1. **`shadow-05` removed.** It was unused in any component. If you referenced it, use `shadow-overlay` instead.

2. **AvatarGroup `borderColor` prop.** Still accepts old values (`"surface-1"`, `"surface-2"`) but new semantic values are recommended. The prop maps the old values to their semantic equivalents internally.

3. **Pre-publish audit.** The audit script now flags any `.tsx` file using old numeric surface/shadow classes (`bg-surface-1`, `shadow-01`, etc.). This is enforced for the design system source code; consumer apps are not affected by this script.

4. **Consumers extending the Tailwind preset.** If your app has custom classes that reference old token names directly (e.g., `bg-surface-2` in your own components), update them to the semantic equivalents. The aliases will continue to work for now but will be removed in a future major version.

---

## Migration Steps for Consumer Apps

1. **Find and replace** old Tailwind classes using the tables above. Most replacements are 1:1, except `bg-surface-1` which splits into three semantic tokens depending on context (base, sunken, overlay).

2. **Review the decision matrix** for any `bg-surface-1` usages to determine the correct replacement:
   - Page background -> `bg-surface-base`
   - Sidebar/topbar -> `bg-surface-sunken`
   - Dialog/popover/input -> `bg-surface-overlay`

3. **Replace shadow classes**: `shadow-01` -> `shadow-raised`, `shadow-02` -> `shadow-raised-hover`, etc.

4. **Audit border + shadow combinations**: If any element has both an explicit `border-*` class and a `shadow-*` class, remove the border (the shadow includes a ring layer).

5. **Test dark mode**: The new `surface-overlay` token diverges from `surface-base` in dark mode (it's slightly lighter), which is correct for floating UI. Verify dialogs and popovers look correct in both light and dark mode.
