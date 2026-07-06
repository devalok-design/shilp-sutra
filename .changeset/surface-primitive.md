---
"@devalok/shilp-sutra": minor
---

Add `Surface` — the low-level elevated container primitive.

Every mature design system ships one (MUI `Paper`, Carbon `Tile`, Chakra/Polaris `Box`) and builds its semantic Card on top; shilp-sutra had only the opinionated `Card` (gap-model padding, slots), so ~29 components hand-rolled `bg-surface-raised … shadow-raised` because there was nothing lighter to compose. `Surface` fills that gap.

```tsx
import { Surface } from '@devalok/shilp-sutra/ui/surface'

<Surface elevation="raised" padding="md">…</Surface>
<Surface elevation="flat" bordered padding="sm">…</Surface>   // on-page tile
<Surface asChild elevation="raised"><a href="/x">…</a></Surface>
```

- `elevation`: `flat | raised | floating | overlay` (binds a surface-bg token to a shadow token)
- `padding`: `none | sm | md | lg` (simple all-side — not Card's gap model)
- `radius`: `none | control | surface | overlay | pill`
- `bordered`: border-led edge; dev-warns if combined with a shadowed elevation (the double-edge anti-pattern)
- `asChild`: render as the child element via Slot

Server-safe. Additive only — no existing component changed. (Follow-ups: refactor `Card` to compose `Surface`, and migrate the hand-rolled surfaces.)
