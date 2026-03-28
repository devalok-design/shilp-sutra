import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorSwatch } from './color-swatch'

const meta: Meta<typeof ColorSwatch> = {
  title: 'UI/Core/ColorSwatch',
  component: ColorSwatch,
  tags: ['autodocs', 'stable'],
  argTypes: {
    color: { control: 'color' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['circle', 'square', 'rounded'] },
    ring: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ColorSwatch>

export const Default: Story = {
  args: {
    color: '#6366F1',
  },
}

export const WithRing: Story = {
  args: {
    color: '#FBBF24',
    ring: true,
  },
}

export const Square: Story = {
  args: {
    color: '#10B981',
    shape: 'square',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      <ColorSwatch color="#6366F1" size="sm" />
      <ColorSwatch color="#6366F1" size="md" />
      <ColorSwatch color="#6366F1" size="lg" />
    </div>
  ),
}

export const AllShapes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      <ColorSwatch color="#EC4899" shape="circle" />
      <ColorSwatch color="#EC4899" shape="square" />
      <ColorSwatch color="#EC4899" shape="rounded" />
    </div>
  ),
}

export const BrandColors: Story = {
  render: () => {
    const colors = [
      { hex: '#6366F1', label: 'Indigo' },
      { hex: '#EC4899', label: 'Pink' },
      { hex: '#10B981', label: 'Emerald' },
      { hex: '#F59E0B', label: 'Amber' },
      { hex: '#3B82F6', label: 'Blue' },
      { hex: '#EF4444', label: 'Red' },
      { hex: '#8B5CF6', label: 'Violet' },
      { hex: '#14B8A6', label: 'Teal' },
      { hex: '#F97316', label: 'Orange' },
    ]
    return (
      <div className="grid grid-cols-3 gap-ds-04">
        {colors.map((c) => (
          <div key={c.hex} className="flex items-center gap-ds-03">
            <ColorSwatch color={c.hex} size="lg" ring />
            <div className="flex flex-col">
              <span className="text-ds-sm font-semibold text-surface-fg">{c.label}</span>
              <span className="text-ds-xs text-surface-fg-muted font-mono">{c.hex}</span>
            </div>
          </div>
        ))}
      </div>
    )
  },
}
