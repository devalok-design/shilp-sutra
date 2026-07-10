// Emoji dataset for the editors' `:shortcode:` autocomplete. Sources
// `@emoji-mart/data` — a pure-JSON package with NO react peer, so it is
// unaffected by the React-19 peer issue that drove the picker off
// `@emoji-mart/react` (→ frimousse). Native-only since that migration: no
// spritesheet coordinates, no per-art-style loaders.

interface EmojiSkin {
  native: string
}

interface EmojiEntry {
  id: string
  name: string
  keywords?: string[]
  skins: EmojiSkin[]
}

export interface EmojiDataset {
  emojis: Record<string, EmojiEntry>
}

export interface ResolvedEmoji {
  id: string
  name: string
  native: string
}

let cachedData: EmojiDataset | null = null

export async function loadEmojiData(): Promise<EmojiDataset> {
  if (cachedData) return cachedData
  const mod = await import('@emoji-mart/data')
  cachedData = ((mod as { default?: EmojiDataset }).default ?? mod) as EmojiDataset
  return cachedData
}

function resolve(entry: EmojiEntry): ResolvedEmoji {
  return { id: entry.id, name: entry.name, native: entry.skins[0]?.native ?? '' }
}

export function searchEmoji(data: EmojiDataset, query: string, limit = 8): ResolvedEmoji[] {
  const entries = Object.values(data.emojis)
  if (!query) return entries.slice(0, limit).map(resolve)
  const q = query.toLowerCase()
  const results: ResolvedEmoji[] = []
  for (const e of entries) {
    if (results.length >= limit) break
    if (
      e.id.includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.keywords?.some((k) => k.includes(q))
    ) {
      results.push(resolve(e))
    }
  }
  return results
}
