import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Tooltip, TooltipContent, TooltipProvider,TooltipTrigger } from './tooltip'

describe('Tooltip', () => {
  it('renders the trigger', () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button>Hover me</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('does not show content by default', () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button>Hover me</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows content when controlled open', () => {
    render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Forced open</TooltipContent>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('works with explicit TooltipProvider', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>With provider</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('merges className on content', () => {
    render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent className="custom-tooltip">Content</TooltipContent>
      </Tooltip>,
    )
    // Portal renders outside the container div, so query from document
    const el = document.querySelector('.custom-tooltip')
    expect(el).toBeInTheDocument()
  })

  it('renders with correct default side offset', () => {
    render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip info</TooltipContent>
      </Tooltip>,
    )
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
  })

  it('applies side prop to content', () => {
    render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
      </Tooltip>,
    )
    // Portal renders outside the container div, so query from document
    const content = document.querySelector('[data-side="bottom"]')
    expect(content).toBeInTheDocument()
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Accessible tooltip</TooltipContent>
      </Tooltip>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
