import type { Meta, StoryObj } from '@storybook/react'
import { AvatarStack } from './avatar-stack'
import { TooltipProvider } from './tooltip'
import type { AvatarData } from './avatar-stack'

const sampleAvatars: AvatarData[] = [
  { name: 'Mudit Kumar', fallback: 'MK', src: 'https://github.com/shadcn.png' },
  { name: 'Priya Sharma', fallback: 'PS' },
  { name: 'Ravi Patel', fallback: 'RP' },
  { name: 'Ananya Singh', fallback: 'AS' },
  { name: 'Deepak Verma', fallback: 'DV' },
  { name: 'Neha Gupta', fallback: 'NG' },
  { name: 'Arjun Reddy', fallback: 'AR' },
]

const meta: Meta<typeof AvatarStack> = {
  title: 'UI/Data Display/AvatarStack',
  component: AvatarStack,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  argTypes: {
    maxAvatars: { control: { type: 'number', min: 1, max: 10 } },
    size: { control: { type: 'number', min: 20, max: 80 } },
    overlap: { control: { type: 'number', min: 0, max: 20 } },
    disableTooltip: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof AvatarStack>

export const Default: Story = {
  args: {
    avatars: sampleAvatars,
  },
}

export const FewAvatars: Story = {
  args: {
    avatars: sampleAvatars.slice(0, 3),
  },
}

export const CustomMax: Story = {
  args: {
    avatars: sampleAvatars,
    maxAvatars: 2,
  },
}

export const LargeSize: Story = {
  args: {
    avatars: sampleAvatars.slice(0, 4),
    size: 56,
    overlap: 12,
  },
}

export const SmallSize: Story = {
  args: {
    avatars: sampleAvatars.slice(0, 4),
    size: 28,
    overlap: 6,
  },
}

export const WithTooltips: Story = {
  args: {
    avatars: sampleAvatars.slice(0, 4),
    disableTooltip: false,
  },
}

export const SingleAvatar: Story = {
  args: {
    avatars: [sampleAvatars[0]],
  },
}

export const AllOverflow: Story = {
  args: {
    avatars: sampleAvatars,
    maxAvatars: 1,
  },
}
