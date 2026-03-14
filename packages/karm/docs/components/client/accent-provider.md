# AccentProvider

- Import: @devalok/shilp-sutra-karm/client
- Server-safe: No
- Category: client

## Props
    accentCss: string | null (default: undefined)

## Defaults
    (no visual defaults — renders nothing)

## Example
```jsx
<AccentProvider accentCss="--color-accent: #d33163; --color-accent-light: #f7e9e9;" />
```

## Gotchas
- Renders null — this is a headless component with no visual output
- Does NOT accept children — it is not a wrapper/provider component in the React context sense
- Injects CSS custom properties directly onto document.documentElement via useEffect
- Properties are cleaned up (removed) when the component unmounts or when accentCss changes
- Pass a semicolon-separated CSS custom property string (e.g., "--color-accent: #d33163; --color-accent-light: #f7e9e9;")
- If accentCss is null or undefined, no properties are applied
- Does NOT extend React.HTMLAttributes — only accepts the accentCss prop

## Changes
### v0.18.0
- **Added** Initial release
