# PageHeader

- Import: @devalok/shilp-sutra/composed/page-header
- Server-safe: Yes
- Category: composed

## Props
    title: string (falls back to last breadcrumb label if omitted)
    subtitle: string
    actions: ReactNode (action buttons)
    breadcrumbs: Breadcrumb[] — { label: string, href?: string }
    titleClassName: string

## Defaults
    None

## Example
```jsx
<PageHeader
  title="Project Settings"
  subtitle="Configure your project preferences"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Settings' },
  ]}
  actions={<Button>Save</Button>}
/>
```

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- If `title` is omitted, the last breadcrumb's `label` is used as the page title
- The last breadcrumb should not have an `href` (it represents the current page)

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
