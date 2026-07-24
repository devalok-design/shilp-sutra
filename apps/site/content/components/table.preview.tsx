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

const ROWS = [
  { name: 'Orbit redesign', owner: 'Aisha Kapoor', status: 'Active', hours: 128 },
  { name: 'Karm mobile app', owner: 'Ben Carter', status: 'Review', hours: 64 },
  { name: 'Setu brand kit', owner: 'Chen Wei', status: 'Draft', hours: 12 },
]

export function TableHero() {
  return (
    <div className="w-full rounded-surface border border-surface-border-subtle bg-surface-raised">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium text-surface-fg">{row.name}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>
                <Badge variant="soft" color={row.status === 'Active' ? 'success' : 'neutral'}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell numeric>{row.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TableVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="density=compact">
        <DemoTable density="compact" />
      </Block>

      <Block title="density=comfortable">
        <DemoTable density="comfortable" />
      </Block>

      <Block title="striped">
        <DemoTable striped />
      </Block>
    </div>
  )
}

function DemoTable({
  density,
  striped,
}: {
  density?: 'compact' | 'standard' | 'comfortable'
  striped?: boolean
}) {
  return (
    <div className="w-full rounded-surface border border-surface-border-subtle bg-surface-raised">
      <Table density={density} striped={striped}>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead numeric>Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium text-surface-fg">{row.name}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell numeric>{row.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
