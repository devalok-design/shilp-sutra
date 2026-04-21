import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Code } from './code'

describeConformance('Code', (props) => <Code {...props}>snippet</Code>, {
  variants: ['inline', 'block'],
})

describe('Code', () => {
  it('renders inline <code> by default', () => {
    render(<Code>console.log</Code>)
    const el = screen.getByText('console.log')
    expect(el.tagName).toBe('CODE')
  })

  it('block variant renders <pre> wrapping <code>', () => {
    render(<Code variant="block">const x = 1</Code>)
    const pre = screen.getByText('const x = 1').closest('pre')
    expect(pre).toBeInTheDocument()
    expect(pre!.tagName).toBe('PRE')
    const code = pre!.querySelector('code')
    expect(code).toBeInTheDocument()
    expect(code).toHaveTextContent('const x = 1')
  })

  it('block variant has overflow-x-auto for scrolling', () => {
    render(<Code variant="block" data-testid="block-code">long line</Code>)
    const pre = screen.getByTestId('block-code')
    expect(pre).toHaveClass('overflow-x-auto')
  })
})
