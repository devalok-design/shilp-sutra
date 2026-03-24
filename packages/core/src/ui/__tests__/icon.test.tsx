import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from '../icon'
import { IconProvider } from '../icon-context'
import { IconPlus, IconCheck } from '@tabler/icons-react'

describe('Icon', () => {
  it('renders a Tabler icon', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders at default md size (18px)', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '18')
    expect(svg).toHaveAttribute('height', '18')
  })

  it('renders at xs size (14px)', () => {
    render(<Icon icon={IconPlus} size="xs" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '14')
  })

  it('renders at lg size (20px)', () => {
    render(<Icon icon={IconPlus} size="lg" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '20')
  })

  it('renders at 2xl size (32px)', () => {
    render(<Icon icon={IconPlus} size="2xl" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
  })

  it('applies regular stroke at md (strokeWidth 2)', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('stroke-width', '2')
  })

  it('applies light stroke at md (strokeWidth 1.5)', () => {
    render(<Icon icon={IconPlus} stroke="light" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it('applies bold stroke at md (strokeWidth 2.5)', () => {
    render(<Icon icon={IconPlus} stroke="bold" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('stroke-width', '2.5')
  })

  it('reads size from IconContext', () => {
    render(
      <IconProvider size="xs">
        <Icon icon={IconPlus} />
      </IconProvider>
    )
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '14')
  })

  it('explicit size overrides IconContext', () => {
    render(
      <IconProvider size="xs">
        <Icon icon={IconPlus} size="lg" />
      </IconProvider>
    )
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '20')
  })

  it('is aria-hidden by default (decorative)', () => {
    render(<Icon icon={IconPlus} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('has aria-label and role when label is provided', () => {
    render(<Icon icon={IconPlus} label="Add item" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Add item')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).not.toHaveAttribute('aria-hidden')
  })
})
