import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import {
  MotionFade,
  MotionScale,
  MotionPop,
  MotionSlide,
  MotionCollapse,
  MotionStagger,
  MotionStaggerItem,
} from '../primitives'

// ── Helpers ──

function renderWithShow(
  Component: React.ForwardRefExoticComponent<any>,
  props: Record<string, any> = {},
) {
  return render(
    <Component show={true} {...props}>
      <span>content</span>
    </Component>,
  )
}

// ── MotionFade ──

describe('MotionFade', () => {
  it('renders children when show={true}', () => {
    renderWithShow(MotionFade)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('does NOT render children when show={false}', async () => {
    const { rerender } = render(
      <MotionFade show={true}>
        <span>content</span>
      </MotionFade>,
    )
    rerender(
      <MotionFade show={false}>
        <span>content</span>
      </MotionFade>,
    )
    await waitFor(() =>
      expect(screen.queryByText('content')).not.toBeInTheDocument(),
    )
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionFade show={true} ref={ref}>
        <span>content</span>
      </MotionFade>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionFade show={true} ref={ref} className="test-class">
        <span>content</span>
      </MotionFade>,
    )
    expect(ref.current).toHaveClass('test-class')
  })
})

// ── MotionScale ──

describe('MotionScale', () => {
  it('renders children when show={true}', () => {
    renderWithShow(MotionScale)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('does NOT render children when show={false}', async () => {
    const { rerender } = render(
      <MotionScale show={true}>
        <span>content</span>
      </MotionScale>,
    )
    rerender(
      <MotionScale show={false}>
        <span>content</span>
      </MotionScale>,
    )
    await waitFor(() =>
      expect(screen.queryByText('content')).not.toBeInTheDocument(),
    )
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionScale show={true} ref={ref}>
        <span>content</span>
      </MotionScale>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionScale show={true} ref={ref} className="scale-class">
        <span>content</span>
      </MotionScale>,
    )
    expect(ref.current).toHaveClass('scale-class')
  })
})

// ── MotionPop ──

describe('MotionPop', () => {
  it('renders children when show={true}', () => {
    renderWithShow(MotionPop)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('does NOT render children when show={false}', async () => {
    const { rerender } = render(
      <MotionPop show={true}>
        <span>content</span>
      </MotionPop>,
    )
    rerender(
      <MotionPop show={false}>
        <span>content</span>
      </MotionPop>,
    )
    await waitFor(() =>
      expect(screen.queryByText('content')).not.toBeInTheDocument(),
    )
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionPop show={true} ref={ref}>
        <span>content</span>
      </MotionPop>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionPop show={true} ref={ref} className="pop-class">
        <span>content</span>
      </MotionPop>,
    )
    expect(ref.current).toHaveClass('pop-class')
  })
})

// ── MotionSlide ──

describe('MotionSlide', () => {
  it('renders children when show={true}', () => {
    renderWithShow(MotionSlide)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('does NOT render children when show={false}', async () => {
    const { rerender } = render(
      <MotionSlide show={true}>
        <span>content</span>
      </MotionSlide>,
    )
    rerender(
      <MotionSlide show={false}>
        <span>content</span>
      </MotionSlide>,
    )
    await waitFor(() =>
      expect(screen.queryByText('content')).not.toBeInTheDocument(),
    )
  })

  it('accepts direction prop', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionSlide show={true} direction="left" ref={ref}>
        <span>content</span>
      </MotionSlide>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionSlide show={true} ref={ref}>
        <span>content</span>
      </MotionSlide>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionSlide show={true} ref={ref} className="slide-class">
        <span>content</span>
      </MotionSlide>,
    )
    expect(ref.current).toHaveClass('slide-class')
  })
})

// ── MotionCollapse ──

describe('MotionCollapse', () => {
  it('renders children when show={true}', () => {
    renderWithShow(MotionCollapse)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('hides content when show={false} (height: 0, opacity: 0)', async () => {
    const ref = React.createRef<HTMLDivElement>()
    const { rerender } = render(
      <MotionCollapse show={true} ref={ref}>
        <span>content</span>
      </MotionCollapse>,
    )
    rerender(
      <MotionCollapse show={false} ref={ref}>
        <span>content</span>
      </MotionCollapse>,
    )
    // MotionCollapse uses initial={false} so the exit animation sets height: 0 / opacity: 0
    // but the node may linger in jsdom. Check either removal or collapsed styles.
    await waitFor(() => {
      const el = screen.queryByText('content')
      if (el) {
        const wrapper = el.closest('div[style]')
        expect(wrapper).toHaveStyle({ height: '0px', opacity: '0' })
      } else {
        // Element was fully removed — also valid
        expect(el).toBeNull()
      }
    })
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionCollapse show={true} ref={ref}>
        <span>content</span>
      </MotionCollapse>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionCollapse show={true} ref={ref} className="collapse-class">
        <span>content</span>
      </MotionCollapse>,
    )
    expect(ref.current).toHaveClass('collapse-class')
  })
})

// ── MotionStagger + MotionStaggerItem ──

describe('MotionStagger + MotionStaggerItem', () => {
  it('renders all stagger items', () => {
    render(
      <MotionStagger>
        <MotionStaggerItem>
          <span>item 1</span>
        </MotionStaggerItem>
        <MotionStaggerItem>
          <span>item 2</span>
        </MotionStaggerItem>
        <MotionStaggerItem>
          <span>item 3</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(screen.getByText('item 1')).toBeInTheDocument()
    expect(screen.getByText('item 2')).toBeInTheDocument()
    expect(screen.getByText('item 3')).toBeInTheDocument()
  })

  it('items are present in the DOM', () => {
    render(
      <MotionStagger data-testid="stagger-root">
        <MotionStaggerItem>
          <span>child</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(screen.getByTestId('stagger-root')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('MotionStagger forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionStagger ref={ref}>
        <MotionStaggerItem>
          <span>child</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('MotionStaggerItem forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionStagger>
        <MotionStaggerItem ref={ref}>
          <span>child</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('MotionStagger accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionStagger ref={ref} className="stagger-class">
        <MotionStaggerItem>
          <span>child</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(ref.current).toHaveClass('stagger-class')
  })

  it('MotionStaggerItem accepts className', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MotionStagger>
        <MotionStaggerItem ref={ref} className="item-class">
          <span>child</span>
        </MotionStaggerItem>
      </MotionStagger>,
    )
    expect(ref.current).toHaveClass('item-class')
  })
})
