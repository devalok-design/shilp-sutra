import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { IconFile, IconDownload } from '@tabler/icons-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileAttachmentView({ node }: NodeViewProps) {
  const safeUrl = /^https?:\/\//.test(node.attrs.url) ? node.attrs.url : '#'
  return (
    <NodeViewWrapper className="my-ds-02">
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-ds-03 rounded-ds-md border border-border bg-layer-02 px-ds-04 py-ds-03 text-ds-sm text-text-primary transition-colors hover:border-border-strong hover:bg-layer-03"
        contentEditable={false}
      >
        <IconFile className="h-ico-sm w-ico-sm shrink-0 text-text-placeholder" />
        <span className="truncate">{node.attrs.name}</span>
        <span className="shrink-0 text-text-placeholder">({formatFileSize(node.attrs.size)})</span>
        <IconDownload className="h-ico-sm w-ico-sm shrink-0 text-text-placeholder" />
      </a>
    </NodeViewWrapper>
  )
}

export const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      name: { default: 'Untitled' },
      size: { default: 0 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-file-attachment]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-file-attachment': '' }, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView)
  },
})
