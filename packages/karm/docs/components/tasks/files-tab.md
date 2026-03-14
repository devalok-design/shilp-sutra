# FilesTab

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    files: TaskFile[] (REQUIRED)
    onUpload: (file: File, title?: string) => void (REQUIRED)
    onDelete: (fileId: string) => void (REQUIRED)
    isUploading: boolean (default: false)
    readOnly: boolean (default: false) — hides upload/delete controls
    ...HTMLAttributes<HTMLDivElement>

## TaskFile Shape
    id: string
    taskId: string
    title: string
    fileUrl: string
    downloadUrl: string (optional)
    fileType: string | null
    uploadedBy: { id: string; name: string; image: string | null }
    createdAt: string
    externalUrl: string (optional, e.g. Google Drive link)
    externalLabel: string (optional, tooltip for external link, default: "Open externally")

## Defaults
    isUploading=false, readOnly=false

## Example
```jsx
<FilesTab
  files={task.files}
  onUpload={(file) => uploadFile(file)}
  onDelete={(fileId) => deleteFile(fileId)}
  isUploading={uploading}
/>
```

## Gotchas
- Supports drag-and-drop upload zone and click-to-upload.
- File icons are auto-detected from fileType: images, documents, code, spreadsheets, archives.
- Delete triggers a confirmation Dialog before calling onDelete.
- In readOnly mode, upload zone and delete buttons are hidden; download/external links remain.
- externalUrl is validated to start with https?:// before rendering as a link.
- Empty state: "No files attached".
- Forwards ref to outer div.

## Changes
### v0.19.0
- **Added** Decomposed into composable pieces: `FileDropZone`, `FileList`, `FileItem` — importable from `@devalok/shilp-sutra-karm/tasks`
- FilesTab remains as a pre-assembled default; use the pieces for custom layouts

### v0.18.0
- **Added** Initial release
