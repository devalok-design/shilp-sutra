import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  MessageList,
  Message,
  SystemMessage,
  DateSeparator,
  UnreadSeparator,
  MessageInput,
  TypingIndicator,
} from './index'
import { Icon } from '../icon'
import { Switch } from '../switch'
import { TooltipProvider } from '../tooltip'
import {
  IconUserPlus,
  IconLock,
  IconPinnedFilled,
  IconEdit,
  IconTrash,
  IconMoodSmile,
  IconArrowForward,
  IconAlertCircle,
} from '@tabler/icons-react'

const meta: Meta = {
  title: 'UI/Chat',
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composable chat primitives \u2014 MessageList, Message (compound), SystemMessage, separators, input, and typing indicator. Serves both AI chat (bubble) and task conversations (flat).',
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
}
export default meta

type Story = StoryObj

// ── 1. FlatConversation ──────────────────────────────────────────────────

export const FlatConversation: Story = {
  render: () => (
    <div className="h-[480px] w-full max-w-xl rounded-ds-lg border border-surface-border bg-surface-2">
      <MessageList>
        <DateSeparator date="2026-03-24" />

        <Message>
          <Message.Avatar src="https://i.pravatar.cc/32?u=priya" fallback="PK" />
          <Message.Content>
            <Message.Author
              name="Priya K."
              timestamp={new Date('2026-03-24T09:15:00')}
            />
            <Message.Body>
              I pushed the initial wireframes for the dashboard redesign. Can you
              take a look before standup?
            </Message.Body>
            <Message.Reactions
              reactions={[
                { emoji: '\uD83D\uDC4D', count: 2, reacted: true },
                { emoji: '\uD83D\uDC40', count: 1, reacted: false },
              ]}
              onReact={(e) => console.log('react', e)}
            />
          </Message.Content>
          <Message.Actions>
            <Message.Action
              icon={IconMoodSmile}
              label="Add reaction"
              onClick={() => {}}
            />
            <Message.Action
              icon={IconArrowForward}
              label="Reply"
              onClick={() => {}}
            />
          </Message.Actions>
        </Message>

        <Message>
          <Message.Avatar src="https://i.pravatar.cc/32?u=arjun" fallback="AS" />
          <Message.Content>
            <Message.Author
              name="Arjun S."
              timestamp={new Date('2026-03-24T09:18:00')}
            />
            <Message.Body>
              On it. The filter bar placement feels off though. Let me sketch an
              alternative.
            </Message.Body>
          </Message.Content>
        </Message>

        <SystemMessage
          icon={<Icon icon={IconPinnedFilled} size="xs" />}
          timestamp="2026-03-24T09:20:00"
        >
          Priya K. pinned a message
        </SystemMessage>

        <DateSeparator date={new Date()} />

        <Message>
          <Message.Avatar src="https://i.pravatar.cc/32?u=priya" fallback="PK" />
          <Message.Content>
            <Message.Author
              name="Priya K."
              timestamp={new Date('2026-03-25T10:05:00')}
            />
            <Message.Body>
              Updated the filter bar \u2014 moved it into a collapsible panel on the
              left. WDYT?
            </Message.Body>
          </Message.Content>
        </Message>

        <Message>
          <Message.Avatar src="https://i.pravatar.cc/32?u=arjun" fallback="AS" />
          <Message.Content>
            <Message.Author
              name="Arjun S."
              timestamp={new Date('2026-03-25T10:12:00')}
            />
            <Message.Body>
              Much better. Ship it.
            </Message.Body>
          </Message.Content>
        </Message>

        <TypingIndicator users={[{ name: 'Priya' }]} />
      </MessageList>
    </div>
  ),
}

// ── 2. BubbleConversation ────────────────────────────────────────────────

export const BubbleConversation: Story = {
  render: () => (
    <div className="h-[400px] w-full max-w-md rounded-ds-lg border border-surface-border bg-surface-2">
      <MessageList>
        <Message variant="bubble" placement="end">
          <Message.Body>
            How do I add a custom Tailwind color token to the design system?
          </Message.Body>
        </Message>

        <Message variant="bubble" placement="start">
          <Message.Body>
            Add the color to `primitives.css` as a CSS custom property, then
            reference it in `semantic.css` to create a semantic alias. Finally,
            register it in `tailwind/preset.ts` so Tailwind picks it up.{'\n\n'}
            **Example:**{'\n'}
            ```css{'\n'}
            --color-brand-gold: oklch(0.85 0.12 85);{'\n'}
            ```
          </Message.Body>
        </Message>

        <Message variant="bubble" placement="end">
          <Message.Body>
            Got it, thanks! Does it auto-generate dark mode variants?
          </Message.Body>
        </Message>

        <TypingIndicator users={[{ name: 'Devadoot' }]} />
      </MessageList>
    </div>
  ),
}

// ── 3. GroupedMessages ───────────────────────────────────────────────────

export const GroupedMessages: Story = {
  render: () => (
    <div className="h-[400px] w-full max-w-xl rounded-ds-lg border border-surface-border bg-surface-2">
      <MessageList>
        <Message>
          <Message.Avatar src="https://i.pravatar.cc/32?u=meera" fallback="MR" />
          <Message.Content>
            <Message.Author
              name="Meera R."
              timestamp={new Date('2026-03-25T14:00:00')}
            />
            <Message.Body>Starting the deploy now.</Message.Body>
          </Message.Content>
        </Message>

        <Message grouped>
          <Message.Avatar fallback="MR" />
          <Message.Content>
            <Message.Author name="Meera R." />
            <Message.Body>Build passed.</Message.Body>
          </Message.Content>
        </Message>

        <Message grouped>
          <Message.Avatar fallback="MR" />
          <Message.Content>
            <Message.Author name="Meera R." />
            <Message.Body>Migrations running...</Message.Body>
          </Message.Content>
        </Message>

        <Message grouped>
          <Message.Avatar fallback="MR" />
          <Message.Content>
            <Message.Author name="Meera R." />
            <Message.Body>All pods healthy.</Message.Body>
          </Message.Content>
        </Message>

        <Message grouped>
          <Message.Avatar fallback="MR" />
          <Message.Content>
            <Message.Author name="Meera R." />
            <Message.Body>
              Deploy complete. v2.4.1 is live.
            </Message.Body>
          </Message.Content>
        </Message>
      </MessageList>
    </div>
  ),
}

// ── 4. MessageStates ─────────────────────────────────────────────────────

export const MessageStates: Story = {
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-ds-04 rounded-ds-lg border border-surface-border bg-surface-2 p-ds-05">
      <Message deleted />

      <Message highlight="mention">
        <Message.Avatar src="https://i.pravatar.cc/32?u=rahul" fallback="RD" />
        <Message.Content>
          <Message.Author
            name="Rahul D."
            timestamp={new Date('2026-03-25T11:30:00')}
          />
          <Message.Body>
            @you The client approved the proposal. Let's kick off sprint planning.
          </Message.Body>
        </Message.Content>
      </Message>

      <Message highlight="internal">
        <Message.Avatar src="https://i.pravatar.cc/32?u=nisha" fallback="NP" />
        <Message.Content>
          <Message.Author
            name="Nisha P."
            badge={
              <span className="rounded-full bg-warning-3 px-1.5 py-0.5 text-[10px] font-medium text-warning-11">
                Internal
              </span>
            }
            timestamp={new Date('2026-03-25T11:35:00')}
          />
          <Message.Body>
            FYI: their budget is actually 20% higher than what they quoted. Don't
            lead with that.
          </Message.Body>
        </Message.Content>
      </Message>
    </div>
  ),
}

// ── 5. EditableBody ──────────────────────────────────────────────────────

function EditableBodyDemo() {
  const [content, setContent] = React.useState(
    'This message can be edited. Click it to enter edit mode.',
  )

  return (
    <div className="w-full max-w-xl rounded-ds-lg border border-surface-border bg-surface-2 p-ds-05">
      <Message>
        <Message.Avatar src="https://i.pravatar.cc/32?u=you" fallback="YO" />
        <Message.Content>
          <Message.Author
            name="You"
            timestamp={new Date('2026-03-25T15:00:00')}
          />
          <Message.EditableBody
            content={content}
            canEdit
            onSave={(newContent) => setContent(newContent)}
          />
        </Message.Content>
      </Message>
      <p className="mt-ds-04 text-ds-xs text-surface-fg-subtle">
        Click the message body to edit. Press Enter to save, Escape to cancel.
      </p>
    </div>
  )
}

export const EditableBody: Story = {
  render: () => <EditableBodyDemo />,
}

// ── 6. SystemMessages ────────────────────────────────────────────────────

export const SystemMessages: Story = {
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-ds-03 rounded-ds-lg border border-surface-border bg-surface-2 p-ds-05">
      <SystemMessage
        icon={<Icon icon={IconUserPlus} size="xs" />}
        timestamp="2026-03-25T09:00:00"
      >
        Arjun S. joined the channel
      </SystemMessage>

      <SystemMessage
        icon={<Icon icon={IconEdit} size="xs" />}
        timestamp="2026-03-25T09:05:00"
      >
        Priya K. changed the topic to "Q2 Sprint Planning"
      </SystemMessage>

      <SystemMessage
        icon={<Icon icon={IconLock} size="xs" />}
        timestamp="2026-03-25T09:10:00"
      >
        Channel is now private
      </SystemMessage>

      <SystemMessage
        icon={<Icon icon={IconPinnedFilled} size="xs" />}
        timestamp="2026-03-25T09:15:00"
      >
        Meera R. pinned a message
      </SystemMessage>

      <SystemMessage
        variant="alert"
        icon={<Icon icon={IconAlertCircle} size="sm" />}
        timestamp="2026-03-25T09:20:00"
      >
        Connection lost. Reconnecting...
      </SystemMessage>
    </div>
  ),
}

// ── 7. InputVariants ─────────────────────────────────────────────────────

function InputVariantsDemo() {
  const [isInternal, setIsInternal] = React.useState(false)

  return (
    <div className="flex w-full max-w-xl flex-col gap-ds-06">
      <div>
        <p className="mb-ds-02 text-ds-xs font-medium text-surface-fg-subtle">
          Default
        </p>
        <div className="rounded-ds-lg border border-surface-border bg-surface-2">
          <MessageInput
            onSubmit={(text) => console.log('send:', text)}
            placeholder="Type a message..."
          />
        </div>
      </div>

      <div>
        <p className="mb-ds-02 text-ds-xs font-medium text-surface-fg-subtle">
          With leading slot (internal toggle)
        </p>
        <div className="rounded-ds-lg border border-surface-border bg-surface-2">
          <MessageInput
            onSubmit={(text) =>
              console.log('send:', text, { internal: isInternal })
            }
            placeholder={
              isInternal ? 'Internal note...' : 'Type a message...'
            }
            leadingSlot={
              <div className="flex items-center gap-ds-02 pl-ds-02">
                <Switch
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                  aria-label="Internal message"
                />
                <span className="text-ds-xs text-surface-fg-subtle whitespace-nowrap">
                  Internal
                </span>
              </div>
            }
          />
        </div>
      </div>

      <div>
        <p className="mb-ds-02 text-ds-xs font-medium text-surface-fg-subtle">
          Streaming (stop button)
        </p>
        <div className="rounded-ds-lg border border-surface-border bg-surface-2">
          <MessageInput
            onSubmit={() => {}}
            isStreaming
            onCancel={() => console.log('cancel')}
            placeholder="AI is responding..."
            disclaimer="Devadoot may produce inaccurate information."
          />
        </div>
      </div>
    </div>
  )
}

export const InputVariants: Story = {
  render: () => <InputVariantsDemo />,
}

// ── 8. Separators ────────────────────────────────────────────────────────

export const Separators: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-ds-03 rounded-ds-lg border border-surface-border bg-surface-2 p-ds-05">
      <DateSeparator date={new Date()} />
      <DateSeparator
        date={new Date(Date.now() - 86_400_000)}
      />
      <DateSeparator date="2026-03-20" />

      <div className="h-ds-04" />

      <UnreadSeparator />
      <UnreadSeparator count={3} />
    </div>
  ),
}
