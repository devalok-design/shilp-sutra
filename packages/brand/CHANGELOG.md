# @devalok/shilp-sutra-brand

## 0.6.1

### Patch Changes

- [#34](https://github.com/devalok-design/shilp-sutra/pull/34) [`8ba8885`](https://github.com/devalok-design/shilp-sutra/commit/8ba888562972901d614cc100d3c9b9efbe490e34) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix React hydration mismatch in `DevalokLogo` and `KarmLogo` when using `color="auto"` under React Server Components.

  **The bug:** the `useState` initializer called `document.documentElement.classList.contains('dark')` on first render. On the server, `document` was undefined → initial state was `'brand'`. On client hydration in dark mode, the DOM read returned `'white'`. React detected the mismatch and threw during hydration, breaking SSR/RSC trees (reported by Karm, who worked around by rendering a plain `<img>`).

  **The fix:** deterministic initial state that does not read the DOM (`'brand'` for `color="auto"`, or the explicit color value otherwise). A `useLayoutEffect` then swaps to the correct color before the browser paints, so dark-mode users don't see a flash of brand color on their first paint.

  **Consumer impact:** no API change. `<DevalokLogo color="auto" />` still switches between brand (light) and white (dark) — it just does so without crashing RSC hydration. If you were using a plain `<img>` workaround, you can now swap back to the component.

  Added a dedicated `devalok-logo.hydration.test.tsx` regression test that renders with `renderToString` in both light and dark DOM states and asserts the server output is deterministic.

## 0.6.1-next.0

### Patch Changes

- [#34](https://github.com/devalok-design/shilp-sutra/pull/34) [`8ba8885`](https://github.com/devalok-design/shilp-sutra/commit/8ba888562972901d614cc100d3c9b9efbe490e34) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix React hydration mismatch in `DevalokLogo` and `KarmLogo` when using `color="auto"` under React Server Components.

  **The bug:** the `useState` initializer called `document.documentElement.classList.contains('dark')` on first render. On the server, `document` was undefined → initial state was `'brand'`. On client hydration in dark mode, the DOM read returned `'white'`. React detected the mismatch and threw during hydration, breaking SSR/RSC trees (reported by Karm, who worked around by rendering a plain `<img>`).

  **The fix:** deterministic initial state that does not read the DOM (`'brand'` for `color="auto"`, or the explicit color value otherwise). A `useLayoutEffect` then swaps to the correct color before the browser paints, so dark-mode users don't see a flash of brand color on their first paint.

  **Consumer impact:** no API change. `<DevalokLogo color="auto" />` still switches between brand (light) and white (dark) — it just does so without crashing RSC hydration. If you were using a plain `<img>` workaround, you can now swap back to the component.

  Added a dedicated `devalok-logo.hydration.test.tsx` regression test that renders with `renderToString` in both light and dark DOM states and asserts the server output is deterministic.
