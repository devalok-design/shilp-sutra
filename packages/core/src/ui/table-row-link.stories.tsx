import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconDots } from '@tabler/icons-react'

import { Badge } from './badge'
import { IconButton } from './icon-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
} from './table'
import { TableRowLink } from './table-row-link'

const meta: Meta<typeof TableRowLink> = {
  title: 'Components/Data Display/Table Row Link',
  component: TableRowLink,
  tags: ['autodocs', 'stable'],
  parameters: {
    docs: {
      description: {
        component:
          'A real-anchor row link for tables. Place inside the row’s primary `<TableCell className="relative">`. Preserves cmd/ctrl+click, middle-click, and context-menu — unlike `onClick`-on-row navigation — and is announced as a link by screen readers.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof TableRowLink>

const projects = [
  { id: 'p1', name: 'Aurora rebrand', status: 'Active' },
  { id: 'p2', name: 'Karm mobile', status: 'Active' },
  { id: 'p3', name: 'Gurukul docs', status: 'Paused' },
]

/**
 * Default — `stretch` (the row-wide click target). The whole row is clickable
 * via a pseudo-element, while the actions button sits above it with `z-[1]`.
 */
export const Stretched: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[60px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="relative">
              <TableRowLink href={`/projects/${p.id}`}>{p.name}</TableRowLink>
            </TableCell>
            <TableCell>
              <Badge color={p.status === 'Active' ? 'success' : 'neutral'} size="sm">
                {p.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <TableRowActions>
                <IconButton
                  className="relative z-[1]"
                  size="xs"
                  variant="ghost"
                  aria-label={`Actions for ${p.name}`}
                  icon={<IconDots />}
                />
              </TableRowActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/**
 * `stretch={false}` — a title-only link (GitHub-style). Row text stays
 * selectable; only the name is the click target.
 */
export const TitleOnly: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="relative">
              <TableRowLink href={`/projects/${p.id}`} stretch={false}>
                {p.name}
              </TableRowLink>
            </TableCell>
            <TableCell>
              <Badge color={p.status === 'Active' ? 'success' : 'neutral'} size="sm">
                {p.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
