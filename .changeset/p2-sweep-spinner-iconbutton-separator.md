---
"@devalok/shilp-sutra": patch
---

fix: P2 audit sweep — spinner reduced-motion contract, icon-button touch target, separator stories

- **spinner (P1):** `onComplete` now fires under `prefers-reduced-motion`. The static
  success/error paths render without an `onAnimationComplete`, so the documented
  `onComplete` callback was silently dropped for reduced-motion users — a flow that
  advances on the success tick would stall. It now fires from an effect when the final
  state mounts, regardless of motion preference.
- **icon-button (P1):** `sm` (32px) and `md` (40px) icon buttons now carry the
  `touch-target` util — an invisible ≥44px press region (visual size unchanged) so
  keyboard/touch targets meet WCAG 2.5.5. `lg` (48px) already cleared it. JSDoc
  taxonomy corrected (adds `soft`; real color axis).
- **separator:** dropped the dead `variant` radio control from Storybook (the prop is a
  no-op since 0.45.0; the control advertised a feature that does nothing). The prop's
  removal itself is a breaking change deferred to the next major.
