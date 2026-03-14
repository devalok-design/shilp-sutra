# Page Skeletons (Karm)

- Import: @devalok/shilp-sutra-karm
- Server-safe: No
- Category: other

Domain-specific loading skeleton components for Karm pages.

Exports: DevsabhaSkeleton, BandwidthSkeleton

## Props

### DevsabhaSkeleton
    ...HTMLDivElement attributes (className, etc.)

Renders a 5-section skeleton grid mimicking the Devsabha (standup) page layout:
1. Main large card (lg:col-span-2) with 4 rows
2. Side card with 3 avatar rows
3. Full-width card (lg:col-span-3) with 3 sub-cards
4. Stats row (lg:col-span-2) with 4 stat blocks
5. Timeline card with 3 entries

### BandwidthSkeleton
    ...HTMLDivElement attributes (className, etc.)

Renders a skeleton mimicking the Bandwidth page layout:
1. 3 summary cards (sm:grid-cols-3) with progress bars
2. Table with 5-column header and 6 rows with avatar + name

## Defaults
    None

## Example
```jsx
import { DevsabhaSkeleton, BandwidthSkeleton } from '@devalok/shilp-sutra-karm'

// Use while data loads
if (isLoading) return <DevsabhaSkeleton />

// Bandwidth page loading
if (isLoading) return <BandwidthSkeleton className="p-6" />
```

## Gotchas
- These are top-level exports from the karm package, not from the admin sub-path
- Both use the core `Skeleton` component internally
- Layout uses `gap-ds-06` spacing and `rounded-ds-xl` border radius
- Pass `className` to customize outer container styles

## Changes
### v0.9.0
- **Added** Initial release
