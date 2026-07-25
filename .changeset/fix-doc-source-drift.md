---
"@devalok/shilp-sutra": patch
---

fix(docs): correct doc↔source drift in 6 components (finish-bar-v2 audit S3)

Six shipped docs made claims the source contradicts — actively misleading AI
agents and consumers. Corrected against source (source is truth):

- **rich-chat-input** (P0): prop table was materially wrong — `onSubmit` is
  `(message: RichChatInputMessage) => void` (not `(html, plainText)`); removed the
  non-existent `maxRows`; added the `inline` variant + `charCountDisplay`,
  `content`, `onVoiceRecord`, `onTranscribe`, `maxDuration`, `replyTo`,
  `actionButton`, `emojiSet`, `onSchedule`, `sendOptions`; fixed `ChatToolbarItem`
  (no `attach`; adds `blockquote`/`link`); documented `RichChatInputMessage`.
- **slider**: doc claimed Slider does NOT consume FormField — it does (a11y wiring:
  aria-invalid/describedby/required); reworded to "consumes for a11y, no visual
  validation treatment."
- **search-input**: removed the false "Escape auto-clears via type=search" claim
  (never wired); added the shipped `xs` size (was `sm|md|lg`).
- **command-registry**: `icon` is `IconInput` (not `ReactNode`); the pages/adminPages
  split is organizational, NOT access control — clarified the component enforces
  nothing (authorize on the server). Fixed the shell Introduction table's phantom
  "register/unregister/search" API to the real contract.
- **app-command-palette**: role detection is case-sensitive (`'Admin'`/`'SuperAdmin'`);
  fixed the example's `role: 'admin'` and documented the footgun.
- **simple-tooltip**: it always mounts its own `TooltipProvider` and does NOT inherit
  an ancestor's `delayDuration` (doc claimed it "respects it if present").

Docs-only; no runtime or type changes.
