import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Button } from './button'
import { ButtonGroup } from './button-group'

describeConformance(
  'ButtonGroup',
  (props) => (
    <ButtonGroup {...props}>
      <Button>One</Button>
      <Button>Two</Button>
    </ButtonGroup>
  ),
)

describe('ButtonGroup', () => {
  it('renders children buttons', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Three' })).toBeInTheDocument()
  })

  it('renders as a group role', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('applies horizontal orientation by default', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('flex-row')
  })

  it('applies vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('flex-col')
  })

  it('passes shared variant to children via context', () => {
    render(
      <ButtonGroup variant="solid" color="error">
        <Button>Delete</Button>
      </ButtonGroup>,
    )
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn.className).toContain('bg-error-9')
  })

})
