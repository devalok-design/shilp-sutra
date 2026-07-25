<!-- Source: packages/core/llms.txt — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# @devalok/shilp-sutra

> Radix UI + Tailwind 4 (CSS-first) + CVA design system for Devalok apps, v0.53.0.
> Built on the same primitives as shadcn/ui but with DIFFERENT prop APIs — never guess from shadcn knowledge; verify every prop.
> This file is a ROUTER: it tells you what exists and where to get details. Do not look for prop tables here — fetch them per component (MCP tool or per-component doc file below).

## How to get component details (in priority order)

1. **shilp-sutra MCP** (if connected): `get_component(name)` — version-exact props/variants/examples/composition as JSON. Also: `find_component(query)`, `get_tokens(category)`, `get_setup(framework)`, `upgrade(from, to)`, `search_docs(query)`. **Setting up in a project?** `detect_framework(packageJson)` → `get_setup(framework)` → `preflight(framework, imports)` (peer installs) → `validate_snippet(code)` before writing → `verify_setup(...)`. Pass your installed version (`node_modules/@devalok/shilp-sutra/package.json`) as `version` on every call.
   Connect: `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp`
2. **No MCP?** Read the single per-component file linked in the index below (`node_modules/@devalok/shilp-sutra/docs/components/...`, ~3K tokens each). Read only the components you need — never bulk-read the directory.
3. **Machine-readable everything**: `mcp-manifest.json` at the package root (all props/tokens/composition as JSON, react-docgen shape). Prefer targeted reads of it over any prose.

## Project setup (first install)

Use a recipe — do not improvise. Recipes ship at `node_modules/@devalok/shilp-sutra/docs/recipes/`:
install-next-app-router.md · install-next-pages.md · install-vite.md · install-astro.md · install-remix.md · install-tanstack-start.md · customize-brand.md (token overrides) · server-components.md (RSC matrix) · troubleshoot.md

Branding fast path: **https://shilp-sutra.devalok.in/themer** — archetypes (`/themer/archetypes`), brand color (`/themer/brand`), wizard (`/themer/wizard`). Paste the result CSS after `@import "@devalok/shilp-sutra/css";`.

## Hard rules (always apply)

- Prefer Button `variant="soft"` over `variant="outline"` for non-primary actions.
- No `variant="destructive"` / `variant="secondary"` / `color="danger"` — use `variant="solid" color="error"`, `variant="soft"`, `color="error"`.
- Spacing cadence: `ds-03` (related) / `ds-05` (grouped) / `ds-07` (section).
- Cards/widgets/panels sit on `bg-surface-2`; `bg-surface-1` is for page + overlays only.
- Compose, don't re-roll: build on existing components (check `get_component(name, sections:["composition"])` or the doc's Composability section) instead of rebuilding their surface.
- Icons: `startIcon={<Icon icon={IconX} />}` wrapper form, never bare icon components.

## Upgrading

Breaking changes are machine-readable in `BREAKING.json` (see `BREAKING.schema.json`); human guide in `MIGRATION.md`. Via MCP: `upgrade(from: "<installed>", to: "<target>")`.

## Component index

Format: `[name](doc path): summary`. Import paths follow `@devalok/shilp-sutra/<tier>/<name>`.

### ui
- [accordion](docs/components/ui/accordion.md)
- [alert](docs/components/ui/alert.md)
- [alert-dialog](docs/components/ui/alert-dialog.md)
- [aspect-ratio](docs/components/ui/aspect-ratio.md)
- [autocomplete](docs/components/ui/autocomplete.md)
- [avatar](docs/components/ui/avatar.md)
- [badge](docs/components/ui/badge.md)
- [badge-group](docs/components/ui/badge-group.md)
- [badge-indicator](docs/components/ui/badge-indicator.md)
- [banner](docs/components/ui/banner.md)
- [breadcrumb](docs/components/ui/breadcrumb.md)
- [button](docs/components/ui/button.md)
- [button-group](docs/components/ui/button-group.md)
- [button-processing](docs/components/ui/button-processing.md)
- [card](docs/components/ui/card.md)
- [charts](docs/components/ui/charts.md)
- [chat](docs/components/ui/chat.md): Seven primitives for building chat interfaces: MessageList, Message (compound), SystemMessage, MessageInput, DateSeparator, UnreadSeparator, TypingIndicator
- [checkbox](docs/components/ui/checkbox.md)
- [code](docs/components/ui/code.md)
- [collapsible](docs/components/ui/collapsible.md)
- [color-input](docs/components/ui/color-input.md)
- [color-swatch](docs/components/ui/color-swatch.md)
- [combobox](docs/components/ui/combobox.md)
- [container](docs/components/ui/container.md)
- [context-menu](docs/components/ui/context-menu.md)
- [data-table](docs/components/ui/data-table.md)
- [data-table-toolbar](docs/components/ui/data-table-toolbar.md)
- [devalok-grain](docs/components/ui/devalok-grain.md)
- [dialog](docs/components/ui/dialog.md)
- [dot](docs/components/ui/dot.md): A small semantic status/indicator dot — the low-level primitive behind status pills, presence indicators, legend swatches, and `StatusDot`
- [dropdown-menu](docs/components/ui/dropdown-menu.md)
- [file-upload](docs/components/ui/file-upload.md)
- [form](docs/components/ui/form.md)
- [hover-card](docs/components/ui/hover-card.md)
- [icon](docs/components/ui/icon.md)
- [icon-button](docs/components/ui/icon-button.md)
- [icon-context](docs/components/ui/icon-context.md)
- [icon-group](docs/components/ui/icon-group.md)
- [input](docs/components/ui/input.md)
- [input-otp](docs/components/ui/input-otp.md)
- [label](docs/components/ui/label.md)
- [link](docs/components/ui/link.md)
- [menubar](docs/components/ui/menubar.md)
- [navigation-menu](docs/components/ui/navigation-menu.md)
- [number-input](docs/components/ui/number-input.md)
- [oauth-button](docs/components/ui/oauth-button.md)
- [pagination](docs/components/ui/pagination.md)
- [popover](docs/components/ui/popover.md)
- [progress](docs/components/ui/progress.md): A linear progress bar
- [progress-ring](docs/components/ui/progress-ring.md)
- [radio](docs/components/ui/radio.md)
- [search-input](docs/components/ui/search-input.md)
- [segmented-control](docs/components/ui/segmented-control.md)
- [select](docs/components/ui/select.md)
- [separator](docs/components/ui/separator.md)
- [sheet](docs/components/ui/sheet.md)
- [sidebar](docs/components/ui/sidebar.md)
- [skeleton](docs/components/ui/skeleton.md)
- [slider](docs/components/ui/slider.md)
- [spinner](docs/components/ui/spinner.md)
- [split-button](docs/components/ui/split-button.md): A compound button that combines a primary action with a dropdown trigger, rendered as a single visual unit `[Action | ▼]`
- [stack](docs/components/ui/stack.md)
- [stat-card](docs/components/ui/stat-card.md)
- [stat-flash](docs/components/ui/stat-flash.md)
- [stepper](docs/components/ui/stepper.md)
- [surface](docs/components/ui/surface.md): The low-level elevated container primitive
- [switch](docs/components/ui/switch.md)
- [table](docs/components/ui/table.md)
- [table-row-link](docs/components/ui/table-row-link.md)
- [tabs](docs/components/ui/tabs.md)
- [text](docs/components/ui/text.md)
- [textarea](docs/components/ui/textarea.md)
- [toast](docs/components/ui/toast.md)
- [toaster](docs/components/ui/toaster.md)
- [toggle](docs/components/ui/toggle.md)
- [toggle-group](docs/components/ui/toggle-group.md)
- [tooltip](docs/components/ui/tooltip.md)
- [tree-view](docs/components/ui/tree-view.md)
- [truncated-text](docs/components/ui/truncated-text.md)
- [visually-hidden](docs/components/ui/visually-hidden.md)

### composed
- [activity-feed](docs/components/composed/activity-feed.md)
- [avatar-group](docs/components/composed/avatar-group.md)
- [bulk-action-bar](docs/components/composed/bulk-action-bar.md)
- [command-palette](docs/components/composed/command-palette.md)
- [confirm-dialog](docs/components/composed/confirm-dialog.md)
- [content-card](docs/components/composed/content-card.md): **DEPRECATED (v0.44.0)** — will be removed in the next major
- [date-picker](docs/components/composed/date-picker.md)
- [deadline-indicator](docs/components/composed/deadline-indicator.md)
- [diff](docs/components/composed/diff.md)
- [emoji-picker](docs/components/composed/emoji-picker.md)
- [empty-state](docs/components/composed/empty-state.md): Note: EmptyState was server-safe prior to v0.18.0 but is NO LONGER server-safe due to Framer Motion dependency
- [error-boundary](docs/components/composed/error-boundary.md)
- [file-preview](docs/components/composed/file-preview.md)
- [filter-bar](docs/components/composed/filter-bar.md)
- [form-section](docs/components/composed/form-section.md)
- [global-loading](docs/components/composed/global-loading.md)
- [inline-edit](docs/components/composed/inline-edit.md)
- [loading-skeleton](docs/components/composed/loading-skeleton.md): Exports: CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton
- [markdown-viewer](docs/components/composed/markdown-viewer.md)
- [master-detail](docs/components/composed/master-detail.md)
- [member-picker](docs/components/composed/member-picker.md)
- [multi-select-popover](docs/components/composed/multi-select-popover.md)
- [page-header](docs/components/composed/page-header.md)
- [page-skeletons](docs/components/composed/page-skeletons.md): Exports: DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton
- [priority-indicator](docs/components/composed/priority-indicator.md)
- [responsive-modal](docs/components/composed/responsive-modal.md)
- [rich-chat-input](docs/components/composed/rich-chat-input.md): Compact rich text chat input for unified human+AI workspaces
- [rich-text-editor](docs/components/composed/rich-text-editor.md): Exports: RichTextEditor, RichTextViewer
- [schedule-view](docs/components/composed/schedule-view.md)
- [simple-tooltip](docs/components/composed/simple-tooltip.md)
- [status-badge](docs/components/composed/status-badge.md): Note: StatusBadge was server-safe prior to v0.18.0 but is NO LONGER server-safe due to Framer Motion dependency

### shell
- [app-command-palette](docs/components/shell/app-command-palette.md)
- [bottom-navbar](docs/components/shell/bottom-navbar.md)
- [command-registry](docs/components/shell/command-registry.md): Exports: CommandRegistryProvider, useCommandRegistry
- [link-context](docs/components/shell/link-context.md): Exports: LinkProvider, useLink
- [notification-center](docs/components/shell/notification-center.md)
- [notification-preferences](docs/components/shell/notification-preferences.md)
- [top-bar](docs/components/shell/top-bar.md)

### ai
- [ai-command-provider](docs/components/ai/ai-command-provider.md): Context provider for the AI command system
- [block-renderer](docs/components/ai/block-renderer.md): Renders an ordered list of typed AI "blocks" — the structured chunks an assistant/ server emits instead of plain text
- [command-bar](docs/components/ai/command-bar.md): A unified AI command input with three layout variants
- [conversation](docs/components/ai/conversation.md): A scrollable AI conversation thread: user + assistant turns, streaming processing steps, an agent header, and structured content blocks (rendered via BlockRenderer) with confirm/cancel/undo action support
- [devadoot-icon](docs/components/ai/devadoot-icon.md): The animated Devalok chakra glyph — the visual identity for the AI command system

## Tokens

Categories: color, spacing (`ds-01`…), typography (`text-ds-*`), radius (`rounded-ds-*`), shadow (`shadow-raised`/`shadow-overlay`/…), motion, z-layers. Full reference: `get_tokens(category)` via MCP, or the `tokens` object in `mcp-manifest.json`.
