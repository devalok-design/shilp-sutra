import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Data Display/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['rectangle', 'circle', 'text'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'shimmer', 'none'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
}

export const Rectangle: Story = {
  args: { variant: 'rectangle' },
  render: (args) => <Skeleton {...args} className="h-20 w-[300px]" />,
}

export const Circle: Story = {
  args: { variant: 'circle' },
  render: (args) => <Skeleton {...args} className="h-12 w-12" />,
}

export const Text: Story = {
  args: { variant: 'text' },
  render: (args) => (
    <div className="space-y-ds-02 w-[350px]">
      <Skeleton {...args} className="w-3/4" />
      <Skeleton {...args} />
      <Skeleton {...args} />
      <Skeleton {...args} className="w-2/3" />
    </div>
  ),
}

export const Pulse: Story = {
  args: { animation: 'pulse' },
  render: (args) => <Skeleton {...args} className="h-4 w-[250px]" />,
}

export const Shimmer: Story = {
  args: { animation: 'shimmer' },
  render: (args) => <Skeleton {...args} className="h-4 w-[250px]" />,
}

export const NoAnimation: Story = {
  args: { animation: 'none' },
  render: (args) => <Skeleton {...args} className="h-4 w-[250px]" />,
}

export const ShimmerCircle: Story = {
  args: { variant: 'circle', animation: 'shimmer' },
  render: (args) => <Skeleton {...args} className="h-12 w-12" />,
}

export const ShimmerText: Story = {
  args: { variant: 'text', animation: 'shimmer' },
  render: (args) => (
    <div className="space-y-ds-02 w-[350px]">
      <Skeleton {...args} className="w-3/4" />
      <Skeleton {...args} />
      <Skeleton {...args} />
      <Skeleton {...args} className="w-2/3" />
    </div>
  ),
}

export const CardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03 w-[300px]">
      <Skeleton className="h-[125px] w-full rounded-ds-xl" />
      <div className="space-y-ds-02">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
}

export const ListSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 w-[400px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-ds-03">
          <Skeleton variant="circle" className="h-10 w-10" />
          <div className="flex-1 space-y-ds-02">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
}

export const TableSkeleton: Story = {
  render: () => (
    <div className="w-[500px] space-y-ds-03">
      <div className="flex gap-ds-04">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-ds-04">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  ),
}

export const TextBlock: Story = {
  render: () => (
    <div className="space-y-ds-02 w-[350px]">
      <Skeleton className="h-5 w-[200px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-ds-07">
      <div>
        <h3 className="text-ds-sm font-medium mb-3 text-text-secondary">
          Shapes
        </h3>
        <div className="flex items-center gap-ds-06">
          <Skeleton variant="rectangle" className="h-16 w-32" />
          <Skeleton variant="circle" className="h-16 w-16" />
          <Skeleton variant="text" className="w-48" />
        </div>
      </div>
      <div>
        <h3 className="text-ds-sm font-medium mb-3 text-text-secondary">
          Animations
        </h3>
        <div className="space-y-ds-03 w-[300px]">
          <Skeleton animation="pulse" className="h-4" />
          <Skeleton animation="shimmer" className="h-4" />
          <Skeleton animation="none" className="h-4" />
        </div>
      </div>
    </div>
  ),
}
