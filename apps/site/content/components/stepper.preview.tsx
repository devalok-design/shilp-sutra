'use client'

import * as React from 'react'
import { Step, Stepper } from '@devalok/shilp-sutra/ui/stepper'

export function StepperHero() {
  const [step, setStep] = React.useState(1)
  return (
    <div className="max-w-2xl">
      <Stepper activeStep={step} onStepClick={setStep}>
        <Step label="Account" description="Create your credentials" />
        <Step label="Profile" description="Add your details" />
        <Step label="Review" description="Confirm and submit" />
      </Stepper>
    </div>
  )
}

export function StepperVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="horizontal — activeStep=1">
        <Stepper activeStep={1}>
          <Step label="Cart" />
          <Step label="Shipping" />
          <Step label="Payment" />
          <Step label="Done" />
        </Stepper>
      </Block>

      <Block title="vertical">
        <Stepper activeStep={1} orientation="vertical">
          <Step label="Connect workspace" description="Link your repository" />
          <Step label="Invite teammates" description="Add collaborators" />
          <Step label="Set up billing" description="Choose a plan" />
        </Stepper>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-04 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div>{children}</div>
    </div>
  )
}
