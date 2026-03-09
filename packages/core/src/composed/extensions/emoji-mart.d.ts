declare module '@emoji-mart/data' {
  const data: {
    emojis: Record<string, {
      id: string
      name: string
      skins: Array<{ native: string }>
    }>
  }
  export default data
}

declare module '@emoji-mart/react' {
  import type { ComponentType } from 'react'
  interface PickerProps {
    data: unknown
    onEmojiSelect: (emoji: { native: string; id: string }) => void
    theme?: 'light' | 'dark' | 'auto'
    previewPosition?: 'none' | 'top' | 'bottom'
    skinTonePosition?: 'none' | 'search' | 'preview'
  }
  const Picker: ComponentType<PickerProps>
  export default Picker
}
