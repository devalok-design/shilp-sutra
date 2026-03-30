# TaskPanel v3 Completion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close all remaining TaskPanel v3 gaps — TipTap description, design-studio-grade files section, missing stories — so karm can publish with nothing pending.

**Architecture:** Core gets one additive change (toolbar customization on RichTextEditor). Karm's v3 description swaps textarea for TipTap. Karm's v3 files section is rewritten from flat list to categorized file manager with thumbnails, FilePreview dialog, link attachments, upload progress, draft/final status, and per-file visibility. New stories cover all additions.

**Tech Stack:** TipTap (via core's RichTextEditor/Viewer), FilePreview (core composed), Dialog (core ui), framer-motion (animations), Vitest + RTL (tests)

**Design doc:** `docs/plans/2026-03-30-taskpanel-v3-completion-design.md`

---

## Task 1: Add `toolbar` prop to core RichTextEditor

**Files:**
- Modify: `packages/core/src/composed/rich-text-editor.tsx`
- Test: `packages/core/src/composed/rich-text-editor.test.tsx`

This is a non-breaking additive change. When `toolbar` is omitted, all buttons render (current behavior). When provided, only listed items render.

**Step 1: Add the type and prop**

Add to the props interface in `rich-text-editor.tsx`:

```ts
export type ToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'highlight'
  | 'h2' | 'h3' | 'blockquote'
  | 'bulletList' | 'orderedList' | 'taskList' | 'codeBlock'
  | 'link' | 'image' | 'file' | 'hr'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'emoji' | 'undo' | 'redo'

export interface RichTextEditorProps /* ... existing ... */ {
  // ... existing props ...
  /** Whitelist of toolbar items. Omit to show all. */
  toolbar?: ToolbarItem[]
}
```

**Step 2: Thread `toolbar` into the internal Toolbar component**

The Toolbar component is internal (not exported). Add a `show` helper:

```ts
function Toolbar({ editor, toolbar, onImageClick, onFileClick, onEmojiClick }: {
  editor: Editor
  toolbar?: ToolbarItem[]
  onImageClick?: () => void
  onFileClick?: () => void
  onEmojiClick?: () => void
}) {
  const show = (item: ToolbarItem) => !toolbar || toolbar.includes(item)
  // ...
```

Wrap each button/group in `{show('bold') && ( ... )}`. Group dividers render only if at least one item in the group is visible.

**Step 3: Write a test**

```ts
it('hides toolbar items not in toolbar prop', () => {
  render(<RichTextEditor toolbar={['bold', 'italic', 'link']} />)
  expect(screen.getByLabelText('Bold')).toBeInTheDocument()
  expect(screen.getByLabelText('Italic')).toBeInTheDocument()
  expect(screen.queryByLabelText('Underline')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Heading 2')).not.toBeInTheDocument()
})
```

**Step 4: Run tests**

```bash
cd packages/core && pnpm test -- --run src/composed/rich-text-editor.test.tsx
```

**Step 5: Commit**

```
feat(core): add toolbar prop to RichTextEditor for item whitelist
```

---

## Task 2: Extend TaskFile type and context

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-types.ts`
- Modify: `packages/karm/src/tasks/v3/task-panel-context.tsx`
- Modify: `packages/karm/src/tasks/v3/index.ts` (export new types)

**Step 1: Extend TaskFile**

In `task-panel-types.ts`, add new optional fields to `TaskFile`:

```ts
export type FileSource = 'upload' | 'figma' | 'gdrive' | 'dropbox' | 'loom' | 'youtube' | 'vimeo' | 'link'
export type FileStatus = 'draft' | 'final'

export interface TaskFile {
  // ... existing fields unchanged ...

  source?: FileSource
  embedUrl?: string
  thumbnailUrl?: string
  status?: FileStatus
  mimeType?: string
  width?: number
  height?: number
  duration?: number
}
```

Add upload state type:

```ts
export interface UploadingFile {
  id: string
  name: string
  progress: number
  error?: string
}
```

**Step 2: Add new context props**

In `task-panel-context.tsx`, add to `TaskPanelContextValue` and `TaskPanelProviderProps`:

```ts
// New context values
uploadingFiles?: UploadingFile[]
onRetryUpload?: (uploadId: string) => void
onCancelUpload?: (uploadId: string) => void
onAttachLink?: (url: string) => void
onUpdateFileStatus?: (fileId: string, status: FileStatus) => void
onToggleFileVisibility?: (fileId: string) => void
maxFileSize?: number
acceptedFileTypes?: string[]
```

Wire them through the provider with noop defaults.

**Step 3: Export new types from index.ts**

Add `UploadingFile`, `FileSource`, `FileStatus` to the type exports.

**Step 4: Run typecheck**

```bash
pnpm typecheck
```

**Step 5: Commit**

```
feat(karm): extend TaskFile type with source, status, upload state
```

---

## Task 3: Rewrite task-panel-description with TipTap

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-description.tsx`
- Modify: `packages/karm/src/tasks/v3/__tests__/task-panel-description.test.tsx`

**Step 1: Replace textarea with RichTextEditor/Viewer**

Rewrite `task-panel-description.tsx`:

- Import `RichTextEditor` and `RichTextViewer` from `@/composed/rich-text-editor`
- **View mode (has content):** Render `RichTextViewer` inside a container with `line-clamp-3` (via a wrapper div with `overflow: hidden; max-height` for collapsed state). Click the viewer → enter edit mode.
- **Edit mode:** Render `RichTextEditor` with reduced toolbar:
  ```ts
  <RichTextEditor
    content={draft}
    onChange={setDraft}
    placeholder="Write a description..."
    toolbar={['bold', 'italic', 'bulletList', 'orderedList', 'taskList', 'link', 'codeBlock']}
    className="..."
  />
  ```
- **Save:** When the user clicks outside (blur) or the component detects focus left the editor area. Use a wrapper div with `onBlur` + `relatedTarget` check (TipTap toolbar clicks should not trigger save).
- **Cancel:** Escape key — listen via `onKeyDown` on the wrapper.
- **Empty state (editable):** "Add a description..." button → opens editor.
- **Empty state (VIEW_ONLY):** "No description added yet." italic text.
- **Edit metadata:** "Last edited by X · Nh ago" below viewer (staff only, expanded mode only).

Key implementation detail for blur-save: TipTap editor has its own focus management. Use a `useRef` on a wrapper div and check `relatedTarget` on blur — if the new focus target is still inside the wrapper, don't save. If focus leaves the wrapper entirely, save.

**Step 2: Handle expand/collapse for rich content**

The viewer's expand/collapse can't use `line-clamp` on HTML content (it doesn't clamp across block elements reliably). Instead:

- Collapsed: wrapper div with `max-height: 4.5em; overflow: hidden` (roughly 3 lines)
- Use a `ResizeObserver` to detect if content overflows, and show "Show more" only when it does
- Expanded: remove max-height constraint

**Step 3: Update tests**

TipTap requires async rendering. Update `task-panel-description.test.tsx`:

- Mock TipTap if needed (check if core's test already handles this) or use `waitFor`
- Test: renders viewer when description has content
- Test: click viewer enters edit mode (RichTextEditor appears)
- Test: VIEW_ONLY shows viewer, no edit on click
- Test: COLLABORATOR can edit
- Test: empty state shows prompt for staff
- Test: empty state shows "No description" for VIEW_ONLY

Note: TipTap in jsdom may need `getComputedStyle` polyfill (already noted in core's test file).

**Step 4: Run tests**

```bash
cd packages/karm && pnpm test -- --run src/tasks/v3/__tests__/task-panel-description.test.tsx
```

**Step 5: Commit**

```
feat(karm): replace plain textarea with TipTap RichTextEditor in TaskPanel description
```

---

## Task 4: File categorization and source detection utilities

**Files:**
- Create: `packages/karm/src/tasks/v3/file-utils.ts`
- Create: `packages/karm/src/tasks/v3/__tests__/file-utils.test.ts`

**Step 1: Write tests for categorization**

```ts
import { categorizeFile, detectUrlSource, FILE_CATEGORIES } from '../file-utils'

describe('categorizeFile', () => {
  it('categorizes image files as media', () => {
    expect(categorizeFile({ fileType: 'png', name: 'logo.png' })).toBe('media')
  })
  it('categorizes figma source as design', () => {
    expect(categorizeFile({ source: 'figma', name: 'mockup' })).toBe('design')
  })
  it('categorizes pdf as documents', () => {
    expect(categorizeFile({ fileType: 'pdf', name: 'brief.pdf' })).toBe('documents')
  })
  it('categorizes generic links as links', () => {
    expect(categorizeFile({ source: 'link', name: 'ref' })).toBe('links')
  })
})

describe('detectUrlSource', () => {
  it('detects figma URLs', () => {
    expect(detectUrlSource('https://www.figma.com/file/abc')).toBe('figma')
  })
  it('detects youtube URLs', () => {
    expect(detectUrlSource('https://youtube.com/watch?v=abc')).toBe('youtube')
  })
  it('detects loom URLs', () => {
    expect(detectUrlSource('https://www.loom.com/share/abc')).toBe('loom')
  })
  it('returns link for unknown URLs', () => {
    expect(detectUrlSource('https://example.com/file')).toBe('link')
  })
})
```

**Step 2: Implement**

```ts
import type { TaskFile, FileSource } from './task-panel-types'

export type FileCategory = 'design' | 'documents' | 'media' | 'links'

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'avi']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'aac']
const DESIGN_EXT = ['fig', 'sketch', 'xd', 'psd', 'ai', 'indd']
const DOC_EXT = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'csv']
const DESIGN_SOURCES: FileSource[] = ['figma']
const MEDIA_SOURCES: FileSource[] = ['loom', 'youtube', 'vimeo']
const LINK_SOURCES: FileSource[] = ['link', 'gdrive', 'dropbox']

export function categorizeFile(file: Pick<TaskFile, 'name' | 'fileType' | 'source'>): FileCategory {
  if (file.source && DESIGN_SOURCES.includes(file.source)) return 'design'
  if (file.source && MEDIA_SOURCES.includes(file.source)) return 'media'
  if (file.source && LINK_SOURCES.includes(file.source)) return 'links'

  const ext = file.fileType?.toLowerCase() ?? file.name.split('.').pop()?.toLowerCase() ?? ''
  if (DESIGN_EXT.includes(ext)) return 'design'
  if (DOC_EXT.includes(ext)) return 'documents'
  if ([...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT].includes(ext)) return 'media'
  return 'documents' // default
}

export function detectUrlSource(url: string): FileSource {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    if (hostname.includes('figma.com')) return 'figma'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('vimeo.com')) return 'vimeo'
    if (hostname.includes('loom.com')) return 'loom'
    if (hostname.includes('drive.google.com')) return 'gdrive'
    if (hostname.includes('dropbox.com')) return 'dropbox'
    return 'link'
  } catch {
    return 'link'
  }
}

export function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXT.includes(ext)
}

export function groupFilesByCategory(files: TaskFile[]): Map<FileCategory, TaskFile[]> {
  const map = new Map<FileCategory, TaskFile[]>()
  for (const file of files) {
    const cat = categorizeFile(file)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(file)
  }
  return map
}
```

**Step 3: Run tests**

```bash
cd packages/karm && pnpm test -- --run src/tasks/v3/__tests__/file-utils.test.ts
```

**Step 4: Commit**

```
feat(karm): add file categorization and URL source detection utilities
```

---

## Task 5: Rewrite task-panel-files with enhanced UI

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-files.tsx` (major rewrite)

This is the largest task. Break into sub-steps.

**Step 1: Scaffold the new structure**

Replace the current flat-list implementation with a new structure:

```
TaskPanelFiles
  ├── ActionBar (Upload + Attach Link buttons)
  ├── UploadingFilesList (progress bars for in-flight uploads)
  ├── GlobalDropZone (drag overlay state)
  ├── CategorizedFileList
  │   ├── CategoryGroup "Design" (if files exist)
  │   │   └── FileRow (per file — icon/thumbnail + name + metadata + actions)
  │   ├── CategoryGroup "Documents"
  │   ├── CategoryGroup "Media"
  │   └── CategoryGroup "Links"
  └── FilePreviewDialog (modal with FilePreview + gallery nav)
```

**Step 2: Implement ActionBar**

Compact row with two buttons:
- "Upload" → triggers hidden file input (existing pattern)
- "Attach link" → toggles a text input below

Staff and COLLABORATOR see both. VIEW_ONLY sees neither.

```tsx
function ActionBar() {
  const { clientMode, onUploadFile, onAttachLink } = useTaskPanel()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [showLinkInput, setShowLinkInput] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const canUpload = !clientMode || clientMode === 'COLLABORATOR'

  if (!canUpload) return null

  const handleLinkSubmit = () => {
    const trimmed = linkUrl.trim()
    if (trimmed && onAttachLink) {
      onAttachLink(trimmed)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  return (
    <div className="flex flex-col gap-ds-02">
      <div className="flex items-center gap-ds-02">
        <Button variant="ghost" size="xs" onClick={() => fileInputRef.current?.click()}>
          <Icon icon={IconUpload} size="xs" className="mr-ds-01" /> Upload
        </Button>
        <Button variant="ghost" size="xs" onClick={() => setShowLinkInput(!showLinkInput)}>
          <Icon icon={IconLink} size="xs" className="mr-ds-01" /> Attach link
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} multiple />
      </div>
      <MotionCollapse show={showLinkInput}>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLinkSubmit(); if (e.key === 'Escape') setShowLinkInput(false) }}
          onBlur={() => { if (!linkUrl.trim()) setShowLinkInput(false) }}
          placeholder="Paste a Figma, Drive, Loom, or any URL..."
          className="w-full rounded-ds-md border border-surface-border bg-surface-raised px-ds-04 py-ds-02 text-ds-sm outline-none focus:border-accent-8"
        />
      </MotionCollapse>
    </div>
  )
}
```

**Step 3: Implement drag-and-drop with visual state**

Wrap the entire files section in a drop target with visual state:

```tsx
const [isDragging, setIsDragging] = React.useState(false)
const dragCountRef = React.useRef(0)

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault()
  dragCountRef.current++
  setIsDragging(true)
}
const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  dragCountRef.current--
  if (dragCountRef.current === 0) setIsDragging(false)
}
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  dragCountRef.current = 0
  setIsDragging(false)
  const files = e.dataTransfer.files
  if (files) Array.from(files).forEach(f => onUploadFile(f))
}
```

Drag overlay:
```tsx
{isDragging && (
  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-ds-lg border-2 border-dashed border-accent-7 bg-accent-2/80">
    <span className="text-ds-sm font-medium text-accent-11">Drop files here</span>
  </div>
)}
```

**Step 4: Implement upload progress rows**

```tsx
function UploadingFileRow({ file }: { file: UploadingFile }) {
  const { onRetryUpload, onCancelUpload } = useTaskPanel()
  return (
    <div className="flex items-center gap-ds-03 px-ds-03 py-ds-02">
      <Icon icon={IconUpload} size="sm" className="shrink-0 text-surface-fg-subtle animate-pulse" />
      <div className="min-w-0 flex-1">
        <span className="text-ds-sm text-surface-fg truncate block">{file.name}</span>
        {file.error ? (
          <div className="flex items-center gap-ds-02 mt-ds-01">
            <span className="text-ds-xs text-error-11">{file.error}</span>
            {onRetryUpload && (
              <button type="button" className="text-ds-xs text-accent-11 hover:underline" onClick={() => onRetryUpload(file.id)}>
                Retry
              </button>
            )}
          </div>
        ) : (
          <Progress value={file.progress} size="sm" autoColor className="mt-ds-01" />
        )}
      </div>
      {onCancelUpload && !file.error && (
        <Button variant="ghost" size="icon-xs" onClick={() => onCancelUpload(file.id)} aria-label="Cancel upload">
          <Icon icon={IconX} />
        </Button>
      )}
    </div>
  )
}
```

**Step 5: Implement FileRow with thumbnails and actions**

```tsx
function FileRow({ file, onPreview }: { file: TaskFile; onPreview: () => void }) {
  const { clientMode, currentUserId, onDeleteFile, onUpdateFileStatus, onToggleFileVisibility } = useTaskPanel()
  const isStaff = !clientMode
  const isOwner = file.uploadedBy.id === currentUserId
  const canDelete = isStaff || (clientMode === 'COLLABORATOR' && isOwner)
  const isImage = isImageFile(file.name)

  return (
    <div className="group/file flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 hover:bg-surface-raised-hover transition-colors">
      {/* Thumbnail or icon */}
      {isImage && (file.thumbnailUrl || file.fileUrl) ? (
        <button type="button" onClick={onPreview} className="shrink-0 rounded-ds-md overflow-hidden">
          <img
            src={file.thumbnailUrl || file.fileUrl}
            alt={file.name}
            className="h-12 w-12 object-cover"
            loading="lazy"
          />
        </button>
      ) : (
        <button type="button" onClick={onPreview} className="shrink-0">
          <Icon icon={getFileIcon(file)} size="sm" className="text-surface-fg-subtle" />
        </button>
      )}

      {/* Name + metadata */}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onPreview} className="text-ds-sm text-surface-fg truncate block hover:text-accent-11 transition-colors text-left">
          {file.name}
        </button>
        <span className="text-ds-xs text-surface-fg-subtle">
          {formatFileSize(file.size)} · {file.uploadedBy.name}
        </span>
      </div>

      {/* Status badge */}
      {file.status === 'final' && (
        <Badge variant="solid" color="success" size="xs">Final</Badge>
      )}

      {/* Actions */}
      <div className="flex items-center gap-ds-01 opacity-0 group-hover/file:opacity-100 transition-opacity">
        {/* Visibility toggle — staff only */}
        {isStaff && onToggleFileVisibility && (
          <Button variant="ghost" size="icon-xs" onClick={() => onToggleFileVisibility(file.id)}
            aria-label={file.isClientVisible === false ? 'Make visible to client' : 'Hide from client'}>
            <Icon icon={file.isClientVisible === false ? IconEyeOff : IconEye} />
          </Button>
        )}
        {/* Status toggle — staff only */}
        {isStaff && onUpdateFileStatus && (
          <Button variant="ghost" size="icon-xs"
            onClick={() => onUpdateFileStatus(file.id, file.status === 'final' ? 'draft' : 'final')}
            aria-label={file.status === 'final' ? 'Mark as draft' : 'Mark as final'}>
            <Icon icon={file.status === 'final' ? IconCircleMinus : IconCircleCheck} />
          </Button>
        )}
        {/* GDrive link */}
        {file.gDriveUrl && (
          <a href={file.gDriveUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Drive">
            <Icon icon={IconExternalLink} size="xs" />
          </a>
        )}
        {/* Delete */}
        {canDelete && (
          <Button variant="ghost" size="icon-xs" onClick={() => onDeleteFile(file.id)} aria-label={`Delete ${file.name}`}>
            <Icon icon={IconTrash} />
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Step 6: Implement categorized display**

Use `groupFilesByCategory` from file-utils. Render each category as a sub-section with a header. Skip categorization if total files ≤ 3 or all in one category.

```tsx
const CATEGORY_LABELS: Record<FileCategory, string> = {
  design: 'Design',
  documents: 'Documents',
  media: 'Media',
  links: 'Links',
}

const CATEGORY_ORDER: FileCategory[] = ['design', 'media', 'documents', 'links']
```

**Step 7: Implement client file filtering**

Clients only see files where `isClientVisible !== false`:

```tsx
const visibleFiles = React.useMemo(() => {
  if (!clientMode) return files
  return files.filter(f => f.isClientVisible !== false)
}, [files, clientMode])
```

**Step 8: Implement validation**

Before calling `onUploadFile`, check size and type:

```tsx
const validateFile = (file: File): string | null => {
  if (maxFileSize && file.size > maxFileSize) {
    return `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(maxFileSize)}`
  }
  if (acceptedFileTypes?.length) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const matches = acceptedFileTypes.some(t =>
      t.startsWith('.') ? ext === t.slice(1) : file.type === t
    )
    if (!matches) return `File type not accepted: .${ext}`
  }
  return null
}
```

Show validation errors as transient inline messages below the action bar.

**Step 9: Assemble the full component**

Wire all sub-components together in the main `TaskPanelFiles` export. Wrap in relative-positioned container for drag overlay. Use `TaskSection` with title="Files", count, and action bar in the `actions` slot.

**Step 10: Commit**

```
feat(karm): rewrite TaskPanel files section — categories, thumbnails, upload progress, link attachments, visibility, draft/final
```

---

## Task 6: FilePreview dialog with gallery navigation

**Files:**
- Create: `packages/karm/src/tasks/v3/task-panel-file-preview.tsx`

**Step 1: Implement dialog wrapper**

```tsx
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/ui/dialog'
import { FilePreview } from '@/composed/file-preview'
import { Button } from '@/ui/button'
import { IconChevronLeft, IconChevronRight, IconDownload } from '@tabler/icons-react'

export interface TaskPanelFilePreviewProps {
  files: TaskFile[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskPanelFilePreview({ files, initialIndex, open, onOpenChange }: TaskPanelFilePreviewProps) {
  const [index, setIndex] = React.useState(initialIndex)

  React.useEffect(() => { setIndex(initialIndex) }, [initialIndex])

  const file = files[index]
  if (!file) return null

  const hasPrev = index > 0
  const hasNext = index < files.length - 1

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) setIndex(i => i - 1)
      if (e.key === 'ArrowRight' && hasNext) setIndex(i => i + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, hasPrev, hasNext])

  // Map TaskFile to FilePreview props
  const previewType = getPreviewType(file)
  const previewUrl = file.embedUrl || file.fileUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 flex flex-col">
        <div className="sr-only">
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>File preview</DialogDescription>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-ds-05 py-ds-03 border-b border-surface-border-subtle">
          <span className="text-ds-sm font-medium text-surface-fg truncate">{file.name}</span>
          <div className="flex items-center gap-ds-02">
            <span className="text-ds-xs text-surface-fg-subtle">{index + 1} of {files.length}</span>
            <a href={file.downloadUrl} download className="shrink-0">
              <Button variant="ghost" size="icon-xs" aria-label="Download">
                <Icon icon={IconDownload} />
              </Button>
            </a>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden relative">
          <FilePreview url={previewUrl} type={previewType} fileName={file.name} alt={file.name} />

          {/* Nav arrows */}
          {hasPrev && (
            <Button variant="ghost" size="icon-sm" className="absolute left-ds-03 top-1/2 -translate-y-1/2 bg-surface-overlay/80 backdrop-blur-sm"
              onClick={() => setIndex(i => i - 1)} aria-label="Previous file">
              <Icon icon={IconChevronLeft} />
            </Button>
          )}
          {hasNext && (
            <Button variant="ghost" size="icon-sm" className="absolute right-ds-03 top-1/2 -translate-y-1/2 bg-surface-overlay/80 backdrop-blur-sm"
              onClick={() => setIndex(i => i + 1)} aria-label="Next file">
              <Icon icon={IconChevronRight} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Add preview type mapping helper**

```tsx
function getPreviewType(file: TaskFile): 'image' | 'pdf' | 'video' | 'audio' | 'embed' | undefined {
  if (file.source === 'figma' || file.source === 'youtube' || file.source === 'vimeo' || file.source === 'loom') return 'embed'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
  return undefined
}
```

**Step 3: Wire into TaskPanelFiles**

In task-panel-files.tsx, add state for preview dialog:

```tsx
const [previewIndex, setPreviewIndex] = React.useState(-1)
const previewOpen = previewIndex >= 0

// In FileRow: onPreview={() => setPreviewIndex(flatFileIndex)}
// At bottom of component:
<TaskPanelFilePreview
  files={allVisibleFiles}
  initialIndex={previewIndex}
  open={previewOpen}
  onOpenChange={(open) => { if (!open) setPreviewIndex(-1) }}
/>
```

**Step 4: Commit**

```
feat(karm): add FilePreview dialog with gallery navigation to TaskPanel files
```

---

## Task 7: Figma inline embed

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-files.tsx` (FileRow enhancement)

**Step 1: Add compact Figma embed**

For files with `source: 'figma'` and `embedUrl`, render a collapsible inline iframe:

```tsx
{file.source === 'figma' && file.embedUrl && (
  <div className="mt-ds-02 rounded-ds-md overflow-hidden border border-surface-border-subtle">
    <iframe
      src={`https://www.figma.com/embed?embed_host=karm&url=${encodeURIComponent(file.embedUrl)}`}
      className="w-full h-[200px]"
      allowFullScreen
      loading="lazy"
      title={`Figma: ${file.name}`}
    />
  </div>
)}
```

Only render in expanded category view, not in the collapsed flat list.

**Step 2: Commit**

```
feat(karm): add inline Figma embed preview in TaskPanel files
```

---

## Task 8: Add new stories

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel.stories.tsx`

**Step 1: Create rich mock data**

Add to the mock section:

```ts
const htmlDescription = '<p>Users are being logged out unexpectedly when their <strong>JWT access token</strong> expires during an active session.</p><ul><li>The refresh token flow is not triggered correctly</li><li>API middleware returns <code>401</code> instead of refreshing</li><li>Affects all authenticated routes</li></ul><p>Particularly disruptive during <em>long form submissions</em>.</p>'

const richMockTask: TaskPanelTask = {
  ...mockTask,
  description: htmlDescription,
  files: [
    {
      id: 'file-1', name: 'auth-flow-v3.fig', fileUrl: '#', downloadUrl: '#',
      fileType: 'fig', size: 2_400_000, source: 'figma',
      embedUrl: 'https://www.figma.com/file/example',
      uploadedBy: arjun, createdAt: hoursAgo(5), status: 'final',
    },
    {
      id: 'file-2', name: 'hero-mockup.png', fileUrl: 'https://picsum.photos/800/600', downloadUrl: '#',
      fileType: 'png', size: 356_000, source: 'upload', thumbnailUrl: 'https://picsum.photos/200/150',
      uploadedBy: priya, createdAt: hoursAgo(3), isClientVisible: true,
    },
    {
      id: 'file-3', name: 'brand-guidelines.pdf', fileUrl: '#', downloadUrl: '#',
      fileType: 'pdf', size: 4_800_000, source: 'upload',
      uploadedBy: nick, createdAt: daysAgo(2), status: 'final', isClientVisible: true,
    },
    {
      id: 'file-4', name: 'client-presentation.pptx', fileUrl: '#', downloadUrl: '#',
      fileType: 'pptx', size: 12_000_000, source: 'gdrive',
      gDriveUrl: 'https://drive.google.com/example',
      uploadedBy: arjun, createdAt: daysAgo(1),
    },
    {
      id: 'file-5', name: 'Onboarding walkthrough', fileUrl: '#', downloadUrl: '#',
      fileType: 'video', size: 0, source: 'loom',
      embedUrl: 'https://www.loom.com/share/example',
      uploadedBy: priya, createdAt: hoursAgo(8),
    },
    {
      id: 'file-6', name: 'internal-notes.docx', fileUrl: '#', downloadUrl: '#',
      fileType: 'docx', size: 84_000, source: 'upload',
      uploadedBy: arjun, createdAt: hoursAgo(1), isClientVisible: false,
    },
  ],
}

const mockUploadingFiles: UploadingFile[] = [
  { id: 'up-1', name: 'revised-mockup-v4.fig', progress: 67 },
  { id: 'up-2', name: 'recording.mp4', progress: 23 },
  { id: 'up-3', name: 'broken-export.psd', progress: 0, error: 'Upload failed — file too large' },
]
```

**Step 2: Add stories**

```ts
/** Rich HTML description rendered with TipTap viewer */
export const RichDescription: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={{ ...richMockTask, isInReview: false }}
      label="Click to see rich HTML description with formatting"
    />
  ),
}

/** Full file gallery — design files, documents, media, links across categories */
export const FileGallery: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      label="Click to see categorized file gallery with thumbnails, Figma embed, and mixed file types"
    />
  ),
}

/** Files mid-upload with progress bars and an error state */
export const FileUploadProgress: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      uploadingFiles={mockUploadingFiles}
      label="Click to see upload progress bars and error states"
    />
  ),
}

/** VIEW_ONLY client — downloads visible files, no upload actions */
export const ClientViewOnlyFiles: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      clientMode="VIEW_ONLY"
      task={richMockTask}
      label="Client view-only — sees only client-visible files, no upload"
    />
  ),
}

/** Inline review banner (not the wing card) */
export const ReviewBannerVisible: Story = {
  render: () => (
    <TaskPanelDemo
      mode="full"
      task={mockTask}
      label="Full page — review banner visible at top of content area"
    />
  ),
}

/** Dark mode — staff side panel */
export const DarkMode: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      label="Dark mode — staff view with rich content"
      lastViewedAt={hoursAgo(4)}
    />
  ),
}
```

**Step 3: Update TaskPanelDemo to accept uploadingFiles prop**

Thread `uploadingFiles` through the demo wrapper into the TaskPanel provider.

**Step 4: Update SidePanelStaff mock to use HTML description**

Change the default `mockTask.description` to use the HTML string so the main story also validates the TipTap viewer.

**Step 5: Preview all new stories**

Use `mcp__storybook__preview-stories` to get URLs for all new stories.

**Step 6: Run story tests on all stories**

Use `mcp__storybook__run-story-tests` — all must pass before committing.

**Step 7: Commit**

```
feat(karm): add TaskPanel v3 stories — file gallery, rich description, dark mode, upload progress, review banner
```

---

## Task 9: Update and add tests

**Files:**
- Modify: `packages/karm/src/tasks/v3/__tests__/task-panel-description.test.tsx`
- Create: `packages/karm/src/tasks/v3/__tests__/task-panel-files.test.tsx`

**Step 1: Update description tests**

Add tests for:
- Renders `RichTextViewer` when description is HTML
- Click enters edit mode with `RichTextEditor`
- VIEW_ONLY renders viewer, click does NOT enter edit mode
- COLLABORATOR can edit
- Empty state prompt opens editor on click
- Expand/collapse toggles on rich content

Note: TipTap in jsdom is brittle. Mock `RichTextEditor`/`RichTextViewer` if needed:

```ts
vi.mock('@/composed/rich-text-editor', () => ({
  RichTextEditor: ({ content, onChange, ...props }: any) => (
    <div data-testid="rich-text-editor" {...props}>{content}</div>
  ),
  RichTextViewer: ({ content, ...props }: any) => (
    <div data-testid="rich-text-viewer" {...props}>{content}</div>
  ),
}))
```

**Step 2: Create files tests**

Test:
- Image files render thumbnails (img element present)
- Non-image files render icon
- Click file opens preview dialog
- Upload progress renders progress bar
- Upload error shows retry button
- Drag overlay appears on dragenter
- Staff sees visibility and status toggles
- COLLABORATOR sees upload button, no visibility toggle
- VIEW_ONLY sees no upload button
- Client sees only files where `isClientVisible !== false`
- Categorized display groups correctly when > 3 files

**Step 3: Run all v3 tests**

```bash
cd packages/karm && pnpm test -- --run src/tasks/v3/
```

**Step 4: Commit**

```
test(karm): update description tests for TipTap, add files section tests
```

---

## Task 10: Full verification pass

**Step 1: Typecheck**

```bash
pnpm typecheck
```

**Step 2: Lint**

```bash
pnpm lint
```

**Step 3: Run all karm tests**

```bash
cd packages/karm && pnpm test -- --run
```

**Step 4: Run all core tests (for toolbar change)**

```bash
cd packages/core && pnpm test -- --run
```

**Step 5: Build**

```bash
pnpm build
```

**Step 6: Run all story tests**

```bash
# via Storybook MCP — omit stories param for full suite
```

**Step 7: Commit any fixes**

**Step 8: Final commit summary**

All tasks done. Ready for publish via `/publish-release`.

---

## Dependency Graph

```
Task 1 (core toolbar) ──→ Task 3 (TipTap description)
                                      ↓
Task 2 (types/context) ──→ Task 5 (files rewrite) ──→ Task 6 (FilePreview dialog)
         ↓                           ↓                          ↓
Task 4 (file utils) ────→ Task 5     ↓                  Task 7 (Figma embed)
                                     ↓                          ↓
                              Task 8 (stories) ←────────────────┘
                                     ↓
                              Task 9 (tests)
                                     ↓
                              Task 10 (verification)
```

**Parallelizable:** Tasks 1, 2, 4 can run in parallel (no dependencies between them).
Tasks 3 and 5 can run in parallel after their deps complete.
