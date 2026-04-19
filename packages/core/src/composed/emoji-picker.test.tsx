import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock the heavy emoji-mart dependencies so we don't load them in tests
vi.mock('@emoji-mart/react', () => ({
  default: function MockPicker({ onEmojiSelect }: { onEmojiSelect: (e: unknown) => void }) {
    return (
      <div data-testid="emoji-picker-mock">
        <button onClick={() => onEmojiSelect({ id: 'smile', native: '\u{1F604}' })}>
          Pick emoji
        </button>
      </div>
    )
  },
}))

vi.mock('@emoji-mart/data', () => ({
  default: { categories: [] },
}))

// Import after mocking
import { EmojiPicker, EmojiPickerPopover } from './emoji-picker'

describe('EmojiPicker', () => {
  it('renders without crashing', async () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    // Initially shows skeleton/loading, then the picker loads
    // Since we mocked the modules, the picker should eventually render
    const picker = await screen.findByTestId('emoji-picker-mock')
    expect(picker).toBeInTheDocument()
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
