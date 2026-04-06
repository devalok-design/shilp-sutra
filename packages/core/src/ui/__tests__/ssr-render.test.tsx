/**
 * SSR renderToString smoke tests for @server-safe components.
 *
 * These verify that components annotated with `// @server-safe` can actually
 * render to HTML via React's server renderer — not just import without error.
 */
import { renderToString } from 'react-dom/server'
import * as React from 'react'

import { Table, TableBody, TableRow, TableCell, TableHead, TableHeader } from '../table'
import { Text } from '../text'
import { Skeleton } from '../skeleton'
import { Code } from '../code'
import { Container } from '../container'
import { Stack } from '../stack'
import { VisuallyHidden } from '../visually-hidden'
import { PageHeader } from '../../composed/page-header'
import { ContentCard } from '../../composed/content-card'
import { CardSkeleton, TableSkeleton } from '../../composed/loading-skeleton'
import { DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton } from '../../composed/page-skeletons'

describe('SSR renderToString', () => {
  it('renders Table without crashing', () => {
    expect(() =>
      renderToString(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>test</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      ),
    ).not.toThrow()
  })

  it('renders Text without crashing', () => {
    expect(() =>
      renderToString(<Text variant="heading-lg">Hello</Text>),
    ).not.toThrow()
  })

  it('renders Skeleton without crashing', () => {
    expect(() =>
      renderToString(<Skeleton variant="rectangle" />),
    ).not.toThrow()
  })

  it('renders Code without crashing', () => {
    expect(() =>
      renderToString(<Code>const x = 1</Code>),
    ).not.toThrow()
  })

  it('renders Code block variant without crashing', () => {
    expect(() =>
      renderToString(<Code variant="block">{'const x = 1\nconst y = 2'}</Code>),
    ).not.toThrow()
  })

  it('renders Container without crashing', () => {
    expect(() =>
      renderToString(<Container>Content</Container>),
    ).not.toThrow()
  })

  it('renders Stack without crashing', () => {
    expect(() =>
      renderToString(
        <Stack direction="vertical" gap="ds-04">
          <div>A</div>
          <div>B</div>
        </Stack>,
      ),
    ).not.toThrow()
  })

  it('renders VisuallyHidden without crashing', () => {
    expect(() =>
      renderToString(<VisuallyHidden>Hidden text</VisuallyHidden>),
    ).not.toThrow()
  })

  it('renders PageHeader without crashing', () => {
    expect(() =>
      renderToString(<PageHeader title="Dashboard" />),
    ).not.toThrow()
  })

  it('renders ContentCard without crashing', () => {
    expect(() =>
      renderToString(<ContentCard>Card content</ContentCard>),
    ).not.toThrow()
  })

  it('renders CardSkeleton without crashing', () => {
    expect(() => renderToString(<CardSkeleton />)).not.toThrow()
  })

  it('renders TableSkeleton without crashing', () => {
    expect(() => renderToString(<TableSkeleton rows={3} columns={3} />)).not.toThrow()
  })

  it('renders DashboardSkeleton without crashing', () => {
    expect(() => renderToString(<DashboardSkeleton />)).not.toThrow()
  })

  it('renders ProjectListSkeleton without crashing', () => {
    expect(() => renderToString(<ProjectListSkeleton />)).not.toThrow()
  })

  it('renders TaskDetailSkeleton without crashing', () => {
    expect(() => renderToString(<TaskDetailSkeleton />)).not.toThrow()
  })
})
