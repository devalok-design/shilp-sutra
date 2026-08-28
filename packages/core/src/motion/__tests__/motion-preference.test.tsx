import { render, screen } from '@testing-library/react'
import { MotionConfig, MotionConfigContext } from 'framer-motion'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { MotionPreference } from '../motion-preference'
import { MotionProvider } from '../motion-provider'

// Reports the `reducedMotion` that a `motion.*` element at this position would
// actually resolve. Framer reads it straight off MotionConfigContext, so
// asserting on the context value is asserting on the real behaviour without
// having to drive an animation frame in jsdom.
function ConfigProbe({ id = 'cfg' }: { id?: string }) {
  const cfg = React.useContext(MotionConfigContext)
  return <span data-testid={id}>{String(cfg.reducedMotion)}</span>
}

describe('MotionPreference', () => {
  it('opts the subtree into the OS preference when nothing else has', () => {
    render(
      <MotionPreference>
        <ConfigProbe />
      </MotionPreference>,
    )
    expect(screen.getByTestId('cfg')).toHaveTextContent('user')
  })

  it('leaves the default in place for anything outside it', () => {
    render(
      <>
        <MotionPreference>
          <ConfigProbe id="inside" />
        </MotionPreference>
        <ConfigProbe id="outside" />
      </>,
    )
    expect(screen.getByTestId('inside')).toHaveTextContent('user')
    expect(screen.getByTestId('outside')).toHaveTextContent('never')
  })

  // The regression that matters: `reducedMotion={false}` is a deliberate
  // "animate regardless of the OS" override. A wrapper that re-enabled reduced
  // motion underneath it would silently break that documented API.
  it('does not override MotionProvider forcing animation on', () => {
    render(
      <MotionProvider reducedMotion={false}>
        <MotionPreference>
          <ConfigProbe />
        </MotionPreference>
      </MotionProvider>,
    )
    expect(screen.getByTestId('cfg')).toHaveTextContent('never')
  })

  it('does not override MotionProvider forcing reduced motion on', () => {
    render(
      <MotionProvider reducedMotion={true}>
        <MotionPreference>
          <ConfigProbe />
        </MotionPreference>
      </MotionProvider>,
    )
    expect(screen.getByTestId('cfg')).toHaveTextContent('always')
  })

  it('defers to a bare MotionConfig that has moved off the default', () => {
    render(
      <MotionConfig reducedMotion="always">
        <MotionPreference>
          <ConfigProbe />
        </MotionPreference>
      </MotionConfig>,
    )
    expect(screen.getByTestId('cfg')).toHaveTextContent('always')
  })

  // Components nest — a Dialog holding a Card holding a Badge means three of
  // these in one path. Only the outermost may configure anything.
  it('is self-cancelling when nested', () => {
    render(
      <MotionPreference>
        <MotionPreference>
          <MotionPreference>
            <ConfigProbe />
          </MotionPreference>
        </MotionPreference>
      </MotionPreference>,
    )
    expect(screen.getByTestId('cfg')).toHaveTextContent('user')
  })

  it('renders no DOM of its own', () => {
    const { container } = render(
      <MotionPreference>
        <i data-testid="child" />
      </MotionPreference>,
    )
    expect(container.firstElementChild?.tagName).toBe('I')
    expect(container.childElementCount).toBe(1)
  })
})
