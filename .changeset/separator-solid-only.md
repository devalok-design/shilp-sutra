---
"@devalok/shilp-sutra": patch
---

Separator: deprecate the `variant` prop and its `gradient` / `gradient-left` / `gradient-right` values. They were decorative (our anti-convergence layer flags decorative dividers) and never actually rendered in production — the class interpolated a runtime value (`linear-gradient(${deg}…)`) that the Tailwind 4 scanner can't emit, so it shipped as `bg-transparent`. Separator now always renders a solid hairline. The `variant` prop still type-checks (renders solid) and is removed in 0.45.0.
