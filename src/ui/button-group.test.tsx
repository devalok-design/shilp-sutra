import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'
import { ButtonGroup } from './button-group'

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
      <ButtonGroup variant="danger">
        <Button>Delete</Button>
        <Button>Remove</Button>
      </ButtonGroup>,
    )
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('merges custom className', () => {
    render(
      <ButtonGroup className="my-custom">
        <Button>A</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('my-custom')
  })
})
