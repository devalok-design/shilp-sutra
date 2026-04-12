'use client'

/**
 * AppCommandPalette -- Application-level command palette wrapper.
 *
 * Props-driven: accepts navigation items, search callbacks, and user
 * info instead of reading from Zustand stores or Remix hooks.
 *
 * Depends on the CommandPalette shared component being available.
 */
import * as React from 'react'
import { useCallback, useMemo } from 'react'
import { IconFileText } from '@tabler/icons-react'
import { CommandPalette, type CommandGroup, type CommandItem, type CommandPaletteProps, type FooterHint } from '../composed/command-palette'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { useCommandRegistry } from './command-registry'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface SearchResult {
  id: string
  title: string
  snippet?: string
  entityType: string
  projectId?: string | null
  metadata?: Record<string, unknown>
  /** Custom icon for this result. Overrides the default entity-type icon. */
  icon?: React.ReactNode
  /** Relevance score for sorting (higher = more relevant). */
  rank?: number
  /** Keyboard shortcut hint to display on this result. */
  shortcut?: string
  /** Navigation href. Used as fallback when onSearchResultSelect is not provided. */
  href?: string
}

/** A group of search results with a label. */
export interface SearchResultGroup {
  label: string
  results: SearchResult[]
}

export interface AppCommandPaletteUser {
  name: string
  role?: string
}

export interface AppCommandPaletteProps
  extends Omit<React.ComponentPropsWithRef<'div'>, 'onSearch'> {
  /** Current user (used to determine admin access) */
  user?: AppCommandPaletteUser | null
  /** When true, shows admin command groups regardless of user.role. Takes precedence over role-based detection. */
  isAdmin?: boolean
  /** Additional command groups to show */
  extraGroups?: CommandGroup[]
  /** Called when the user selects a navigation target */
  onNavigate?: (path: string) => void
  /** Called when the search input changes (for server-side search) */
  onSearch?: (query: string) => void
  /** Flat search results (displayed in a single "Search Results" group).
   *  For grouped results, use `searchResultGroups` instead. */
  searchResults?: SearchResult[]
  /** Grouped search results — displayed as multiple labeled sections.
   *  Takes precedence over `searchResults` when provided. */
  searchResultGroups?: SearchResultGroup[]
  /** Whether a search is currently in progress */
  isSearching?: boolean
  /** Called when the user selects a search result. When provided, the component
   *  does NOT perform internal navigation — the consumer owns routing entirely. */
  onSearchResultSelect?: (result: SearchResult) => void
  /** Custom label for the search results group. Overrides "Search Results" / "Searching...".
   *  Can be a string or a function receiving the result count. */
  searchResultsLabel?: string | ((count: number) => string)
  // -- Pass-through CommandPalette props --
  /** Controlled open state. */
  open?: boolean
  /** Default open state. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Keybinding(s) to toggle. Pass `false` to disable. Default: 'mod+k'. */
  keybinding?: CommandPaletteProps['keybinding']
  /** Max height of results. Default '320px'. */
  maxHeight?: CommandPaletteProps['maxHeight']
  /** Custom empty state. */
  emptyState?: React.ReactNode
  /** Custom footer hints. Pass `false` to hide. */
  footerHints?: FooterHint[] | false
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Convert a SearchResult into a CommandItem. */
function searchResultToCommandItem(
  r: SearchResult,
  onSearchResultSelect: ((result: SearchResult) => void) | undefined,
  nav: (to: string) => void,
): CommandItem {
  return {
    id: `search-${r.entityType}-${r.id}`,
    label: r.title,
    filterValue: r.title,
    description: r.snippet,
    icon: r.icon ?? <Icon icon={IconFileText} />,
    shortcut: r.shortcut,
    onSelect: () => {
      if (onSearchResultSelect) {
        onSearchResultSelect(r)
      } else if (r.href) {
        nav(r.href)
      }
    },
  }
}

// -----------------------------------------------------------------------
// AppCommandPalette
// -----------------------------------------------------------------------

const AppCommandPalette = React.forwardRef<HTMLDivElement, AppCommandPaletteProps>(
  function AppCommandPalette(
    {
      user,
      isAdmin: isAdminProp,
      extraGroups = [],
      onNavigate,
      onSearch,
      searchResults = [],
      searchResultGroups,
      isSearching = false,
      onSearchResultSelect,
      searchResultsLabel,
      open,
      defaultOpen,
      onOpenChange,
      keybinding,
      maxHeight,
      emptyState,
      footerHints,
      className,
      ...props
    },
    ref,
  ) {
  const isAdmin =
    isAdminProp ?? (user?.role === 'Admin' || user?.role === 'SuperAdmin')

  const registry = useCommandRegistry()

  const nav = useCallback(
    (to: string) => {
      onNavigate?.(to)
    },
    [onNavigate],
  )

  // -- Static groups ---------------------------------------------------

  const pagesGroup: CommandGroup = useMemo(
    () => ({
      label: 'Pages',
      items: registry
        ? registry.pages.map((p) => ({
            id: p.id,
            label: p.label,
            icon: p.icon,
            keywords: p.keywords,
            onSelect: () => nav(p.path),
          }))
        : [],  // Consumer provides pages via CommandRegistryProvider
    }),
    [nav, registry],
  )

  const adminGroup: CommandGroup = useMemo(
    () => ({
      label: 'Admin',
      items: registry
        ? registry.adminPages.map((p) => ({
            id: p.id,
            label: p.label,
            icon: p.icon,
            keywords: p.keywords,
            onSelect: () => nav(p.path),
          }))
        : [],  // Consumer provides admin pages via CommandRegistryProvider
    }),
    [nav, registry],
  )

  // -- Dynamic search results groups ------------------------------------

  const searchGroups: CommandGroup[] = useMemo(() => {
    // Grouped results take precedence (#2)
    if (searchResultGroups && searchResultGroups.length > 0) {
      return searchResultGroups.map((group) => {
        // Sort by rank if provided
        const sorted = group.results.some(r => r.rank != null)
          ? [...group.results].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
          : group.results

        return {
          label: group.label,
          items: sorted.map(r => searchResultToCommandItem(r, onSearchResultSelect, nav)),
        }
      })
    }

    // Flat results (legacy behavior)
    if (searchResults.length === 0) return []

    // Sort by rank if any result has one
    const sorted = searchResults.some(r => r.rank != null)
      ? [...searchResults].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
      : searchResults

    const items = sorted.map(r => searchResultToCommandItem(r, onSearchResultSelect, nav))

    // Resolve the label (#10)
    let label: string
    if (searchResultsLabel) {
      label = typeof searchResultsLabel === 'function'
        ? searchResultsLabel(items.length)
        : searchResultsLabel
    } else {
      label = isSearching ? 'Searching...' : 'Search Results'
    }

    return [{ label, items }]
  }, [searchResults, searchResultGroups, isSearching, nav, onSearchResultSelect, searchResultsLabel])

  // -- Assemble groups -------------------------------------------------

  const groups: CommandGroup[] = useMemo(() => {
    const g: CommandGroup[] = []
    g.push(...searchGroups)
    g.push(pagesGroup)
    if (isAdmin) g.push(adminGroup)
    g.push(...extraGroups)
    return g
  }, [searchGroups, pagesGroup, isAdmin, adminGroup, extraGroups])

  // -- Handle search ---------------------------------------------------

  const handleSearch = useCallback(
    (query: string) => {
      onSearch?.(query)
    },
    [onSearch],
  )

  return (
    <CommandPalette
      ref={ref}
      groups={groups}
      placeholder="Search or jump to..."
      onSearch={handleSearch}
      emptyMessage="No results found. Try a different search term."
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      keybinding={keybinding}
      maxHeight={maxHeight}
      emptyState={emptyState}
      footerHints={footerHints}
      className={cn(className)}
      {...props}
    />
  )
  },
)

AppCommandPalette.displayName = 'AppCommandPalette'

export { AppCommandPalette }
