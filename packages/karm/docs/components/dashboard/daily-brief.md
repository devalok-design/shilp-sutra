# DailyBrief

- Import: @devalok/shilp-sutra-karm/dashboard
- Server-safe: No
- Category: dashboard

## Props
    data: BriefData | null (REQUIRED)
    loading: boolean (default: false)
    onRefresh: () => void
    unavailable: boolean (default: false)
    collapsible: boolean (default: true)
    defaultCollapsed: boolean (default: false)
    title?: string (default: "Morning Brief")
    className: string

## Related Types
    BriefData: { brief: string[]; generatedAt: string }

## Defaults
    loading=false, unavailable=false, collapsible=true, defaultCollapsed=false, title="Morning Brief"

## Example
```jsx
<DailyBrief
  data={{ brief: ["3 tasks due today", "Team standup at 10am"], generatedAt: new Date().toISOString() }}
  onRefresh={() => refetchBrief()}
  loading={isRefreshing}
/>
```

## Gotchas
- Returns null if data is null or data.brief is empty (and not loading/unavailable)
- When loading=true and data is null, shows a shimmer skeleton placeholder
- When unavailable=true, shows a minimal "AI brief unavailable" strip
- Each brief item is rendered with ReactMarkdown — supports inline markdown (bold, code, links)
- Brief items get rotating colored dots (amber, teal, cyan, accent)
- Shows "Generated X ago" timestamp using formatRelativeTime
- The refresh button only appears when onRefresh is provided; it spins while loading=true
- Collapse/expand uses framer-motion AnimatePresence for smooth height animation
- Extends React.HTMLAttributes<HTMLDivElement>

## Changes
### v0.18.0
- **Added** Initial release
