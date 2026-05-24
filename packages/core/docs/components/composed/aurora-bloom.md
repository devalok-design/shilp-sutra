# AuroraBloom

- Import: @devalok/shilp-sutra/composed/aurora-bloom
- Server-safe: No (WebGL canvas — `"use client"`)
- Category: composed

## Props
    intensity: "subtle" | "medium" | "strong" (default: "medium") — drives opacity / distortion / scale across all layers
    shape: "curtain" | "ribbon" | "halo" | "full" (default: "curtain") — mask silhouette
    position: "top" | "bottom" | "center" | "full" (default: "top") — bloom anchor + fade direction
    layers: 1 | 2 | 3 (default: 2) — stacked mesh layers (1=front, 2=front+back halo, 3=+micro detail)
    speed: number (default: 0.35) — shader drift multiplier; 0 freezes
    palette: "brand" | AuroraPalette | string[] (default: "brand") — token-driven, object, or 5 hex stops
    parallax: "mouse" | "scroll" | "off" (default: "mouse") — interactive drift mode
    grain: "match" | "paper" | "off" (default: "paper") — "match" swaps in the Devalok SVG turbulence
    breathing: boolean (default: true) — mask gently scales 100%→102%→100% over 6s
    className?: string

## AuroraPalette Type
    colors: string[] (5 sRGB hex stops, drawn from the live brand ramp)
    ground: string (sRGB hex of `--color-surface-base`, used for inner-fill + edge wash)
    isDark: boolean (true when `<html>` carries the `.dark` class)

## Behaviour
- Reads `--color-accent-{3,5,7,9,11}` in light mode and `--color-accent-{7..11}` in dark mode.
- `data-brand` / `.dark` / inline-style mutations on `<html>` trigger a 1.2s sRGB cross-fade.
- `prefers-reduced-motion`: shader speed=0, breathing off, palette swap is instant.
- Off-screen (IntersectionObserver, 50px rootMargin): shader RAF pauses.
- Tab hidden: shader RAF auto-pauses (Paper Shaders internal).
- Requires a `relative isolate overflow-hidden` parent for the mask to clip correctly.

## Defaults
    intensity="medium", shape="curtain", position="top", layers=2, speed=0.35, palette="brand", parallax="mouse", grain="paper", breathing=true

## Example
```jsx
<section className="relative isolate overflow-hidden">
  <AuroraBloom />
  <div className="relative z-10">…hero copy…</div>
</section>
```

## useAuroraPalette()
Headless hook that returns the live `AuroraPalette` (5 hex stops + ground + isDark) and re-resolves on brand or theme change. Use it to drive your own WebGL / canvas / SVG composition.

```jsx
import { useAuroraPalette } from '@devalok/shilp-sutra/composed/aurora-palette'

const palette = useAuroraPalette()
// palette.colors[2] === current accent-9 in sRGB hex
```
