import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Fade, Collapse, Grow, Slide } from './transitions'

const meta: Meta = {
  title: 'Foundations/Motion/Transitions',
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the transition is in its "entered" state',
    },
    duration: {
      control: 'text',
      description: 'Custom CSS duration value (e.g. "500ms")',
    },
    unmountOnClose: {
      control: 'boolean',
      description: 'Remove the element from the DOM when closed',
    },
  },
}
export default meta

const demoBox = (
  <div className="rounded-ds-md bg-interactive p-ds-05 text-text-on-color text-[length:var(--font-size-md)]">
    Transition content
  </div>
)

function ToggleDemo({
  children,
  label,
}: {
  children: (open: boolean) => React.ReactNode
  label: string
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="space-y-ds-04">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
      >
        {open ? `Hide ${label}` : `Show ${label}`}
      </button>
      {children(open)}
    </div>
  )
}

export const FadeTransition: StoryObj = {
  render: () => (
    <ToggleDemo label="Fade">
      {(open) => <Fade open={open}>{demoBox}</Fade>}
    </ToggleDemo>
  ),
}

export const FadeUnmountOnClose: StoryObj = {
  render: () => (
    <ToggleDemo label="Fade (unmount)">
      {(open) => (
        <Fade open={open} unmountOnClose>
          {demoBox}
        </Fade>
      )}
    </ToggleDemo>
  ),
}

export const CollapseTransition: StoryObj = {
  render: () => (
    <ToggleDemo label="Collapse">
      {(open) => (
        <Collapse open={open}>
          <div className="space-y-ds-03">
            <div className="rounded-ds-md bg-layer-02 p-ds-04 text-text-primary text-[length:var(--font-size-md)]">
              First collapsible item
            </div>
            <div className="rounded-ds-md bg-layer-02 p-ds-04 text-text-primary text-[length:var(--font-size-md)]">
              Second collapsible item
            </div>
            <div className="rounded-ds-md bg-layer-02 p-ds-04 text-text-primary text-[length:var(--font-size-md)]">
              Third collapsible item
            </div>
          </div>
        </Collapse>
      )}
    </ToggleDemo>
  ),
}

export const GrowTransition: StoryObj = {
  render: () => (
    <ToggleDemo label="Grow">
      {(open) => <Grow open={open}>{demoBox}</Grow>}
    </ToggleDemo>
  ),
}

export const SlideUp: StoryObj = {
  render: () => (
    <ToggleDemo label="Slide Up">
      {(open) => (
        <div className="overflow-hidden rounded-ds-md">
          <Slide open={open} direction="up">
            {demoBox}
          </Slide>
        </div>
      )}
    </ToggleDemo>
  ),
}

export const SlideDown: StoryObj = {
  render: () => (
    <ToggleDemo label="Slide Down">
      {(open) => (
        <div className="overflow-hidden rounded-ds-md">
          <Slide open={open} direction="down">
            {demoBox}
          </Slide>
        </div>
      )}
    </ToggleDemo>
  ),
}

export const SlideLeft: StoryObj = {
  render: () => (
    <ToggleDemo label="Slide Left">
      {(open) => (
        <div className="overflow-hidden rounded-ds-md">
          <Slide open={open} direction="left">
            {demoBox}
          </Slide>
        </div>
      )}
    </ToggleDemo>
  ),
}

export const SlideRight: StoryObj = {
  render: () => (
    <ToggleDemo label="Slide Right">
      {(open) => (
        <div className="overflow-hidden rounded-ds-md">
          <Slide open={open} direction="right">
            {demoBox}
          </Slide>
        </div>
      )}
    </ToggleDemo>
  ),
}

export const AllTransitions: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div className="space-y-ds-06">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors"
        >
          {open ? 'Hide All' : 'Show All'}
        </button>

        <div className="grid grid-cols-2 gap-ds-05">
          <div className="space-y-ds-03">
            <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
              Fade
            </span>
            <Fade open={open}>{demoBox}</Fade>
          </div>

          <div className="space-y-ds-03">
            <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
              Grow
            </span>
            <Grow open={open}>{demoBox}</Grow>
          </div>

          <div className="space-y-ds-03">
            <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
              Collapse
            </span>
            <Collapse open={open}>{demoBox}</Collapse>
          </div>

          <div className="space-y-ds-03">
            <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
              Slide (up)
            </span>
            <div className="overflow-hidden rounded-ds-md">
              <Slide open={open} direction="up">
                {demoBox}
              </Slide>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const CustomDuration: StoryObj = {
  render: () => (
    <ToggleDemo label="Slow Fade (800ms)">
      {(open) => (
        <Fade open={open} duration="800ms">
          {demoBox}
        </Fade>
      )}
    </ToggleDemo>
  ),
}
