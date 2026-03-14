# Breadcrumb

- Import: @devalok/shilp-sutra/ui/breadcrumb
- Server-safe: Yes
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

## Gotchas
- Use BreadcrumbPage for the current (non-clickable) page, BreadcrumbLink for navigable items

## Changes
### v0.18.0
- **Added** `BreadcrumbProps`, `BreadcrumbLinkProps` type exports

### v0.1.0
- **Added** Initial release
