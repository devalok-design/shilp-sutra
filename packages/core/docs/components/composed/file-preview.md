# FilePreview

- Import: @devalok/shilp-sutra/composed/file-preview
- Server-safe: No
- Category: composed

## Props
    url: string (file URL)
    type: "image" | "pdf" | "video" | "audio" | "embed" (auto-detected from URL/mimeType if omitted)
    mimeType: string (helps with type detection)
    alt: string (alt text for images)
    initialPage: number (starting page for PDFs)

## Defaults
    initialPage={1}

## Example
```jsx
<FilePreview url="/uploads/screenshot.png" />
<FilePreview url="/docs/report.pdf" initialPage={3} />
<FilePreview url="https://youtube.com/watch?v=abc" />
<FilePreview url="/audio/recording.mp3" mimeType="audio/mpeg" />
```

## Gotchas
- Images use `react-zoom-pan-pinch` (lazy-loaded) for pan/zoom controls
- PDFs use `react-pdf` (lazy-loaded) with page navigation
- Embeds auto-convert URLs from YouTube, Vimeo, Figma, and Loom into embed URLs
- A "Download" link is always rendered below the preview
- Type detection falls back to "image" if it cannot determine the file type — pass `type` explicitly for ambiguous URLs
