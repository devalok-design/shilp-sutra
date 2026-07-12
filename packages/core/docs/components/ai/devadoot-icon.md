# DevadootIcon

- Import: @devalok/shilp-sutra/ai
- Server-safe: No
- Category: ai

The animated Devalok chakra glyph — the visual identity for the AI command system.
Uses fill-first animation (the gradient color *is* the animation, Gemini-style),
with a distinct state for idle, processing, responded, and error.

## Props
    state: "idle" | "processing" | "responded" | "error" — animation mode (default "idle")
    size: number — pixel size (default 20)
    className: string

## Defaults
    state defaults to "idle"
    size defaults to 20

## Example
```jsx
// Drive the icon from the agent lifecycle:
<DevadootIcon state={isThinking ? 'processing' : hasReplied ? 'responded' : 'idle'} size={24} />

// Error state:
<DevadootIcon state="error" />
```

## Composability
- **State-as-identity** — `idle` breathes pink↔rose slowly; `processing` sweeps a pink→purple→magenta gradient + glow; `responded` flashes bright then settles + a scale pop; `error` turns red with a glow pulse. Wire `state` to your agent's status.
- **Pairs with `CommandBar` / `AIConversation`** — commonly placed in the CommandBar (hero/floating) or as the agent header avatar in the conversation.
- **Exported from the `ai` barrel** — `import { DevadootIcon } from '@devalok/shilp-sutra/ai'` (no dedicated subpath).

## Gotchas
- Client component — mount inside a client boundary.
- Requires a mounted `MotionProvider`; renders a static chakra when reduced-motion is set.
- Brand-locked colors (Devalok pink↔purple palette) — it's a brand asset, not a generic spinner. Use `Spinner` for neutral loading.

## Changes
### v0.49.0
- **Added** Component documentation (the AI layer is now covered by the docs gate + hosted MCP).
