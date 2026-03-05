import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Stepper, Step } from './stepper'

const meta: Meta<typeof Stepper> = {
  title: 'UI/Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: {
      control: { type: 'number', min: 0, max: 4 },
      description: 'Zero-based index of the currently active step',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction of the stepper',
    },
  },
}
export default meta
type Story = StoryObj<typeof Stepper>

export const Default: Story = {
  args: {
    activeStep: 1,
  },
  render: (args) => (
    <Stepper {...args}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Set up your profile" />
      <Step label="Review" description="Review and submit" />
    </Stepper>
  ),
}

export const FirstStep: Story = {
  render: () => (
    <Stepper activeStep={0}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Set up your profile" />
      <Step label="Review" description="Review and submit" />
    </Stepper>
  ),
}

export const MiddleStep: Story = {
  render: () => (
    <Stepper activeStep={1}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Set up your profile" />
      <Step label="Review" description="Review and submit" />
    </Stepper>
  ),
}

export const AllCompleted: Story = {
  render: () => (
    <Stepper activeStep={3}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Set up your profile" />
      <Step label="Review" description="Review and submit" />
    </Stepper>
  ),
}

export const FiveSteps: Story = {
  render: () => (
    <Stepper activeStep={2}>
      <Step label="Cart" />
      <Step label="Shipping" />
      <Step label="Payment" />
      <Step label="Confirmation" />
      <Step label="Complete" />
    </Stepper>
  ),
}

export const WithDescriptions: Story = {
  render: () => (
    <Stepper activeStep={1}>
      <Step label="Select Plan" description="Choose a subscription tier" />
      <Step label="Payment" description="Enter billing details" />
      <Step label="Verify" description="Confirm your identity" />
      <Step label="Done" description="Start using the service" />
    </Stepper>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Stepper activeStep={2} orientation="vertical">
      <Step label="Requirements" description="Gather project requirements" />
      <Step label="Design" description="Create wireframes and mockups" />
      <Step label="Development" description="Build the application" />
      <Step label="Testing" description="QA and user acceptance" />
      <Step label="Deployment" description="Ship to production" />
    </Stepper>
  ),
}

export const VerticalFirstStep: Story = {
  render: () => (
    <Stepper activeStep={0} orientation="vertical">
      <Step label="Requirements" description="Gather project requirements" />
      <Step label="Design" description="Create wireframes and mockups" />
      <Step label="Development" description="Build the application" />
    </Stepper>
  ),
}

function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(0)
  const steps = ['Details', 'Address', 'Payment', 'Confirm']

  return (
    <div className="space-y-ds-06">
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label} label={label} />
        ))}
      </Stepper>

      <div className="flex items-center gap-ds-03">
        <button
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors disabled:opacity-[0.4] disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          disabled={activeStep > steps.length - 1}
          onClick={() => setActiveStep((s) => s + 1)}
          className="rounded-ds-md bg-interactive px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-on-color hover:opacity-[0.9] transition-opacity disabled:opacity-[0.4] disabled:cursor-not-allowed"
        >
          {activeStep >= steps.length ? 'Done' : 'Next'}
        </button>
        {activeStep > steps.length - 1 && (
          <button
            type="button"
            onClick={() => setActiveStep(0)}
            className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-[length:var(--font-size-sm)] text-text-secondary">
        {activeStep > steps.length - 1
          ? 'All steps completed.'
          : `Step ${activeStep + 1} of ${steps.length}: ${steps[activeStep]}`}
      </p>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify initial state: step 1 of 4
    await expect(canvas.getByText('Step 1 of 4: Details')).toBeVisible()

    // Click Next to advance to step 2
    const nextButton = canvas.getByRole('button', { name: /next/i })
    await userEvent.click(nextButton)
    await expect(canvas.getByText('Step 2 of 4: Address')).toBeVisible()

    // Click Next again to advance to step 3
    await userEvent.click(nextButton)
    await expect(canvas.getByText('Step 3 of 4: Payment')).toBeVisible()

    // Click Back to go back to step 2
    const backButton = canvas.getByRole('button', { name: /back/i })
    await userEvent.click(backButton)
    await expect(canvas.getByText('Step 2 of 4: Address')).toBeVisible()
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-ds-08">
      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Horizontal — Step 0 active
        </span>
        <Stepper activeStep={0}>
          <Step label="First" description="Initial step" />
          <Step label="Second" description="Middle step" />
          <Step label="Third" description="Final step" />
        </Stepper>
      </div>

      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Horizontal — Step 1 active
        </span>
        <Stepper activeStep={1}>
          <Step label="First" description="Initial step" />
          <Step label="Second" description="Middle step" />
          <Step label="Third" description="Final step" />
        </Stepper>
      </div>

      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Horizontal — All completed
        </span>
        <Stepper activeStep={3}>
          <Step label="First" description="Initial step" />
          <Step label="Second" description="Middle step" />
          <Step label="Third" description="Final step" />
        </Stepper>
      </div>

      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Vertical — Step 2 active
        </span>
        <Stepper activeStep={2} orientation="vertical">
          <Step label="First" description="Initial step" />
          <Step label="Second" description="Middle step" />
          <Step label="Third" description="Final step" />
          <Step label="Fourth" description="Last step" />
        </Stepper>
      </div>
    </div>
  ),
}
