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
  - `lastUsed` — high-converting "Last used" hint above the button.
  - `helperText` — reassurance copy below.
  - `data-provider` attribute for analytics.
- `OAuthGroup` — stacked layout wrapper with consistent spacing.
- `OAuthDivider` — `or`-style horizontal rule between OAuth and email form.
- `OAuthConnectionRow` — settings-page row representing a linked provider
  with Disconnect / (re-)Connect action.

Default glyphs are sourced from `@tabler/icons-react` (already a peer dep).
Pass `icon={<YourBrandSvg />}` to replace any glyph — useful when you want a
provider's official multicolour mark from their own brand-guidelines page.
