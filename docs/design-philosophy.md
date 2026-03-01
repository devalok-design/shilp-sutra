# Shilp Sutra — शिल्प सूत्र

*Craft Principles — A Design System by Devalok*

## Philosophy

Shilp Sutra is built on the belief that design systems should be opinionated about composition, not just styling. Every component embodies three principles:

1. **Accessible by default** — WCAG AA compliance baked into every component. Consumers get correctness without configuration.
2. **Composable by design** — Compound components, slot patterns, and `asChild` ensure components compose predictably.
3. **Culturally grounded** — Rooted in the warmth and precision of Indian craft traditions, reflected in our color language and design sensibility.

## Color Heritage

Our primary color is Pink — warm, energetic, distinctive. The legacy color palette carries poetic names that reflect our cultural roots:

| Token | Legacy Name | Hex | Role |
|-------|-------------|-----|------|
| `--color-interactive` | Blooming Lotus | #D33163 | Primary actions, brand identity |
| `--pink-300` | Blush | #DD9EB8 | Soft accents, hover states |
| `--pink-200` | Dusk | #EFD5D9 | Light surfaces, subtle backgrounds |
| `--pink-50` | Divine White | #FCF7F7 | Lightest surface, card backgrounds |
| `--color-accent` | — | #9E7DC9 | Secondary actions (Purple) |

These names live in our documentation and brand materials. In code, we use functional token names (`--color-interactive`, `--color-text-primary`) for maintainability.

## Architecture

```
Primitives (raw palette)
    ↓
Semantic (functional roles)
    ↓
Tailwind Preset (utility classes)
    ↓
Components (CVA variants + cn())
```

### Module Hierarchy

```
ui/ (41 primitives) → shared/ (13) → layout/ (6) → karm/ (43 domain)
```

Each layer can only import from layers to its left. This ensures the design system core remains independent of domain logic.

## Motion

- Purposeful: every animation serves a function (feedback, orientation, delight)
- Respectful: `prefers-reduced-motion` honored globally
- Token-driven: `--duration-fast` (100ms) through `--duration-deliberate` (700ms)

## Density

- **Comfortable**: Default — generous spacing for general interfaces
- **Compact**: Available via spacing tokens for data-heavy admin tools (karm/)

## Standards

- **WCAG 2.2 AA** — Minimum accessibility target
- **W3C Design Tokens** — Token format for cross-tool interoperability
- **Conventional Commits** — Version history that tells a story
