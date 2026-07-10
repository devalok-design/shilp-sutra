import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// frimousse fetches emoji data from a CDN at runtime — mock it so tests stay
// offline and deterministic. Root exposes onEmojiSelect via a test button.
vi.mock('frimousse', () => {
  type AnyProps = { children?: React.ReactNode; onEmojiSelect?: (e: { emoji: string; label: string }) => void }
  const Root = ({ children, onEmojiSelect }: AnyProps) => (
    <div data-testid="emoji-picker-mock">
      <button onClick={() => onEmojiSelect?.({ emoji: '\u{1F604}', label: 'grinning face' })}>
        Pick emoji
      </button>
      {children}
    </div>
  )
  const Passthrough = ({ children }: AnyProps) => <div>{children}</div>
  return {
    EmojiPicker: { Root, Search: Passthrough, Viewport: Passthrough, List: Passthrough, Loading: Passthrough, Empty: Passthrough },
  }
})

import { EmojiPicker, EmojiPickerPopover } from './emoji-picker'

describe('EmojiPicker', () => {
  it('renders without crashing', () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    expect(screen.getByTestId('emoji-picker-mock')).toBeInTheDocument()
  })

  it('maps a frimousse selection to EmojiData (native char + kebab id)', () => {
    const onSelect = vi.fn()
    render(<EmojiPicker onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Pick emoji'))
    expect(onSelect).toHaveBeenCalledWith({ id: 'grinning-face', native: '\u{1F604}' })
  })
})

describe('EmojiPickerPopover', () => {
  it('renders the trigger', () => {
    render(
      <EmojiPickerPopover onSelect={vi.fn()}>
        <button>Add emoji</button>
      </EmojiPickerPopover>,
    )
    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeInTheDocument()
  })
})
