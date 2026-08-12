import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Diff } from './diff'

const mockUseReducedMotion = vi.fn(() => false)
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useReducedMotion: () => mockUseReducedMotion() }
})

describe('Diff', () => {
  it('renders without crashing', () => {
    const { container } = render(<Diff before="a" after="b" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('merges className', () => {
    const { container } = render(<Diff before="a" after="b" className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Diff before="a" after="b" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Diff before="line one\nline two" after="line one\nline three" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('inline mode (default)', () => {
    it('shows the +N / -N / change-count summary', () => {
      render(<Diff before="a\nb\nc" after="a\nx\nc" />)
      expect(screen.getByText('1 change')).toBeInTheDocument()
    })

    it('shows "No changes" when before equals after', () => {
      render(<Diff before="same" after="same" />)
      expect(screen.getByText('No changes')).toBeInTheDocument()
    })

    it('hides the summary when showSummary is false', () => {
      render(<Diff before="a" after="b" showSummary={false} />)
      expect(screen.queryByText(/change/)).not.toBeInTheDocument()
    })
  })

  describe('split mode', () => {
    it('shows column labels', () => {
      render(<Diff before="a" after="b" mode="split" />)
      expect(screen.getByText('Committed')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('respects custom beforeLabel/afterLabel', () => {
      render(<Diff before="a" after="b" mode="split" beforeLabel="Old" afterLabel="New" />)
      expect(screen.getByText('Old')).toBeInTheDocument()
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })

  describe('fields mode', () => {
    it('renders added/removed/changed field rows', () => {
      const before = JSON.stringify({ a: 1, b: 2 })
      const after = JSON.stringify({ a: 1, b: 3, c: 4 })
      render(<Diff before={before} after={after} mode="fields" />)
      expect(screen.getByText('b')).toBeInTheDocument()
      expect(screen.getByText('c')).toBeInTheDocument()
      expect(screen.getByText('Changed')).toBeInTheDocument()
      expect(screen.getByText('Added')).toBeInTheDocument()
    })

    it('shows "No field changes." when JSON is identical', () => {
      const json = JSON.stringify({ a: 1 })
      render(<Diff before={json} after={json} mode="fields" />)
      expect(screen.getByText('No field changes.')).toBeInTheDocument()
    })

    it('shows a default error message when before fails to parse', () => {
      render(<Diff before="not json" after={JSON.stringify({ a: 1 })} mode="fields" />)
      expect(screen.getByText('Fields mode needs valid before JSON.')).toBeInTheDocument()
    })

    it('shows a default error message when after fails to parse', () => {
      render(<Diff before={JSON.stringify({ a: 1 })} after="not json" mode="fields" />)
      expect(screen.getByText('Fields mode needs valid after JSON.')).toBeInTheDocument()
    })

    it('shows both default error messages when both sides fail to parse', () => {
      render(<Diff before="nope" after="nope either" mode="fields" />)
      expect(screen.getByText('Fields mode needs valid before JSON.')).toBeInTheDocument()
      expect(screen.getByText('Fields mode needs valid after JSON.')).toBeInTheDocument()
    })

    it('uses a custom beforeParseError render function', () => {
      render(
        <Diff
          before="bad"
          after={JSON.stringify({ a: 1 })}
          mode="fields"
          beforeParseError={(raw) => <span>Custom before error: {raw}</span>}
        />,
      )
      expect(screen.getByText('Custom before error: bad')).toBeInTheDocument()
      expect(screen.queryByText('Fields mode needs valid before JSON.')).not.toBeInTheDocument()
    })

    it('uses a custom afterParseError render function', () => {
      render(
        <Diff
          before={JSON.stringify({ a: 1 })}
          after="bad"
          mode="fields"
          afterParseError={(raw) => <span>Custom after error: {raw}</span>}
        />,
      )
      expect(screen.getByText('Custom after error: bad')).toBeInTheDocument()
      expect(screen.queryByText('Fields mode needs valid after JSON.')).not.toBeInTheDocument()
    })
  })

  describe('collapse/expand', () => {
    const manyContextLines = Array.from({ length: 10 }, (_, i) => `context ${i}`).join('\n')
    const before = `${manyContextLines}\nold line`
    const after = `${manyContextLines}\nnew line`

    it('collapses long unchanged runs behind an expander by default', () => {
      render(<Diff before={before} after={after} />)
      expect(screen.getByText(/Expand \d+ unchanged lines?/)).toBeInTheDocument()
    })

    it('expands hidden lines when the expander is clicked', async () => {
      render(<Diff before={before} after={after} />)
      const expandButton = screen.getByText(/Expand \d+ unchanged lines?/)
      expandButton.click()
      await waitFor(() => {
        expect(screen.getByText('context 0')).toBeInTheDocument()
      })
    })

    it('never collapses when collapseUnchanged is false', () => {
      render(<Diff before={before} after={after} collapseUnchanged={false} />)
      expect(screen.queryByText(/Expand \d+ unchanged lines?/)).not.toBeInTheDocument()
      expect(screen.getByText('context 0')).toBeInTheDocument()
    })

    it('respects a custom collapseThreshold', () => {
      render(<Diff before={before} after={after} collapseThreshold={20} />)
      expect(screen.queryByText(/Expand \d+ unchanged lines?/)).not.toBeInTheDocument()
    })

    it('expands under reduced motion too', async () => {
      mockUseReducedMotion.mockReturnValue(true)
      render(<Diff before={before} after={after} />)
      const expandButton = screen.getByText(/Expand \d+ unchanged lines?/)
      expandButton.click()
      await waitFor(() => {
        expect(screen.getByText('context 0')).toBeInTheDocument()
      })
      mockUseReducedMotion.mockReturnValue(false)
    })
  })

  describe('accept/reject callbacks', () => {
    it('does not render controls when neither callback is provided', () => {
      render(<Diff before="a" after="b" />)
      expect(screen.queryByLabelText(/Accept change/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Reject change/)).not.toBeInTheDocument()
    })

    it('calls onAcceptHunk with the hunk on click', () => {
      const onAcceptHunk = vi.fn()
      render(<Diff before="a" after="b" onAcceptHunk={onAcceptHunk} />)
      screen.getByLabelText('Accept change 1').click()
      expect(onAcceptHunk).toHaveBeenCalledWith({ index: 0, before: 'a', after: 'b' })
    })

    it('calls onRejectHunk with the hunk on click', () => {
      const onRejectHunk = vi.fn()
      render(<Diff before="a" after="b" onRejectHunk={onRejectHunk} />)
      screen.getByLabelText('Reject change 1').click()
      expect(onRejectHunk).toHaveBeenCalledWith({ index: 0, before: 'a', after: 'b' })
    })
  })

  describe('word granularity', () => {
    it('renders added/removed words as marks', () => {
      const { container } = render(<Diff before="the quick fox" after="the slow fox" granularity="word" />)
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    })

    it('counts diff groups, not lines, for the change count', () => {
      render(<Diff before="the quick fox" after="the slow fox" granularity="word" />)
      expect(screen.getByText('2 changes')).toBeInTheDocument()
    })
  })

  describe('language (syntax highlighting)', () => {
    it('still renders the line text with a language set', async () => {
      render(<Diff before="const a = 1;" after="const a = 2;" language="typescript" />)
      await waitFor(() => {
        expect(screen.getByText((_, node) => node?.textContent === 'const a = 1;')).toBeInTheDocument()
      })
      expect(screen.getByText((_, node) => node?.textContent === 'const a = 2;')).toBeInTheDocument()
    })

    it('has no effect on word granularity', () => {
      const { container } = render(
        <Diff before="the quick fox" after="the slow fox" granularity="word" language="typescript" />,
      )
      expect(container.textContent).toContain('quick')
      expect(container.textContent).toContain('slow')
    })

    it('has no effect on fields mode', () => {
      const before = JSON.stringify({ a: 1 })
      const after = JSON.stringify({ a: 2 })
      render(<Diff before={before} after={after} mode="fields" language="json" />)
      expect(screen.getByText('a')).toBeInTheDocument()
    })
  })
})
