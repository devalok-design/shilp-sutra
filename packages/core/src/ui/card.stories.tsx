import type { Meta, StoryObj } from '@storybook/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Data Display/Card',
  component: Card,
  tags: ['autodocs'],
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
        <Button variant="primary" size="sm">View Details</Button>
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
      <CardContent className="pt-ds-06">
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
        <Button variant="primary">Confirm</Button>
      </CardFooter>
    </Card>
  ),
}
