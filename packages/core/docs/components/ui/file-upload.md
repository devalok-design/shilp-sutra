# FileUpload

- Import: @devalok/shilp-sutra/ui/file-upload
- Server-safe: No
- Category: ui

## Props
    onFiles: (files: File[]) => void (REQUIRED)
    accept: string (MIME or extension, e.g. "image/*", ".pdf,.doc")
    maxSize: number (bytes, default: 10MB)
    multiple: boolean
    uploading: boolean
    progress: number (0-100)
    error: string
    compact: boolean (inline button mode vs drop zone)
    disabled: boolean
    label: string
    sublabel: string

## Defaults
    compact: false
    maxSize: 10MB (10485760 bytes)

## Example
```jsx
<FileUpload
  accept="image/*"
  maxSize={2 * 1024 * 1024}
  onFiles={(files) => uploadAvatar(files[0])}
  label="Upload profile photo"
  sublabel="PNG, JPG up to 2MB"
/>
```

## Composability
- **Two modes, one component:** `compact={false}` (default) = drag-and-drop zone with visible affordance; `compact={true}` = inline "Upload" button. Swap by prop, same callback.
- **Progress integration:** Drive `uploading` + `progress` from your upload logic. The component renders an embedded Progress bar when uploading=true.
- **Validation is built-in:** `accept` (MIME types / extensions) + `maxSize` are enforced before `onFiles` fires. Invalid files produce `error` state instead of calling through. Your onFiles never has to re-validate.
- **Multi-file:** `multiple={true}` accepts File[] (array always, even for single-file mode — use `files[0]`).
- **Composes with Toast for feedback:** Pair with toast.success on upload complete, toast.error on failure.

## Gotchas
- compact=true renders a small inline button; false (default) renders a large drag-and-drop zone
- Client-side validation: invalid files are rejected before onFiles is called
- `onFiles` always receives an array — use `files[0]` even when `multiple={false}`

## Changes
### v0.1.0
- **Added** Initial release
