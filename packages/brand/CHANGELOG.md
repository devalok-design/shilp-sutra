# @devalok/shilp-sutra-brand

## 0.8.0

### Minor Changes

- [#124](https://github.com/devalok-design/shilp-sutra/pull/124) [`16fa27c`](https://github.com/devalok-design/shilp-sutra/commit/16fa27c496b6b8b1bd927197db750790b2c8a522) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add `@devalok/shilp-sutra-brand/aurora` — the theme-reactive WebGL aurora curtain as Devalok signature identity.
  - **`AuroraBloom`** (Tier 1) — the raw, fully-controllable component: intensity, shape, position, layers, speed, palette, parallax, grain, breathing. `@paper-design/shaders-react` is an **optional peer** of this subpath, so logo-only consumers of the brand package never pull the WebGL bundle.
  - **`AURORA_PRESETS`** (Tier 2) — six named Devalok configurations (Devalok, Bhairav, Saptarishi, Diya, Monsoon, Mandir).
  - **Live palette resolver** — `useAuroraPalette` / `readAuroraPalette` read the accent ramp straight from the CSS cascade, so brand + theme switches recolour automatically. Brand stays identity-only with no dependency on core.
  - **Reduced-motion fallback** — under `prefers-reduced-motion`, paints a static CSS-gradient bloom and never mounts WebGL.
  - **`poster` prop** — static gradient on first paint, upgrade to the live shader after mount (better LCP for above-the-fold heroes).

  The component previously lived only in `apps/site`; this makes it the single published source for every Devalok surface. `framer-motion` is not pulled in (the reduced-motion hook is inlined).

## 0.7.0

### Minor Changes

- [#120](https://github.com/devalok-design/shilp-sutra/pull/120) [`7f3471c`](https://github.com/devalok-design/shilp-sutra/commit/7f3471cf2cbd927d8ab34ed74db09907f610ab0c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Trim baked padding from all logo assets (Devalok + Karm).

  Every logo previously shipped with 20–66% transparent padding baked into the canvas (e.g. the Devalok wordmark was 66% empty vertical space, shloka 54%). This forced consumers to hand-crop or add negative margins for tight alignment.
  - **Raster logos** (monogram, monogram-shell, monogram-shell-wordmark, monogram-coin-wordmark, monogram-wordmark, shloka — all colors, 512/1024, png+webp): trimmed to their content bounding box.
  - **SVG logos** (wordmark, dass, chakra, Karm icon/wordmark/wordmark-icon): `viewBox` tightened to the glyph bounds. Paths are unchanged — no reshaping.

  Logos now render edge-to-edge. `DevalokLogo`/`KarmLogo` size by height with `w-auto`, so nothing distorts. **Consumers that relied on the baked padding for spacing should add their own clear-space** (margin/padding) around the mark. Favicons and app-icons are unchanged (they keep their safe-area).

## 0.6.2

### Patch Changes

- [#41](https://github.com/devalok-design/shilp-sutra/pull/41) [`db68ada`](https://github.com/devalok-design/shilp-sutra/commit/db68ada99bb33ca95c9a3cc050ed918536816b2b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Doc-driven AI-agent setup for public release. Ships a complete recipes catalog + governance baseline (AGENTS.md, `docs/recipes/`, SECURITY.md, CODE_OF_CONDUCT.md, CODEOWNERS, issue templates) plus package.json metadata hygiene (keywords, author, homepage, bugs) and README badges, so any AI coding agent can install and configure shilp-sutra from the bundled docs. Minor for core (ships `docs/recipes/` in the tarball); brand carries the same metadata-hygiene fields.

## 0.6.1

### Patch Changes

- [#34](https://github.com/devalok-design/shilp-sutra/pull/34) [`8ba8885`](https://github.com/devalok-design/shilp-sutra/commit/8ba888562972901d614cc100d3c9b9efbe490e34) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix React hydration mismatch in `DevalokLogo` and `KarmLogo` when using `color="auto"` under React Server Components.

  The `useState` initializer read `document.documentElement.classList.contains('dark')` on first render: undefined on the server (→ `'brand'`), `'white'` on dark-mode client hydration → React threw during hydration, breaking SSR/RSC trees (reported by Karm). Fix: deterministic initial state that does not read the DOM; a `useLayoutEffect` swaps to the correct color before paint. No API change. Added a `devalok-logo.hydration.test.tsx` regression test asserting deterministic server output in both light and dark DOM states.

## 0.6.1-next.0

### Patch Changes

- [#34](https://github.com/devalok-design/shilp-sutra/pull/34) [`8ba8885`](https://github.com/devalok-design/shilp-sutra/commit/8ba888562972901d614cc100d3c9b9efbe490e34) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Prerelease of the `DevalokLogo`/`KarmLogo` `color="auto"` RSC hydration fix (see 0.6.1).
