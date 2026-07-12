# AICommandProvider

- Import: @devalok/shilp-sutra/ai/ai-command-provider
- Server-safe: No
- Category: ai

Context provider for the AI command system. Supplies custom block renderers, the
action handler, and the agent identity to `AIConversation` / `BlockRenderer` below
it, so you configure them once instead of threading props through every message.
Ships a `useAICommand()` hook to read the context.

## Props
    children: ReactNode (required)
    customBlocks: Record<string, ComponentType<BlockComponentProps>> — custom block-type renderers available to all descendants
    onAction: (actionId: string, type: "confirm" | "cancel" | "undo") => void — default action handler for descendant blocks
    agent: { name: string, icon?: IconInput } — default agent identity for assistant messages

## Example
```jsx
<AICommandProvider
  agent={{ name: 'Devadoot', icon: <IconSparkles /> }}
  customBlocks={{ chart: ChartBlock }}
  onAction={(id, type) => handleAction(id, type)}
>
  <AIConversation messages={messages} />
</AICommandProvider>

// Read the context in a descendant:
function MyBlock() {
  const ctx = useAICommand() // { customBlocks, onAction, agent } | null
  // ...
}
```

## Composability
- **Configure once** — set `customBlocks`, `onAction`, and `agent` here; `AIConversation` and `BlockRenderer` read them via context. Per-component props still win over the context (prop overrides provider).
- **`useAICommand()`** — returns the context (`{ customBlocks, onAction, agent }`) or `null` when no provider is mounted. Custom blocks can use it to reach the shared action handler.
- **Optional** — `AIConversation`/`BlockRenderer` work without a provider if you pass their props directly; the provider is a convenience for app-wide config.

## Gotchas
- Client component — mount inside a client boundary.
- `useAICommand()` returns `null` (not a throw) when there's no provider — guard for it in custom blocks.

## Changes
### v0.49.0
- **Added** Component documentation (the AI layer is now covered by the docs gate + hosted MCP).
