# v0.40+ customization axes — plan

Status: **DRAFT, awaiting approval.**

Last updated: 2026-05-25
Author: Claude (with Mudit Lal)

---

## Context

v0.39 shipped **shape presets** as the first preset-driven customization axis:

- 8 semantic radius role tokens (`--radius-control`, `--radius-surface`, etc.)
- 3 `[data-shape]` presets (`sharp` / `slightly-rounded` (default) / `rounded`)
- Pre-publish audit gate, codemod, recipes, Storybook story

That pattern — **role tokens + preset switch via data-attr + audit gate** — is reusable for every brand-affecting axis. This plan proposes the next six.

Each axis follows the same shipping template:

1. Semantic role tokens in `tokens/semantic.css`
2. `[data-<axis>]` preset blocks (3 named presets default)
3. Component CVAs reference roles, not primitives
4. Audit gate bans bare primitives in `src/**/*.tsx`
5. Re-runnable codemod under `scripts/`
6. Recipe in `docs/recipes/customize-brand.md`
7. Storybook story in `Foundations/`
8. Playground demo on `apps/site/`

---

## Proposed axes — recommended sequence

### Axis 1 — Density `[data-density]`  *(highest impact, v0.40.0)*

Brand axis: information density. Linear ships `compact`. Stripe ships `comfortable`. Notion ships `spacious`.

**Role tokens** (consumed by every padding/gap/min-height in components):

```css
--space-control-x         /* horizontal padding on buttons/inputs/menu items */
--space-control-y         /* vertical padding on buttons/inputs */
--space-stack             /* gap-between-blocks (sections) */
--space-cluster           /* gap-between-elements-in-a-row (button rows) */
--space-card-pad          /* Card / panel inner padding */
--space-page-y            /* page-level vertical rhythm */
--height-control-sm/md/lg /* control heights — Button/Input minor scale */
```

**Presets:**

```css
[data-density="compact"]      /* Linear / Vercel / dev-tool — tight */
[data-density="comfortable"]  /* DEFAULT — shadcn/Stripe/Notion sidebar */
[data-density="spacious"]     /* iOS / Notion content / consumer */
```

**Touch surface:** ~70 source files (every CVA with `px-ds-*`/`py-ds-*`/`gap-ds-*`/`h-ds-*`). Codemod-friendly.

**Why first:** stacks with shape. `sharp` + `compact` = dev-tool. `rounded` + `spacious` = consumer. Two axes unlock four corners of the brand space.

---

### Axis 2 — Border / stroke `[data-border]`  *(v0.40.0)*

Brand axis: visual weight of edges. Apple uses hairline (0.5px effective). Microsoft Fluent uses crisp 1px. Bold brand sites use 2-3px.

**Role tokens:**

```css
--border-control-width     /* Button outline, Input border, Select trigger */
--border-control-color     /* control border color */
--border-surface-width     /* Card / Panel border */
--border-surface-color
--border-overlay-width     /* Dialog / Popover border */
--border-overlay-color
--border-divider-width     /* hr, list separators */
--border-divider-color
```

**Presets:**

```css
[data-border="hairline"]   /* 0.5px / barely visible — Apple */
[data-border="default"]    /* 1px — most SaaS */
[data-border="pronounced"] /* 2px solid — bold brand */
[data-border="none"]       /* hide all borders — heavy-shadow brands */
```

**Touch surface:** ~40 files (every `border` / `border-surface-*` ref).

**Why second:** small surface, dramatic visual delta. Easy win.

---

### Axis 3 — Elevation / shadow `[data-elevation]`  *(v0.40.0)*

Brand axis: depth language. Flat (Notion/Linear) vs subtle (Stripe) vs dramatic (consumer apps with floating cards).

**Role tokens** (already exist as semantic shadows — refactor into preset-aware):

```css
--shadow-raised      /* Card resting */
--shadow-floating    /* Popover/HoverCard */
--shadow-overlay     /* Dialog/Sheet */
--shadow-pressed     /* active state inset */
```

**Presets:**

```css
[data-elevation="flat"]       /* shadow-raised = inset-only ring */
[data-elevation="subtle"]     /* DEFAULT — current values */
[data-elevation="dramatic"]   /* deeper, longer-radius blurs */
```

**Touch surface:** zero component changes — existing shadow tokens just get remapped per preset. Cheap.

---

### Axis 4 — Motion `[data-motion]`  *(v0.41.0)*

Brand axis: animation personality. Combines with `prefers-reduced-motion`.

**Role tokens** (some exist, formalize):

```css
--duration-instant
--duration-quick
--duration-standard
--duration-slow
--ease-control       /* Button press, focus ring */
--ease-overlay       /* Dialog enter/exit */
--ease-attention     /* notification, toast, badge */
```

**Presets:**

```css
[data-motion="off"]      /* all durations → 0; honors reduced-motion automatically */
[data-motion="calm"]     /* slower durations, softer eases */
[data-motion="lively"]   /* DEFAULT — current values */
```

**Touch surface:** framer-motion configs reference role tokens. Estimated ~25 files.

---

### Axis 5 — Brand archetypes `[data-archetype]`  *(v0.41.0)*

Combo bundles. Sets shape + density + border + elevation + motion in one attribute.

```css
[data-archetype="linear"]   /* sharp + compact + hairline + flat + calm */
[data-archetype="stripe"]   /* slightly-rounded + comfortable + default + subtle + lively */
[data-archetype="apple"]    /* rounded + spacious + hairline + subtle + calm */
[data-archetype="material"] /* rounded + comfortable + default + dramatic + lively */
[data-archetype="vercel"]   /* sharp + compact + default + flat + calm */
[data-archetype="notion"]   /* slightly-rounded + spacious + none + flat + calm */
```

Marketing-friendly. "Pick a vibe." Implemented purely via cascading `[data-*]` selectors in CSS — no JS.

---

### Axis 6 — Accent ramp generator (promote to public utility) *(v0.40.0 — optional)*

`generateRamp(hue, chroma)` already exists at `apps/site/lib/ramp-generator.ts`. Promote to package as:

```ts
import { generateRamp } from '@devalok/shilp-sutra/brand/generate-ramp'

const ramp = generateRamp(195, 0.18) // hue 195 = teal, chroma 0.18 = saturated
// → { light: [{ step: 1, value: 'oklch(...)' }, ...], dark: [...] }
```

Consumer takes one input color → gets full 12-step OKLCH light + dark ramp. Battle-tested in our own site's brand showcase. Pure utility. Zero new surface.

---

### Axis 7 — Component-level shape/density override prop  *(v0.42.0)*

`<Card shape="sharp">`, `<Button density="compact">`. Already partial (Button has `shape="pill"`). Generalize to allow per-component preset overrides. Useful for mixed-vibe pages (e.g. dev-tool sub-area embedded in consumer app).

**Implementation:** components read prop → emit `data-shape`/`data-density` on root element → CSS handles the rest.

---

### Axis 8 — JS theme switcher API  *(v0.42.0)*

`@devalok/shilp-sutra/theme` exports:

```ts
import { setShape, setDensity, setBorder, getCurrentTheme, useTheme } from '@devalok/shilp-sutra/theme'

setShape('rounded')              // sets data-shape on <html>, persists to localStorage
const { shape, density } = useTheme()  // React hook
```

Includes no-flash inline script generator (like `next-themes`). Solves SSR theme detection.

---

## Combined release roadmap

| Version | Axes shipping | Effort | Brand-impact |
|---|---|---|---|
| **v0.40.0** | Density (#1) + Border (#2) + Elevation (#3) + Ramp generator (#6) | High (~150 files) | Massive — unlocks 4 axes × 3 presets = 12-cell brand grid |
| **v0.41.0** | Motion (#4) + Archetypes (#5) | Medium (~35 files) | "Pick a vibe" marketing-friendly |
| **v0.42.0** | Component override prop (#7) + JS theme API (#8) | Low-medium | Power-user features |

---

## What's in this PR scope

This planning PR only writes:

- `docs/plans/2026-05-25-v040-customization-axes.md` (this file)
- `playgrounds/*.html` — interactive demos showing each axis in isolation, openable in any browser, no DS install required

No code in `packages/core` touched. Implementation lands in subsequent PRs after design approval.

---

## Playgrounds

Standalone HTML files in `playgrounds/`. Each one:

- Self-contained — single HTML file, no build, no dependencies
- Shows mock components (cards, buttons, inputs, dialogs) styled with CSS variables that mirror what the role tokens would generate
- Has a control panel to toggle preset values + a sliders for per-token overrides
- Shows live token values in a sidebar
- Includes a "copy CSS" button so you can export the active preset

Open with `open playgrounds/density-presets.html` (macOS) or just double-click on Windows.

| Playground file | Demos axis |
|---|---|
| `playgrounds/density-presets.html` | Density |
| `playgrounds/border-presets.html` | Border |
| `playgrounds/elevation-presets.html` | Elevation |
| `playgrounds/motion-presets.html` | Motion |
| `playgrounds/archetypes.html` | Combo (shape + density + border + elevation) |
| `playgrounds/ramp-generator.html` | Hue/chroma → OKLCH 12-step ramp |

---

## Decisions needed

For each axis, decide:

1. **Ship it / skip it / defer?**
2. **Preset names** — do `compact/comfortable/spacious` etc. feel right?
3. **Default values** — preserve current behaviour or shift slightly?
4. **Token names** — `--space-control-x` vs `--padding-control-x`? Bike-shed early.
5. **Versioning** — bundle into v0.40 / v0.41 / v0.42 as proposed, or different cuts?

After approval per axis, I'll write implementation PRs the same way I did for shape presets:

- Role tokens
- Preset blocks
- Component migration via codemod
- Audit gate update
- Recipe doc
- Storybook story
- Site `/theming` switcher integration
- Changeset

---

## Risks / things to watch

- **Token explosion** — each axis adds 5-10 role tokens. By v0.42 we'd have ~50 role tokens. Cognitive load on consumers grows. Mitigate via archetypes (one attribute sets all).
- **Visual regression sprawl** — Chromatic visual tests grow exponentially with preset combinations. May need to test only `default` baseline + spot-check named archetypes, not every combination.
- **Documentation maintenance** — every new axis touches MIGRATION, llms-full, customize-brand, Foundations.mdx. Tooling that auto-generates this from token sources would help. Consider a `scripts/build-token-docs.mjs` pass.
- **Density × component-size variants** — components already have `size="sm|md|lg"` axes. Density adds another scaling dimension. Need to decide: does `density="compact" + size="lg"` produce different sizes than `density="comfortable" + size="md"`? Probably yes (they multiply), but design the math up front.
- **Performance** — every `[data-*]` selector adds CSS specificity. Many cascading attrs could create selector-explosion. Audit CSS bundle size after each axis lands.
