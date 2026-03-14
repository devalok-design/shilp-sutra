# Pagination

- Import: @devalok/shilp-sutra/ui/pagination
- Server-safe: No
- Category: ui

## Compound Components
    PaginationRoot (nav)
      PaginationContent (ul)
        PaginationItem (li)
          PaginationLink (isActive: boolean, asChild: boolean)
          PaginationPrevious
          PaginationNext
          PaginationEllipsis
    PaginationNav (convenience wrapper)

## Utility
    generatePagination(current: number, total: number, siblingCount: number) => (number | 'ellipsis')[]

## Example
```jsx
<PaginationRoot>
  <PaginationContent>
    <PaginationItem><PaginationPrevious onClick={() => setPage(p - 1)} /></PaginationItem>
    {generatePagination(page, totalPages, 1).map((item, i) =>
      item === 'ellipsis'
        ? <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
        : <PaginationItem key={i}>
            <PaginationLink isActive={item === page} onClick={() => setPage(item)}>
              {item}
            </PaginationLink>
          </PaginationItem>
    )}
    <PaginationItem><PaginationNext onClick={() => setPage(p + 1)} /></PaginationItem>
  </PaginationContent>
</PaginationRoot>
```

## Gotchas
- Root component is PaginationRoot (NOT Pagination)

## Changes
### v0.1.1
- **Fixed** Pagination link padding uses `ds-*` tokens instead of Tailwind arbitrary values

### v0.1.0
- **Added** Initial release
- **Added** PaginationNav compound wrapper with `generatePagination` helper
