import type { Meta, StoryObj } from '@storybook/react'
import { CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton } from './loading-skeleton'

const meta: Meta = {
  title: 'Composed/LoadingSkeleton',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj

// --- CardSkeleton ---

export const Card: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <CardSkeleton />
    </div>
  ),
}

export const CardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
}

// --- TableSkeleton ---

export const Table: Story = {
  render: () => <TableSkeleton />,
}

export const TableThreeRowsTwoColumns: Story = {
  render: () => <TableSkeleton rows={3} columns={2} />,
}

export const TableEightRowsSixColumns: Story = {
  render: () => <TableSkeleton rows={8} columns={6} />,
}

// --- BoardSkeleton ---

export const Board: Story = {
  render: () => <BoardSkeleton />,
}

export const BoardTwoColumns: Story = {
  render: () => <BoardSkeleton columns={2} cardsPerColumn={4} />,
}

export const BoardSixColumns: Story = {
  render: () => <BoardSkeleton columns={6} cardsPerColumn={2} />,
}

// --- ListSkeleton ---

export const List: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ListSkeleton />
    </div>
  ),
}

export const ListWithoutAvatars: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ListSkeleton showAvatar={false} />
    </div>
  ),
}

export const ListThreeRows: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ListSkeleton rows={3} />
    </div>
  ),
}

export const ListTenRows: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ListSkeleton rows={10} />
    </div>
  ),
}

// --- All Together ---

export const AllSkeletons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          CardSkeleton
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      <div>
        <p style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          TableSkeleton
        </p>
        <TableSkeleton rows={4} columns={4} />
      </div>

      <div>
        <p style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          BoardSkeleton
        </p>
        <BoardSkeleton columns={4} cardsPerColumn={2} />
      </div>

      <div>
        <p style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          ListSkeleton
        </p>
        <div style={{ maxWidth: 480 }}>
          <ListSkeleton rows={4} />
        </div>
      </div>
    </div>
  ),
}
