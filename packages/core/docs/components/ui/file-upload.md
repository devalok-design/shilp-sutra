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

## Gotchas
- compact=true renders a small inline button; false (default) renders a large drag-and-drop zone
- Client-side validation: invalid files are rejected before onFiles is called

## Changes
### v0.1.0
- **Added** Initial release
