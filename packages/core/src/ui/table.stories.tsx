import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback } from './avatar'
import { Badge } from './badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { TruncatedText } from './truncated-text'

const meta: Meta<typeof Table> = {
  title: 'Components/Data Display/Table',
  component: Table,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Table>

const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
  { id: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$1,750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const Simple: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Mudit Kumar</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Priya Sharma</TableCell>
          <TableCell>Associate</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Ravi Patel</TableCell>
          <TableCell>Apprentice</TableCell>
          <TableCell>On Leave</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="py-ds-07 text-center text-surface-fg-muted">
            No results found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-05">
      {(['compact', 'standard', 'comfortable'] as const).map((density) => (
        <Table key={density} density={density}>
          <TableHeader>
            <TableRow>
              <TableHead>{density}</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead className="text-right">Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>Goutham K</TableCell><TableCell>UI/UX</TableCell><TableCell className="text-right tabular-nums">142</TableCell></TableRow>
            <TableRow><TableCell>Yogin S</TableCell><TableCell>Product</TableCell><TableCell className="text-right tabular-nums">128</TableCell></TableRow>
          </TableBody>
        </Table>
      ))}
    </div>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead className="text-right">Estimate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableCell>Token sweep</TableCell><TableCell className="text-right tabular-nums">3h</TableCell></TableRow>
        <TableRow><TableCell>Chart palette</TableCell><TableCell className="text-right tabular-nums">5h</TableCell></TableRow>
        <TableRow><TableCell>Storybook deploy</TableCell><TableCell className="text-right tabular-nums">1h</TableCell></TableRow>
        <TableRow><TableCell>Release notes</TableCell><TableCell className="text-right tabular-nums">2h</TableCell></TableRow>
      </TableBody>
    </Table>
  ),
}

// Rich cell recipes — the patterns real tables are made of. Density→avatar rule:
// compact = text only, standard = Avatar size "xs", comfortable = "xs" or "sm".
const people = [
  { name: 'Goutham Krishnan', email: 'goutham@devalok.in', initials: 'GK', role: 'UI/UX', tags: ['Karm', 'Muhurat'], extra: 0, amount: '₹1,80,000' },
  { name: 'Yogin Sadanandan', email: 'yogin@devalok.in', initials: 'YS', role: 'Product', tags: ['Karm', 'Brand', 'Web'], extra: 2, amount: '₹2,40,000' },
  { name: 'Amal Mathew', email: 'amal@devalok.in', initials: 'AM', role: 'Motion', tags: [], extra: 0, amount: '—' },
]

export const RichCells: Story = {
  name: 'Rich cells (user / tags / money / empty)',
  render: () => (
    <Table density="comfortable">
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Projects</TableHead>
          <TableHead className="text-right">Billed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((p) => (
          <TableRow key={p.email}>
            {/* User cell: xs avatar keeps the 37px standard row; both lines truncate */}
            <TableCell>
              <div className="flex items-center gap-ds-03 min-w-0">
                <Avatar size="xs">
                  <AvatarFallback>{p.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 leading-ds-tight">
                  <TruncatedText as="p" className="text-surface-fg font-medium">{p.name}</TruncatedText>
                  <TruncatedText as="p" mode="middle" className="text-ds-sm text-surface-fg-muted">{p.email}</TruncatedText>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-surface-fg-muted">{p.role}</TableCell>
            {/* Tag group with +N overflow — never let badges wrap the row taller */}
            <TableCell>
              {p.tags.length === 0 ? (
                <span className="text-surface-fg-subtle" aria-label="No projects">—</span>
              ) : (
                <div className="flex items-center gap-ds-02">
                  {p.tags.slice(0, 2).map((t) => (
                    <Badge key={t} color="neutral" size="xs">{t}</Badge>
                  ))}
                  {p.extra > 0 && (
                    <span className="text-ds-sm text-surface-fg-subtle">+{p.extra}</span>
                  )}
                </div>
              )}
            </TableCell>
            {/* Money cell: right-aligned tabular figures; em-dash for empty */}
            <TableCell className="text-right tabular-nums">{p.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right tabular-nums">₹4,20,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const SelectedRows: Story = {
  name: 'Selected + hover states',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableCell>#1042</TableCell><TableCell><Badge color="success" size="xs">Paid</Badge></TableCell><TableCell className="text-right tabular-nums">₹4,95,600</TableCell></TableRow>
        <TableRow data-state="selected"><TableCell>#1041</TableCell><TableCell><Badge color="warning" size="xs">Sent</Badge></TableCell><TableCell className="text-right tabular-nums">₹80,000</TableCell></TableRow>
        <TableRow data-state="selected"><TableCell>#1040</TableCell><TableCell><Badge color="success" size="xs">Paid</Badge></TableCell><TableCell className="text-right tabular-nums">₹2,10,500</TableCell></TableRow>
        <TableRow><TableCell>#1039</TableCell><TableCell><Badge color="error" size="xs">Overdue</Badge></TableCell><TableCell className="text-right tabular-nums">₹36,900</TableCell></TableRow>
      </TableBody>
    </Table>
  ),
}
