# Playgrounds

Self-contained HTML demos for proposed customization axes. No build. No dependencies. Open in any browser.

## Start here

Open [`index.html`](./index.html) — landing page with cards for every axis and status (v0.40 / v0.41 / v0.42).

## Per-axis files

| File | Axis | Target release |
|---|---|---|
| [`density-presets.html`](./density-presets.html) | Density (compact / comfortable / spacious) | v0.40 |
| [`border-presets.html`](./border-presets.html) | Border (hairline / default / pronounced / none) | v0.40 |
| [`elevation-presets.html`](./elevation-presets.html) | Elevation (flat / subtle / dramatic) | v0.40 |
| [`ramp-generator.html`](./ramp-generator.html) | Accent ramp generator (1 input → 12-step OKLCH) | v0.40 |
| [`motion-presets.html`](./motion-presets.html) | Motion (off / calm / lively) | v0.41 |
| [`archetypes.html`](./archetypes.html) | Brand archetypes (linear / stripe / apple / material / notion) | v0.41 |

## How they work

Each playground:

1. Defines role tokens as CSS variables on `:root`
2. Defines preset blocks under `[data-<axis>]` selectors that redeclare the roles
3. Renders mock shilp-sutra components (cards, buttons, inputs, dialogs) styled with the role tokens
4. Exposes a control panel to toggle presets / drag sliders
5. Displays the active token snapshot live
6. Provides a `Copy CSS` button so you can paste the active preset block into your own stylesheet

These are **prototypes** — they prove the role-token + preset-switch pattern works for each axis, before we commit to migrating the real components.

## Approval process

Per axis, decide:

1. **Ship it / skip it / defer?**
2. **Preset names** — do `compact/comfortable/spacious` feel right vs alternatives?
3. **Default values** — preserve current behaviour or shift?
4. **Token names** — `--space-control-x` vs `--padding-control-x`? Bike-shed early.

Approved axes ship as PRs the same way v0.39's shape presets did:

- Role tokens in `tokens/semantic.css`
- Preset blocks
- Component CVA migration via codemod
- Pre-publish audit gate update
- Recipe in `docs/recipes/customize-brand.md`
- Storybook story in `Foundations/`
- Site `/theming` switcher integration
- Changeset

## Related

- Full plan: [`docs/plans/2026-05-25-v040-customization-axes.md`](../docs/plans/2026-05-25-v040-customization-axes.md)
- Pattern reference: v0.39 shape presets (`packages/core/src/tokens/semantic.css` lines around `[data-shape]`)
