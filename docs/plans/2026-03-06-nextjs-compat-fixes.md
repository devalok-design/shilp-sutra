# Next.js Compatibility Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three Next.js 15 App Router integration issues reported by karm team: optional peer dep build failures, pnpm hoisting, and EmptyState RSC breakage.

**Architecture:** Remove chart and data-table components from the `ui` barrel export so webpack doesn't resolve their heavy deps (d3-*, @tanstack/*) when consumers only import lightweight components. Fix EmptyState by changing `icon` prop from component type to ReactNode with an inline swadhisthana chakra SVG default.

**Tech Stack:** React 18, TypeScript, Vite (library mode), Vitest + RTL

---

### Task 1: Fix EmptyState icon prop (RSC compatibility)

**Files:**
- Modify: `packages/core/src/composed/empty-state.tsx`
- Modify: `packages/core/src/composed/empty-state.test.tsx`

**Step 1: Update EmptyState component**

Replace the entire file with:

```tsx
import * as React from 'react'
import { cn } from '../ui/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

const DevalokChakraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M25.97,21.39c-0.9-1.85,0.08-3.95-1.72-5.39c1.76-1.44,0.8-3.55,1.69-5.39c0.05-0.12,0.04-0.25-0.02-0.35c-0.06-0.1-0.16-0.18-0.29-0.19c-2.05-0.15-3.35-2.04-5.5-1.21c-0.39-2.21-2.7-2.44-3.84-4.13c-0.08-0.1-0.19-0.16-0.31-0.16c-0.12,0-0.23,0.05-0.31,0.16c-1.14,1.69-3.43,1.92-3.82,4.13c-2.14-0.83-3.47,1.07-5.52,1.21c-0.13,0.01-0.23,0.09-0.29,0.19c-0.06,0.1-0.07,0.23-0.02,0.35c0.9,1.85-0.08,3.95,1.72,5.39c-1.76,1.44-0.8,3.55-1.69,5.39C6,21.51,6.02,21.64,6.07,21.74c0.06,0.1,0.16,0.18,0.29,0.19c2.05,0.15,3.38,2.06,5.52,1.23c0.39,2.21,2.67,2.43,3.82,4.12c0.08,0.1,0.19,0.16,0.31,0.16c0.12,0,0.23-0.05,0.31-0.16c1.14-1.69,3.42-1.92,3.81-4.13c2.14,0.83,3.48-1.07,5.53-1.22c0.13-0.01,0.23-0.09,0.29-0.19C26.01,21.64,26.02,21.51,25.97,21.39z" />
  </svg>
)

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      compact = false,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedIcon = icon ?? (
      <DevalokChakraIcon
        className={cn(
          'text-text-placeholder',
          compact ? 'h-ico-md w-ico-md' : 'h-ico-lg w-ico-lg',
        )}
      />
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'gap-ds-04 py-ds-07' : 'gap-ds-05 py-ds-10',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-ds-xl bg-layer-02',
            compact ? 'h-ds-md w-ds-md' : 'h-ds-lg w-ds-lg',
          )}
        >
          {resolvedIcon}
        </div>

        <div className="flex max-w-[280px] flex-col gap-ds-02">
          <h3
            className={cn(
              'text-text-primary',
              compact ? 'text-ds-md font-semibold' : 'text-ds-base font-semibold',
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                'text-text-placeholder',
                compact ? 'text-ds-sm' : 'text-ds-md',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="mt-ds-02">{action}</div>}
      </div>
    )
  },
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
```

Key changes:
- `icon` prop: `TablerIcon` -> `React.ReactNode`
- Default icon: inline `DevalokChakraIcon` (swadhisthana chakra SVG) instead of `IconInbox`
- Removed `@tabler/icons-react` import entirely
- When `icon` is provided, it's rendered as-is (ReactNode); when omitted, the default chakra icon renders with appropriate sizing
- Component remains server-safe (no hooks, no client deps)

**Step 2: Update EmptyState tests**

Update tests to use `icon={<SomeIcon />}` (ReactNode) instead of `icon={SomeIcon}` (component ref). Also add a test for the default chakra icon.

**Step 3: Run tests**

Run: `cd packages/core && pnpm vitest run src/composed/empty-state.test.tsx`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add packages/core/src/composed/empty-state.tsx packages/core/src/composed/empty-state.test.tsx
git commit -m "fix(core): change EmptyState icon prop to ReactNode with inline chakra default

BREAKING CHANGE: icon prop now accepts ReactNode instead of TablerIcon component.
Use icon={<IconName />} instead of icon={IconName}.
Default icon is now the Devalok swadhisthana chakra (inline SVG, zero deps)."
```

---

### Task 2: Remove charts and data-table from ui barrel export

**Files:**
- Modify: `packages/core/src/ui/index.ts` (remove chart + data-table re-exports)

**Step 1: Edit ui/index.ts**

Remove these lines:
- `export { DataTable, type DataTableProps } from './data-table'`
- `export { DataTableToolbar, type DataTableToolbarProps, type Density } from './data-table-toolbar'`
- `export * from './charts'`

These components remain accessible via their per-component exports:
- `@devalok/shilp-sutra/ui/data-table`
- `@devalok/shilp-sutra/ui/data-table-toolbar`
- `@devalok/shilp-sutra/ui/charts`

**Step 2: Verify per-component exports exist in package.json**

Confirm that `packages/core/package.json` exports map already has:
- `"./ui/data-table"` entry
- `"./ui/data-table-toolbar"` entry
- `"./ui/charts"` entry

These should already exist from the per-component exports work.

**Step 3: Build and verify**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds. `dist/ui/index.js` no longer re-exports charts/data-table.

**Step 4: Commit**

```bash
git add packages/core/src/ui/index.ts
git commit -m "fix(core): remove charts and data-table from ui barrel export

Components with heavy optional deps (d3-*, @tanstack/*, @tabler/icons-react)
are no longer re-exported from the main ui barrel. This prevents Next.js webpack
from resolving these deps when consumers only import lightweight components.

Use per-component imports instead:
  import { DataTable } from '@devalok/shilp-sutra/ui/data-table'
  import { BarChart } from '@devalok/shilp-sutra/ui/charts'"
```

---

### Task 3: Update peerDependenciesMeta documentation

**Files:**
- Modify: `packages/core/package.json` (add comments or JSDoc noting which components need which peers)

**Step 1: No code change needed for peerDependenciesMeta**

The deps remain optional peers — they're only needed if you use charts/data-table. With the barrel fix, consumers who don't use these components won't encounter resolution errors. Consumers who DO use them will get a clear build-time error telling them to install the dep.

**Step 2: Verify pnpm resolution**

With charts removed from barrel, a consumer doing `import { Button } from '@devalok/shilp-sutra/ui'` will never trigger d3/tanstack resolution, so pnpm hoisting is irrelevant for the common case.

---

### Task 4: Full test suite + build verification

**Step 1: Run full test suite**

Run: `cd packages/core && pnpm vitest run`
Expected: All 555+ tests pass

**Step 2: Run full build**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds

**Step 3: Verify dist output**

- `dist/ui/index.js` should NOT contain imports from d3-*, @tanstack/*, or @tabler/icons-react
- `dist/composed/empty-state.js` should NOT contain imports from @tabler/icons-react
- `dist/composed/empty-state.js` should NOT have "use client" directive (remains server-safe)
- `dist/ui/charts/bar-chart.js` should still exist (per-component export still works)
- `dist/ui/data-table.js` should still exist

---

### Task 5: Version bump, changelog, publish

**Files:**
- Modify: `packages/core/package.json` (version bump to 0.5.0)
- Modify: `CHANGELOG.md`

**Step 1: Bump version to 0.5.0**

Minor bump because EmptyState icon prop is a breaking API change (on 0.x).

**Step 2: Update CHANGELOG.md**

Add v0.5.0 entry with:
- BREAKING: `EmptyState` `icon` prop changed from `TablerIcon` to `ReactNode` — use `icon={<Icon />}` instead of `icon={Icon}`
- Fixed: Charts and DataTable removed from `ui` barrel export to prevent Next.js build failures with missing optional deps
- Fixed: pnpm strict hoisting no longer required for optional peer deps

**Step 3: Commit version bump**

```bash
git add packages/core/package.json CHANGELOG.md
git commit -m "chore: bump @devalok/shilp-sutra to v0.5.0"
```

**Step 4: Publish**

```bash
cd packages/core && npm publish --access public
```

---

### Parallel Execution Strategy

- Tasks 1 and 2 are independent — can run in parallel
- Task 3 is documentation only (no code change needed)
- Task 4 depends on Tasks 1+2
- Task 5 depends on Task 4
