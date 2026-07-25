import type { Meta, StoryObj } from '@storybook/react'

import { ContentCard } from './composed/content-card'
import { BulkActionBar, type BulkActionBarAction } from './composed/bulk-action-bar'
import { AvatarGroup, type AvatarUser } from './composed/avatar-group'
import { TableSkeleton, ListSkeleton } from './composed/loading-skeleton'
import { ProjectListSkeleton } from './composed/page-skeletons'
import { ErrorDisplay } from './composed/error-boundary'
import { MasterDetail } from './composed/master-detail'
import { FileUpload } from './ui/file-upload'
import { Text } from './ui/text'

/**
 * Below-Bar Gallery — a single review surface for the finish-bar-v2 audit's
 * "below-bar" P1 components (the rebuild/compose candidates), so they can be
 * eyeballed side-by-side. NOT a usage reference — see each component's own
 * stories for canonical examples. Ordered by audit priority.
 */
const meta: Meta = {
  title: 'Audit/Below-Bar Gallery',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

const users: AvatarUser[] = [
  { name: 'Aarav Sharma', image: null },
  { name: 'Priya Patel', image: null },
  { name: 'Rohan Gupta', image: null },
  { name: 'Meera Nair', image: null },
  { name: 'Kabir Singh', image: null },
  { name: 'Ananya Rao', image: null },
]

const bulkActions: BulkActionBarAction[] = [
  { label: 'Archive', onClick: () => {} },
  { label: 'Delete', color: 'error', onClick: () => {} },
]

function Section({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-ds-03 rounded-surface border border-surface-border bg-surface-raised p-ds-05">
      <div className="flex flex-col gap-ds-01">
        <Text variant="label-md" className="text-surface-fg">{title}</Text>
        <Text variant="body-sm" className="text-surface-fg-muted">{note}</Text>
      </div>
      <div className="rounded-control border border-surface-border-subtle bg-surface-base p-ds-04">
        {children}
      </div>
    </section>
  )
}

export const Gallery: Story = {
  render: () => (
    <div className="min-h-svh bg-surface-base p-ds-06">
      <div className="mx-auto flex max-w-5xl flex-col gap-ds-06">
        <div className="flex flex-col gap-ds-01">
          <Text variant="heading-sm" className="text-surface-fg">Below-Bar Components</Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            Finish-bar-v2 audit P1 rebuild/compose candidates, in one place for review.
          </Text>
        </div>

        <div className="grid grid-cols-1 gap-ds-05 lg:grid-cols-2">
          <Section title="ContentCard" note="P1 — duplicates Card; deprecate → compose.">
            <ContentCard headerTitle="Weekly summary">
              <Text variant="body-sm" className="text-surface-fg-muted">
                Card-like container with header/footer slots. Overlaps ui/Card.
              </Text>
            </ContentCard>
          </Section>

          <Section title="AvatarGroup" note="P1 — compose Avatar; overflow +N; group a11y.">
            <AvatarGroup users={users} max={4} />
          </Section>

          <Section title="ErrorDisplay / ErrorBoundary" note="P1 — match react-error-boundary (reset keys, fallback render prop).">
            <ErrorDisplay error={new Error('Failed to load data')} onReset={() => {}} />
          </Section>

          <Section title="FileUpload" note="P1 — drag-drop a11y, progress, error states.">
            <FileUpload onFiles={() => {}} label="Drop files or click to upload" />
          </Section>

          <Section title="LoadingSkeleton — Table" note="P1 — compose ui/skeleton; unify shimmer (S6).">
            <TableSkeleton rows={3} columns={4} />
          </Section>

          <Section title="LoadingSkeleton — List" note="P1 — same family; showAvatar variant.">
            <ListSkeleton rows={3} showAvatar />
          </Section>

          <Section title="PageSkeletons — ProjectList" note="P1 — compose ui/skeleton; unify shimmer.">
            <ProjectListSkeleton />
          </Section>

          <Section title="MasterDetail" note="P1 — list-detail a11y + keyboard (React Aria class).">
            <MasterDetail selected="1" className="h-[280px] overflow-hidden rounded-control border border-surface-border">
              <MasterDetail.List>
                <MasterDetail.ListItem active onClick={() => {}}>
                  <span className="font-medium">Karm V2</span>
                </MasterDetail.ListItem>
                <MasterDetail.ListItem onClick={() => {}}>
                  <span>Website Redesign</span>
                </MasterDetail.ListItem>
              </MasterDetail.List>
              <MasterDetail.Detail>
                <div className="p-ds-05">
                  <Text variant="label-md" className="text-surface-fg">Karm V2</Text>
                  <Text variant="body-sm" className="mt-ds-02 text-surface-fg-muted">Detail pane content.</Text>
                </div>
              </MasterDetail.Detail>
            </MasterDetail>
          </Section>
        </div>

        <Section
          title="BulkActionBar"
          note="P1 — compose React-Aria toolbar; keyboard + roles. (Renders as a floating bar at the viewport bottom.)"
        >
          <div className="relative h-[72px]">
            <BulkActionBar
              show
              count={3}
              totalCount={12}
              onClearSelection={() => {}}
              onSelectAll={() => {}}
              actions={bulkActions}
            />
          </div>
        </Section>

        <Section
          title="DataTableBulkActions + DataTablePagination"
          note="P1 — a11y + token cleanup. These only render inside a DataTable context — review them in the DataTable stories, not here."
        >
          <Text variant="body-sm" className="text-surface-fg-subtle">
            See Components → DataTable (bulk-actions row + pagination footer).
          </Text>
        </Section>
      </div>
    </div>
  ),
}
