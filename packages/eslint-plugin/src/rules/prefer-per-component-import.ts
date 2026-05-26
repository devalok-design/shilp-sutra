import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'
import { getNamedSpecifiers, renderImportDeclaration } from '../util/imports'

/**
 * v0.40.0 removed twelve peer-cliff symbols from their parent barrels.
 * Consumers must now import them via per-component subpaths.
 *
 * This rule:
 *   1. Detects barrel imports (`@devalok/shilp-sutra/ui`, `/composed`,
 *      `/ai`, `/ai/blocks`) that include cliff symbols.
 *   2. Splits the import: keeps non-cliff symbols on the original line,
 *      emits new import lines for each cliff symbol's per-component subpath.
 *
 * Source of truth: MIGRATION.md → v0.40.0 — Barrel peer-cliff cleanup.
 */

interface CliffMapping {
  /** The parent barrel a consumer typically imports from. */
  from: string
  /** Symbol → per-component subpath */
  symbols: Record<string, string>
}

const CLIFFS: CliffMapping[] = [
  {
    from: '@devalok/shilp-sutra/ui',
    symbols: {
      InputOTP: '@devalok/shilp-sutra/ui/input-otp',
      InputOTPGroup: '@devalok/shilp-sutra/ui/input-otp',
      InputOTPSeparator: '@devalok/shilp-sutra/ui/input-otp',
      InputOTPSlot: '@devalok/shilp-sutra/ui/input-otp',
      InputOTPProps: '@devalok/shilp-sutra/ui/input-otp',
      toast: '@devalok/shilp-sutra/ui/toast',
      formatFileSize: '@devalok/shilp-sutra/ui/toast',
      ToastActionOptions: '@devalok/shilp-sutra/ui/toast',
      ToastOptions: '@devalok/shilp-sutra/ui/toast',
      ToastProps: '@devalok/shilp-sutra/ui/toast',
      ToastType: '@devalok/shilp-sutra/ui/toast',
      ToastUndoOptions: '@devalok/shilp-sutra/ui/toast',
      ToastUploadOptions: '@devalok/shilp-sutra/ui/toast',
      UploadFile: '@devalok/shilp-sutra/ui/toast',
      Toaster: '@devalok/shilp-sutra/ui/toaster',
      ToasterProps: '@devalok/shilp-sutra/ui/toaster',
    },
  },
  {
    from: '@devalok/shilp-sutra/composed',
    symbols: {
      DatePicker: '@devalok/shilp-sutra/composed/date-picker',
      DateRangePicker: '@devalok/shilp-sutra/composed/date-picker',
      DateTimePicker: '@devalok/shilp-sutra/composed/date-picker',
      TimePicker: '@devalok/shilp-sutra/composed/date-picker',
      CalendarGrid: '@devalok/shilp-sutra/composed/date-picker',
      MonthPicker: '@devalok/shilp-sutra/composed/date-picker',
      YearPicker: '@devalok/shilp-sutra/composed/date-picker',
      Presets: '@devalok/shilp-sutra/composed/date-picker',
      useCalendar: '@devalok/shilp-sutra/composed/date-picker',
      EmojiPicker: '@devalok/shilp-sutra/composed/emoji-picker',
      EmojiPickerPopover: '@devalok/shilp-sutra/composed/emoji-picker',
      EmojiNode: '@devalok/shilp-sutra/composed/extensions/emoji-node',
      createEmojiSuggestion: '@devalok/shilp-sutra/composed/extensions/emoji-suggestion',
      FilePreview: '@devalok/shilp-sutra/composed/file-preview',
      MarkdownViewer: '@devalok/shilp-sutra/composed/markdown-viewer',
      RichChatInput: '@devalok/shilp-sutra/composed/rich-chat-input',
      AudioPlayer: '@devalok/shilp-sutra/composed/rich-chat-input',
      AudioWaveform: '@devalok/shilp-sutra/composed/rich-chat-input',
      useVoiceRecorder: '@devalok/shilp-sutra/composed/rich-chat-input',
      RichTextEditor: '@devalok/shilp-sutra/composed/rich-text-editor',
      RichTextViewer: '@devalok/shilp-sutra/composed/rich-text-editor',
    },
  },
  {
    from: '@devalok/shilp-sutra/ai',
    symbols: {
      BlockRenderer: '@devalok/shilp-sutra/ai/block-renderer',
      ErrorBlock: '@devalok/shilp-sutra/ai/blocks/error',
      TextBlock: '@devalok/shilp-sutra/ai/blocks/text',
    },
  },
  {
    from: '@devalok/shilp-sutra/ai/blocks',
    symbols: {
      ErrorBlock: '@devalok/shilp-sutra/ai/blocks/error',
      TextBlock: '@devalok/shilp-sutra/ai/blocks/text',
    },
  },
]

type MessageIds = 'peerCliffImport'

export default createRule<[], MessageIds>({
  name: 'prefer-per-component-import',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Split barrel imports of peer-cliff symbols (Toaster, DatePicker, RichTextEditor, …) into their per-component subpaths. v0.40.0 removed these from the barrels because they statically import optional peers.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.40.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      peerCliffImport:
        'Symbols `{{symbols}}` were removed from `{{from}}` in 0.40.0. Import them from their per-component subpath instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const cliff = CLIFFS.find((c) => c.from === node.source.value)
        if (!cliff) return

        const specs = getNamedSpecifiers(node)
        if (specs.length === 0) return

        const cliffSpecs = specs.filter((s) => cliff.symbols[s.imported])
        if (cliffSpecs.length === 0) return

        // Group cliff specifiers by target subpath
        const bySource = new Map<string, typeof cliffSpecs>()
        for (const s of cliffSpecs) {
          const target = cliff.symbols[s.imported]
          if (!target) continue
          const list = bySource.get(target) ?? []
          list.push(s)
          bySource.set(target, list)
        }

        const remaining = specs.filter((s) => !cliff.symbols[s.imported])
        const isTypeOnly = node.importKind === 'type'

        // Build the replacement: remaining-on-original-line + new lines per cliff target
        const lines: string[] = []
        if (remaining.length > 0) {
          lines.push(
            renderImportDeclaration({
              specifiers: remaining,
              source: node.source.value,
              typeOnlyDeclaration: isTypeOnly,
              newline: false,
            }),
          )
        }
        // Sort by target source for deterministic autofix output.
        const sortedTargets = [...bySource.entries()].sort((a, b) =>
          a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0,
        )
        for (const [target, list] of sortedTargets) {
          lines.push(
            renderImportDeclaration({
              specifiers: list,
              source: target,
              typeOnlyDeclaration: isTypeOnly,
              newline: false,
            }),
          )
        }

        const symbolNames = cliffSpecs.map((s) => `\`${s.imported}\``).join(', ')

        context.report({
          node,
          messageId: 'peerCliffImport',
          data: { symbols: symbolNames, from: cliff.from },
          fix: (fixer) => fixer.replaceText(node, lines.join('\n')),
        })
      },
    }
  },
})
