# RichChatInput v2 — Complete Interaction Design

**Date:** 2026-04-08
**Supersedes:** `2026-04-07-rich-chat-input-design.md` (v1 was generic, this is world-class)
**Benchmark:** Slack (toolbar/files), Linear (progressive disclosure), Apple Messages (mic→send morph), Discord (zone stacking), Notion (BubbleMenu), WhatsApp (voice recording)

## Philosophy

This is not a text box with buttons. It is a **breathing, state-driven composition surface** with choreographed transitions between states. Every pixel change serves a purpose — communicating state, directing attention, or providing physical feedback.

---

## 1. State Machine

```
IDLE → FOCUSED → COMPOSING → SENT
                      ↕
              POWER USER MODE (expanded toolbar)
                      │
                text selection (mobile)
                      │
                      ▼
                  SELECTING (BubbleMenu)
                      
COMPOSING → tap mic → RECORDING → stop → REVIEW → send → SENT
                          │                          │
                        cancel                    discard
                          │                          │
                          ▼                          ▼
                        IDLE                       COMPOSING
```

### State Visuals

**IDLE** — Zero visual weight
```
                    Type a message...              [🎤]
```
No toolbar. No send button. Just placeholder + mic (or nothing if no voice).

**FOCUSED** — Subtle activation
```
                    Type a message... |             [🎤]
```
Focus ring appears (`ring-2 ring-accent-9 ring-offset-2`). Placeholder dims to 50% opacity. Nothing else.

**COMPOSING** — Features reveal
```
  Hello world, @aarav can you check this? |
  ──────────────────────────────────────────────────
  [B] [I] [U] [S] [~] [</>] │ [•] [1.] │ [@] [:)] [📎] [/]  ·····  [➤]
```
Toolbar fades in (150ms). Send button springs in (200ms, bounce). Mic morphs to send (cross-fade). Input breathes with content.

**SELECTING** — Mobile text selection
```
  Hello ▓▓▓▓▓, @aarav can you check this?
           ┌─────────────────────┐
           │ B  I  U  S  ~  </>  │  ← floating BubbleMenu
           └─────────────────────┘
  ──────────────────────────────────────────────────
  [@] [:)] [📎] [/]  ·····························  [➤]
```

**RECORDING**
```
  ● 0:03  ═══════╤═══════════════════════  [⏹] [🗑]
```
Editor dims. Recording overlay slides up. Red dot pulses. Live waveform animates.

**REVIEW**
```
  ┌─ Voice note ──────────────────────────────────────┐
  │ [▶] ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓●▓░░░░░░░░░  0:12    1x    │
  └───────────────────────────────────────────────────┘
  Also, here's what I think about the design...  |
  ──────────────────────────────────────────────────
  [B] [I] [U] ...                              [➤] [🗑]
```
Voice note in attachment strip. Editor active again. Can add text alongside.

---

## 2. Zone Architecture

Composable vertical stack — each zone slides in/out independently:

```
┌─ Container ──────────────────────────────────────────────┐
│  ZONE 1: Reply Banner     (slides down when replyTo set) │
│  ZONE 2: Attachment Strip  (slides down when files/voice) │
│  ZONE 3: Editor            (always present, breathes)     │
│  ZONE 4: Toolbar           (fades in on compose)          │
└──────────────────────────────────────────────────────────┘
```

Zone animations staggered 50ms apart. Enter: ease-productive-entrance. Exit: ease-productive-exit.

---

## 3. Props API

```tsx
interface RichChatInputProps {
  // Core
  onSubmit: (message: {
    html: string
    plainText: string
    attachments?: Array<{ url: string; name: string; size: number; type: string }>
    voiceNote?: { blob: Blob; duration: number }
  }) => void
  placeholder?: string
  disabled?: boolean
  content?: string

  // Variant
  variant?: 'compact' | 'expanded' | 'minimal'

  // Behavior
  enterBehavior?: 'send' | 'newline'
  maxLength?: number

  // Rich features
  mentions?: MentionItem[]
  onMentionSearch?: (query: string) => Promise<MentionItem[]>
  onMentionSelect?: (item: MentionItem) => void
  onFileUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>
  onImageUpload?: (file: File) => Promise<string>
  slashCommands?: SlashCommandGroup[]

  // Voice (composable — omit for text-only)
  onVoiceRecord?: (audio: Blob, duration: number) => void
  maxDuration?: number  // seconds, no limit if omitted

  // Context
  replyTo?: { id: string; author: string; preview: string; onDismiss: () => void }

  // Callbacks
  onTyping?: (isTyping: boolean) => void
  onEmpty?: (isEmpty: boolean) => void

  // Streaming
  isStreaming?: boolean
  onCancel?: () => void

  // Slots
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
  disclaimer?: string

  // Toolbar
  toolbar?: boolean | ChatToolbarItem[]
}
```

Composable: `onVoiceRecord` absent = no mic icon. `onFileUpload` absent = no attach button. `slashCommands` absent = no / trigger. `mentions` absent = no @ trigger.

---

## 4. Visual Token Mapping

### Container (matches Input family)
```
Border:      border border-surface-border-strong
Background:  bg-surface-raised-hover
Focus:       ring-2 ring-accent-9 ring-offset-2
Hover:       hover:bg-surface-raised-active
Radius:      rounded-ds-lg
Transition:  transition-[color,background-color,border-color,box-shadow]
             duration-fast-02 ease-productive-standard
Disabled:    opacity-action-disabled cursor-not-allowed
```

### Text
```
Font:        font-body text-ds-md
Color:       text-surface-fg
Placeholder: text-surface-fg-subtle (dims to 50% on focus, vanishes on keystroke)
```

### Toolbar
```
Border:      border-t border-surface-border
Padding:     px-ds-04 py-ds-02b
Buttons:     h-ds-xs-plus w-ds-xs-plus rounded-ds-md touch-target
Active:      bg-surface-raised-hover text-accent-11
```

### Recording
```
Red dot:     w-ds-02b h-ds-02b rounded-ds-full bg-error-9 (pulses 1s)
Timer:       text-ds-sm font-mono tabular-nums
Waveform:    3px bars, 2px gap, rounded-ds-full caps, accent-9
Container:   border-error-7/30 (subtle recording tint)
```

### Audio Player
```
Play btn:    h-8 w-8 rounded-ds-full bg-accent-9 text-accent-fg
Waveform:    played accent-9, unplayed surface-border
Seek dot:    h-3 w-3 rounded-ds-full bg-accent-9
Speed pill:  text-ds-xs bg-surface-raised rounded-ds-full px-ds-02
```

---

## 5. Animation Choreography

All timings use existing motion tokens. No magic numbers.

| Transition | Duration | Easing | Token |
|-----------|----------|--------|-------|
| Focus ring appear | 150ms | ease-out | duration-moderate-01, ease-productive-standard |
| Toolbar reveal | 150ms | ease-in-out | duration-moderate-01, ease-productive-entrance |
| Send button spring-in | 200ms | spring (400/25) | ease-bounce |
| Mic→Send morph | 110ms+200ms | cross-fade | duration-fast-02 + ease-bounce |
| Editor breathing | 150ms | ease-out | duration-moderate-01, ease-productive-standard |
| Zone slide in/out | 240ms | ease-out | duration-moderate-02, ease-productive-entrance |
| Attachment enter | 200ms | spring (400/30) | ease-bounce |
| Attachment exit | 110ms | ease-out | duration-fast-02, ease-productive-exit |
| Recording enter | 240ms staggered | ease-out | duration-moderate-02 |
| Recording pulse | 1000ms | ease-in-out | infinite |
| Recording → Review | 240ms staggered | ease-out | duration-moderate-02 |
| Submit clear | 0ms | instant | speed > theatrics |
| Submit exhale (height) | 150ms | ease-out | duration-moderate-01 |

---

## 6. Micro-Interactions

### Button press feedback
```
All buttons:  press scale(0.95), duration-fast-01 (70ms)
              release scale(1.0), duration-fast-02 (110ms) ease-bounce
Send button:  deeper press scale(0.92) — primary action feels more pushable
Mic button:   press tints bg-error-3 — communicates "significant action"
```

### Attachment × button
```
Hidden by default. Appears on parent hover (opacity 0→1, 110ms).
Hover: bg-error-3 text-error-11. Press: scale(0.9).
```

### Mention pill morph
```
On confirm: @text background fades to accent-2, border-radius morphs
to rounded-ds-sm, padding appears. 150ms. Text transforms into pill in-place.
Backspace on pill: shake first (nudge -2px → 2px → 0, 200ms), delete on second.
```

### Emoji hover
```
In suggestion popover: emoji does subtle scale(1.0→1.15→1.0) wiggle, 300ms.
The one playful moment — appropriate for emoji only.
```

### Slash commands
```
Popover appears ABOVE cursor (not below — commands are tools, reaching up).
Opposite direction from mentions/emoji (which appear below — they're contextual).
```

### Character counter
```
At 90%: color transitions to warning-11 (150ms)
At 100%: color to error-11 (110ms), counter shakes once (-1px→1px→0, 150ms)
```

### Recording near max duration
```
Last 10s: timer text-warning-11
Last 5s: timer text-error-11, pulse speeds to 500ms
At 0: auto-stop, transition to REVIEW
```

### Empty cascade (delete to empty)
```
Staggered sequence (50ms intervals):
1. Content disappears (instant)
2. Send→mic morph begins
3. Toolbar fades out
4. Height shrinks (exhale)
5. Placeholder dims back in
Total: ~350ms cascade. Component settles to rest.
```

---

## 7. Sub-Component Architecture

### Exported (reusable outside RichChatInput)
```
AudioWaveform   — live mode (recording) + static mode (playback)
AudioPlayer     — play/pause, seek, speed, waveform
VoiceRecorder   — recording controls (timer, live waveform, stop, cancel)
```

### Internal only
```
ChatToolbar       — inline formatting + insert toolbar
AttachmentStrip   — Zone 2: file/image/voice previews
ReplyBanner       — Zone 1: "replying to" context
RecordingOverlay  — Recording state UI
```

### Hook
```
useVoiceRecorder({ maxDuration, onComplete })
  → { state, duration, analyserNode, start, stop, cancel, pause, resume }
  
Handles: getUserMedia, MediaRecorder, AudioContext+AnalyserNode,
         duration tracking, auto-stop at maxDuration, cleanup on unmount
```

### File structure
```
packages/core/src/composed/
  rich-chat-input.tsx
  rich-chat-input/
    attachment-strip.tsx
    recording-overlay.tsx
    audio-waveform.tsx
    audio-player.tsx
    voice-recorder.tsx
    use-voice-recorder.ts
```

---

## 8. Accessibility

### ARIA
```
Container:       role="region" aria-label="Message composer"
Editor:          role="textbox" aria-multiline="true"
Toolbar:         role="toolbar" aria-label="Message formatting"
Recording:       role="status" aria-live="polite"
Audio player:    role="group", slider with aria-valuemin/max/now
Reply banner:    role="status" aria-label="Replying to {author}"
Attachment strip: role="list" aria-label="Attachments"
```

### Keyboard
```
Editor:    Enter=send, Shift+Enter=newline, Cmd+Enter=always send
           @=mentions, :=emoji, /=slash commands, Escape=close popover
Toolbar:   Arrow Left/Right navigate, Tab exits to editor
Recording: Escape=cancel
Player:    Space=play/pause, Arrow Left/Right=seek ±5s
```

### Reduced motion
```
All durations → 0ms. Springs → tween duration 0.
Recording pulse → static red dot.
Live waveform → still updates (informational).
Playback progress → still updates (functional).
```

### Screen reader announcements (aria-live="polite")
```
"Recording started"
"Recording stopped, duration X seconds"
"Recording cancelled"
"File attached: {name}"
"Attachment removed: {name}"
"Replying to {author}"
```

---

## 9. Composability

Everything is opt-in via props:

```tsx
// Minimal: text only, no features
<RichChatInput onSubmit={send} />

// Team chat: mentions + files
<RichChatInput onSubmit={send} mentions={team} onFileUpload={upload} />

// AI chat: voice + slash commands + streaming
<RichChatInput
  onSubmit={send}
  onVoiceRecord={recordHandler}
  slashCommands={aiCommands}
  isStreaming={streaming}
  onCancel={cancelStream}
  enterBehavior="newline"
  disclaimer="AI responses may be inaccurate"
/>

// Full experience
<RichChatInput
  onSubmit={send}
  mentions={team}
  onMentionSearch={searchMembers}
  onFileUpload={upload}
  onImageUpload={uploadImage}
  slashCommands={commands}
  onVoiceRecord={recordHandler}
  maxDuration={300}
  replyTo={replyContext}
  maxLength={4000}
  onTyping={handleTyping}
/>
```

---

## NOT in scope
- Real-time collaboration (TipTap Collab)
- Voice-to-text transcription (consumer calls Whisper API via onVoiceRecord)
- Thread/reply UI (consumer manages replyTo state)
- Message editing (consumer uses content prop + controlled state)
- Giphy/sticker integration
- Read receipts / delivery status
