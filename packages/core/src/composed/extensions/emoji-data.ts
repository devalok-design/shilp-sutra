import { emojiDataLoaders } from '../emoji-picker'

// Spritesheet constants — must match emoji-mart's rendering (emoji-datasource v15.0.1)
export const SPRITESHEET_URL = (set: string) =>
  `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@15.0.1/img/${set}/sheets-256/64.png`
export const SHEET_COLS = 61
export const SHEET_ROWS = 61

interface EmojiSkin {
  unified: string
  native: string
  x?: number
  y?: number
}

interface EmojiEntry {
  id: string
  name: string
  keywords?: string[]
  skins: EmojiSkin[]
}

export interface EmojiDataset {
  emojis: Record<string, EmojiEntry>
  sheet?: { cols: number; rows: number }
}

export interface ResolvedEmoji {
  id: string
  name: string
  native: string
  x: number
  y: number
}

let cachedSet: string | null = null
let cachedData: EmojiDataset | null = null

export async function loadEmojiData(set: string): Promise<EmojiDataset> {
  if (cachedSet === set && cachedData) return cachedData
  const loader = emojiDataLoaders[set] ?? emojiDataLoaders.native
  const mod = await loader()
  cachedData = (mod.default ?? mod) as EmojiDataset
  cachedSet = set
  return cachedData
}

export function lookupEmoji(data: EmojiDataset, id: string): ResolvedEmoji | null {
  const entry = data.emojis[id]
  if (!entry) return null
  const skin = entry.skins[0]
  if (!skin) return null
  return {
    id: entry.id,
    name: entry.name,
    native: skin.native,
    x: skin.x ?? 0,
    y: skin.y ?? 0,
  }
}

export function searchEmoji(data: EmojiDataset, query: string, limit = 8): ResolvedEmoji[] {
  const entries = Object.values(data.emojis)
  if (!query) {
    return entries.slice(0, limit).map((e) => ({
      id: e.id,
      name: e.name,
      native: e.skins[0]?.native ?? '',
      x: e.skins[0]?.x ?? 0,
      y: e.skins[0]?.y ?? 0,
    }))
  }
  const q = query.toLowerCase()
  const results: ResolvedEmoji[] = []
  for (const e of entries) {
    if (results.length >= limit) break
    if (
      e.id.includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.keywords?.some((k) => k.includes(q))
    ) {
      results.push({
        id: e.id,
        name: e.name,
        native: e.skins[0]?.native ?? '',
        x: e.skins[0]?.x ?? 0,
        y: e.skins[0]?.y ?? 0,
      })
    }
  }
  return results
}
