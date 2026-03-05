'use client'

/**
 * AppCommandPalette -- Application-level command palette wrapper.
 *
 * Props-driven: accepts navigation items, search callbacks, and user
 * info instead of reading from Zustand stores or Remix hooks.
 *
 * Depends on the CommandPalette shared component being available.
 * If you haven't created `src/shared/command-palette.tsx`, this
 * component re-exports a minimal inline implementation.
 */
import { useCallback, useMemo } from 'react'
import type { Icon as TablerIcon } from '@tabler/icons-react'
import {
  IconLayoutDashboard,
  IconCalendarCheck,
  IconUmbrella,
  IconLayoutKanban,
  IconListCheck,
  IconBook,
  IconAdjustmentsHorizontal,
  IconUserCircle,
  IconShieldCheck,
  IconClipboardList,
  IconUserPlus,
  IconSettings,
  IconFileText,
  IconUsers,
  IconMessage,
  IconVideo,
  IconLink,
  IconPackage,
} from '@tabler/icons-react'
import { CommandPalette, type CommandGroup, type CommandItem } from '../composed/command-palette'

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
}

export interface AppCommandPaletteUser {
  name: string
  role?: string
}

export interface AppCommandPaletteProps {
  /** Current user (used to determine admin access) */
  user?: AppCommandPaletteUser | null
  /** Additional command groups to show */
  extraGroups?: CommandGroup[]
  /** Called when the user selects a navigation target */
  onNavigate?: (path: string) => void
  /** Called when the search input changes (for server-side search) */
  onSearch?: (query: string) => void
  /** IconSearch results from external search provider */
  searchResults?: SearchResult[]
  /** Whether a search is currently in progress */
  isSearching?: boolean
  /** Called when the user selects a search result */
  onSearchResultSelect?: (result: SearchResult) => void
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const ENTITY_TYPE_ICONS: Record<string, TablerIcon> = {
  TASK: IconListCheck,
  PROJECT: IconLayoutKanban,
  USER: IconUsers,
  COMMENT: IconMessage,
  MEETING: IconVideo,
  LINK: IconLink,
  DELIVERABLE: IconPackage,
}

// -----------------------------------------------------------------------
// Default page navigation items
// -----------------------------------------------------------------------

function buildDefaultPageItems(
  nav: (to: string) => void,
): CommandItem[] {
  return [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      icon: IconLayoutDashboard,
      onSelect: () => nav('/'),
    },
    {
      id: 'nav-attendance',
      label: 'Attendance',
      icon: IconCalendarCheck,
      onSelect: () => nav('/attendance'),
    },
    {
      id: 'nav-breaks',
      label: 'Breaks',
      icon: IconUmbrella,
      onSelect: () => nav('/breaks'),
    },
    {
      id: 'nav-projects',
      label: 'Projects',
      icon: IconLayoutKanban,
      onSelect: () => nav('/projects'),
    },
    {
      id: 'nav-my-tasks',
      label: 'My Tasks',
      icon: IconListCheck,
      onSelect: () => nav('/my-tasks'),
    },
    {
      id: 'nav-devsabha',
      label: 'Devsabha',
      icon: IconBook,
      onSelect: () => nav('/devsabha'),
    },
    {
      id: 'nav-adjustments',
      label: 'Adjustments',
      icon: IconAdjustmentsHorizontal,
      onSelect: () => nav('/adjustments'),
    },
    {
      id: 'nav-profile',
      label: 'Profile',
      icon: IconUserCircle,
      onSelect: () => nav('/profile'),
    },
  ]
}

function buildDefaultAdminItems(
  nav: (to: string) => void,
): CommandItem[] {
  return [
    {
      id: 'nav-admin-dashboard',
      label: 'Admin Dashboard',
      icon: IconShieldCheck,
      onSelect: () => nav('/admin'),
    },
    {
      id: 'nav-admin-breaks',
      label: 'Manage Breaks',
      icon: IconUmbrella,
      onSelect: () => nav('/admin/breaks'),
    },
    {
      id: 'nav-admin-attendance',
      label: 'Manage Attendance',
      icon: IconCalendarCheck,
      onSelect: () => nav('/admin/attendance'),
    },
    {
      id: 'nav-admin-lokwasi',
      label: 'Lokwasi',
      icon: IconClipboardList,
      onSelect: () => nav('/admin/lokwasi'),
    },
    {
      id: 'nav-admin-onboarding',
      label: 'Onboarding',
      icon: IconUserPlus,
      onSelect: () => nav('/admin/onboarding'),
    },
    {
      id: 'nav-admin-config',
      label: 'System Config',
      icon: IconSettings,
      onSelect: () => nav('/admin/system-config'),
    },
  ]
}

// -----------------------------------------------------------------------
// AppCommandPalette
// -----------------------------------------------------------------------

export function AppCommandPalette({
  user,
  extraGroups = [],
  onNavigate,
  onSearch,
  searchResults = [],
  isSearching = false,
  onSearchResultSelect,
}: AppCommandPaletteProps) {
  const isAdmin =
    user?.role === 'Admin' || user?.role === 'SuperAdmin'

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
      items: buildDefaultPageItems(nav),
    }),
    [nav],
  )

  const adminGroup: CommandGroup = useMemo(
    () => ({
      label: 'Admin',
      items: buildDefaultAdminItems(nav),
    }),
    [nav],
  )

  // -- Dynamic search results group ------------------------------------

  const searchGroup: CommandGroup | null = useMemo(() => {
    if (searchResults.length === 0) return null

    const items: CommandItem[] = searchResults.map((r) => {
      let route = '/'
      switch (r.entityType) {
        case 'TASK':
          route = r.projectId
            ? `/projects/${r.projectId}?taskId=${r.id}`
            : '/'
          break
        case 'PROJECT':
          route = `/projects/${r.id}`
          break
        case 'USER':
          route = `/teammates`
          break
        case 'COMMENT':
          route =
            r.projectId && r.metadata?.taskId
              ? `/projects/${r.projectId}?taskId=${r.metadata.taskId}`
              : '/'
          break
        case 'MEETING':
          route = r.projectId
            ? `/projects/${r.projectId}?tab=meetings`
            : '/'
          break
        case 'LINK':
          route = r.projectId
            ? `/projects/${r.projectId}?tab=karyakram`
            : '/'
          break
        case 'DELIVERABLE':
          route = r.projectId
            ? `/projects/${r.projectId}?tab=deliverables`
            : '/'
          break
      }

      return {
        id: `search-${r.entityType}-${r.id}`,
        label: r.title,
        description: r.snippet,
        icon: ENTITY_TYPE_ICONS[r.entityType] ?? IconFileText,
        onSelect: () => {
          onSearchResultSelect?.(r)
          nav(route)
        },
      }
    })

    return {
      label: isSearching ? 'Searching...' : 'Search Results',
      items,
    }
  }, [searchResults, isSearching, nav, onSearchResultSelect])

  // -- Assemble groups -------------------------------------------------

  const groups: CommandGroup[] = useMemo(() => {
    const g: CommandGroup[] = []
    if (searchGroup) g.push(searchGroup)
    g.push(pagesGroup)
    if (isAdmin) g.push(adminGroup)
    g.push(...extraGroups)
    return g
  }, [searchGroup, pagesGroup, isAdmin, adminGroup, extraGroups])

  // -- Handle search ---------------------------------------------------

  const handleSearch = useCallback(
    (query: string) => {
      onSearch?.(query)
    },
    [onSearch],
  )

  return (
    <CommandPalette
      groups={groups}
      placeholder="Search or jump to..."
      onSearch={handleSearch}
      emptyMessage="No results found. Try a different search term."
    />
  )
}

AppCommandPalette.displayName = 'AppCommandPalette'
