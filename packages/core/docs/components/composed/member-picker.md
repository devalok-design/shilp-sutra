# MemberPicker

- Import: @devalok/shilp-sutra/composed/member-picker
- Server-safe: No
- Category: composed

## Props
    members: MemberPickerMember[] (REQUIRED) — { id, name, avatar? }
    selectedIds: string[] (REQUIRED)
    onSelect: (memberId: string) => void (REQUIRED)
    multiple: boolean (default: false)
    placeholder: string (default: "Search members...")
    children: ReactNode (trigger element)

## Defaults
    multiple=false, placeholder="Search members..."

## Example
```jsx
<MemberPicker members={teamMembers} selectedIds={assignees} onSelect={toggleAssignee} multiple>
  <Button variant="outline">Assign Members</Button>
</MemberPicker>
```

## Composability
- **Trigger + Popover + search list.** Pass any button/element as `children` to act as the trigger. Typical pairing: outline Button that says "Assign" or an IconButton with avatar overflow.
- **Single vs multi:** `multiple={true}` allows multiple selections; `false` (default) replaces the previous selection. `selectedIds` is always an array in both modes — consumer controls semantics.
- **onSelect with a single ID:** Fires once per click with one memberId. Toggle logic in multi mode is consumer responsibility (derive the new array from the click).
- **Avatar display:** Uses ui/Avatar internally — supply `avatar` URL in the member object, fallback to initials from `name`.
- **For general-purpose multi-select** (non-members), use MultiSelectPopover which has the same popover+search pattern without member-specific avatar rendering.

## Gotchas
- `children` is used as the trigger element (e.g., a Button)
- `onSelect` is called with a single `memberId` — toggle logic is up to the consumer
- When `multiple=false`, selecting a new member replaces the previous selection

## Changes
### v0.18.0
- **Fixed** Added `aria-label` to search input

### v0.1.0
- **Added** Initial release
