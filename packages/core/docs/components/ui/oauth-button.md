# OAuthButton

- Import: @devalok/shilp-sutra/ui/oauth-button
- Server-safe: No
- Category: ui

## Exports
- `OAuthButton` — primary brand-aware sign-in button
- `OAuthGroup` — stacked layout wrapper with consistent spacing
- `OAuthDivider` — `or`-style horizontal rule between OAuth row and email form
- `OAuthConnectionRow` — settings-page row for a linked provider (Disconnect / Connect action)

## OAuthButton props
    provider: "google" | "apple" | "github" | "microsoft" | "x" | "linkedin" | "facebook" | "discord" | "slack" | "gitlab" | "sso" | "email" | "passkey" (required)
    intent: "continue" | "signin" | "signup" (default "continue") — drives the verb in the label
    appearance: "brand" | "outline" | "dark" (default "brand") — visual treatment
    icon: ReactNode — override the default Tabler glyph with a brand-multicolour SVG
    iconOnly: boolean — compact icon-only button; provider name preserved in aria-label
    compact: boolean — short label ("Google" not "Continue with Google"); aria-label keeps long form
    lastUsed: boolean — inline right-edge pill inside the button (a stronger pattern is reorder, below)
    helperText: ReactNode — reassurance copy rendered below the button
    children: ReactNode — override the default label entirely (i18n / custom copy)
    size: inherited from Button ("xs" | "sm" | "md" | "lg" | compact + icon variants)
    fullWidth, loading, onClick, onClickAsync, asyncFeedbackDuration, disabled — inherited from Button

## Data attributes
- `data-provider="<provider>"` — useful for analytics filtering
- `data-oauth-appearance="<appearance>"`

## OAuthGroup props
    orientation: "vertical" | "horizontal" (default "vertical")
    gap: "ds-02" | "ds-03" | "ds-04" (default "ds-03")
    fullWidth: boolean (default true) — stretches children to fill width when vertical
    reorderLastUsedFirst: boolean (default false) — pull the child with lastUsed to position 0
        (Stripe-style — a stronger conversion lever than a visual badge alone)

## OAuthDivider props
    label: ReactNode (default "or")

## OAuthConnectionRow props
    provider: OAuthProvider (required)
    connected: boolean (required)
    accountLabel: ReactNode — account identifier shown next to the provider name (e.g. email)
    onAction: (e) => void — synchronous click handler
    onActionAsync: (e) => Promise<void> — uses Button's async state machine
    actionLabel: ReactNode — override the "Disconnect" / "Connect <name>" copy
    icon: ReactNode — override the default glyph
    disabled: boolean

## Defaults
    intent="continue", appearance="brand", iconOnly=false, lastUsed=false

## Example
```jsx
// Typical signup flow
<OAuthGroup>
  <OAuthButton provider="google" lastUsed />
  <OAuthButton provider="apple" />
  <OAuthButton provider="github" />
</OAuthGroup>
<OAuthDivider />
<OAuthGroup>
  <OAuthButton provider="passkey" appearance="outline" />
  <OAuthButton provider="email" appearance="outline" />
</OAuthGroup>

// Async loading + success/error feedback
<OAuthButton provider="google" fullWidth onClickAsync={signInWithGoogle} />

// True brand-multicolour glyph from the provider's brand page
<OAuthButton provider="google" icon={<GoogleGSvg />} />

// Settings page — linked state
<OAuthConnectionRow
  provider="google"
  connected
  accountLabel="namaskar@devalok.in"
  onAction={disconnectGoogle}
/>
```

## Composability
- **Built on Button.** Async state machine, loading/processing, sizes, and `fullWidth` are inherited. `variant` and `color` are managed internally — pass `appearance` instead.
- **Tabler peer dep.** Default glyphs come from `@tabler/icons-react`. To match a provider's official multicolour mark, pass `icon={<YourSvg />}`.
- **Brand-colour backgrounds.** `appearance="brand"` uses each provider's published button colour. `appearance="outline"` falls back to DS-neutral. `appearance="dark"` unifies every provider into an Apple-style black-on-white (light) / white-on-black (dark) treatment — useful when you want a row to feel visually consistent across providers.
- **Last-used hint.** Storage is the consumer's responsibility — pass `lastUsed={user.lastProvider === 'google'}`.
