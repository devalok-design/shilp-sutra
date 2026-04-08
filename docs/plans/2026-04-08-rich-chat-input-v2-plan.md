# RichChatInput v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the RichChatInput as a breathing, state-driven composition surface with choreographed transitions, zone architecture, voice recording, and micro-interactions — matching Apple Messages / Linear / Slack quality.

**Architecture:** Complete rewrite of the existing `rich-chat-input.tsx` (630 lines) into a multi-file component. State machine drives all visual changes. Four independent zones (reply banner, attachments, editor, toolbar) animate in/out with staggered transitions. Voice recording via Web Audio API + MediaRecorder. Sub-components (AudioWaveform, AudioPlayer, VoiceRecorder) exported for reuse in chat message bubbles.

**Tech Stack:** TipTap (React), framer-motion (AnimatePresence, motion, useReducedMotion, layout animations), Web Audio API (AnalyserNode for live waveform), MediaRecorder API, existing TipTap extensions (mention-suggestion, emoji-suggestion, file-attachment, slash-command), existing design tokens

**IMPORTANT:** This replaces the existing `packages/core/src/composed/rich-chat-input.tsx` entirely. The existing stories and exports are updated, not replaced.

---

## Pre-requisite: Read before implementing ANY task

These files define the visual DNA that MUST be matched:
- `packages/core/src/ui/input.tsx` — border, focus ring, padding, radius, transition patterns
- `packages/core/src/ui/chat/message-input.tsx` — the plain chat input we're replacing
- `packages/core/src/composed/rich-text-editor.tsx` — TipTap setup, extension configuration, ToolbarButton pattern
- `packages/core/src/composed/extensions/mention-suggestion.tsx` — suggestion renderer pattern
- `packages/core/src/composed/extensions/emoji-suggestion.tsx` — EmojiSuggestion export
- `packages/core/src/composed/extensions/slash-command.tsx` — SlashCommand export
- `packages/core/src/composed/extensions/file-attachment.tsx` — FileAttachment export
- `packages/core/src/ui/lib/motion.ts` — springs, tweens, motion presets
- `packages/core/src/tokens/semantic.css` — motion duration/easing tokens

---

## Task 1: useVoiceRecorder Hook

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/use-voice-recorder.ts`

The recording logic — MediaRecorder + Web Audio API AnalyserNode. This is pure logic, no UI.

**Interface:**
```tsx
interface UseVoiceRecorderOptions {
  maxDuration?: number  // seconds
  onComplete: (blob: Blob, duration: number) => void
}

interface UseVoiceRecorderReturn {
  state: 'idle' | 'recording' | 'paused'
  duration: number
  analyserNode: AnalyserNode | null
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
}
```

**Implementation details:**
- `start()`: calls `navigator.mediaDevices.getUserMedia({ audio: true })`, creates `MediaRecorder` + `AudioContext` + `AnalyserNode`
- Duration tracked via `setInterval` (1 second ticks), stored in state
- `analyserNode` exposed for live waveform rendering (consumer reads frequency data)
- `stop()`: stops MediaRecorder, calls `onComplete(blob, duration)`, cleans up streams
- `cancel()`: stops without calling onComplete, cleans up
- Auto-stop: if `maxDuration` is set, stop automatically when reached
- Cleanup: `useEffect` cleanup stops all streams, closes AudioContext on unmount
- Error handling: `start()` catches getUserMedia errors (permission denied, no mic)
- `'use client'` at top (uses browser APIs)

Commit: `feat: useVoiceRecorder hook — MediaRecorder + Web Audio API`

---

## Task 2: AudioWaveform Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/audio-waveform.tsx`

Reusable waveform visualization with two modes: live (recording) and static (playback).

**Props:**
```tsx
interface AudioWaveformProps {
  mode: 'live' | 'static'
  // Live mode: reads from AnalyserNode
  analyserNode?: AnalyserNode | null
  // Static mode: pre-computed amplitude data
  data?: number[]  // normalized 0-1 values
  // Playback progress (static mode only)
  progress?: number  // 0-1
  // Visual
  barWidth?: number   // default 3
  barGap?: number     // default 2
  barCount?: number   // default 40
  height?: number     // default 32
  className?: string
}
```

**Implementation details:**
- Live mode: `requestAnimationFrame` loop reads `analyserNode.getByteFrequencyData()`, normalizes to bar heights, renders via SVG `<rect>` elements
- Static mode: renders pre-computed `data` array as SVG rects
- Played vs unplayed coloring: bars before `progress * barCount` use `accent-9`, rest use `surface-border`
- Bar caps: `rx={barWidth/2}` for rounded caps (matches `rounded-ds-full`)
- Smoothing in live mode: each bar lerps toward target (factor 0.3) to prevent jitter
- SVG-based (not canvas) for consistent rendering and accessibility
- `useReducedMotion`: live mode still updates (informational, not decorative)
- Memoize static rendering when `data` and `progress` haven't changed

Commit: `feat: AudioWaveform — live and static waveform visualization`

---

## Task 3: AudioPlayer Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/audio-player.tsx`

Playback controls for recorded audio — used in review state AND in sent message bubbles.

**Props:**
```tsx
interface AudioPlayerProps {
  src: string | Blob  // audio URL or Blob
  duration: number    // total seconds
  waveformData?: number[]  // pre-computed for static waveform
  className?: string
}
```

**Implementation details:**
- Uses `<audio>` element (hidden) for playback
- Play/pause button: `h-8 w-8 rounded-ds-full bg-accent-9 text-accent-fg`
- AudioWaveform in static mode with `progress` driven by audio `timeupdate`
- Seek: clicking/dragging on waveform sets `audio.currentTime`
- Seek dot: `h-3 w-3 rounded-ds-full bg-accent-9`, positioned at progress point
- Duration display: `text-ds-xs tabular-nums text-surface-fg-subtle`
- Speed control: pill that cycles 1x → 1.5x → 2x on click
  - Cross-fade text animation (70ms)
  - Subtle scale pulse (1.0→1.05→1.0, 110ms)
- Keyboard: Space=play/pause, Arrow Left/Right=seek ±5s
- ARIA: `role="group"`, slider with `aria-valuemin/max/now`
- `forwardRef` + `displayName`

Commit: `feat: AudioPlayer — playback controls with waveform and speed`

---

## Task 4: RecordingOverlay Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/recording-overlay.tsx`

The UI that appears during voice recording — replaces the editor area.

**Props:**
```tsx
interface RecordingOverlayProps {
  duration: number
  analyserNode: AnalyserNode | null
  maxDuration?: number
  onStop: () => void
  onCancel: () => void
}
```

**Implementation details:**
- Red pulsing dot: `w-ds-02b h-ds-02b rounded-ds-full bg-error-9`, CSS animation `pulse` (opacity 0.4→1.0, 1s)
- Timer: `text-ds-sm font-mono tabular-nums`, blinking colon (opacity 1→0.3→1, 500ms)
- Warning at maxDuration-10s: timer `text-warning-11`
- Critical at maxDuration-5s: timer `text-error-11`, pulse speeds to 500ms
- Live waveform via `<AudioWaveform mode="live" analyserNode={analyserNode} />`
- Stop button: `<Button variant="ghost" size="icon-sm">` with square icon
- Cancel button: `<Button variant="ghost" size="icon-sm">` with trash icon, `text-surface-fg-subtle hover:text-error-11`
- `useReducedMotion`: pulse becomes static dot, timer colon doesn't blink
- Framer-motion entrance: `opacity 0→1, y: 8→0, duration-moderate-02 (240ms) ease-productive-entrance`

Commit: `feat: RecordingOverlay — recording state UI with live waveform`

---

## Task 5: AttachmentStrip Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/attachment-strip.tsx`

Zone 2 — horizontal strip of file/image/voice attachment previews.

**Props:**
```tsx
interface AttachmentStripProps {
  attachments: Attachment[]
  voiceNote?: { blob: Blob; duration: number; waveformData: number[] }
  onRemoveAttachment: (id: string) => void
  onRemoveVoice: () => void
}
```

**Implementation details:**
- Container: `overflow-x-auto px-ds-04 py-ds-02b border-b border-surface-border`
- Image thumbs: `h-12 w-12 rounded-ds-md object-cover`, × button hidden until hover (opacity 0→1, 110ms)
- File chips: `bg-surface-raised rounded-ds-md px-ds-03 py-ds-01 text-ds-xs`
- Voice note: mini AudioPlayer inline in the strip
- × button on images: `absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error-9 text-error-fg`
- Framer-motion `AnimatePresence` on each item:
  - Enter: `scale 0→1.03→1.0 (spring), opacity 0→1`
  - Exit: `scale 1→0.95, opacity 1→0, duration-fast-02 (110ms)`
  - Layout animation on remaining items (shift to fill gap)
- Upload state: `opacity-50` with Skeleton shimmer pattern
- Error state: `border-error-7`, shake animation, error icon

Commit: `feat: AttachmentStrip — animated file/image/voice preview zone`

---

## Task 6: ReplyBanner Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/reply-banner.tsx`

Zone 1 — "Replying to @user" context bar.

**Props:**
```tsx
interface ReplyBannerProps {
  author: string
  preview: string
  onDismiss: () => void
}
```

**Implementation details:**
- Container: `bg-surface-raised border-b border-surface-border px-ds-04 py-ds-02b`
- Author: `text-ds-sm font-semibold text-surface-fg`
- Preview: `text-ds-sm text-surface-fg-muted truncate` (hover shows Tooltip with full text)
- Dismiss: × button, `text-surface-fg-subtle hover:text-surface-fg`
- Framer-motion: MotionCollapse for height animation (in/out)

Commit: `feat: ReplyBanner — reply context zone with dismiss`

---

## Task 7: ChatToolbar Component

**Files:**
- Create: `packages/core/src/composed/rich-chat-input/chat-toolbar.tsx`

Zone 4 — inline formatting toolbar with micro-interactions.

**Props:**
```tsx
interface ChatToolbarProps {
  editor: Editor
  toolbar: boolean | ChatToolbarItem[]
  isMobile: boolean
  // Insert actions
  hasMentions: boolean
  hasSlashCommands: boolean
  hasFileUpload: boolean
  onAttachClick: () => void
  // Counter + Send
  maxLength?: number
  charCount: number
  isEmpty: boolean
  disabled: boolean
  isStreaming: boolean
  onSubmit: () => void
  onCancel?: () => void
}
```

**Implementation details:**
- Container: `role="toolbar" aria-label="Message formatting"`, `border-t border-surface-border px-ds-04 py-ds-02b`
- Button component (local): `h-ds-xs-plus w-ds-xs-plus rounded-ds-md touch-target`
  - Idle: `text-surface-fg-subtle`
  - Hover: `bg-surface-raised-hover text-surface-fg`
  - Active: `bg-surface-raised-hover text-accent-11`
  - Press: `active:scale-95` + `duration-fast-01`
  - Release: bounce back via `transition duration-fast-02 ease-bounce`
- Mobile: hide formatting buttons (B/I/U/S/highlight/code/lists). Show only insert group (@, emoji, attach, /) + send
- Desktop: full toolbar with formatting | lists | insert | counter | send
- Character counter: `text-ds-xs tabular-nums`, warning at 90% (`text-warning-11`), error at 100% (`text-error-11` + shake once)
- Send button: `<Button variant="ghost" size="icon-sm">`, springs in via framer-motion `scale 0→1.05→1.0`
- Streaming: send becomes stop button (cross-fade morph)
- Framer-motion: whole toolbar fades in/out with `opacity + translateY(4px)`, `duration-moderate-01 (150ms)`

Commit: `feat: ChatToolbar — animated toolbar with micro-interactions`

---

## Task 8: Main RichChatInput — State Machine + Composition

**Files:**
- Rewrite: `packages/core/src/composed/rich-chat-input.tsx`

This is the orchestrator — state machine, zone composition, editor setup.

**Implementation details:**

### State machine
```tsx
type InputState = 'idle' | 'focused' | 'composing' | 'recording' | 'review'
const [state, setState] = useState<InputState>('idle')
```

State transitions:
- `idle` → focus event → `focused`
- `focused` → first keystroke (editor not empty) → `composing`
- `composing` → empty + blur → `idle`
- `composing` → tap mic → `recording`
- `recording` → stop → `review`
- `recording` → cancel → previous state (composing if had content, else idle)
- `review` → send → `idle`
- `review` → discard voice → `composing`
- Any state → submit → `idle`

### Container
```tsx
<motion.div
  className={cn(
    'rounded-ds-lg border border-surface-border-strong bg-surface-raised-hover',
    'transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard',
    'hover:bg-surface-raised-active',
    state !== 'idle' && 'ring-2 ring-accent-9 ring-offset-2',
    state === 'recording' && 'border-error-7/30',
    disabled && 'opacity-action-disabled cursor-not-allowed',
  )}
>
```

### Zone composition (inside container)
```tsx
{/* Zone 1: Reply Banner */}
<AnimatePresence>
  {replyTo && <ReplyBanner author={replyTo.author} preview={replyTo.preview} onDismiss={replyTo.onDismiss} />}
</AnimatePresence>

{/* Zone 2: Attachment Strip */}
<AnimatePresence>
  {(attachments.length > 0 || voiceNote) && <AttachmentStrip ... />}
</AnimatePresence>

{/* Zone 3: Editor / Recording */}
{state === 'recording' ? (
  <RecordingOverlay ... />
) : (
  <div style={{ minHeight, maxHeight, overflowY: 'auto' }}>
    <EditorContent editor={editor} />
  </div>
)}

{/* Mobile BubbleMenu */}
{isMobile && editor && <BubbleMenu editor={editor} ... />}

{/* Zone 4: Toolbar / Mic */}
<AnimatePresence>
  {state === 'composing' || state === 'review' || variant === 'expanded' ? (
    <ChatToolbar ... />
  ) : state === 'idle' || state === 'focused' ? (
    // Mic button only (or nothing)
    <MicRow ... />
  ) : null}
</AnimatePresence>
```

### Mic → Send morph
A dedicated component that handles the cross-fade between mic and send icons based on state:
```tsx
function ActionButton({ state, hasContent, onSubmit, onMicTap, isStreaming, onCancel, hasVoice }) {
  // idle/focused + hasVoice: show mic
  // composing: show send
  // streaming: show stop
  // Uses AnimatePresence for cross-fade morph
}
```

### Editor setup
Same TipTap extensions as v1 BUT with:
- `handlePaste` for file interception
- `EnterToSend` custom extension (using `splitBlock`, NOT `enter()`)
- `BubbleMenu` from `@tiptap/react` for mobile
- `CharacterCount` extension

### Breathing (auto-grow)
```tsx
// Measure editor height on every update
useEffect(() => {
  if (!editor) return
  const handleUpdate = () => {
    const el = editor.view.dom
    const newHeight = Math.min(el.scrollHeight, maxHeight)
    setEditorHeight(newHeight)
  }
  editor.on('update', handleUpdate)
  handleUpdate()
  return () => editor.off('update', handleUpdate)
}, [editor, maxHeight])

// Apply with CSS transition
<div style={{ height: editorHeight, transition: 'height 150ms ease-out', overflowY: editorHeight >= maxHeight ? 'auto' : 'hidden' }}>
```

### Placeholder dim on focus
```tsx
// TipTap placeholder via CSS
// Default: opacity 1
// Focused (not composing): opacity 0.5
// Composing: hidden (TipTap hides it automatically when content exists)
```

Use Tailwind arbitrary class on the editor wrapper:
```css
[&_.tiptap_p.is-editor-empty:first-child::before]:opacity-100
[&_.tiptap_p.is-editor-empty:first-child::before]:transition-opacity
[&_.tiptap_p.is-editor-empty:first-child::before]:duration-moderate-02
```
Then toggle a `data-focused` attribute to dim to 50%.

### Typing indicator + empty state
Same as v1 (editor.on('update') callbacks).

### File handling
Same as v1 (drag/drop/paste) but using AttachmentStrip sub-component for rendering.

Commit: `feat: RichChatInput v2 — state machine, zone architecture, breathing editor`

---

## Task 9: Stories

**Files:**
- Rewrite: `packages/core/src/composed/rich-chat-input.stories.tsx`

Stories to cover:
1. **Default** — compact, all features (mentions, slash, files, voice)
2. **Expanded** — expanded variant for AI prompts
3. **Minimal** — minimal variant for inline replies
4. **TextOnly** — no voice, no files, no mentions (just rich text)
5. **WithReply** — replyTo banner shown
6. **VoiceRecording** — demonstrates recording flow
7. **WithCharacterLimit** — maxLength counter
8. **Streaming** — isStreaming with stop button
9. **AllVariants** — side-by-side comparison
10. **Mobile** — mobile viewport, BubbleMenu on selection
11. **ProgressiveDisclosure** — shows idle → focused → composing transition

Each story uses `fn()` for action props. Voice stories provide mock `onVoiceRecord`.

Play functions on Default:
- Type text → verify toolbar appears
- Click bold → verify formatting
- Type @ → verify mention popover

Commit: `docs: RichChatInput v2 stories — all states and variants`

---

## Task 10: Tests

**Files:**
- Create: `packages/core/src/composed/__tests__/rich-chat-input-v2.test.tsx`
- Create: `packages/core/src/composed/rich-chat-input/__tests__/audio-waveform.test.tsx`
- Create: `packages/core/src/composed/rich-chat-input/__tests__/audio-player.test.tsx`

Tests:
1. Renders with placeholder
2. State transitions: idle → focused → composing → idle
3. Toolbar appears on compose, disappears on empty
4. Send button appears on compose (mic on idle)
5. onSubmit fires with { html, plainText } on Enter
6. Cmd+Enter always sends regardless of enterBehavior
7. Shift+Enter inserts newline when enterBehavior='send'
8. Character counter shows when maxLength set
9. Voice: onVoiceRecord provided → mic icon visible
10. Voice: no onVoiceRecord → no mic icon
11. Attachments: drop zone works (mock DataTransfer)
12. replyTo renders banner with author and preview
13. Disabled state
14. axe: toHaveNoViolations
15. AudioWaveform: renders correct number of bars
16. AudioPlayer: play/pause toggles

Note: MediaRecorder and AudioContext need mocks in jsdom. Web Audio API doesn't exist in jsdom — mock at the test level.

Commit: `test: RichChatInput v2 — states, voice, attachments, a11y`

---

## Task 11: Exports + Docs

**Files:**
- Modify: `packages/core/src/composed/index.ts` — update exports (RichChatInput + AudioWaveform + AudioPlayer + VoiceRecorder)
- Verify: `packages/core/package.json` — `./composed/rich-chat-input` subpath already exists
- Create: `packages/core/docs/components/composed/rich-chat-input.md` — update with v2 API

Commit: `feat: update RichChatInput exports + component docs for v2`

---

## Execution Strategy

**Sequential — each task depends on the previous:**

| Round | Task | Why Sequential |
|-------|------|----------------|
| 1 | Task 1: useVoiceRecorder hook | Pure logic, no deps |
| 2 | Task 2: AudioWaveform | Depends on hook interface (analyserNode) |
| 3 | Task 3: AudioPlayer | Uses AudioWaveform |
| 4 | Task 4: RecordingOverlay | Uses AudioWaveform + hook interface |
| 5 | Task 5: AttachmentStrip | Uses AudioPlayer (voice note preview) |
| 6 | Task 6: ReplyBanner | Independent but simple |
| 7 | Task 7: ChatToolbar | Independent but needs editor interface |
| 8 | Task 8: Main component | Composes all sub-components |
| 9 | Task 9+10: Stories + Tests | After main component works |
| 10 | Task 11: Exports | After everything passes |

**Parallelizable pairs:**
- Tasks 2+6 (AudioWaveform + ReplyBanner — no shared deps)
- Tasks 5+7 (AttachmentStrip + ChatToolbar — no shared deps)
- Tasks 9+10 (Stories + Tests — different files)

**Estimated: 11 tasks, ~7 rounds.**
