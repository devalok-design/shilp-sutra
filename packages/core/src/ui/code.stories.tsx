import type { Meta, StoryObj } from '@storybook/react'
import { Code } from './code'

const meta: Meta<typeof Code> = {
  title: 'UI/Data Display/Code',
  component: Code,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['inline', 'block'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Code>

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      Run <Code>pnpm install</Code> to install dependencies.
    </p>
  ),
}

export const Block: Story = {
  render: () => (
    <Code variant="block">
      {`import { Button } from '@devalok/shilp-sutra'

function App() {
  return <Button variant="primary">Click me</Button>
}`}
    </Code>
  ),
}

export const InlineInParagraph: Story = {
  render: () => (
    <p className="text-sm max-w-md">
      The <Code>requireUser(request)</Code> guard throws a redirect to{' '}
      <Code>/login</Code> if the user is unauthenticated. Use{' '}
      <Code>requireRole()</Code> for role-based access control.
    </p>
  ),
}

export const BlockMultiline: Story = {
  render: () => (
    <Code variant="block">
      {`// prisma/schema.prisma
model V2Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("TODO")
  priority    String   @default("MEDIUM")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`}
    </Code>
  ),
}

export const SingleLineBlock: Story = {
  render: () => (
    <Code variant="block">
      npx prisma migrate dev --name add-notifications
    </Code>
  ),
}
