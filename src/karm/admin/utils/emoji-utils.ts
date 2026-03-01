// ============================================================
// Emoji Utilities
// ============================================================

export function removeEmojiAtStart(text: string): string {
  return text.replace(
    /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200B-\u200D]+/gu,
    '',
  )
}

export function removeAllEmojis(text?: string): string {
  return (
    text?.replace(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200B-\u200D]+/gu,
      '',
    ) ?? ''
  )
}
