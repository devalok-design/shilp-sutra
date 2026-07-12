# CommandBar

- Import: @devalok/shilp-sutra/ai/command-bar
- Server-safe: No
- Category: ai

A unified AI command input with three layout variants. Supports natural-language
submission (`onSubmit`) and, optionally, command-palette filtering (`groups`) in the
same bar. Shows an animated brand-gradient border while processing.

## Props
    onSubmit: (query: string) => void — called on Enter (natural-language submission)
    state: "idle" | "typing" | "processing" | "responded" — drives visual feedback (gradient border, placeholder)
    groups: CommandGroup[] — when provided, enables command-palette filtering alongside AI submission
    onSearch: (query: string) => void — fired as the query changes (palette mode)
    emptyMessage: string — text when a palette search yields nothing
    emptyState: ReactNode — replaces the default empty UI
    variant: "hero" | "inline" | "floating" — layout (default "hero")
    placeholder: string | string[] — static text, or an array that rotates on an interval
    placeholderInterval: number — rotation interval in ms when placeholder is an array (default 4000)
    greeting: string — text above the input (hero variant)
    hints: string[] — hint strings below the input (hero variant)
    agentName: string
    agentIcon: ReactNode
    open: boolean — controlled open state (floating variant)
    defaultOpen: boolean — uncontrolled initial open (floating variant)
    onOpenChange: (open: boolean) => void — floating variant
    keybinding: string | string[] | false — global toggle for the floating bar (default "mod+j")
    disabled: boolean
    maxHeight: string | number — cap on the results/scroll region (default "320px")
    children: ReactNode

CommandGroup / CommandItem: shared with composed/command-palette (see that doc)

## Defaults
    variant defaults to "hero"
    placeholderInterval defaults to 4000
    keybinding defaults to "mod+j"
    maxHeight defaults to "320px"

## Example
```jsx
// Hero variant — the primary AI entry point on a dashboard:
<CommandBar
  variant="hero"
  greeting="What can I help with?"
  placeholder={['Summarize this project…', 'Draft a status update…', 'Find overdue tasks…']}
  hints={['⌘J to open anywhere', 'Ask in plain English']}
  state={aiState}
  onSubmit={(q) => runAgent(q)}
/>

// Floating variant — global ⌘J overlay, palette + AI in one:
<CommandBar
  variant="floating"
  keybinding="mod+j"
  groups={commandGroups}
  onSearch={setQuery}
  onSubmit={(q) => runAgent(q)}
/>
```

## Composability
- **Two modes in one bar** — pass `onSubmit` for natural-language AI; add `groups` to also get command-palette filtering (arrow-key navigation, grouped items). Reuses `CommandGroup`/`CommandItem` from composed/command-palette.
- **`floating` reuses the Dialog primitive** (`DialogContentRaw`) with a global keybinding — same overlay pattern as CommandPalette, so focus-trap/Escape/scroll-lock come for free.
- **State-driven feedback** — set `state="processing"` to show the animated brand-gradient border; `"responded"` to settle it. Wire `state` to your agent's lifecycle.
- **Placeholder rotation** — pass an array to `placeholder` for the rotating-prompt effect (paused while typing; respects reduced-motion).
- **Pairs with `AIConversation`** — CommandBar is the input; AIConversation renders the response thread.

## Gotchas
- Client component — mount inside a client boundary.
- Requires a mounted `MotionProvider`.
- `keybinding` only applies to the `floating` variant; pass `false` to disable the global shortcut.
- Largest component in the AI layer (3 variants share one implementation) — prefer `inline`/`hero` for embedded bars, `floating` for the app-wide launcher.

## Changes
### v0.49.0
- **Added** Component documentation (the AI layer is now covered by the docs gate + hosted MCP).
