import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { MotionProvider } from '../../motion/motion-provider'
import { DevadootIcon } from '../devadoot-icon'

function renderIcon(props: Parameters<typeof DevadootIcon>[0] = {}) {
  return render(
    <MotionProvider reducedMotion={true}>
      <DevadootIcon {...props} />
    </MotionProvider>,
  )
}

describe('DevadootIcon', () => {
  it('renders an SVG', () => {
    const { container } = renderIcon()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is aria-hidden for decorative use', () => {
    const { container } = renderIcon()
    // The reduced motion path renders an SVG with aria-hidden
    // The animated path wraps in a span with aria-hidden
    const hidden = container.querySelector('[aria-hidden="true"]')
    expect(hidden).toBeInTheDocument()
  })

  it('accepts custom size', () => {
    const { container } = renderIcon({ size: 32 })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })

  it('renders with processing state', () => {
    const { container } = renderIcon({ state: 'processing' })
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with error state', () => {
    const { container } = renderIcon({ state: 'error' })
    const path = container.querySelector('path')
    // Error state uses ERROR_RED fill
    expect(path).toHaveAttribute('fill', '#E5383B')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderIcon()
    expect(await axe(container)).toHaveNoViolations()
  })
})
