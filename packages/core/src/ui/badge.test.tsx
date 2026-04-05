import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from './badge'
import { BadgeIndicator } from './badge-indicator'
import { BadgeGroup } from './badge-group'
import { IconPlus } from '@tabler/icons-react'
import { Icon } from './icon'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with subtle variant by default', () => {
    const { container } = render(<Badge>Test</Badge>)
    expect(container.firstChild).toHaveClass('bg-surface-raised-hover')
  })

  it('renders solid variant', () => {
    const { container } = render(<Badge variant="solid" color="accent">Test</Badge>)
    expect(container.firstChild?.className).toContain('bg-accent-9')
  })

  it('renders outline variant', () => {
    const { container } = render(<Badge variant="outline" color="error">Test</Badge>)
    expect(container.firstChild?.className).toContain('border')
    expect(container.firstChild?.className).toContain('text-error-11')
  })

  it('renders soft variant without border', () => {
    const { container } = render(<Badge variant="soft" color="success">Test</Badge>)
    expect(container.firstChild?.className).toContain('bg-success-3')
    expect(container.firstChild?.className).toContain('border-transparent')
  })

  it('renders startIcon', () => {
    render(<Badge startIcon={<Icon icon={IconPlus} />}>Test</Badge>)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders dot indicator', () => {
    const { container } = render(<Badge dot>Test</Badge>)
    // dot renders two spans (pulse + dot)
    const dots = container.querySelectorAll('.rounded-full.bg-current')
    expect(dots.length).toBeGreaterThanOrEqual(1)
  })

  it('onDismiss renders dismiss button', () => {
    const dismiss = vi.fn()
    render(<Badge onDismiss={dismiss}>Test</Badge>)
    const btn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(btn)
    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('onClick renders as button', () => {
    const click = vi.fn()
    render(<Badge onClick={click}>Test</Badge>)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(click).toHaveBeenCalledOnce()
  })

  it('onClick + onDismiss uses div with role=button for outer', () => {
    render(<Badge onClick={() => {}} onDismiss={() => {}}>Test</Badge>)
    // The outer element should be a div with role="button"
    const outer = screen.getByRole('button', { name: /remove/i }).closest('[role="button"]')
    expect(outer).toBeInTheDocument()
  })

  it('selected adds check icon when interactive', () => {
    render(<Badge selected onClick={() => {}}>Test</Badge>)
    // check icon SVG should be present (only renders when onClick + selected)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(1)
  })

  it('disabled adds opacity class', () => {
    const { container } = render(<Badge disabled>Test</Badge>)
    expect(container.firstChild?.className).toContain('opacity-')
  })

  it('maxWidth truncates', () => {
    const { container } = render(<Badge maxWidth={50}>Very long text</Badge>)
    expect(container.querySelector('.truncate')).toBeInTheDocument()
  })

  it('truncate prop enables ellipsis without maxWidth', () => {
    const { container } = render(<Badge truncate className="w-20">Very long text that overflows</Badge>)
    const truncEl = container.querySelector('.truncate')
    expect(truncEl).toBeInTheDocument()
    expect(truncEl).toHaveAttribute('title', 'Very long text that overflows')
  })

  it('circle forces square aspect', () => {
    const { container } = render(<Badge circle>3</Badge>)
    expect(container.firstChild?.className).toContain('aspect-square')
  })

  it('merges custom className', () => {
    const { container } = render(<Badge className="extra-class">Custom</Badge>)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})

describe('BadgeIndicator', () => {
  it('shows count', () => {
    render(<BadgeIndicator count={5}><span>icon</span></BadgeIndicator>)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows max overflow', () => {
    render(<BadgeIndicator count={150} max={99}><span>icon</span></BadgeIndicator>)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('hides when invisible', () => {
    render(<BadgeIndicator count={5} invisible><span>icon</span></BadgeIndicator>)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('hides zero by default', () => {
    render(<BadgeIndicator count={0}><span>icon</span></BadgeIndicator>)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows zero when showZero', () => {
    render(<BadgeIndicator count={0} showZero><span>icon</span></BadgeIndicator>)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

describe('BadgeGroup', () => {
  it('shows all children when no max', () => {
    render(
      <BadgeGroup>
        <Badge>A</Badge>
        <Badge>B</Badge>
        <Badge>C</Badge>
      </BadgeGroup>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows overflow when max exceeded', () => {
    render(
      <BadgeGroup max={2}>
        <Badge>A</Badge>
        <Badge>B</Badge>
        <Badge>C</Badge>
        <Badge>D</Badge>
      </BadgeGroup>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('C')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
