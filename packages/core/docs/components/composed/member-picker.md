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

## Gotchas
- `children` is used as the trigger element (e.g., a Button)
- `onSelect` is called with a single `memberId` — toggle logic is up to the consumer
- When `multiple=false`, selecting a new member replaces the previous selection

## Changes
### v0.18.0
- **Fixed** Added `aria-label` to search input

### v0.1.0
- **Added** Initial release
