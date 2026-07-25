import type { Meta, StoryObj } from '@storybook/react'

import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from './ui/card'
import { ContentCard } from './composed/content-card'
import { AvatarGroup, type AvatarUser } from './composed/avatar-group'
import { Button } from './ui/button'
import { Text } from './ui/text'

const team: AvatarUser[] = [
  { name: 'Aarav Sharma', image: null, indicator: 'lead' },
  { name: 'Priya Patel', image: null },
  { name: 'Rohan Gupta', image: null, indicator: 'admin' },
  { name: 'Meera Nair', image: null },
  { name: 'Kabir Singh', image: null },
  { name: 'Ananya Rao', image: null },
]

/**
 * Below-Bar: Before / After — side-by-side comparisons for each finish-bar-v2
 * below-bar component as it's rebuilt/composed. Left = current (before),
 * right = rebuilt/composed (after), with the change notes below each pair.
 */
const meta: Meta = {
  title: 'Audit/Below-Bar Before-After',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

function Row({
  name,
  verdict,
  before,
  after,
  changes,
}: {
  name: string
  verdict: string
  /** Omit when the win is behavioral (a11y/motion) and looks identical statically. */
  before?: React.ReactNode
  after: React.ReactNode
  changes: string[]
}) {
  return (
    <section className="flex flex-col gap-ds-04 border-b border-surface-border pb-ds-07">
      <div className="flex flex-col gap-ds-01">
        <Text variant="heading-xs" className="text-surface-fg">{name}</Text>
        <Text variant="body-sm" className="text-surface-fg-muted">{verdict}</Text>
      </div>
      {before ? (
        <div className="grid grid-cols-1 gap-ds-05 lg:grid-cols-2">
          <div className="flex flex-col gap-ds-02">
            <Text variant="label-sm" className="text-surface-fg-subtle">BEFORE</Text>
            <div className="rounded-control border border-surface-border-subtle bg-surface-base p-ds-05">{before}</div>
          </div>
          <div className="flex flex-col gap-ds-02">
            <Text variant="label-sm" className="text-accent-11">AFTER</Text>
            <div className="rounded-control border border-accent-6 bg-surface-base p-ds-05">{after}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-ds-02">
          <Text variant="label-sm" className="text-accent-11">AFTER (behavioral — tab in / enable reduced-motion to feel the change)</Text>
          <div className="rounded-control border border-accent-6 bg-surface-base p-ds-05">{after}</div>
        </div>
      )}
      <ul className="flex flex-col gap-ds-01 pl-ds-04">
        {changes.map((c, i) => (
          <li key={i} className="list-disc text-ds-sm text-surface-fg-muted">{c}</li>
        ))}
      </ul>
    </section>
  )
}

export const BeforeAfter: Story = {
  render: () => (
    <div className="min-h-svh bg-surface-base p-ds-06">
      <div className="mx-auto flex max-w-5xl flex-col gap-ds-07">
        <div className="flex flex-col gap-ds-01">
          <Text variant="heading-sm" className="text-surface-fg">Below-Bar — Before / After</Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            Each below-bar component rebuilt/composed. Left = current, right = after.
          </Text>
        </div>

        {/* ── content-card: DELETE (compose into Card), not a rebuild ── */}
        <Row
          name="ContentCard → Card + slots"
          verdict="Audit P0: don't rebuild — it's @deprecated. A drift-prone copy of Card. Migrate to Card + slots, delete next major."
          before={
            <ContentCard
              headerTitle="Team activity"
              headerActions={<Button size="sm" variant="soft">View all</Button>}
              footer={<Text variant="body-sm" className="text-surface-fg-subtle">Updated 2 min ago</Text>}
            >
              <Text variant="body-sm" className="text-surface-fg-muted">
                6 commits, 2 reviews, 1 release today.
              </Text>
            </ContentCard>
          }
          after={
            <Card>
              <CardHeader>
                <CardTitle>Team activity</CardTitle>
                <CardAction><Button size="sm" variant="soft">View all</Button></CardAction>
              </CardHeader>
              <CardContent>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  6 commits, 2 reviews, 1 release today.
                </Text>
              </CardContent>
              <CardFooter>
                <Text variant="body-sm" className="text-surface-fg-subtle">Updated 2 min ago</Text>
              </CardFooter>
            </Card>
          }
          changes={[
            'No re-rolled surface/radius/shadow — Card owns the surface (one card vocabulary, not two).',
            'Slots (CardHeader/CardTitle/CardAction/CardContent/CardFooter) replace fixed region props + implicit header ?? headerTitle precedence.',
            'CardTitle picks the right heading semantics instead of a hardcoded <h3>.',
            'Card default is tonal/flat (no false hover-lift on a non-interactive card); use interactive intent when the card is clickable.',
            'Resolution: delete ContentCard next major; this is the migration.',
          ]}
        />

        {/* ── avatar-group: polish rebuild (a11y + motion P0s) ── */}
        <Row
          name="AvatarGroup — a11y + motion polish"
          verdict="Audit: polish, not rebuild. Two P0s fixed (no focus ring / keyboard-unreachable names; no reduced-motion) + P1 cleanups. Public API unchanged."
          after={
            <div className="flex items-center gap-ds-06">
              <AvatarGroup users={team} max={4} />
              <Text variant="body-sm" className="text-surface-fg-subtle">
                Tab into it — each avatar is a focusable, labelled trigger with a focus ring; its name shows on keyboard focus (was hover-only).
              </Text>
            </div>
          }
          changes={[
            'P0 a11y: each avatar is now a focusable <button> with the focus-ring util + aria-label — member names reachable by keyboard/AT (were on non-focusable divs, hover-only).',
            'P0 motion: spread + spotlight driven by framer (animate x) so MotionConfig/reduced-motion governs them; no positional animation under prefers-reduced-motion.',
            'P1 motion: avatars + the +N badge now animate the spread together on DS spring/duration tokens (avatars used to snap while +N glided).',
            'P1 compose: +N badge is now an <Avatar> + <AvatarFallback> — deletes the duplicate avatarSizeVariants CVA and text-size map.',
            'P1 fix: dead indicator ternary resolved — admin dot is now bg-warning-9 (matched the docs); lead stays accent.',
            'P2: empty users renders nothing (was a focusable "0 team members"); max clamped ≥1; ring-offset follows borderColor (no seam on surface-base).',
          ]}
        />

        {/* ── bulk-action-bar: ARIA toolbar keyboard model (P0) ── */}
        <Row
          name="BulkActionBar — ARIA toolbar keyboard model"
          verdict="Audit P0: keyboard trap — roving tabindex sat on a wrapper div while the real Button was tabindex=-1, so actions were unreachable by keyboard. (Floating portal — see it live in the gallery; the win is behavioral.)"
          after={
            <Text variant="body-sm" className="text-surface-fg-muted">
              Single tab stop → Arrow/Home/End rove across Select-all + actions + Clear, focus lands on the real buttons, Enter/Space activate. Locked by a new arrow-then-Enter test.
            </Text>
          }
          changes={[
            'P0 a11y: roving tabindex now on the actual <Button>s (was on wrapper divs) — arrow to an action, Enter activates it. Single tab stop across ALL controls (Select-all, actions, Clear), per the React-Aria Toolbar model.',
            'P1 a11y: inline confirm is role="group" + aria-live="assertive"; focus moves to Confirm on open, restores to the action on Cancel/Escape.',
            'P1 RTL: logical positioning (start-1/2) + Arrow Left/Right mirrored under dir="rtl".',
            'P1 api: forwardRef + spreads HTMLAttributes; action color widened to the full Button union (was 2 of 6).',
            'P2 state: per-action loading spinner; P2 motion: springs.smooth for the slide + reduced-motion guard (opacity-only under prefers-reduced-motion).',
            'Docs corrected: prop table now matches source (icon = IconInput, full color union, +totalCount/onSelectAll/loading/confirm props).',
          ]}
        />
      </div>
    </div>
  ),
}
