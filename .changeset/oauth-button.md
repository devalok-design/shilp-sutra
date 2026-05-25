---
"@devalok/shilp-sutra": minor
---

feat(ui): add `OAuthButton` — brand-aware social/login buttons

A purpose-built component for "Sign in with X" flows that previously had to be
hand-assembled from `Button + IconBrandGoogle`. The Tabler-glyph approach had
no shared copy convention across providers, no per-provider loading state, and
no row pattern. This component bakes in the conventions that matter for
conversion (brand colours, "Last used" hint, helper copy, iconOnly rows,
linked-state for settings pages).

New exports from `@devalok/shilp-sutra/ui/oauth-button`:

- `OAuthButton` — composes on `Button`, inherits async/loading/sizes.
  - 13 providers: `google` `apple` `github` `microsoft` `x` `linkedin`
    `facebook` `discord` `slack` `gitlab` `sso` `email` `passkey`
  - `intent`: `continue` (default) / `signin` / `signup` drives the label.
  - `appearance`: `brand` (provider colour) / `outline` (DS neutral) /
    `dark` (unified Apple-style across all providers).
  - `icon` — drop in a brand-multicolour SVG to replace the default glyph.
  - `iconOnly` — square button with provider name kept in `aria-label`.
  - `compact` — short label (`"Google"` not `"Continue with Google"`).
    `aria-label` keeps the long form for screen readers. Good under an
    explicit "Or sign in with" divider.
  - `lastUsed` — inline right-edge pill rendered inside the button. The
    stronger conversion pattern is to combine this with `OAuthGroup`'s
    `reorderLastUsedFirst`, which promotes the provider to position 0.
  - `helperText` — reassurance copy below.
  - `data-provider` attribute for analytics.
  - **Dark-mode uniformity:** every brand appearance lands on the same DS
    surface in dark mode — brand identity comes from the glyph, not the
    background — so rows stay visually coherent.
- `OAuthGroup` — stacked layout wrapper with consistent spacing.
  Optional `reorderLastUsedFirst` pulls a `lastUsed` child to position 0
  (Stripe-style ordering — a stronger conversion lever than a visual badge).
- `OAuthDivider` — `or`-style horizontal rule between OAuth and email form.
- `OAuthConnectionRow` — settings-page row representing a linked provider
  with Disconnect / (re-)Connect action.

Default glyphs are sourced from `@tabler/icons-react` (already a peer dep).
Pass `icon={<YourBrandSvg />}` to replace any glyph — useful when you want a
provider's official multicolour mark from their own brand-guidelines page.
