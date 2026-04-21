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

## Composability
- **Two APIs in one component:**
  - Low-level compound (PaginationRoot + Content + Item + Link + Previous/Next/Ellipsis) — full control over rendering
  - High-level `PaginationNav` — pass `totalPages` + `currentPage` + `onPageChange` and it renders the whole thing using `generatePagination`
- **Use PaginationNav for 95% of cases.** Reach for the compound API when you need custom page-button rendering (e.g. pagination with input "jump to page" or custom ellipsis handling).
- **generatePagination** utility — pass `current`, `total`, `siblingCount` to get the `[1, ..., 5, 6, 7, ..., 20]` structure. Use it standalone if rendering pagination elsewhere (e.g. in a DataTable's footer).
- **Router integration:** Each PaginationLink accepts `asChild` — wrap with NextLink/react-router Link for URL-based pagination.
- **DataTable already has built-in pagination** — don't add Pagination separately; use DataTable's `pagination` prop.

## Gotchas
- Root component is PaginationRoot (NOT Pagination)
- PaginationNav is the convenience wrapper — prefer it unless you need custom rendering

## Changes
### v0.1.1
- **Fixed** Pagination link padding uses `ds-*` tokens instead of Tailwind arbitrary values

### v0.1.0
- **Added** Initial release
- **Added** PaginationNav compound wrapper with `generatePagination` helper
