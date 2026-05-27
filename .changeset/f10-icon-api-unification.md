---
"@devalok/shilp-sutra": minor
---

feat: F-10 — Icon API unification across 22 components (single `IconInput` type)

**Non-breaking.** Type widening only. Every call site that compiled before keeps compiling.

## Why

Before this release the design system had **6 distinct prop type signatures for the same conceptual "icon"** across 22+ icon-accepting components: `React.ReactElement`, `React.ReactNode`, `React.ReactNode | ComponentType<{className}>`, `ComponentType<{className}>`, `IconProps['icon']`, and (in Toast internals) `ForwardRefExoticComponent<any>`. Consumers had to memorize per-component conventions. Stories drifted. Five separate `iconSizeMap` declarations cropped up across component sources. Dual-detect logic was duplicated in EmptyState + StatCard. Twenty-three of twenty-five components silently ignored size context.

## What changed

### Foundation (new exports)

```ts
import type { IconInput } from '@devalok/shilp-sutra/ui/lib/icon-input'
import { normalizeIcon } from '@devalok/shilp-sutra/ui/lib/normalize-icon'

type IconInput =
  | React.ReactElement
  | React.ComponentType<{ className?: string; size?: number | string }>
  | null
  | undefined

function normalizeIcon(input: IconInput, fallbackSize?: IconSize): React.ReactNode
```

`normalizeIcon` passes React elements through, wraps Tabler-shaped forwardRef refs in `<Icon icon={…} />` (so they participate in `IconContext`), and renders plain function components directly. Falls through to `null` for `null`/`undefined`. 16 vitest tests cover all branches + the type compatibility surface.

### Consumer-facing API: every icon prop accepts all four shapes

```tsx
<Button startIcon={<Icon icon={IconPlus} />}>OK</Button>   // canonical
<Button startIcon={<IconPlus />}>OK</Button>                // raw Tabler element
<Button startIcon={IconPlus}>OK</Button>                    // component ref
<Button startIcon={<span>+</span>}>OK</Button>              // custom node
```

### 22 components migrated

| Layer | Components |
|---|---|
| ui (P1) | Button, IconButton |
| ui leaf (P2) | Badge, Combobox, SegmentedControl, Stepper, StatCard, TreeItem (TreeNode.icon), OAuthButton (icon + linkedIcon) |
| chat + ai (P3) | Chat.Message.Avatar, Chat.Message.Action, Chat.SystemMessage, AIConversation (agent.icon), AICommandProvider (agent.icon), CommandBar (item.icon) |
| composed (P4) | EmptyState (kill dual-detect), BulkActionBar (loosen from IconProps['icon']), ActivityFeed, CommandPalette |
| shell (P5) | TopBar (UserMenuItem + TopBar.IconButton), Sidebar (NavItem + NavSubItem + footer.promo — three sites collapsed to one), BottomNavbar, AppCommandPalette (SearchResult.icon), CommandRegistry (CommandPageItem.icon) |

### Internals collapsed

- 5 duplicate `iconSizeMap` declarations across Badge/Combobox/EmptyState/StatCard/etc. → one shared `<IconProvider size={token}>` pattern at each call site
- 2 duplicate dual-detect branches (`isValidElement(icon) || '$$typeof' in icon`) → one shared `normalizeIcon()` helper
- `React.createElement(icon, {className})` workarounds across EmptyState/StatCard → call through `normalizeIcon`

### Strict-to-loose newly-accepted call sites

- `SegmentedControl options[*].icon` previously rejected `<IconX />` instantiated elements (only accepted bare component refs)
- `BulkActionBar actions[*].icon` previously rejected non-Tabler nodes
- `Chat.Message.Action.icon` previously required `IconProps['icon']` strict Tabler shape
- All three now accept `IconInput`

### Tests

- 16 new tests in `src/ui/__tests__/normalize-icon.test.tsx` covering all four input shapes, IconProvider context propagation, type compatibility, and the `React.isValidElement` vs forwardRef vs plain-function-component decision tree.
- `src/composed/empty-state.test.tsx` rewritten to assert px-rendered sizing via `IconProvider` (the new contract) instead of className-based sizing (the old leak).

### Not in this patch

- **Toast internal icons** (`TOAST_TYPE_CONFIG.icon`) keep their sonner ForwardRefExoticComponent shape. Internal config, not a consumer prop — out of scope.
- **Stories cleanup** (remove `className="h-4 w-4"` overrides from `.stories.tsx`) — voluntary, behavior unchanged.
- **`pre-publish-audit` Icon API gate** — deferred. The current test coverage + typecheck catches regressions for now.

## Closes

- tbf-tracker F-10 (Icon API consistency) — full scope. Promoted from "accept both at edges" to deep three-layer unification (type alias + normalizer + per-component IconProvider).

## Migration checklist for consumers

1. **Nothing required.** All existing call sites continue to compile.
2. **Voluntary cleanup:** delete `className="h-4 w-4"` (or similar) overrides on icon prop usages — `IconProvider` now sizes correctly via context.
3. **New API in your own wrappers:** import `IconInput` + `normalizeIcon` for components that accept icons-like props.

See `MIGRATION.md → v0.40.0` for the full per-component before/after.
