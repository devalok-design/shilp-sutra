import type { Meta, StoryObj } from '@storybook/react-vite'
import { BadgeGroup } from './badge-group'
import { Badge } from './badge'

const meta: Meta<typeof BadgeGroup> = {
  title: 'UI/Core/BadgeGroup',
  component: BadgeGroup,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof BadgeGroup>

/* ── 1. Default ─────────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => (
    <BadgeGroup>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Tailwind</Badge>
    </BadgeGroup>
  ),
}

/* ── 2. Overflow / Truncation ───────────────────────────────────────── */

export const Overflow: Story = {
  render: () => (
    <BadgeGroup max={3}>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Tailwind</Badge>
      <Badge>Vite</Badge>
      <Badge>Storybook</Badge>
      <Badge>Vitest</Badge>
    </BadgeGroup>
  ),
}

/* ── 3. Overflow with Click Handler ─────────────────────────────────── */

export const OverflowClickable: Story = {
  render: () => (
    <BadgeGroup max={2} onOverflowClick={() => alert('Show all tags')}>
      <Badge color="accent">Frontend</Badge>
      <Badge color="success">Backend</Badge>
      <Badge color="warning">DevOps</Badge>
      <Badge color="error">Urgent</Badge>
    </BadgeGroup>
  ),
}

/* ── 4. Gap Variants ────────────────────────────────────────────────── */

export const GapVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['tight', 'default', 'loose'] as const).map((g) => (
        <div key={g} className="flex items-center gap-ds-04">
          <span className="w-16 text-xs text-text-secondary">{g}</span>
          <BadgeGroup gap={g}>
            <Badge>Alpha</Badge>
            <Badge>Beta</Badge>
            <Badge>Gamma</Badge>
          </BadgeGroup>
        </div>
      ))}
    </div>
  ),
}
