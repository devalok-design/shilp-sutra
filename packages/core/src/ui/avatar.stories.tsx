import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const SingleLetter: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>A</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-ds-xs">XS</AvatarFallback>
      </Avatar>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-ds-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarFallback className="text-ds-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-20 w-20">
        <AvatarFallback className="text-ds-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <div className="flex items-center gap-ds-02">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const statuses = ['online', 'offline', 'busy', 'away'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Sizes (with fallback)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {sizes.map((size) => (
              <Avatar key={size} size={size}>
                <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Sizes (with image)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {sizes.map((size) => (
              <Avatar key={size} size={size}>
                <AvatarImage src="https://github.com/shadcn.png" alt={`Avatar ${size}`} />
                <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        {statuses.map((status) => (
          <div key={status}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary capitalize">Status: {status}</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {sizes.map((size) => (
                <Avatar key={`${status}-${size}`} size={size} status={status}>
                  <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}
