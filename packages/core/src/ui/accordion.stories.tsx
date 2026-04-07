import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from 'storybook/test'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'

const meta: Meta<typeof Accordion> = {
  title: 'UI/Navigation/Accordion',
  component: Accordion,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Single: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Shilp Sutra?</AccordionTrigger>
        <AccordionContent>
          Shilp Sutra is the Devalok design system package, providing reusable React components
          with consistent styling and behavior.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I install it?</AccordionTrigger>
        <AccordionContent>
          Run <code className="text-ds-xs bg-surface-raised-hover px-ds-01 py-0.5 rounded-ds-md">pnpm add @devalok/shilp-sutra</code> in your project directory.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it compatible with Next.js?</AccordionTrigger>
        <AccordionContent>
          Yes, Shilp Sutra is designed exclusively for Next.js 15+ with App Router support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('What is Shilp Sutra?'))
    await waitFor(() => expect(canvas.getByText(/Devalok design system package/)).toBeVisible())
  },
}

export const Multiple: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          Install the package and import the components you need. Each component is tree-shakeable.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Theming</AccordionTrigger>
        <AccordionContent>
          The design system uses CSS custom properties for theming. Override the token variables to customize the look and feel.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Accessibility</AccordionTrigger>
        <AccordionContent>
          All components are built on Radix UI primitives and follow WAI-ARIA patterns for keyboard navigation and screen reader support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Getting Started'))
    await waitFor(() => expect(canvas.getByText(/Install the package/)).toBeVisible())
    await userEvent.click(canvas.getByText('Theming'))
    await waitFor(() => expect(canvas.getByText(/CSS custom properties/)).toBeVisible())
    await expect(canvas.getByText(/Install the package/)).toBeVisible()
  },
}

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Open by Default</AccordionTrigger>
        <AccordionContent>
          This accordion item is open by default using the defaultValue prop.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Closed by Default</AccordionTrigger>
        <AccordionContent>
          This one starts closed.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const ChevronLeft: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger chevronPosition="left">Getting Started</AccordionTrigger>
        <AccordionContent>
          Install the package and import the components you need. Each component is tree-shakeable.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger chevronPosition="left">Theming</AccordionTrigger>
        <AccordionContent>
          The design system uses CSS custom properties for theming. Override the token variables to customize the look and feel.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger chevronPosition="left">Accessibility</AccordionTrigger>
        <AccordionContent>
          All components are built on Radix UI primitives and follow WAI-ARIA patterns for keyboard navigation and screen reader support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
