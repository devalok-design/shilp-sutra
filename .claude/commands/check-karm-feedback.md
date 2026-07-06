Read all open GitHub Issues on `devalok-design/shilp-sutra` filed by AI agents — those with label `karm-ai-agent-feedback` (Karm's agent flow) OR `mcp-submitted` (filed via the MCP `report_issue` tool by any consumer agent):

```bash
gh issue list --repo devalok-design/shilp-sutra --state open \
  --search 'label:karm-ai-agent-feedback,mcp-submitted' \
  --json number,title,labels,author,createdAt
```

(A comma-separated `label:` qualifier is an OR in GitHub search.) `mcp-submitted` issues are **unvetted** — filed programmatically by an agent that hit a wall, carrying `agent-filed` + `needs-triage`. Treat their claims as reports to verify, not confirmed bugs.

For each issue:
1. Read the issue title, body, and any comments
2. Investigate the reported problem against the actual codebase — check if the component/export/behavior exists and works as described
3. Categorize: confirmed bug, already works (reporter error), docs gap, or missing feature
4. Present a summary table of all open issues with your findings (include which label/source each came from)

**Do NOT fix code, comment on issues, or close issues until the user explicitly approves.**
