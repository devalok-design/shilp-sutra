# Playgrounds

Self-contained HTML demos for proposed customization axes. No build. No dependencies. Open in any browser.

## Start here

1. **`themer-wizard.html`** — the on-ramp. 5-question flow that picks an archetype + tweaks + accent color and outputs the full CSS combo. Most consumers should never need to leave this.
2. **`index.html`** — landing card grid for every individual axis.
3. **Plan:** [`docs/plans/2026-05-25-v040-customization-axes.md`](../docs/plans/2026-05-25-v040-customization-axes.md) (rev 2 — expanded axis set + archetype-first reframe + cross-cutting concerns)

## Files

| File | Axis / Tool | Target |
|---|---|---|
| `themer-wizard.html` | 5-question on-ramp (outputs archetype + overrides + accent CSS) | v0.40 — front door |
| `archetypes.html` | Brand archetypes (Linear / Stripe / Apple / Material / Notion / Vercel / Devalok) | v0.40 — headline |
| `density-presets.html` | Density (compact / comfortable / spacious) | v0.40 |
| `border-presets.html` | Border (hairline / default / pronounced / none) | v0.40 |
| `elevation-presets.html` | Elevation (flat / subtle / dramatic) | v0.40 |
| `typography-presets.html` | Typography voice (dense / default / editorial) | v0.40 |
| `type-weight-presets.html` | Type weight (light / default / bold) | v0.40 |
| `saturation-presets.html` | Accent saturation (muted / default / vibrant) | v0.40 |
| `focus-ring-presets.html` | Focus ring (hairline / default / halo / inset) | v0.40 |
| `ramp-generator.html` | One color → 12-step OKLCH ramp | v0.40 utility |
| `motion-presets.html` | Motion (off / calm / lively) | v0.41 |
| `feedback-presets.html` | Interactive feedback (color / scale / lift / combo) | v0.41 |
| `texture-presets.html` | Surface texture (none / subtle / grain) | v0.41 |

## Pattern (consistent across all)

1. Define role tokens as CSS variables on `:root`
2. Define preset blocks under `[data-<axis>]` selectors
3. Render mock shilp-sutra components styled with the role tokens
4. Sidebar exposes preset switches
5. Live token snapshot shown on the side
6. `Copy CSS` button outputs the active preset block

## Approval workflow

Per axis decide:

1. **Ship it / skip it / defer?**
2. **Preset names** — bike-shed early
3. **Default values** — preserve current or shift
4. **Token names**

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
- Pattern reference: v0.39 shape presets (`packages/core/src/tokens/semantic.css` `[data-shape]` blocks)
