---
"@devalok/shilp-sutra": minor
---

remove(shell)!: `AppSidebar` removed — compose the `Sidebar` primitives or the `sidebar-app` preset

**BREAKING (beta 0.x).** The config-driven `AppSidebar` shell wrapper is removed,
along with its config types (`AppSidebarProps`, `NavGroup`, `NavItem`,
`NavSubItem`, `SidebarUser`, `SidebarPromo`, `SidebarFooterConfig`) and the
`@devalok/shilp-sutra/shell/sidebar` subpath export.

**Why.** The `Sidebar` primitives (`@devalok/shilp-sutra/ui/sidebar`) are already
fully composable — logo, grouped nav, collapsible sub-items, badges, group
actions, user footer. The wrapper only re-expressed those primitives through a
data-shape config, and every new pattern meant a new config prop. We're moving to
the shadcn model: **compose the primitives, or copy a preset and own it.**

**Migration.**
- Fastest: `npx shadcn@latest add @devalok/sidebar-app`, then replace
  `<AppSidebar navGroups={…} user={…} currentPath={…} />` with the pasted
  `<SidebarApp/>` and wire your router `Link` + active path. Preset gallery:
  https://shilp-sutra.devalok.in/presets (also `sidebar-projects`,
  `sidebar-client`, `sidebar-minimal`).
- Or compose `@devalok/shilp-sutra/ui/sidebar` directly.

The `Sidebar` **primitives are unchanged** — only the wrapper on top of them is
gone. See BREAKING.json (0.54.0) + MIGRATION.md for the full symbol list.
