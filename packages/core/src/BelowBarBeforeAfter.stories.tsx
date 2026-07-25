import type { Meta, StoryObj } from '@storybook/react'

import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from './ui/card'
import { ContentCard } from './composed/content-card'
import { AvatarGroup, type AvatarUser } from './composed/avatar-group'
import { TableSkeleton, ListSkeleton } from './composed/loading-skeleton'
import { ErrorDisplay } from './composed/error-boundary'
import { MasterDetail } from './composed/master-detail'
import { FileUpload } from './ui/file-upload'
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

        {/* ── loading-skeleton + page-skeletons: S6 shimmer unify + a11y ── */}
        <Row
          name="Skeletons — S6 shimmer unify + a11y status region"
          verdict="Audit: two skeleton vocabularies in one system + silent to AT. Now one source of truth + role=status. (loading-skeleton + page-skeletons.)"
          after={
            <div className="flex flex-col gap-ds-05">
              <TableSkeleton rows={3} columns={4} label="Loading table" />
              <ListSkeleton rows={3} label="Loading list" />
            </div>
          }
          changes={[
            'S6 (P0): dropped every bg-surface-raised-hover fill override — all bars now inherit the base Skeleton’s skeleton-base, so the whole system shimmers from ONE source (was two vocabularies) and bars no longer vanish in forced-colors (Windows HCM).',
            'a11y (P0): each root is now role="status" + aria-busy with an sr-only label (was silent to AT — child Skeletons are all aria-hidden). New optional `label` prop.',
            'state (P1): count props clamped (Math.max(0, floor)) — rows={-1}/NaN can’t throw a RangeError anymore.',
            'motion (P1): removed the inert animationDelay (it sat on non-animated wrapper divs and never fired).',
            'cohesion (P1): shells use border-card + rounded-surface (Card’s vocabulary), not border-card-strong / rounded-overlay-lg (Dialog radius); page-skeletons’ misleading `shimmer` fill const deleted.',
            'docs: page-skeletons no longer falsely claims it’s "Built on LoadingSkeleton".',
          ]}
        />

        {/* ── error-boundary: a11y alert + boundary contract (react-error-boundary parity) ── */}
        <Row
          name="ErrorBoundary / ErrorDisplay — alert a11y + boundary contract"
          verdict="Audit P0: no live region (screen readers got nothing when the boundary swapped in). + boundary mechanics lagged react-error-boundary. All fixes additive."
          after={<ErrorDisplay error={new Error('Failed to load dashboard')} onReset={() => {}} fullPage={false} />}
          changes={[
            'a11y (P0): the message region is now role="alert" (assertive live region) — AT announces the error on appearance; focus moves to the recovery button when the boundary swaps in (autoFocusReset).',
            'security (P1): raw error.message is gated behind dev — production shows the friendly status-mapped copy (no internal-detail leak); the real message stays in the dev-only stack block.',
            'api (P1): ErrorBoundary now has componentDidCatch → onError(error, info) for Sentry/logging; + an actions slot (secondary recovery action) replacing the hardcoded single "Try Again".',
            'api (P2): resetKeys — the boundary auto-recovers when a dependency changes (react-error-boundary parity); fallback now receives a guaranteed onReset.',
            'visual: dead border-card-strong → border-card; min-h-[60vh] gated behind a fullPage prop (inline boundaries no longer force viewport height).',
          ]}
        />

        {/* ── master-detail: a11y naming/live + selection ownership ── */}
        <Row
          name="MasterDetail — a11y + selection ownership"
          verdict="Audit P0: nameless listbox + detail swaps silently. P1: controlled-only, hand-wired active+onClick. Roving keyboard nav was already solid."
          after={
            <MasterDetail defaultSelected="karm" label="Projects" className="h-[240px] overflow-hidden rounded-control border border-surface-border">
              <MasterDetail.List>
                <MasterDetail.ListItem value="karm">Karm V2</MasterDetail.ListItem>
                <MasterDetail.ListItem value="site">Website Redesign</MasterDetail.ListItem>
                <MasterDetail.ListItem value="brand">Brand System</MasterDetail.ListItem>
              </MasterDetail.List>
              <MasterDetail.Detail>
                <div className="p-ds-05">
                  <Text variant="label-md" className="text-surface-fg">Detail pane</Text>
                  <Text variant="body-sm" className="mt-ds-02 text-surface-fg-muted">Arrow/Home/End to rove, Enter to select. Focus a row.</Text>
                </div>
              </MasterDetail.Detail>
            </MasterDetail>
          }
          changes={[
            'a11y (P0): the listbox now has an accessible name (`label` prop → aria-label) — was a nameless listbox to screen readers.',
            'a11y (P0): the detail pane is role="region" aria-live="polite" — AT users are told the detail changed on selection (was a silent swap).',
            'api (P1): selection ownership — pass `value` per row + `onSelect`/`defaultSelected` on the root; active + aria-selected derive from context. No more hand-wiring `active={id===sel}` AND `onClick` on every row. Controlled `selected` still works.',
            'motion (P2): the mobile detail slide is gated behind useReducedMotion (opacity-only / instant under prefers-reduced-motion).',
            'RTL (P2): list divider border-r → border-e; the mobile back arrow mirrors under dir="rtl".',
            'cleanup: removed the dead itemCount context; roving activeIndex derives from value or explicit active. (asChild/typeahead noted as follow-ups.)',
          ]}
        />

        {/* ── file-upload: focus-visible + motion hygiene ── */}
        <Row
          name="FileUpload — focus-visible + motion hygiene"
          verdict="Audit P0: the keyboard-operable drop zone had no focus-visible ring. P1: progress animated width (layout, escaped reduced-motion) + a default error shake."
          after={<FileUpload onFiles={() => {}} label="Drop files or click to upload" />}
          changes={[
            'a11y (P0): the role="button" drop zone now has the focus-ring util — tab to it and you get a visible ring (a div[role=button] gets no usable UA outline). WCAG 2.4.7.',
            'a11y (P1): disabled drop zone is tabIndex=-1 (leaves the tab order) to match aria-disabled — was still focusable while disabled.',
            'motion (P1): progress bar animates scaleX on a full-width child (transform-origin:left) instead of width — compositor-only + honored by prefers-reduced-motion (width slipped past MotionConfig).',
            'motion (P1): removed the default 5-keyframe error shake — the alert fades/slides in calmly now.',
            'visual (P2): the drop zone rests on bg-surface-base (canvas) and tints on hover — the hover token was being used at rest; adds real hover feedback.',
            'Follow-up noted: compose the compact variant on <Button> (still re-rolls button chrome).',
          ]}
        />
      </div>
    </div>
  ),
}
