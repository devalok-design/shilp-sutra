import type { Meta, StoryObj } from '@storybook/react'
import { ClientPortalHeader } from './client-portal-header'

const meta: Meta<typeof ClientPortalHeader> = {
  title: 'Karm/Client/ClientPortalHeader',
  component: ClientPortalHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ClientPortalHeader } from "@devalok/shilp-sutra-karm/client"`',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ClientPortalHeader>

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    orgName: 'Devalok',
    userName: 'Priya Sharma',
  },
}

export const WithOrgLogo: Story = {
  name: 'With Organization Logo',
  args: {
    orgName: 'Devalok',
    orgLogo:
      'https://ui-avatars.com/api/?name=D&background=d33163&color=fff&size=64&bold=true',
    userName: 'Mudit Kapoor',
    userAvatar:
      'https://ui-avatars.com/api/?name=MK&background=6366f1&color=fff&size=64',
  },
}

export const WithUserAvatar: Story = {
  name: 'With User Avatar',
  args: {
    orgName: 'Acme Corp',
    userName: 'Rahul Verma',
    userAvatar:
      'https://ui-avatars.com/api/?name=RV&background=059669&color=fff&size=64',
  },
}

export const LongOrgName: Story = {
  name: 'Long Organization Name',
  args: {
    orgName: 'International Business Solutions Pvt. Ltd.',
    userName: 'Ananya Krishnamurthy',
  },
}

export const SingleWordNames: Story = {
  name: 'Single Word Names',
  args: {
    orgName: 'Startup',
    userName: 'Admin',
  },
}

export const WithChildren: Story = {
  name: 'With Extra Navigation',
  args: {
    orgName: 'Devalok',
    userName: 'Priya Sharma',
  },
  render: (args) => (
    <ClientPortalHeader {...args}>
      <nav className="flex items-center gap-ds-04 text-ds-sm">
        <a
          href="#"
          className="font-medium text-text-primary hover:underline"
        >
          Dashboard
        </a>
        <a
          href="#"
          className="text-text-secondary hover:underline"
        >
          Projects
        </a>
        <a
          href="#"
          className="text-text-secondary hover:underline"
        >
          Support
        </a>
      </nav>
    </ClientPortalHeader>
  ),
}

export const NoAvatars: Story = {
  name: 'No Avatars (Fallbacks Only)',
  args: {
    orgName: 'TechStart',
    orgLogo: null,
    userName: 'Kavya Nair',
    userAvatar: null,
  },
}
