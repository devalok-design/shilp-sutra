/**
 * Karm-specific command registry for AppCommandPalette.
 *
 * Contains all Karm page routes and admin routes that were previously
 * hardcoded in the core AppCommandPalette component.
 *
 * Usage:
 * ```tsx
 * import { CommandRegistryProvider } from '@devalok/shilp-sutra/shell'
 * import { karmCommandRegistry } from '@devalok/shilp-sutra-karm/shell/karm-command-registry'
 *
 * <CommandRegistryProvider registry={karmCommandRegistry}>
 *   <AppCommandPalette ... />
 * </CommandRegistryProvider>
 * ```
 */
import * as React from 'react'
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
} from '@tabler/icons-react'
import type { CommandRegistry } from '@/shell/command-registry'

export const karmCommandRegistry: CommandRegistry = {
  pages: [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      icon: React.createElement(IconLayoutDashboard),
      path: '/',
      keywords: ['home'],
    },
    {
      id: 'nav-attendance',
      label: 'Attendance',
      icon: React.createElement(IconCalendarCheck),
      path: '/attendance',
      keywords: ['clock', 'time'],
    },
    {
      id: 'nav-breaks',
      label: 'Breaks',
      icon: React.createElement(IconUmbrella),
      path: '/breaks',
      keywords: ['leave', 'vacation'],
    },
    {
      id: 'nav-projects',
      label: 'Projects',
      icon: React.createElement(IconLayoutKanban),
      path: '/projects',
      keywords: ['board', 'kanban'],
    },
    {
      id: 'nav-my-tasks',
      label: 'My Tasks',
      icon: React.createElement(IconListCheck),
      path: '/my-tasks',
      keywords: ['todo'],
    },
    {
      id: 'nav-devsabha',
      label: 'Devsabha',
      icon: React.createElement(IconBook),
      path: '/devsabha',
      keywords: ['standup', 'meeting'],
    },
    {
      id: 'nav-adjustments',
      label: 'Adjustments',
      icon: React.createElement(IconAdjustmentsHorizontal),
      path: '/adjustments',
      keywords: ['corrections'],
    },
    {
      id: 'nav-profile',
      label: 'Profile',
      icon: React.createElement(IconUserCircle),
      path: '/profile',
      keywords: ['account', 'settings'],
    },
  ],
  adminPages: [
    {
      id: 'nav-admin-dashboard',
      label: 'Admin Dashboard',
      icon: React.createElement(IconShieldCheck),
      path: '/admin',
      keywords: ['admin', 'overview'],
    },
    {
      id: 'nav-admin-breaks',
      label: 'Manage Breaks',
      icon: React.createElement(IconUmbrella),
      path: '/admin/breaks',
      keywords: ['admin', 'leave'],
    },
    {
      id: 'nav-admin-attendance',
      label: 'Manage Attendance',
      icon: React.createElement(IconCalendarCheck),
      path: '/admin/attendance',
      keywords: ['admin', 'time'],
    },
    {
      id: 'nav-admin-lokwasi',
      label: 'Lokwasi',
      icon: React.createElement(IconClipboardList),
      path: '/admin/lokwasi',
      keywords: ['admin', 'onboarding'],
    },
    {
      id: 'nav-admin-onboarding',
      label: 'Onboarding',
      icon: React.createElement(IconUserPlus),
      path: '/admin/onboarding',
      keywords: ['admin', 'new hire'],
    },
    {
      id: 'nav-admin-config',
      label: 'System Config',
      icon: React.createElement(IconSettings),
      path: '/admin/system-config',
      keywords: ['admin', 'settings', 'configuration'],
    },
  ],
}
