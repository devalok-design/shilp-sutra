import type { Meta, StoryObj } from '@storybook/react'
import { DevsabhaSkeleton, BandwidthSkeleton } from './page-skeletons'

const meta: Meta = {
  title: 'Karm/PageSkeletons',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Full-page loading skeletons for Karm pages.',
      },
    },
  },
}

export default meta

export const Devsabha: StoryObj = {
  render: () => <DevsabhaSkeleton />,
}

export const Bandwidth: StoryObj = {
  render: () => <BandwidthSkeleton />,
}
