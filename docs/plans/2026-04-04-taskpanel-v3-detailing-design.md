# TaskPanel v3 Detailing Pass — Design

## Problem

The TaskPanel v3 has functional completeness but numerous visual inconsistencies and one wrong UX pattern (Switch toggle for comment visibility). Issues identified from Storybook visual review and industry research.

## Key Design Decisions

### 1. TaskComposer: Tabs + Amber Background

Replace the Switch with **tab buttons above the textarea** ("Team" / "Client"). When "Client" is active, the entire input container background turns amber (`bg-warning-2`, `border-warning-7`). This is the Zendesk/Jira/Intercom/Freshdesk universal pattern for internal-vs-external comment safety.

### 2. QuickProps Pill Height Normalization

Status dot is `h-2 w-2` (8px) while Priority icon is `Icon size="xs"` (16px). Fix by increasing dot to `h-2.5 w-2.5` (10px) — solid-filled dots have higher visual weight per pixel, so 10px optically balances with 16px outline icons.

### 3. Input Bar Background

`bg-surface-base` on a `bg-surface-raised` sheet creates no depth. Change to `bg-surface-1`.

### 4. FileRow Height Consistency

Image thumbnails are `size-12` (48px), non-image icons are bare 20px. Normalize: shrink thumbnails to `size-10` (40px), wrap non-image icons in a `h-10 w-10` container with `bg-surface-raised` background.

### 5. Remove Inline Figma Embed from FileRow

200px iframe inside a clickable row is too heavy. Figma embeds belong in the FilePreview dialog only.

### 6. Spacing & Alignment Sweep

- UploadingFileRow `py-ds-02` → `py-ds-03`
- First file category: add `first:mt-0` to remove extra top margin
- Dependencies: remove `pl-ds-05` wrapper indent, match subtask indent
- Remove redundant `+ Upload files` dashed button at bottom of files
- `+ Add subtask` link: add `px-ds-03` to match row alignment
- QuickProps `px-ds-05` → `px-ds-06` to match header
- Timeline filter bar `px-ds-02` → `px-ds-04`

## Research Sources

Zendesk, Jira Service Management, Intercom, Freshdesk for comment visibility. Linear, Notion, Asana, ClickUp for property pills and file sections.
