# LinkProvider

- Import: @devalok/shilp-sutra/shell/link-context
- Server-safe: No
- Category: shell

Exports: LinkProvider, useLink

## Props

### LinkProvider
    component: ForwardRefComponent (e.g. Next.js Link, Remix Link)
    children: ReactNode

### useLink hook
    Returns: LinkComponent

## Defaults
    Without LinkProvider, shell components render plain `<a>` tags

## Example
```jsx
import Link from 'next/link'

<LinkProvider component={Link}>
  <AppSidebar ... />
  <BottomNavbar ... />
</LinkProvider>
```

## Composability
- **The framework router bridge for all shell components.** Without LinkProvider, AppSidebar / BottomNavbar / TopBar.UserMenu / AppCommandPalette render plain `<a>` tags — that means full page reloads instead of client-side navigation.
- **Required setup:**
  ```tsx
  // Next.js
  import Link from 'next/link'
  <LinkProvider component={Link}>
    <App />
  </LinkProvider>
  ```
- **Place at app root** — above every shell component that renders nav links.
- **component must be forwardRef** (Next.js Link, Remix Link, react-router Link all qualify). Custom components need to forward ref + forward className + forward all anchor props.
- **Consumer components use `useLink()`** — returns the registered component or falls back to plain `<a>`. Your own components can consume this hook to integrate with the same router abstraction.
- **ui-category components don't consume LinkProvider** — they use `asChild` for router integration (e.g. `<Button asChild><NextLink ...>...</NextLink></Button>`). LinkProvider is shell-specific because shell components embed link arrays (can't use asChild per-item without breaking the data-driven API).

## Gotchas
- Without LinkProvider, shell components render plain `<a>` tags (full page reloads)
- Place at app root, wrapping all shell components that render navigation links
- The `component` prop must be a forwardRef component (Next.js Link, Remix Link, etc.)

## Changes
### v0.1.1
- **Added** Shell components decoupled from Next.js — replaced hard `next/link` import with polymorphic `LinkProvider`/`useLink` context

### v0.1.0
- **Added** Initial release (with hardcoded Next.js Link dependency)
