import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { RichTextEditor, RichTextViewer } from './rich-text-editor'
import type { MentionItem } from './rich-text-editor'

const sampleMentions: MentionItem[] = [
  { id: '1', label: 'Aarav Sharma' },
  { id: '2', label: 'Priya Patel' },
  { id: '3', label: 'Vikram Singh' },
  { id: '4', label: 'Ananya Gupta' },
]

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
  title: 'Composed/RichTextEditor',
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
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Editor (editable)
        </p>
        <RichTextEditor content={sampleHtml} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Viewer (read-only, no toolbar)
        </p>
        <RichTextViewer content={sampleHtml} />
      </div>
    </div>
  ),
}

// --- New feature stories ---

const richContent = `
<h2>Enhanced Content Demo</h2>
<p>This shows <u>underline</u>, <mark>highlight</mark>, <strong>bold</strong>, and <s>strikethrough</s>.</p>
<blockquote><p>This is a blockquote — great for callouts or quotes.</p></blockquote>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Completed task</p></li>
  <li data-type="taskItem" data-checked="false"><p>Pending task</p></li>
</ul>
<p style="text-align: center">This paragraph is center-aligned.</p>
<hr>
<p>A horizontal rule above separates sections.</p>
<p>Visit <a href="https://example.com" rel="noopener noreferrer" target="_blank">example.com</a> for more details.</p>
`.trim()

export const WithAllFormatting: EditorStory = {
  args: {
    content: richContent,
  },
}

export const WithImageUpload: EditorStory = {
  args: {
    placeholder: 'Paste or drop an image...',
    onImageUpload: fn(async (_file: File) => 'https://placehold.co/400x200/1a1a2e/e0e0e0?text=Uploaded+Image'),
  },
}

export const WithFileUpload: EditorStory = {
  args: {
    placeholder: 'Drop files here...',
    onImageUpload: fn(async (_file: File) => 'https://placehold.co/400x200/1a1a2e/e0e0e0?text=Uploaded'),
    onFileUpload: fn(async (file: File) => ({ url: '#', name: file.name, size: file.size })),
  },
}

export const WithMentions: EditorStory = {
  args: {
    placeholder: 'Type @ to mention someone...',
    mentions: sampleMentions,
    onMentionSelect: fn(),
  },
}

export const FullFeatured: EditorStory = {
  args: {
    placeholder: 'Type @ for mentions, : for emoji, paste images...',
    mentions: sampleMentions,
    onImageUpload: fn(async (_file: File) => 'https://placehold.co/400x200/1a1a2e/e0e0e0?text=Uploaded'),
    onFileUpload: fn(async (file: File) => ({ url: '#', name: file.name, size: file.size })),
    onMentionSelect: fn(),
  },
}

const viewerRichContent = `
<h2>All Content Types</h2>
<p>Text with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, and <mark>highlight</mark>.</p>
<p>A link: <a href="https://example.com" rel="noopener noreferrer" target="_blank">Click here</a></p>
<blockquote><p>A blockquote for emphasis.</p></blockquote>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Done</p></li>
  <li data-type="taskItem" data-checked="false"><p>Not done</p></li>
</ul>
<img src="https://placehold.co/600x200/1a1a2e/e0e0e0?text=Sample+Image" alt="Sample">
<p>Mention: <span data-type="mention" data-id="1" class="mention">@Aarav Sharma</span> is assigned.</p>
<hr>
<p style="text-align: center">Center-aligned closing note.</p>
`.trim()

export const ViewerFullContent: EditorStory = {
  render: () => (
    <RichTextViewer content={viewerRichContent} />
  ),
}
