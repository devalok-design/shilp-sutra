# Breadcrumb

- Import: @devalok/shilp-sutra/ui/breadcrumb
- Server-safe: No
- Category: ui

## Compound Components
    Breadcrumb (root nav)
      BreadcrumbList (ol)
        BreadcrumbItem (li)
          BreadcrumbLink (for clickable items) | BreadcrumbPage (for current page)
        BreadcrumbSeparator (auto-rendered or custom)
        BreadcrumbEllipsis (for collapsed items)

## Defaults
    none

## Example
```jsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Composability
- **Compound structure only** — no context cascade, each part is standalone. The semantic shape (`<nav>` → `<ol>` → `<li>`) is what matters for a11y, not any internal state.
- **BreadcrumbLink vs BreadcrumbPage:** Use BreadcrumbLink for everything except the current page; BreadcrumbPage for the current page (not clickable, renders without href, announced as "current page" via aria-current).
- **Router integration:** Use `<BreadcrumbLink asChild><NextLink href="/x">...</NextLink></BreadcrumbLink>` (Radix Slot pattern).
- **Truncation:** For long paths, use BreadcrumbEllipsis between the first and last items instead of showing all. Pair with a DropdownMenu (open the ellipsis to show hidden intermediate items) if you need to expose them.
- **PageHeader (composed) auto-builds Breadcrumb** from its `breadcrumbs` prop — use that higher-level component for page-top breadcrumbs and save this component for inline or custom positioning.

## Gotchas
- Use BreadcrumbPage for the current (non-clickable) page, BreadcrumbLink for navigable items
- Don't wrap BreadcrumbPage in a link — it's the current location by definition

## Changes
### v0.18.0
- **Added** `BreadcrumbProps`, `BreadcrumbLinkProps` type exports

### v0.1.0
- **Added** Initial release
