# Customize: Brand & Tokens

Override colors, radius, fonts, and spacing without forking the package. All customization happens through CSS custom properties — no JS configuration.

## The fast path: use the Themer

Before hand-writing variables, try **[shilp-sutra.devalok.in/themer](https://shilp-sutra.devalok.in/themer)**. It is one funnel with four entry doors:

- **Pick an archetype** — Linear, Stripe, Apple, Material, Notion, Vercel, or Devalok. Click → result page.
- **Use my brand color** — paste a hex or dial OKLCH. Auto-generates the 12-step ramp and suggests an archetype.
- **Walk me through it** — five-question wizard composes the answers into a theme.
- **Just exploring** — land on a sample result page to see what you ship away with.

Every door drops you at the same result screen: a copy-pasteable CSS block (role tokens + 12-step OKLCH accent ramp), install commands for your package manager, and a share URL that encodes the theme.

Paste the snippet into your global stylesheet *after* the `@import "@devalok/shilp-sutra/css";` line. That's the whole flow — no `tailwind.config.ts`, no theme provider, no JS bundle.

The rest of this doc covers what to do if the Themer doesn't expose a token you need to override (font stack, spacing scale, focus ring) — fall through to the hand-written cases below.

## How tokens layer

Shilp Sutra's tokens are organized in three tiers:

1. **Primitives** (`primitives.css`) — raw OKLCH palette values. Private. You should not need to touch these.
2. **Semantic** (`semantic.css`) — intent-based mappings (`--color-accent-9`, `--color-surface-2`, `--font-sans`). Public, exposed to Tailwind 4's `@theme`.
3. **Utility output** — Tailwind generates classes (`bg-accent-9`, `text-surface-fg`, `font-sans`) from the semantic layer.

To override a token, redefine it AFTER the design-system import. The cascade does the rest.

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

@theme {
  /* Overrides go here */
  --color-accent-9: oklch(0.55 0.22 195);
}
```

`@theme` is the Tailwind 4 directive that registers a CSS variable AND auto-generates the matching utility (so `bg-accent-9` picks up the override).

## Common overrides

### Change the accent color

The accent scale runs from `--color-accent-1` (lightest) to `--color-accent-12` (darkest). Step 9 is the saturated default-button background, step 11 is on-tint text.

To swap to teal:

```css
@theme {
  --color-accent-1: oklch(0.985 0.005 195);
  --color-accent-2: oklch(0.96 0.012 195);
  --color-accent-3: oklch(0.92 0.025 195);
  --color-accent-4: oklch(0.88 0.04 195);
  --color-accent-5: oklch(0.82 0.07 195);
  --color-accent-6: oklch(0.74 0.10 195);
  --color-accent-7: oklch(0.66 0.14 195);
  --color-accent-8: oklch(0.60 0.17 195);
  --color-accent-9: oklch(0.54 0.22 195);
  --color-accent-10: oklch(0.49 0.21 195);
  --color-accent-11: oklch(0.42 0.16 195);
  --color-accent-12: oklch(0.20 0.05 195);
}

.dark {
  --color-accent-9: oklch(0.62 0.21 195);
  /* ...override remaining steps for dark mode */
}
```

For a quick swap without redoing the full scale, only override step 9 (background) and step 11 (foreground). Other steps will still reference the original chroma — visually mismatched but functional.

### Shape presets (`[data-shape]`)

The simplest way to change roundness for the whole UI is to set a `data-shape` attribute on the document (or any subtree). Three presets ship by default — `sharp`, `slightly-rounded` (the default if no attribute), and `rounded`. Pill shapes (Badge, Switch, Slider, Avatar circle) stay pill in every preset.

```html
<!-- Whole-app, sharp/technical feel -->
<html data-shape="sharp">

<!-- Whole-app, soft/consumer feel -->
<html data-shape="rounded">
```

You can scope it to a subtree if a particular section wants different shape language than the rest:

```tsx
<div data-shape="sharp">
  <DeveloperConsole />
</div>
```

Visual feel:

| Preset | Identity | Comparable to |
|---|---|---|
| `sharp` | Technical, precise, "serious software" | Vercel, Linear, terminal UIs |
| `slightly-rounded` (default) | Modern SaaS neutral | shadcn default, Stripe, Notion sidebar |
| `rounded` | Friendly, soft, consumer | iOS, Notion content, modern startup landings |

### Custom radius — override a role token

If a preset doesn't fit, you can override any semantic radius role token directly. Components reference these role tokens (not the primitive scale), so a single override propagates everywhere.

```css
/* Tighten controls only; leave overlays / surfaces alone */
:root {
  --radius-control: 4px;
}

/* Or scoped to a subtree */
.checkout {
  --radius-control: 8px;
  --radius-surface: 20px;
}
```

The role tokens (defaults shown — the "slightly-rounded" preset):

| Token                    | Default | Used by |
|--------------------------|---------|---------|
| `--radius-control`       | 6px     | Button, Input, Select, Tabs trigger, Toggle, Code block |
| `--radius-control-inner` | 2px     | Checkbox box, ±/close buttons, inline Code |
| `--radius-surface`       | 10px    | Card, Alert, Accordion |
| `--radius-overlay-sm`    | 6px     | Tooltip, Toast |
| `--radius-overlay`       | 10px    | Popover, HoverCard, DropdownMenu / ContextMenu / Menubar content, listboxes |
| `--radius-overlay-lg`    | 16px    | Dialog, AlertDialog, Sheet, BottomSheet, ColorInput picker |
| `--radius-pill`          | 9999px  | Badge, StatusDot, Radio, Switch, Slider, Progress, Avatar circle |
| `--radius-bubble`        | 24px    | ChatMessage bubble |

### Build your own preset

Define your own `[data-shape="…"]` block and swap to it whenever you want:

```css
[data-shape="brand-soft"] {
  --radius-control:        8px;
  --radius-control-inner:  3px;
  --radius-surface:        14px;
  --radius-overlay-sm:     8px;
  --radius-overlay:        14px;
  --radius-overlay-lg:     20px;
  --radius-pill:           9999px;
  --radius-bubble:         28px;
}
```

```html
<html data-shape="brand-soft">
```

### Change the primitive radius scale (advanced)

If you're rebuilding the entire system rather than just rebranding, you can also override the primitive scale that the role tokens reference:

```css
@theme {
  --radius-ds-sm: 0.25rem;
  --radius-ds-md: 0.5rem;
  --radius-ds-lg: 0.75rem;
  --radius-ds-xl: 1rem;
  --radius: 0.5rem;          /* unsuffixed — generates bare `rounded` */
}
```

Most consumers should NOT touch this — overriding the role tokens above is the cleaner path.

### Change fonts

The design system uses three font families, each backed by a CSS variable:

- `--font-sans` — Inter (body)
- `--font-display` — Ranade (headings)
- `--font-mono` — JetBrains Mono (code)

To swap with `next/font`:

```tsx
// app/layout.tsx (Next.js App Router)
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const fontDisplay = Plus_Jakarta_Sans({ subsets: ["latin"], weight: "700", variable: "--font-display" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

For Vite/Remix/Astro/TanStack, drop the `@font-face` declarations into the global CSS and override the variables:

```css
@font-face {
  font-family: "Plus Jakarta Sans";
  src: url("/fonts/PlusJakartaSans-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

@theme {
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

### Change the spacing scale

The DS spacing scale runs `--spacing-ds-00` (0) to `--spacing-ds-12` (highest). Each step roughly doubles. The Tailwind classes are `p-ds-04`, `m-ds-08`, `gap-ds-03`, etc.

```css
@theme {
  --spacing-ds-00: 0;
  --spacing-ds-01: 0.125rem;
  --spacing-ds-02: 0.25rem;
  --spacing-ds-03: 0.5rem;
  --spacing-ds-04: 0.75rem;
  --spacing-ds-05: 1rem;
  /* etc. */
}
```

Most consumers should not touch this. The DS scale is tuned for the typography rhythm; changing one step without re-tuning typography looks visually off.

### Change a single shadow

```css
@theme {
  --shadow-raised: 0 1px 2px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04);
}
```

Available shadows: `--shadow-raised`, `--shadow-overlay`, `--shadow-floating`, `--shadow-brand`. Each is a multi-layer composite — overriding one without considering its layers usually produces flat-looking shadows.

## Light + dark in lockstep

Every override should consider both modes. Pattern:

```css
@theme {
  --color-accent-9: oklch(0.54 0.22 195);
  --color-accent-fg: oklch(0.99 0 0);
}

/* Dark mode override */
.dark {
  --color-accent-9: oklch(0.62 0.21 195);
  --color-accent-fg: oklch(0.10 0 0);
}
```

`.dark` is a regular class selector — its specificity is higher than `:root`/`@theme` body, so dark-mode overrides win when the class is active.

## High contrast (`[data-contrast]`)

WCAG 2.2 SC 1.4.11 asks for **3:1** between a control's edge and its background.
The default control edge here is **2.00:1** in light and **2.08:1** in dark — a
deliberately softer look, and deliberately under that bar. It is recorded as
`CONTROL-EDGE-BELOW-AA` in the deviations register.

Set `data-contrast="high"` to opt into edges that clear the threshold:

```html
<!-- whole app -->
<html data-contrast="high">
```

```tsx
{/* or one region — a data-entry screen inside an otherwise soft product */}
<div data-contrast="high">
  <InvoiceForm />
</div>
```

| | control edge, light | control edge, dark |
|---|---|---|
| default | `#b7b7b7` — 2.00:1 | `#4c4c4c` — 2.08:1 |
| `data-contrast="high"` | `#868686` — **3.64:1** | `#767676` — **3.93:1** |

It affects Input, Textarea, Select, Combobox, Checkbox, Radio, Switch,
NumberInput and outlined Button — anything using the control-edge tier. It does
**not** touch decorative borders (card and panel hairlines stay soft), and it
does not touch the chromatic ramps, so an outlined Button on a colour is
unchanged.

Composes with everything else — it is a plain attribute, like `.dark` and
`data-shape`:

```html
<html class="dark" data-shape="sharp" data-contrast="high">
```

**Two things worth knowing.**

If you override the neutral ramp, high contrast follows automatically — the
block resolves `--neutral-8` / `--neutral-9` by name rather than hard-coding
hexes, so a rebrand gets a correctly-scaled high-contrast mode for free.

If you want the *opposite* — compliant edges everywhere, with no attribute to
remember — set the tokens directly and skip the attribute entirely:

```css
:root {
  --color-surface-border-interactive:        var(--neutral-8);
  --color-surface-border-interactive-strong: var(--neutral-9);
}
```

That is worth considering. A default is what most products ship, so leaving the
attribute unset means shipping the edge that misses 1.4.11.

## Forced colors (Windows high-contrast)

If you override semantic colors, the `@media (forced-colors: active)` block in `semantic.css` continues to remap to system keywords. Your override is ignored when the user is in high-contrast mode — this is the correct behavior.

If you need a custom forced-colors mapping, override inside `@media (forced-colors: active)`:

```css
@media (forced-colors: active) {
  :root {
    --color-accent-9: Highlight;
    --color-accent-fg: HighlightText;
  }
}
```

## Per-route theming

Apply a class on a wrapper element to scope token overrides:

```css
.theme-karm {
  --color-accent-9: oklch(0.55 0.22 195);
}
.theme-karm.dark,
.dark .theme-karm {
  --color-accent-9: oklch(0.62 0.21 195);
}
```

Then:

```tsx
<div className="theme-karm">
  <Button>Karm-themed</Button>
</div>
```

## What you cannot override via CSS variables

- The component DOM structure (use the `asChild` pattern or wrap the component to insert)
- The vendored Radix primitives' behavior
- Animation keyframes (override the `--animate-*` references via `@theme` — but the keyframe definitions themselves are package-private)

For deeper changes, fork the source or use the `className` prop with arbitrary Tailwind utilities to layer styling on top.

## Verifying an override

Open DevTools, inspect a component, and check the Computed tab for the variable's resolved value. The cascade origin column shows where the value came from — your override should appear there, not the package's default.

If the override isn't winning, check:

1. The `@theme` override comes AFTER `@import "@devalok/shilp-sutra/css";` in source order
2. There's no `!important` in the package overriding you (there isn't — file an issue if you find one)
3. The selector specificity matches the target (`.dark` class is on a parent of the inspected element, etc.)
