---
"@devalok/shilp-sutra": minor
---

deprecate(shell): `AppSidebar` — retiring the config-driven wrapper in favour of composable primitives + a preset

`AppSidebar` (and `AppSidebarProps`) are now marked `@deprecated`. Nothing is
removed yet — this release only adds the deprecation signal (IDE strikethrough +
`@deprecated` JSDoc) and ships the replacement.

**Why.** The `Sidebar` primitives (`@devalok/shilp-sutra/ui/sidebar`) are already
fully composable — logo, grouped nav, collapsible sub-items (`SidebarMenuSub*`),
badges (`SidebarMenuBadge`), a group action (`SidebarGroupAction`), user footer.
The config wrapper only ever re-expressed those primitives through a data shape,
and every new pattern meant a new config prop. We're moving to the shadcn model:
**compose the primitives, or copy a preset and own it.**

**Replacement.** A new **App sidebar preset** (`sidebar-app`) renders the exact
shape `AppSidebar` produced, as a plain composition you paste into your app and
edit directly. Preview + source: https://shilp-sutra.devalok.in/blocks/sidebar-app

**Migration.** Replace `<AppSidebar navGroups={…} user={…} currentPath={…} />`
with the pasted preset composition; wire your router's `Link` and active-path in
place of the preset's placeholders. No API removed in this release.

**Timeline.** `AppSidebar` keeps working through the 0.5x line and is scheduled
for removal in **1.0.0**. A DS notice will be filed on the Karm repo (its app
shells are the primary consumer).
