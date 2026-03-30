# TaskPanel v3 Completion — Design

**Date:** 2026-03-30
**Status:** Approved
**Scope:** Close all remaining gaps before karm publish

## Context

TaskPanel v3 is a compound component in `packages/karm/src/tasks/v3/` with 26 source files, 3 view modes (peek/side/full), and client permission support. All 573 tests pass, 10 Storybook stories pass (component + a11y), CI is green.

Four gaps remain before shipping:

1. Description is a plain `<textarea>` — needs TipTap rich text
2. Files section is a flat list — needs thumbnails, previews, link attachments, categorization
3. No ReviewBanner story
4. No dark mode story

## 1. TipTap Description Editor

**Current:** `task-panel-description.tsx` uses a `<textarea>` with click-to-edit, blur-to-save, Escape-to-cancel.

**Target:** Replace with `RichTextEditor` (view) and `RichTextViewer` (edit) from `@/composed/rich-text-editor`, which already exist in core and are used in karm's `conversation-tab.tsx`.

### Toolbar (reduced)

Only these toolbar items — no headings, alignment, emoji, image/file upload, or mentions:

- Bold, Italic
- Bullet list, Ordered list, Task list
- Link
- Code block

### Modes

| State | Staff | COLLABORATOR | VIEW_ONLY |
|-------|-------|-------------|-----------|
| View (has content) | `RichTextViewer` + click to edit | `RichTextViewer` + click to edit | `RichTextViewer` (read-only) |
| View (empty) | "Add a description..." prompt → opens editor | Same as staff | "No description added yet." |
| Edit | `RichTextEditor` with reduced toolbar | Same as staff | N/A |

### Behavior

- Click description → enters edit mode with `RichTextEditor`
- **Save:** Blur or click outside (same as current textarea behavior)
- **Cancel:** Escape reverts to last saved content
- **Data format:** HTML string. `onUpdateDescription(html: string)` callback unchanged.
- **Expand/collapse:** In view mode, content is clamped to 3 lines of rendered HTML. "Show more" expands. "Show less" collapses.
- **Edit metadata:** "Last edited by X · Nh ago" still shown below viewer in expanded mode (staff only).

### Implementation notes

- `RichTextEditor` accepts `content` (HTML string) and `onChange(html)`.
- To limit toolbar, pass toolbar config or wrap with custom toolbar. Check if `RichTextEditor` supports a `toolbar` prop; if not, hide unwanted buttons via CSS or extend the component.
- TipTap is already in core's vendor chunks (546KB, lazy-loaded). No new dependencies.

## 2. Enhanced Files Section

### 2a. Type Changes

Extend `TaskFile` in `task-panel-types.ts`:

```ts
export interface TaskFile {
  // Existing fields unchanged
  id: string
  name: string
  fileUrl: string
  downloadUrl: string
  fileType: string
  size: number
  uploadedBy: { id: string; name: string; image?: string | null }
  createdAt: string
  gDriveUrl?: string
  isClientVisible?: boolean

  // New fields
  source?: 'upload' | 'figma' | 'gdrive' | 'dropbox' | 'loom' | 'youtube' | 'vimeo' | 'link'
  embedUrl?: string
  thumbnailUrl?: string
  status?: 'draft' | 'final'
  mimeType?: string
  width?: number
  height?: number
  duration?: number
}
```

All new fields optional — backward compatible.

Add upload state type to context:

```ts
export interface UploadingFile {
  id: string
  name: string
  progress: number  // 0-100
  error?: string
}
```

### 2b. New Props on TaskPanel

```ts
// Add to TaskPanelProviderProps
uploadingFiles?: UploadingFile[]
onRetryUpload?: (uploadId: string) => void
onCancelUpload?: (uploadId: string) => void
onAttachLink?: (url: string) => void
onUpdateFileStatus?: (fileId: string, status: 'draft' | 'final') => void
onToggleFileVisibility?: (fileId: string) => void
maxFileSize?: number       // bytes, default 25MB
acceptedFileTypes?: string[] // MIME types or extensions
```

### 2c. Upload Experience

**Triggers:**
- Click "Upload" button (existing, improved)
- Drag-and-drop: global dropzone over entire files section with visual highlight (dashed accent border, "Drop files here" overlay)
- Paste from clipboard: detect image paste (Ctrl+V), auto-trigger upload
- "Attach link" button: text input for URL paste

**Drag-and-drop visual states:**
- Idle: normal section appearance
- Drag over: section border becomes `border-accent-7`, background tints `bg-accent-2`, shows "Drop files here" text
- Drop: files passed to `onUploadFile`, visual resets

**Validation (client-side, before calling onUploadFile):**
- File size check against `maxFileSize` (default 25MB)
- File type check against `acceptedFileTypes` (if provided)
- Rejected files show inline error toast (not a modal)
- Duplicate filename detection: show warning badge, allow upload

**Upload progress:**
- Each `UploadingFile` renders as a row with:
  - File name + type icon
  - Progress bar (uses core `Progress` component with `autoColor`)
  - Cancel button (calls `onCancelUpload`)
- On error: red text + "Retry" button (calls `onRetryUpload`)
- On complete: row transitions to normal file display (consumer removes from `uploadingFiles` and adds to `task.files`)

### 2d. Link Attachments

**Flow:**
1. Click "Attach link" button in action bar
2. Text input appears with placeholder "Paste a Figma, Drive, Loom, or any URL..."
3. On Enter or blur (if non-empty), calls `onAttachLink(url)`
4. Consumer detects URL type, creates a `TaskFile` entry with appropriate `source`, `embedUrl`, `thumbnailUrl`

**Smart URL detection (in display, not in DS — DS just reads `source` field):**

| URL pattern | `source` | Display |
|-------------|----------|---------|
| `figma.com/*` | `figma` | Figma icon + file name |
| `drive.google.com/*` | `gdrive` | Drive icon + file name |
| `loom.com/*` | `loom` | Loom icon + title |
| `youtube.com/*`, `youtu.be/*` | `youtube` | YouTube icon + title |
| `vimeo.com/*` | `vimeo` | Vimeo icon + title |
| `dropbox.com/*` | `dropbox` | Dropbox icon + file name |
| Other | `link` | Favicon + domain + title |

### 2e. Categorized Display

When files span multiple categories, group under collapsible headers:

- **Design** — source: `figma`, fileType includes: sketch, xd, psd, ai, indd
- **Documents** — fileType: pdf, docx, pptx, xlsx, txt
- **Media** — fileType: images, video, audio, loom, youtube, vimeo
- **Links** — source: `link`, `gdrive`, `dropbox`

If all files fall in one category, skip category headers (flat list).
If total files ≤ 3, skip categories (flat list).

### 2f. Image Thumbnails

Image files (png, jpg, jpeg, gif, webp, svg) render as:
- **Thumbnail:** 48px height, aspect-ratio preserved, rounded corners, object-cover
- Uses `thumbnailUrl` if available, falls back to `fileUrl`
- Click opens `FilePreview` in a `Dialog`

Non-image files keep current icon + metadata layout.

### 2g. FilePreview Dialog

- Click any file opens `FilePreview` from `@/composed/file-preview` inside a `Dialog`
- Images: zoom/pan (existing)
- PDFs: page navigation (existing)
- Videos: custom player (existing)
- Figma/YouTube/Vimeo/Loom: iframe embed (existing)
- Other: download prompt
- **Gallery navigation:** Left/Right arrow keys cycle through files in the same category. Show "N of M" counter.

### 2h. Draft / Final Status

- Staff can toggle file status between `draft` and `final` via a small badge/button on each file row
- `final` files show a green "Final" badge
- `draft` files show a subtle "Draft" label (or no label — draft is the default)
- Calls `onUpdateFileStatus(fileId, status)`

### 2i. Per-File Client Visibility

- Staff sees an eye icon toggle on each file
- `isClientVisible: true` → eye open (default for EVERYONE tasks)
- `isClientVisible: false` → eye closed, file dimmed slightly
- Clients only see files where `isClientVisible !== false`
- Calls `onToggleFileVisibility(fileId)`

### 2j. Action Bar

Replace single upload button with a compact action row:

```
[ Upload ]  [ Attach link ]  [ ⋮ ]
```

The overflow menu (⋮) contains: "Download all" (future, noop for now).

Staff and COLLABORATOR see upload + link buttons.
VIEW_ONLY sees nothing (just the file list for download).

### 2k. Permissions Summary

| Action | Staff | COLLABORATOR | VIEW_ONLY |
|--------|-------|-------------|-----------|
| Upload files | Yes | Yes | No |
| Attach links | Yes | Yes | No |
| Delete any file | Yes | No | No |
| Delete own file | Yes | Yes | No |
| Toggle visibility | Yes | No | No |
| Set draft/final | Yes | No | No |
| Download | Yes | Yes | Yes |
| View thumbnails | Yes | Yes (visible only) | Yes (visible only) |
| Open FilePreview | Yes | Yes (visible only) | Yes (visible only) |

### 2l. Figma Inline Embed

Files with `source: 'figma'` and `embedUrl` get a compact inline embed:
- 200px tall iframe with the Figma embed URL
- Click opens full FilePreview (larger iframe)
- Collapsed by default within the Design category; expand on click

## 3. Stories

### New stories to add:

| Story | Purpose |
|-------|---------|
| `ReviewBannerVisible` | Staff side panel with review banner visible inside the panel body |
| `DarkMode` | Side panel staff view with `globals: { theme: 'dark' }` |
| `RichDescription` | Task with HTML description showing formatted content |
| `FileGallery` | Task with mix of images, PDFs, Figma links, video — all categories populated |
| `FileUploadProgress` | Task showing files mid-upload with progress bars |
| `EmptyFilesStaff` | Staff view with no files — shows upload + link buttons |
| `ClientViewOnlyFiles` | VIEW_ONLY client seeing visible files only, no upload |

### Existing stories to update:

- `SidePanelStaff` — update mock task to use HTML description, add richer file data
- `SidePanelClient` — verify client file visibility filtering
- `FullPage` — verify file gallery renders in full page layout

## 4. Tests

### Description tests (update existing `task-panel-description.test.tsx`):

- Renders `RichTextViewer` when description has HTML content
- Click opens `RichTextEditor` with reduced toolbar
- Save on blur persists HTML
- Escape cancels edit
- VIEW_ONLY renders viewer, no edit capability
- COLLABORATOR can edit
- Empty state shows prompt, click opens editor

### File tests (new `task-panel-files.test.tsx` or extend existing):

- Image files render thumbnails
- Click file opens FilePreview dialog
- Upload progress renders progress bar
- Upload error shows retry button
- Drag-and-drop triggers onUploadFile
- File size validation rejects oversized files
- Client sees only visible files
- Staff sees visibility toggle
- Draft/final badge renders correctly
- Categorized display groups files correctly
- Link attachment input calls onAttachLink
- Gallery navigation with arrow keys

## Non-goals

- Google Drive Picker integration (requires backend OAuth, separate feature)
- File versioning (v1, v2, v3 of same file)
- Before/after comparison
- Download all as ZIP
- Real-time collaborative editing of description
