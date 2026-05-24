---
"@devalok/shilp-sutra": minor
---

feat: AuroraBloom — theme-reactive WebGL aurora curtain (composed)

Brand-aware aurora background that drops behind a hero with a single import.
Reads its palette live from the design system's accent ramp, so brand
switches, theme flips, and `data-brand` mutations cross-fade automatically.

**Anatomy:**

- 1–3 stacked WebGL mesh layers (front curtain + soft halo + optional micro
  detail) drift at different speeds and scales for true parallax depth
- Shape × position table: `curtain` / `ribbon` / `halo` / `full` ×
  `top` / `bottom` / `center` / `full` → 16 silhouette combinations
- Intensity, parallax (`mouse` / `scroll` / `off`), grain (`paper` /
  `match` / `off`), breathing, and arbitrary palette overrides exposed as
  props for full DX control
- 1.2s sRGB cross-fade tween on every brand / theme / palette change —
  never a flip
- IntersectionObserver pauses the shader RAF when scrolled off-screen;
  `prefers-reduced-motion` zeroes shader speed + skips the tween
- Headless `useAuroraPalette()` hook for custom WebGL / canvas / SVG
  compositions built on the live token ramp
- Paper Shaders bundle (~25 KB) is split into its own `_chunks/paper-shaders.js`
  so consumers who never render AuroraBloom never pay the cost

**Imports:**

```ts
import {
  AuroraBloom,
  useAuroraPalette,
  type AuroraBloomProps,
  type AuroraPalette,
} from '@devalok/shilp-sutra/composed/aurora-bloom'
```

**Minimal usage:**

```jsx
<section className="relative isolate overflow-hidden">
  <AuroraBloom />
  <div className="relative z-10">…hero copy…</div>
</section>
```

Storybook coverage: Default / Subtle / Strong / Halo / Ribbon / FullBleed /
DevalokGrain / CustomPalette / NoMotion. RTL smoke tests verify mount,
aria, palette shape acceptance, and layer canvas counts.
