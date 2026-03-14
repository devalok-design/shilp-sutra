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

## Gotchas
- Without LinkProvider, shell components render plain `<a>` tags (full page reloads)
- Place at app root, wrapping all shell components that render navigation links
- The `component` prop must be a forwardRef component (Next.js Link, Remix Link, etc.)

## Changes
### v0.1.1
- **Added** Shell components decoupled from Next.js — replaced hard `next/link` import with polymorphic `LinkProvider`/`useLink` context

### v0.1.0
- **Added** Initial release (with hardcoded Next.js Link dependency)
