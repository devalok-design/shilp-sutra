import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardAction,
  CardBleed,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSection,
  CardTitle,
} from './card'
import { Badge } from './badge'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'Components/Data Display/Card',
  component: Card,
  tags: ['autodocs', 'stable'],
  argTypes: {
    interactive: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Project Update</CardTitle>
        <CardDescription>Latest status on the design system migration.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-ds-sm">
          The component library has been extracted and all primitives are ready for review.
        </p>
      </CardContent>
      <CardFooter className="gap-ds-02">
        <Button variant="solid" size="sm">View Details</Button>
        <Button variant="ghost" size="sm">Dismiss</Button>
      </CardFooter>
    </Card>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card interactive className="w-[350px]">
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Hover to see the interactive effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-ds-sm">
          This card has a hover shadow and border change to indicate interactivity.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent>
        <p className="text-ds-sm">A simple card with only content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
        <CardDescription>Are you sure you want to proceed?</CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button variant="solid">Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

export const Colors: Story = {
  render: () => {
    const colors = ['default', 'accent', 'error', 'success', 'warning', 'info', 'neutral'] as const
    return (
      <div className="grid grid-cols-2 gap-ds-04">
        {colors.map((color) => (
          <Card key={color} color={color} className="w-[280px]">
            <CardHeader>
              <CardTitle className="capitalize">{color}</CardTitle>
              <CardDescription>Card with {color} border color.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-ds-sm">The border color changes to match the semantic color.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const sizes = ['sm', 'md', 'lg'] as const
    return (
      <div className="flex flex-col gap-ds-04">
        {sizes.map((size) => (
          <Card key={size} size={size} className="w-[350px]">
            <CardHeader>
              <CardTitle className="capitalize">{size} Card</CardTitle>
              <CardDescription>Internal padding adjusts with size.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-ds-sm">
                Card content with {size} padding on header, content, and footer.
              </p>
            </CardContent>
            <CardFooter className="gap-ds-02">
              <Button variant="solid" size="sm">Action</Button>
              <Button variant="ghost" size="sm">Cancel</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  },
}

export const WithCornerAction: Story = {
  name: 'CardAction (corner slots)',
  render: () => (
    <div className="flex gap-ds-05">
      <Card className="w-[260px]">
        <CardAction>
          <Badge color="accent" size="xs">LIVE</Badge>
        </CardAction>
        <CardHeader>
          <CardTitle>Deploy status</CardTitle>
          <CardDescription>Top-right badge slot</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-ds-sm text-surface-fg-muted">Production is serving v0.44.0.</p>
        </CardContent>
      </Card>

      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>Invoice #2048</CardTitle>
          <CardDescription>Bottom-right ghost button (tucked)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-ds-sm text-surface-fg-muted">Due in 5 days.</p>
        </CardContent>
        <CardAction placement="bottom-right" tuck>
          <Button variant="ghost" size="sm">Download</Button>
        </CardAction>
      </Card>
    </div>
  ),
}

export const FullBleedMedia: Story = {
  name: 'CardBleed (full-bleed media + bands)',
  render: () => (
    <div className="flex flex-wrap gap-ds-05">
      <Card className="w-[280px]">
        <CardBleed side="top">
          <div className="h-24 bg-linear-to-br from-accent-9 to-accent-11" />
        </CardBleed>
        <CardHeader>
          <CardTitle>Cover image</CardTitle>
          <CardDescription>side=&quot;top&quot; — touches three edges, inherits the radius.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="w-[280px]">
        <CardHeader>
          <CardTitle>Storage plan</CardTitle>
        </CardHeader>
        <CardContent>
          <CardBleed>
            <div className="bg-accent-2 px-(--card-spacing) py-ds-03 text-ds-sm text-accent-11">
              90% of quota used — inline band via side=&quot;x&quot;.
            </div>
          </CardBleed>
        </CardContent>
        <CardContent>
          <p className="text-ds-sm text-surface-fg-muted">
            Note: direct children of Card already span the full width — a divider or band
            placed between slots needs no bleed at all. side=&quot;x&quot; is only for escaping
            a slot&apos;s inset.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const Horizontal: Story = {
  name: 'Horizontal (media pane + CardSection)',
  render: () => (
    <Card orientation="horizontal" className="w-[420px]">
      <div className="w-28 shrink-0 overflow-hidden rounded-l-surface">
        <div className="h-full min-h-24 bg-linear-to-br from-accent-9 to-info-9" />
      </div>
      <CardSection>
        <CardHeader>
          <CardTitle>Field notes — panchang engine</CardTitle>
          <CardDescription>Blog draft · 6 min read</CardDescription>
        </CardHeader>
        <CardFooter>
          <Badge color="neutral" size="xs">Draft</Badge>
        </CardFooter>
      </CardSection>
    </Card>
  ),
}

export const SpacingOverride: Story = {
  name: 'One-variable spacing override',
  render: () => (
    <Card className="w-[350px] [--card-spacing:var(--spacing-ds-07)] [--card-gap:var(--spacing-ds-05)]">
      <CardHeader>
        <CardTitle>Hero card</CardTitle>
        <CardDescription>
          Padding, slot inset, and CardAction corners all retune from one override.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-ds-sm">className=&quot;[--card-spacing:var(--spacing-ds-07)]&quot;</p>
      </CardContent>
    </Card>
  ),
}
