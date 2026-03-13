import type { Meta, StoryObj } from '@storybook/react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta: Meta<typeof HoverCard> = {
  title: 'UI/Feedback/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href="#"
          className="text-ds-sm font-medium underline underline-offset-4"
        >
          @nextjs
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-ds-04">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-ds-01">
            <h4 className="text-ds-sm font-semibold">@nextjs</h4>
            <p className="text-ds-sm text-surface-fg-muted">
              The React Framework -- created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-ds-02">
              <span className="text-ds-xs text-surface-fg-muted">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
