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
  TableRowActions,
} from '@devalok/shilp-sutra/ui/table'
import { TableRowLink } from '@devalok/shilp-sutra/ui/table-row-link' // client-only
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

## Props

| Component | Prop | Values | Notes |
|---|---|---|---|
| `Table` | `density` | `compact` \| `standard` (default) \| `comfortable` | Rows ≈ 29 / 37 / 45 px via `--table-py`; header height tracks it |
| `Table` | `striped` | boolean | Opt-in zebra. Hairline separators are the default row cue — stripe only very wide/dense tables |
| `TableCell` / `TableHead` | `numeric` | boolean | Right-align + tabular figures. Quantities only — dates/phones/IDs stay left |
| `TableRowActions` | `persist` | boolean | Actions always visible instead of hover/focus reveal |
| `TableRowLink` | `href`, `stretch` | string, boolean (default true) | Real-anchor whole-row navigation; `stretch={false}` = title-only link |

Everything else is a thin semantic wrapper over standard HTML attributes plus `className`.

**Density → cell content.** Rows grow silently when content is taller than the text line: `compact` = text only, `standard` = `Avatar size="xs"` max + single-line identity, `comfortable` = the only density for two-line identity (name + email).

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

**Row actions (hover/focus-revealed via TableRowActions):**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>File</TableHead>
      <TableHead numeric>Size</TableHead>
      <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {files.map((f) => (
      <TableRow key={f.id}>
        <TableCell>{f.name}</TableCell>
        <TableCell numeric>{formatFileSize(f.size)}</TableCell>
        <TableCell>
          <TableRowActions>
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
          </TableRowActions>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

`TableRowActions` reveals on row hover AND keyboard focus (buttons stay permanently tabbable — opacity reveal, never `display:none`); always visible on touch. Pass `persist` to keep actions always visible. Give the column a visually-hidden header.

**Whole-row navigation (TableRowLink — client component):**
```tsx
<TableRow>
  <TableCell className="relative">
    <TableRowLink href={`/projects/${p.id}`}>{p.name}</TableRowLink>
  </TableCell>
  <TableCell><Badge color="success">Active</Badge></TableCell>
  <TableCell>
    <TableRowActions>
      <IconButton className="relative z-[1]" size="xs" variant="ghost" aria-label={`Actions for ${p.name}`} icon={<Icon icon={IconDots} />} />
    </TableRowActions>
  </TableCell>
</TableRow>
```

A real anchor stretched across the row — cmd/ctrl+click, middle-click, and "open in new tab" work. The primary cell must be `className="relative"`; other interactive elements in the row need `className="relative z-[1]"`. **Never** put `onClick` on a `<TableRow>` for navigation. Trade-off: the stretch blocks text selection — `stretch={false}` gives a title-only link.

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

Better: for edge-to-edge rows (borders and hover running the full card width), place the Table as a **direct child of Card** instead of inside `CardContent` — first/last cells automatically pad with `var(--card-spacing)` so columns align with the card's header/footer slots. Use `CardContent` wrapping only when the table should stay inset.

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
- Keep TableCell content single-line where possible — multi-line cells make scanning hard. Two-line identity cells (name + email) require `density="comfortable"`.
- Quantitative columns get `numeric` (right + tabular figures). Identifier-numbers (dates, phones, IDs) stay left. Negatives: never color alone — pair with a minus sign or parentheses.
- Row navigation = `<TableRowLink>` (real anchor), never `onClick` on the row. Row actions = `<TableRowActions>` with a visually-hidden column header.
- Empty cells get a muted em-dash with `aria-label`, never blank: `<span className="text-fg-muted" aria-label="No value">—</span>`.
