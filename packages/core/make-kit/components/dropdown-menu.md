# DropdownMenu

Click-triggered menu of actions. Use for overflow menus, row actions, account menus.

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@devalok/shilp-sutra/ui/dropdown-menu'
```

## When to use

- Row / item actions (kebab menu — Edit, Duplicate, Delete).
- Account menu (Profile, Settings, Logout).
- Sort / filter pickers with a fixed list.
- Toolbar overflow ("More" button).
- Interactive panel (forms, calendars, complex pickers)? Use `<Popover>`.
- Single-choice from a fixed list inside a form field? Use `<Select>`.
- Hover-triggered rich preview? Use `<HoverCard>`.
- Right-click contextual menu? Use `<ContextMenu>` (separate component).

## Compound shape

```
DropdownMenu (root — open, onOpenChange, defaultOpen, modal)
  DropdownMenuTrigger                          ← asChild around your button
  DropdownMenuContent
    DropdownMenuLabel                          ← non-interactive section heading
    DropdownMenuSeparator
    DropdownMenuItem (+ DropdownMenuShortcut)  ← standard action
    DropdownMenuCheckboxItem                   ← multi-select toggle
    DropdownMenuRadioGroup
      DropdownMenuRadioItem                    ← single-select group
    DropdownMenuGroup                          ← visual grouping
    DropdownMenuSub
      DropdownMenuSubTrigger                   ← visible item that opens submenu
      DropdownMenuSubContent                   ← the nested submenu panel
```

## Root state props (Radix passthrough)

| Prop | Type | Notes |
|---|---|---|
| `open` | `boolean` | Controlled. |
| `onOpenChange` | `(open: boolean) => void` | |
| `defaultOpen` | `boolean` | Uncontrolled. |
| `modal` | `boolean` | Default `true`. |

## Examples

**Standard kebab menu:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <IconButton icon={<Icon icon={IconDots} />} variant="ghost" aria-label="Actions" />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => edit(item)}>
      <Icon icon={IconEdit} /> Edit
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => duplicate(item)}>
      <Icon icon={IconCopy} /> Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => remove(item)}>
      <Icon icon={IconTrash} /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**With keyboard shortcut hints:**
```tsx
<DropdownMenuContent>
  <DropdownMenuItem onSelect={save}>
    Save
    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
  </DropdownMenuItem>
  <DropdownMenuItem onSelect={find}>
    Find
    <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
  </DropdownMenuItem>
</DropdownMenuContent>
```

`DropdownMenuShortcut` is decorative — it does NOT bind the shortcut globally. Bind shortcuts separately (e.g. with a `useHotkeys` hook).

**Checkbox items (multi-select filters):**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="soft" endIcon={IconChevronDown}>View</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Show columns</DropdownMenuLabel>
    <DropdownMenuCheckboxItem
      checked={cols.includes('owner')}
      onCheckedChange={(checked) => toggleCol('owner', checked)}
      onSelect={(e) => e.preventDefault()}
    >
      Owner
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={cols.includes('status')}
      onCheckedChange={(checked) => toggleCol('status', checked)}
      onSelect={(e) => e.preventDefault()}
    >
      Status
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Calling `e.preventDefault()` inside `onSelect` keeps the menu open after toggling — standard for checkbox items.

**Radio items (single-select sort):**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="soft">Sort: {sort}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">A → Z</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

**Submenu:**
```tsx
<DropdownMenuContent>
  <DropdownMenuItem onSelect={() => share(item)}>Share</DropdownMenuItem>
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <Icon icon={IconFolder} /> Move to
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <DropdownMenuItem onSelect={() => move('inbox')}>Inbox</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => move('archive')}>Archive</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => move('trash')}>Trash</DropdownMenuItem>
    </DropdownMenuSubContent>
  </DropdownMenuSub>
</DropdownMenuContent>
```

Both `SubTrigger` AND `SubContent` are required — missing either silently breaks the hover-open behavior.

**Account menu pattern:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <IconButton icon={<Avatar size="sm" src={user.avatar} alt={user.name} />} variant="ghost" aria-label="Account" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={signOut}>
      <Icon icon={IconLogout} /> Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Composability

- **Radix DropdownMenu** underneath — `open` / `onOpenChange` / `defaultOpen` / `modal` standard state.
- **Keyboard:** Arrow keys navigate, Enter/Space activates, Esc closes, typeahead jumps to first letter. All pre-wired.
- **Trigger:** `<DropdownMenuTrigger asChild>` around any button. `IconButton` is the common pairing for kebab menus.
- **Closing from a handler:** `onSelect` auto-closes the menu. Call `e.preventDefault()` inside the handler to keep it open (checkbox items, multi-step interactions).
- **z-popover (1400):** Stacks above Dialog. Nesting dropdowns inside dialogs works correctly.

See `foundations/surfaces.md` for menu surface tokens, `foundations/motion.md` for the spring open animation.

## Rules

- Use `<DropdownMenuTrigger asChild>` around a Button or IconButton. Don't use Dropdown's default injected trigger.
- For kebab menus, always set `aria-label` on the IconButton — "Actions" or the specific row context.
- Submenus require BOTH `DropdownMenuSubTrigger` AND `DropdownMenuSubContent`. Missing either silently breaks hover-to-open.
- `DropdownMenuShortcut` is decorative. Bind the actual shortcut separately.
- For checkbox items, call `e.preventDefault()` inside `onSelect` to keep the menu open after toggling.
- For interactive content beyond a list (calendars, forms), use `<Popover>` not DropdownMenu.
- Don't nest a DropdownMenu inside another DropdownMenu — use `<DropdownMenuSub>` for hierarchy.
- For right-click menus, use `<ContextMenu>` (separate component). DropdownMenu is click-triggered only.
