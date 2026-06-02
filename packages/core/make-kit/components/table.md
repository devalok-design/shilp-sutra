# Table

Server-safe semantic wrappers around `<table>`. For static / presentational tables.

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@devalok/shilp-sutra/ui/table'
```

## When to use

- Static or small data displays where you control every row and cell.
- Marketing / pricing comparison tables.
- Documentation tables (API references, prop tables).
- Server-rendered tables (RSC) — Table and sub-components are server-safe.
- Need sorting / filtering / pagination / selection / virtualization? Use `<DataTable>` from `@devalok/shilp-sutra/ui/data-table` — out of scope for this guide.

## Compound shape

```
Table (<table>)
  TableCaption (<caption>)        ← optional summary for screen readers
  TableHeader (<thead>)
    TableRow (<tr>)
      TableHead (<th scope="col">)
  TableBody (<tbody>)
    TableRow (<tr>)
      TableCell (<td>)
  TableFooter (<tfoot>)
    TableRow
      TableCell
```

Each component is a thin semantic wrapper — no props beyond standard HTML attributes plus `className`.

## Examples

**Standard:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Owner</TableHead>
      <TableHead>Updated</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {projects.map((p) => (
      <TableRow key={p.id}>
        <TableCell>{p.name}</TableCell>
        <TableCell>
          <Badge color={p.status === 'active' ? 'success' : 'neutral'}>
            {p.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Stack direction="horizontal" gap="ds-02" align="center">
            <Avatar size="xs" src={p.owner.avatar} alt={p.owner.name} />
            <Text variant="body-sm">{p.owner.name}</Text>
          </Stack>
        </TableCell>
        <TableCell>
          <Text variant="body-sm" className="text-fg-muted">
            {formatDate(p.updatedAt)}
          </Text>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**With caption + footer:**
```tsx
<Table>
  <TableCaption>Q4 revenue by region.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Region</TableHead>
      <TableHead>Revenue</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>NA</TableCell><TableCell>$1.2M</TableCell></TableRow>
    <TableRow><TableCell>EU</TableCell><TableCell>$0.8M</TableCell></TableRow>
    <TableRow><TableCell>APAC</TableCell><TableCell>$0.4M</TableCell></TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell><Text variant="label-sm">Total</Text></TableCell>
      <TableCell><Text variant="label-sm">$2.4M</Text></TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

**Row actions (IconButton in last cell):**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>File</TableHead>
      <TableHead>Size</TableHead>
      <TableHead className="w-12" />
    </TableRow>
  </TableHeader>
  <TableBody>
    {files.map((f) => (
      <TableRow key={f.id}>
        <TableCell>{f.name}</TableCell>
        <TableCell>{formatFileSize(f.size)}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton icon={<Icon icon={IconDots} />} variant="ghost" size="sm" aria-label="Actions" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => download(f)}>Download</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => remove(f)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Inside a Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Team members</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.name}</TableCell>
            <TableCell><Badge color="neutral">{m.role}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

When inside a `<Card>`, the Table's surrounding padding comes from `CardContent`. Don't add extra padding on the Table.

**Server-rendered table (RSC):**
```tsx
// app/projects/page.tsx — no 'use client'
export default async function ProjectsPage() {
  const projects = await db.projects.findMany()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell><Badge>{p.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

Table + Badge (server-safe via Badge.Group context — verify per use) + Avatar all render in RSC trees. Skip client components.

## Composability

- **Server-safe:** Table and its sub-components are pure HTML semantic wrappers. No state, no context. Use in RSC trees without `'use client'`.
- **TableHead scope:** Headers automatically get `scope="col"` for screen-reader navigation. Don't override it.
- **Composes with primitives:** Drop `<Badge>`, `<Avatar>`, `<IconButton>`, `<StatusDot>` inside cells. Check each component's server-safety if you need RSC compatibility.
- **TableCaption:** Renders as HTML `<caption>` — screen readers announce it before content. Use it for any non-trivial table.

See `foundations/typography.md` for the body / label variants inside cells, `foundations/surfaces.md` for table-in-card surface guidance.

## Rules

- For anything with sorting / filtering / pagination / selection / virtualization, use `<DataTable>` from `/ui/data-table`. Don't rebuild that machinery on bare Table.
- Always wrap header cells in `<TableHead>` (renders `<th>`). Don't use `<TableCell>` (`<td>`) in headers — breaks screen-reader column scope.
- Use `<TableCaption>` for any table that's not self-evident. Renders the HTML `<caption>` which screen readers announce.
- Inside Card, drop the Table directly in `<CardContent>` — don't add wrapper divs that fight the card's padding cascade.
- For wide tables on mobile, wrap in an `overflow-x-auto` container. Don't try to make a Table responsive via column stacking — switch to a card list on small viewports.
- Don't style cell text with raw Tailwind palette utilities. Use `text-fg-muted` from `foundations/color.md`.
- Compose with Badge for status, Avatar for users, IconButton for row actions. Don't invent new primitives per table.
- Keep TableCell content single-line where possible — multi-line cells make scanning hard. Use `<Stack>` only when each row genuinely needs two lines.
