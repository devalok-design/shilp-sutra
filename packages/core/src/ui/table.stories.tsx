import type { Meta, StoryObj } from '@storybook/react-vite'
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
