import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Fade, Collapse, Grow } from '../transitions'

describe('Fade', () => {
  it('renders children when open', () => {
    render(<Fade open>Visible</Fade>)
    expect(screen.getByText('Visible')).toBeInTheDocument()
  })

  it('sets opacity 0 when closed', () => {
    render(<Fade open={false}>Hidden</Fade>)
    const el = screen.getByText('Hidden')
    expect(el.style.opacity).toBe('0')
  })

  it('sets opacity 1 when open', () => {
    render(<Fade open>Visible</Fade>)
    const el = screen.getByText('Visible')
    expect(el.style.opacity).toBe('1')
  })
})

describe('Collapse', () => {
  it('renders children', () => {
    render(<Collapse open>Content</Collapse>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('sets height 0 when closed', () => {
    render(<Collapse open={false} data-testid="collapse"><div>Content</div></Collapse>)
    const wrapper = screen.getByTestId('collapse')
    expect(wrapper.style.height).toBe('0px')
  })
})

describe('Grow', () => {
  it('renders children when open', () => {
    render(<Grow open>Content</Grow>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('scales to 0 when closed', () => {
    render(<Grow open={false}>Content</Grow>)
    const el = screen.getByText('Content')
    expect(el.style.transform).toContain('scale(0)')
  })
})
