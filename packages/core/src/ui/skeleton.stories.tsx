import type { Meta, StoryObj } from '@storybook/react'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
  SkeletonChart,
  SkeletonImage,
  SkeletonGroup,
} from './skeleton'

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

// ---------------------------------------------------------------------------
// Sub-component stories
// ---------------------------------------------------------------------------

export const AvatarSizes: Story = {
  name: 'SkeletonAvatar — All Sizes',
  render: () => (
    <div className="flex items-center gap-ds-06">
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonAvatar size="sm" />
        <span className="text-ds-xs text-text-secondary">sm</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonAvatar size="md" />
        <span className="text-ds-xs text-text-secondary">md</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonAvatar size="lg" />
        <span className="text-ds-xs text-text-secondary">lg</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonAvatar size="xl" />
        <span className="text-ds-xs text-text-secondary">xl</span>
      </div>
    </div>
  ),
}

export const AvatarShimmer: Story = {
  name: 'SkeletonAvatar — Shimmer',
  render: () => (
    <div className="flex items-center gap-ds-06">
      <SkeletonAvatar size="sm" animation="shimmer" />
      <SkeletonAvatar size="md" animation="shimmer" />
      <SkeletonAvatar size="lg" animation="shimmer" />
      <SkeletonAvatar size="xl" animation="shimmer" />
    </div>
  ),
}

export const TextDefault: Story = {
  name: 'SkeletonText — Default (3 lines)',
  render: () => (
    <div className="w-[350px]">
      <SkeletonText />
    </div>
  ),
}

export const TextCustomLines: Story = {
  name: 'SkeletonText — Custom Lines',
  render: () => (
    <div className="w-[350px] space-y-ds-06">
      <div>
        <span className="text-ds-xs text-text-secondary mb-2 block">2 lines</span>
        <SkeletonText lines={2} />
      </div>
      <div>
        <span className="text-ds-xs text-text-secondary mb-2 block">5 lines</span>
        <SkeletonText lines={5} />
      </div>
    </div>
  ),
}

export const TextHalfWidth: Story = {
  name: 'SkeletonText — Half Width Last Line',
  render: () => (
    <div className="w-[350px]">
      <SkeletonText lines={4} lastLineWidth="half" />
    </div>
  ),
}

export const TextShimmer: Story = {
  name: 'SkeletonText — Shimmer',
  render: () => (
    <div className="w-[350px]">
      <SkeletonText animation="shimmer" />
    </div>
  ),
}

export const ButtonSizes: Story = {
  name: 'SkeletonButton — Sizes',
  render: () => (
    <div className="flex items-center gap-ds-04">
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="sm" />
        <span className="text-ds-xs text-text-secondary">sm</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="md" />
        <span className="text-ds-xs text-text-secondary">md</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="lg" />
        <span className="text-ds-xs text-text-secondary">lg</span>
      </div>
    </div>
  ),
}

export const ButtonFullWidth: Story = {
  name: 'SkeletonButton — Full Width',
  render: () => (
    <div className="w-[300px] space-y-ds-03">
      <SkeletonButton size="sm" width="full" />
      <SkeletonButton size="md" width="full" />
      <SkeletonButton size="lg" width="full" />
    </div>
  ),
}

export const ButtonShimmer: Story = {
  name: 'SkeletonButton — Shimmer',
  render: () => (
    <div className="flex items-center gap-ds-04">
      <SkeletonButton size="sm" animation="shimmer" />
      <SkeletonButton size="md" animation="shimmer" />
      <SkeletonButton size="lg" animation="shimmer" />
    </div>
  ),
}

export const InputSizes: Story = {
  name: 'SkeletonInput — Sizes',
  render: () => (
    <div className="w-[350px] space-y-ds-04">
      <div>
        <span className="text-ds-xs text-text-secondary mb-1 block">sm</span>
        <SkeletonInput size="sm" />
      </div>
      <div>
        <span className="text-ds-xs text-text-secondary mb-1 block">md</span>
        <SkeletonInput size="md" />
      </div>
      <div>
        <span className="text-ds-xs text-text-secondary mb-1 block">lg</span>
        <SkeletonInput size="lg" />
      </div>
    </div>
  ),
}

export const InputShimmer: Story = {
  name: 'SkeletonInput — Shimmer',
  render: () => (
    <div className="w-[350px] space-y-ds-03">
      <SkeletonInput animation="shimmer" />
    </div>
  ),
}

export const ChartDefault: Story = {
  name: 'SkeletonChart — Default (7 bars)',
  render: () => (
    <div className="w-[400px]">
      <SkeletonChart />
    </div>
  ),
}

export const ChartCustomBars: Story = {
  name: 'SkeletonChart — Custom Bar Count',
  render: () => (
    <div className="w-[400px] space-y-ds-06">
      <div>
        <span className="text-ds-xs text-text-secondary mb-2 block">4 bars</span>
        <SkeletonChart bars={4} />
      </div>
      <div>
        <span className="text-ds-xs text-text-secondary mb-2 block">12 bars</span>
        <SkeletonChart bars={12} />
      </div>
    </div>
  ),
}

export const ChartShimmer: Story = {
  name: 'SkeletonChart — Shimmer',
  render: () => (
    <div className="w-[400px]">
      <SkeletonChart animation="shimmer" height="h-48" />
    </div>
  ),
}

export const FormSkeleton: Story = {
  name: 'Composed — Form Skeleton',
  render: () => (
    <div className="w-[400px] space-y-ds-06">
      <div className="space-y-ds-02">
        <Skeleton variant="text" className="w-16 h-3" />
        <SkeletonInput size="md" />
      </div>
      <div className="space-y-ds-02">
        <Skeleton variant="text" className="w-20 h-3" />
        <SkeletonInput size="md" />
      </div>
      <div className="space-y-ds-02">
        <Skeleton variant="text" className="w-24 h-3" />
        <SkeletonInput size="lg" />
      </div>
      <SkeletonText lines={2} lastLineWidth="half" spacing="sm" />
      <div className="flex gap-ds-03 pt-ds-02">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
      </div>
    </div>
  ),
}

export const TextSingleLine: Story = {
  name: 'SkeletonText — Single Line',
  render: () => (
    <div className="w-[350px]">
      <SkeletonText lines={1} />
    </div>
  ),
}

export const TextManyLines: Story = {
  name: 'SkeletonText — Many Lines (10)',
  render: () => (
    <div className="w-[350px]">
      <SkeletonText lines={10} />
    </div>
  ),
}

export const ButtonIconOnly: Story = {
  name: 'SkeletonButton — Icon Only',
  render: () => (
    <div className="flex items-center gap-ds-04">
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="sm" width="icon" />
        <span className="text-ds-xs text-text-secondary">sm</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="md" width="icon" />
        <span className="text-ds-xs text-text-secondary">md</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <SkeletonButton size="lg" width="icon" />
        <span className="text-ds-xs text-text-secondary">lg</span>
      </div>
    </div>
  ),
}

export const ImageDefault: Story = {
  name: 'SkeletonImage — Default',
  render: () => (
    <div className="w-[400px]">
      <SkeletonImage />
    </div>
  ),
}

export const ImageCustomSize: Story = {
  name: 'SkeletonImage — Custom Size',
  render: () => (
    <div className="space-y-ds-04">
      <SkeletonImage width="w-64" height="h-32" />
      <SkeletonImage width="w-80" height="h-60" animation="shimmer" />
    </div>
  ),
}

export const GroupAccessible: Story = {
  name: 'SkeletonGroup — Accessible Wrapper',
  render: () => (
    <SkeletonGroup label="Loading user profile" className="w-[400px] space-y-ds-04">
      <div className="flex items-center gap-ds-03">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-ds-02">
          <SkeletonText lines={2} lastLineWidth="half" />
        </div>
      </div>
      <SkeletonImage height="h-32" />
      <SkeletonText lines={4} />
      <div className="flex gap-ds-03">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
      </div>
    </SkeletonGroup>
  ),
}

export const ChartShimmerWide: Story = {
  name: 'SkeletonChart — Shimmer Wide (12 bars)',
  render: () => (
    <div className="w-[600px]">
      <SkeletonChart bars={12} animation="shimmer" height="h-48" />
    </div>
  ),
}
