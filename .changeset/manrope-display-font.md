---
"@devalok/shilp-sutra": minor
---

Add Manrope as the display/heading face and make the design system own the heading font.

**What changed**

- Ships `Manrope-Variable.woff2` (OFL, latin variable, weights 200–800) with an `@font-face` declaration in `typography.css`.
- `--font-display` moves from `"Inter", system-ui, sans-serif` to `"Manrope", "Inter", system-ui, sans-serif`.
- The DS now binds the display face to headings, which it previously did not do:
  - `base.css` sets `font-family: var(--font-display)` on bare `h1`–`h6` (inside `@layer base`).
  - The `text-heading-{2xl…xs}` utilities now set `font-family: var(--font-display)`.
  - The `Text` component's `heading-*` variants now carry `font-display`.

**Why**

Until now `--font-display` was an orphan token — no shipped component or utility consumed it, so `<h1>` inherited the body face (Inter). Each consumer app wired its own heading font by hand. This makes Manrope the single DS-level default so heading typography is consistent across products without per-app wiring.

**Behavioral change (read before upgrading)**

Headings that previously rendered in Inter (the body default) now render in Manrope. This is a visible change, not an API change.

- Apps that already set their own heading `font-family` in **unlayered** CSS (e.g. `app/globals.css` styling `h1–h6`, or a `next/font` variable applied to headings) are unaffected — their rule wins over the DS `@layer base` default. They opt into Manrope by removing that local wiring.
- Ranade is **unchanged**: it remains `--font-accent` (the brand-moment face) and continues to drive `.prose-devsabha`. Body copy stays Inter.

Manrope has no italic axis; italic display text falls back per the `@font-face` stack.
