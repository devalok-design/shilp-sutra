import type { Meta, StoryObj } from '@storybook/react'
import { RichTextEditor, RichTextViewer } from './rich-text-editor'

const sampleHtml = `
<h2>Project Requirements</h2>
<p>Here are the key deliverables for the <strong>Karm V2</strong> dashboard redesign:</p>
<ul>
  <li>Redesign the attendance calendar component</li>
  <li>Add real-time notification badges</li>
  <li>Implement the new <strong>bandwidth tracker</strong> widget</li>
</ul>
<h3>Technical Notes</h3>
<p>The frontend uses <strong>Remix</strong> with server-side rendering. All data fetching happens in loaders. Keep in mind:</p>
<ol>
  <li>Use <code>prisma</code> queries only in <code>.server.ts</code> files</li>
  <li>SSE for real-time updates via <code>/api/sse</code></li>
  <li>Redis pub/sub for cross-instance events</li>
</ol>
<p>For any questions, reach out to <strong>Aarav</strong> or <strong>Priya</strong>.</p>
`.trim()

const shortContent = '<p>A brief note about the upcoming sprint planning session.</p>'

const codeHeavyContent = `
<h2>Setup Instructions</h2>
<p>Clone the repository and install dependencies:</p>
<pre><code>git clone https://github.com/devalok/karm-v2.git
cd karm-v2
pnpm install</code></pre>
<p>Then run the dev server:</p>
<pre><code>pnpm dev</code></pre>
<p>The app will be available at <code>http://localhost:5173</code>.</p>
`.trim()

// --- Editor stories ---

const editorMeta: Meta<typeof RichTextEditor> = {
  title: 'Shared/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
}
export default editorMeta
type EditorStory = StoryObj<typeof RichTextEditor>

export const Default: EditorStory = {
  args: {},
}

export const WithPlaceholder: EditorStory = {
  args: {
    placeholder: 'Write a comment or update...',
  },
}

export const WithContent: EditorStory = {
  args: {
    content: sampleHtml,
  },
}

export const WithShortContent: EditorStory = {
  args: {
    content: shortContent,
  },
}

export const WithCodeContent: EditorStory = {
  args: {
    content: codeHeavyContent,
  },
}

export const ReadOnly: EditorStory = {
  args: {
    content: sampleHtml,
    editable: false,
  },
}

// --- Viewer stories ---

export const ViewerDefault: EditorStory = {
  render: () => (
    <RichTextViewer content={sampleHtml} />
  ),
}

export const ViewerCodeHeavy: EditorStory = {
  render: () => (
    <RichTextViewer content={codeHeavyContent} />
  ),
}

export const ViewerShort: EditorStory = {
  render: () => (
    <RichTextViewer content={shortContent} />
  ),
}

export const EditorAndViewer: EditorStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--Mapped-Text-Secondary)' }}>
          Editor (editable)
        </p>
        <RichTextEditor content={sampleHtml} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--Mapped-Text-Secondary)' }}>
          Viewer (read-only, no toolbar)
        </p>
        <RichTextViewer content={sampleHtml} />
      </div>
    </div>
  ),
}
