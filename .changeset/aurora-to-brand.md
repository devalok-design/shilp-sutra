---
"@devalok/shilp-sutra-brand": minor
---

Add `@devalok/shilp-sutra-brand/aurora` — the theme-reactive WebGL aurora curtain as Devalok signature identity.

- **`AuroraBloom`** (Tier 1) — the raw, fully-controllable component: intensity, shape, position, layers, speed, palette, parallax, grain, breathing. `@paper-design/shaders-react` is an **optional peer** of this subpath, so logo-only consumers of the brand package never pull the WebGL bundle.
- **`AURORA_PRESETS`** (Tier 2) — six named Devalok configurations (Devalok, Bhairav, Saptarishi, Diya, Monsoon, Mandir).
- **Live palette resolver** — `useAuroraPalette` / `readAuroraPalette` read the accent ramp straight from the CSS cascade, so brand + theme switches recolour automatically. Brand stays identity-only with no dependency on core.
- **Reduced-motion fallback** — under `prefers-reduced-motion`, paints a static CSS-gradient bloom and never mounts WebGL.
- **`poster` prop** — static gradient on first paint, upgrade to the live shader after mount (better LCP for above-the-fold heroes).

The component previously lived only in `apps/site`; this makes it the single published source for every Devalok surface. `framer-motion` is not pulled in (the reduced-motion hook is inlined).
