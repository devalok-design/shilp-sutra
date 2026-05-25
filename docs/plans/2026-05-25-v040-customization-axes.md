# v0.40+ customization axes — plan (v2)

Status: **DRAFT, awaiting approval.**

Last updated: 2026-05-25 (rev 2 — expanded after gap audit)
Author: Claude (with Mudit Lal)

---

## Context

v0.39 shipped **shape presets** as the first preset-driven customization axis (8 semantic radius role tokens + 3 `[data-shape]` presets + pre-publish audit gate + codemod + recipes + Storybook story).

The pattern — **role tokens + preset switch via data-attr + audit gate** — is reusable for every brand-affecting axis. This plan covers the full set across v0.40 → v1.0 and reframes the API around **brand archetypes as the primary surface**, with individual axes as power-user escape hatches.

Each axis follows the same shipping template:

1. Semantic role tokens in `tokens/semantic.css`
2. `[data-<axis>]` preset blocks (3-4 named presets default)
3. Component CVAs reference roles, not primitives
4. Audit gate bans bare primitives
5. Re-runnable codemod under `scripts/`
6. Recipe in `docs/recipes/customize-brand.md`
7. Storybook story in `Foundations/`
8. Playground demo at `playgrounds/<axis>.html`
9. Site `/theming` integration

---

## The reframe — archetypes-first, axes as escape hatch

**Original framing (rev 1):** consumers pick six independent axes.
**Problem:** six axes × three-to-four presets each = 720+ combinations. Most incoherent. Decision paralysis.

**New framing (rev 2):**

1. **Archetypes are the front door.** 80% of consumers pick one — `linear`, `stripe`, `apple`, `material`, `notion`, `vercel`, `devalok` — and never touch individual axes.
2. **Individual axes are the escape hatch.** Override one axis at a time within an archetype: `<html data-archetype="stripe" data-density="compact">`.
3. **Themer Wizard is the on-ramp.** 5-question flow that walks consumers from "I have no idea what I want" to "here's your archetype + the tweaks." Outputs copy-pasteable CSS.

### Cascading data-attrs

CSS specificity handles layering:

```css
:root { /* default */ }
[data-archetype="apple"] { /* apple wins */ }
[data-archetype="apple"][data-density="compact"] { /* density override wins */ }
[data-density="compact"] { /* density wins if no archetype */ }
```

---

## Proposed axes — full set

### Category A — Form (visual shape and weight)

#### Axis 1 — Shape `[data-shape]` ✓ SHIPPED in v0.39

#### Axis 2 — Density `[data-density]`  **v0.40**
compact / comfortable / spacious. Role tokens: `--space-control-x/y`, `--space-stack`, `--space-cluster`, `--space-card-pad`, `--space-page-y`, `--height-control-sm/md/lg`.

#### Axis 3 — Border `[data-border]`  **v0.40**
hairline / default / pronounced / none. Role tokens: `--border-{control,surface,overlay,divider}-{width,color}`.

#### Axis 4 — Elevation `[data-elevation]`  **v0.40**
flat / subtle / dramatic. Role tokens already exist semantically — remap per preset.

---

### Category B — Voice (typography + color)

#### Axis 5 — Typography `[data-typography]`  **v0.40**
dense / default / editorial. Role tokens: `--text-{display,heading,body,label,caption}-size`, `--leading-{display,heading,body}`, `--text-scale-ratio`, `--tracking-{display,body}`.

#### Axis 6 — Type weight `[data-type-weight]`  **v0.40**
light / default / bold. Role tokens: `--weight-{body,heading-display,heading-content,action,emphasis}`.

#### Axis 7 — Accent saturation `[data-saturation]`  **v0.40**
muted / default / vibrant. Multiplies chroma via `--saturation-multiplier`.

#### Axis 8 — Accent ramp generator (utility)  **v0.40**
Promote `apps/site/lib/ramp-generator.ts` to `@devalok/shilp-sutra/brand/generate-ramp`.

---

### Category C — Feel (interaction)

#### Axis 9 — Motion `[data-motion]`  **v0.41**
off / calm / lively. Role tokens: `--duration-{instant,quick,standard,slow}`, `--ease-{control,overlay,attention}`.

#### Axis 10 — Interactive feedback `[data-feedback]`  **v0.41**
color / scale / lift / combo. Role tokens: `--fb-hover-{bg-shift,transform}`, `--fb-active-transform`, `--fb-pressed-shadow`, `--fb-duration`.

#### Axis 11 — Focus ring `[data-focus-ring]`  **v0.40 (a11y promoted)**
hairline / default / halo / inset. Role tokens: `--focus-ring-{width,offset,color,style,radius}`.

---

### Category D — Surface

#### Axis 12 — Texture `[data-texture]`  **v0.41**
none / subtle / grain. Role token: `--texture-overlay` (SVG noise data URI).

#### Axis 13 — Brand archetypes `[data-archetype]`  **v0.40 (HEADLINE)**

```css
[data-archetype="linear"]   /* sharp + compact + hairline + flat + dense + medium + muted + hairline-focus */
[data-archetype="stripe"]   /* default everything */
[data-archetype="apple"]    /* rounded + spacious + hairline + subtle + editorial + light + muted + halo-focus */
[data-archetype="material"] /* rounded + comfortable + default + dramatic + default + medium + vibrant + inset-focus */
[data-archetype="vercel"]   /* sharp + compact + default + flat + dense + bold + muted + default-focus */
[data-archetype="notion"]   /* slightly-rounded + spacious + default + flat + editorial + medium + muted + default-focus */
[data-archetype="devalok"]  /* slightly-rounded + comfortable + default + subtle + default + medium + default + halo-focus + grain */
```

---

### Category E — Power-user surfaces (v0.42+)

- **Axis 14:** Component-level preset prop. `<Card shape="sharp">` reads prop → emits data-attr.
- **Axis 15:** JS theme switcher API. `setShape()`, `useTheme()` hook, localStorage persistence, SSR-safe no-flash script.
- **Axis 16:** Color-blind safe palettes (`[data-palette="protan-safe"]` etc.).
- **Axis 17:** RTL support (foundational, audit logical properties pre-v0.40).

---

## Tooling axes (parallel work)

- **Themer Wizard** **v0.40** — 5-question flow → archetype + overrides + accent CSS.
- **Token doc autogen** **v0.40** — `scripts/build-token-docs.mjs` parses `semantic.css` → docs.
- **Slot composition API** **v0.41** — TopBar action slot, Card media slot, Sidebar brand-mark slot.

---

## Cross-cutting concerns (CRITICAL — read before approving)

### 1. Preset versioning

**Problem:** v0.45 tweaks default values → silent visual shift for every consumer.

Options:
- (a) Lock preset values forever — additive only
- (b) Version presets (`slightly-rounded-v1` vs `-v2`)
- (c) Treat preset-value changes as major bumps
- (d) Hybrid — `[data-preset-version="2026-05"]` pins entire suite

**Recommendation:** (a) for the first year, evolve to (d) after real customer data.

### 2. Transition strategy

When `[data-shape]` toggles live, only some CSS properties have transitions.

Options:
- (a) Snap (no transition) — cleanest
- (b) Universal transition helper class — smooth but expensive
- (c) Explicit transition tokens per axis — token explosion

**Recommendation:** (b) via JS theme API (v0.42). Until then snap (a).

### 3. RTL / logical properties

Pre-v0.40 audit: migrate `pl-*`/`pr-*`/`text-left` to logical equivalents. Add gate.

### 4. Token doc autogen

Hand-maintenance rots fast with 6+ axes. Build `scripts/build-token-docs.mjs` + CI drift gate.

### 5. Customer research

**Add as v0.40 prerequisite. Do not lock scope before this happens.**

30-minute interviews with Karm, BharatTools, Gurukul, Devalok Hiring teams. Ask: "What about the current DS feels constraining?"

### 6. Visual regression scope

Test default baseline + each archetype only. 8 archetypes × 1100 stories = 8800 snapshots. May need Chromatic plan tier-up.

### 7. CSS bundle size

Budget: 10 KB additional CSS over v0.38 baseline by end of v0.42. Currently used: ~600 bytes (v0.39 shape presets).

---

## Sequencing

| Version | What ships | Why |
|---|---|---|
| **Pre-v0.40 prep** | Customer research. RTL audit. Token-doc autogen script. | Foundational. |
| **v0.40.0 — HEADLINE** | Archetypes + Density + Border + Elevation + Typography + Type-weight + Saturation + Focus-ring + Ramp generator + Themer Wizard + Token doc autogen | "Pick your archetype, ship your app." |
| **v0.41.0 — Feel layer** | Motion + Interactive feedback + Texture + RTL foundational + Slot composition API | Brand personality nuances. |
| **v0.42.0 — Power users** | Component-level preset props + JS theme switcher + Color-blind palettes + Preset-version pinning | Advanced features. |
| **v1.0.0** | Stabilize all preset + token names. Lock with hard semver. | Stable customization contract. |

---

## Playgrounds map

Open `playgrounds/index.html` — landing card grid.

| Playground | Axis / Tool | Target |
|---|---|---|
| `themer-wizard.html` | 5-question on-ramp | v0.40 — front door |
| `archetypes.html` | Brand archetypes | v0.40 — headline |
| `density-presets.html` | Density | v0.40 |
| `border-presets.html` | Border | v0.40 |
| `elevation-presets.html` | Elevation | v0.40 |
| `typography-presets.html` | Typography | v0.40 |
| `type-weight-presets.html` | Type weight | v0.40 |
| `saturation-presets.html` | Saturation | v0.40 |
| `focus-ring-presets.html` | Focus ring | v0.40 |
| `ramp-generator.html` | OKLCH ramp generator | v0.40 utility |
| `motion-presets.html` | Motion | v0.41 |
| `feedback-presets.html` | Interactive feedback | v0.41 |
| `texture-presets.html` | Surface texture | v0.41 |

---

## Decisions needed (per item)

For each archetype: do the bundled values feel right? Especially:
- Linear — `dense` typography or `default`?
- Apple — `light` weight vs `default`?
- Material — Material 3 dialed back dramatic shadows; confirm.
- Devalok — **most important to nail.** Need brand voice doc input.

For each individual axis: names, defaults, token names.

For cross-cutting: preset versioning approach, transition strategy, visual regression scope.

---

## Approval workflow

1. Open `playgrounds/index.html`
2. Click through each card. Toggle presets.
3. Run `playgrounds/themer-wizard.html` end-to-end.
4. Read this plan top to bottom.
5. Comment on PR #54 per item.
6. Approved axes ship as implementation PRs.

---

## Risks (updated)

- **Token explosion** — ~70 tokens by v0.42. Mitigation: archetypes hide individual tokens from 80%.
- **Visual regression sprawl** — see #6.
- **Doc maintenance** — see #4.
- **Density × component-size variants** — multiply via `--height-control-sm/md/lg`. Stable math.
- **Performance / CSS bundle** — see #7.
- **Customer expectations** — once we ship wizard + archetypes, more presets will be requested. Need curation policy.

---

## Open questions

1. Devalok brand voice doc — does it exist? Required for `devalok` archetype values.
2. Ramp generator package path — `/brand/generate-ramp` or `/utils/ramp` or both?
3. Preset version pinning — per-axis or suite-wide?
4. Themer wizard route — replaces `/theming` or new `/themer`?
