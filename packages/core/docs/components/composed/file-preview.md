# FilePreview

- Import: @devalok/shilp-sutra/composed/file-preview
- Server-safe: No
- Category: composed

## Props
    url: string (file URL — required)
    type: "image" | "pdf" | "video" | "audio" | "embed" (auto-detected from URL/mimeType)
    mimeType: string (helps auto-detection)
    alt: string (image alt text)
    initialPage: number (PDF starting page, default 1)
    fileName: string (displayed in file info bar)
    fileSize: string (displayed as badge, e.g. "2.4 MB")
    onError: (error: string) => void (called on load failures)

## Defaults
    initialPage={1}, type auto-detected

## Features by Type

**Image:** Pinch/scroll zoom (0.1x–8x), double-click toggle, floating toolbar (zoom %/reset/fullscreen), keyboard (+/-/0/F/Esc)
**PDF:** react-pdf page nav (prev/next + direct input), keyboard (←→), crossfade between pages
**Video:** Custom branded player, play overlay, auto-hiding controls, progress bar + scrub handle, mute, fullscreen
**Audio:** Branded mini-player, full-width progress bar with hover tooltip + scrub handle, volume, file name display
**Embed:** 16:9 aspect ratio, auto-converts YouTube/Vimeo/Figma/Loom URLs, 15s timeout

## Example
```jsx
<FilePreview url="/uploads/mockup.png" fileName="mockup.png" fileSize="2.4 MB" />
<FilePreview url="/docs/contract.pdf" initialPage={3} />
<FilePreview url="https://youtube.com/watch?v=..." />
```

## Gotchas
- Image/PDF lazy-loaded (Skeleton on first render)
- PDF worker from unpkg CDN — configure workerSrc for offline apps
- All types have error fallback with download link
- Embed URLs auto-converted to embed format
- Audio player doesn't show separate Download button (integrated in card)
