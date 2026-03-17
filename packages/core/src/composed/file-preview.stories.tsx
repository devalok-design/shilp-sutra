import type { Meta, StoryObj } from '@storybook/react'
import { FilePreview } from './file-preview'

const meta: Meta<typeof FilePreview> = {
  title: 'Composed/FilePreview',
  component: FilePreview,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof FilePreview>

export const Image: Story = {
  args: {
    url: 'https://placehold.co/800x600/6366F1/ffffff?text=Design+Preview',
    type: 'image',
    alt: 'Design system preview',
    className: 'max-w-2xl',
  },
}

export const Video: Story = {
  args: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    className: 'max-w-2xl',
  },
}

export const Embed: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'embed',
    className: 'max-w-2xl',
  },
}

export const Audio: Story = {
  args: {
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    className: 'max-w-md',
  },
}
