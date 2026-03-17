import type { Meta, StoryObj } from '@storybook/react'
import { FilePreview } from './file-preview'

const meta: Meta<typeof FilePreview> = {
  title: 'Composed/FilePreview',
  component: FilePreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof FilePreview>

export const ImageWithZoom: Story = {
  args: {
    url: 'https://placehold.co/1200x800/6366F1/ffffff?text=Pinch+%26+Zoom+Me',
    type: 'image',
    alt: 'Design mockup',
    fileName: 'hero-mockup.png',
    fileSize: '2.4 MB',
    className: 'max-w-2xl',
  },
  name: 'Image (zoom, fullscreen, keyboard)',
}

export const ImageLandscape: Story = {
  args: {
    url: 'https://placehold.co/1920x1080/0EA5E9/ffffff?text=Landscape+Preview',
    type: 'image',
    alt: 'Wide screenshot',
    fileName: 'dashboard-screenshot.png',
    fileSize: '1.1 MB',
    className: 'max-w-3xl',
  },
}

export const VideoPlayer: Story = {
  args: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    fileName: 'big-buck-bunny.mp4',
    fileSize: '158 MB',
    className: 'max-w-2xl',
  },
  name: 'Video (custom player)',
}

export const AudioPlayer: Story = {
  args: {
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    fileName: 'SoundHelix-Song-1.mp3',
    fileSize: '8.2 MB',
    className: 'max-w-lg',
  },
  name: 'Audio (branded player)',
}

export const AudioMinimal: Story = {
  args: {
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    type: 'audio',
    className: 'max-w-lg',
  },
  name: 'Audio (no file name)',
}

export const YouTubeEmbed: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'embed',
    fileName: 'Product Demo.mp4',
    className: 'max-w-2xl',
  },
  name: 'Embed (YouTube, 16:9)',
}

export const VimeoEmbed: Story = {
  args: {
    url: 'https://vimeo.com/824804225',
    type: 'embed',
    className: 'max-w-2xl',
  },
  name: 'Embed (Vimeo)',
}

export const WithFileInfo: Story = {
  args: {
    url: 'https://placehold.co/600x400/F59E0B/000000?text=Contract+v2',
    type: 'image',
    fileName: 'contract-v2-final-FINAL.pdf',
    fileSize: '4.7 MB',
    className: 'max-w-2xl',
  },
  name: 'With file name + size',
}

export const BrokenImage: Story = {
  args: {
    url: 'https://example.com/nonexistent-image.png',
    type: 'image',
    fileName: 'missing-file.png',
    className: 'max-w-2xl',
  },
  name: 'Error state (broken URL)',
}
