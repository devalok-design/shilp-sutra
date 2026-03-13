import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { MotionProvider, useMotion } from '../motion-provider'
import { springs, tweens } from '../../ui/lib/motion'

// Mock framer-motion's useReducedMotion
const mockUseReducedMotion = vi.fn(() => false)
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => mockUseReducedMotion(),
  }
})

function MotionConsumer() {
  const ctx = useMotion()
  return (
    <div>
      <span data-testid="reduced">{String(ctx.reducedMotion)}</span>
      <span data-testid="has-springs">{ctx.springs ? 'yes' : 'no'}</span>
      <span data-testid="has-tweens">{ctx.tweens ? 'yes' : 'no'}</span>
    </div>
  )
}

describe('MotionProvider', () => {
  it('renders children', () => {
    render(
      <MotionProvider>
        <span>hello</span>
      </MotionProvider>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('useMotion() returns springs and tweens from context', () => {
    render(
      <MotionProvider>
        <MotionConsumer />
      </MotionProvider>,
    )
    expect(screen.getByTestId('has-springs')).toHaveTextContent('yes')
    expect(screen.getByTestId('has-tweens')).toHaveTextContent('yes')
  })

  it('defaults to reducedMotion="user" mode (OS preference false)', () => {
    mockUseReducedMotion.mockReturnValue(false)
    render(
      <MotionProvider>
        <MotionConsumer />
      </MotionProvider>,
    )
    expect(screen.getByTestId('reduced')).toHaveTextContent('false')
  })

  it('respects OS reduced motion preference in "user" mode', () => {
    mockUseReducedMotion.mockReturnValue(true)
    render(
      <MotionProvider>
        <MotionConsumer />
      </MotionProvider>,
    )
    expect(screen.getByTestId('reduced')).toHaveTextContent('true')
  })

  it('reducedMotion={true} forces reducedMotion: true in context', () => {
    mockUseReducedMotion.mockReturnValue(false)
    render(
      <MotionProvider reducedMotion={true}>
        <MotionConsumer />
      </MotionProvider>,
    )
    expect(screen.getByTestId('reduced')).toHaveTextContent('true')
  })

  it('reducedMotion={false} forces reducedMotion: false regardless of OS', () => {
    mockUseReducedMotion.mockReturnValue(true)
    render(
      <MotionProvider reducedMotion={false}>
        <MotionConsumer />
      </MotionProvider>,
    )
    expect(screen.getByTestId('reduced')).toHaveTextContent('false')
  })

  it('useMotion() without provider returns default context', () => {
    render(<MotionConsumer />)
    expect(screen.getByTestId('reduced')).toHaveTextContent('false')
    expect(screen.getByTestId('has-springs')).toHaveTextContent('yes')
    expect(screen.getByTestId('has-tweens')).toHaveTextContent('yes')
  })
})
