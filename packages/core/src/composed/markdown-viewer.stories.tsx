import type { Meta, StoryObj } from '@storybook/react-vite'
import { MarkdownViewer } from './markdown-viewer'

const meta: Meta<typeof MarkdownViewer> = {
  title: 'Composed/MarkdownViewer',
  component: MarkdownViewer,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof MarkdownViewer>

const fullMarkdown = `# Project Overview

This document outlines the **design system migration** for the Karm project management platform.

## Goals

The migration aims to achieve the following:

1. **Token standardization** across all surfaces
2. *Consistent* component APIs for better DX
3. Accessibility compliance (WCAG 2.1 AA)

### Key Principles

> Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials.
>
> — Dieter Rams

## Components

Here is the current inventory:

| Component | Status | Priority |
|-----------|--------|----------|
| Button | Complete | High |
| Card | In Progress | High |
| Dialog | Planned | Medium |
| Toast | Planned | Low |

## Code Example

Use the \`Button\` component like this:

\`\`\`tsx
import { Button } from '@devalok/shilp-sutra'

function App() {
  return (
    <Button variant="solid" size="md">
      Click me
    </Button>
  )
}
\`\`\`

## Resources

- [Design Tokens Spec](https://example.com/tokens)
- [Component Checklist](https://example.com/checklist)
- [Accessibility Guidelines](https://example.com/a11y)

---

For questions, reach out to the **Design Systems** team on Slack.
`

export const Default: Story = {
  args: {
    content: fullMarkdown,
    className: 'max-w-2xl',
  },
}

export const Compact: Story = {
  args: {
    content: fullMarkdown,
    compact: true,
    className: 'max-w-2xl',
  },
}

const codeHeavyMarkdown = `# API Reference

## Authentication

All requests require a Bearer token in the \`Authorization\` header.

\`\`\`bash
curl -H "Authorization: Bearer sk_live_abc123" \\
  https://api.example.com/v1/projects
\`\`\`

## Create a Project

\`\`\`typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    name: 'New Project',
    description: 'A sample project',
    status: 'active',
  }),
})

const project = await response.json()
console.log(project.id)
\`\`\`

## Response Format

\`\`\`json
{
  "id": "proj_abc123",
  "name": "New Project",
  "status": "active",
  "created_at": "2026-03-17T10:00:00Z"
}
\`\`\`
`

export const CodeBlock: Story = {
  args: {
    content: codeHeavyMarkdown,
    className: 'max-w-2xl',
  },
}
