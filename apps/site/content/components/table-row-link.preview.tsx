'use client'

import { Badge } from '@devalok/shilp-sutra/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@devalok/shilp-sutra/ui/table'
import { TableRowLink } from '@devalok/shilp-sutra/ui/table-row-link'

const ROWS = [
  { id: 'orbit', name: 'Orbit redesign', status: 'Active' },
  { id: 'karm', name: 'Karm mobile app', status: 'Review' },
  { id: 'setu', name: 'Setu brand kit', status: 'Draft' },
]

export function TableRowLinkHero() {
  return (
    <div className="w-full rounded-surface border border-surface-border-subtle bg-surface-raised">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="relative">
                <TableRowLink href={`#/projects/${row.id}`}>{row.name}</TableRowLink>
              </TableCell>
              <TableCell>
                <Badge variant="soft" color={row.status === 'Active' ? 'success' : 'neutral'}>
                  {row.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TableRowLinkVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="stretch (default — whole row is the click target)">
        <div className="w-full rounded-surface border border-surface-border-subtle bg-surface-raised">
          <Table>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="relative">
                    <TableRowLink href={`#/projects/${row.id}`}>{row.name}</TableRowLink>
                  </TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Block>

      <Block title="stretch={false} (title-only, text stays selectable)">
        <div className="w-full rounded-surface border border-surface-border-subtle bg-surface-raised">
          <Table>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="relative">
                    <TableRowLink href={`#/projects/${row.id}`} stretch={false}>
                      {row.name}
                    </TableRowLink>
                  </TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
