import type { TaskFile, FileSource } from './task-panel-types'

export type FileCategory = 'design' | 'documents' | 'media' | 'links'

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'avi']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'aac']
const DESIGN_EXT = ['fig', 'sketch', 'xd', 'psd', 'ai', 'indd']
const DOC_EXT = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'csv']

const DESIGN_SOURCES: FileSource[] = ['figma']
const MEDIA_SOURCES: FileSource[] = ['loom', 'youtube', 'vimeo']
const LINK_SOURCES: FileSource[] = ['link', 'gdrive', 'dropbox']

export function categorizeFile(
  file: Pick<TaskFile, 'name' | 'fileType'> & { source?: FileSource },
): FileCategory {
  if (file.source && DESIGN_SOURCES.includes(file.source)) return 'design'
  if (file.source && MEDIA_SOURCES.includes(file.source)) return 'media'
  if (file.source && LINK_SOURCES.includes(file.source)) return 'links'

  const ext =
    file.fileType?.toLowerCase() ||
    file.name.split('.').pop()?.toLowerCase() ||
    ''
  if (DESIGN_EXT.includes(ext)) return 'design'
  if (DOC_EXT.includes(ext)) return 'documents'
  if ([...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT].includes(ext)) return 'media'
  return 'documents'
}

export function detectUrlSource(url: string): FileSource {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    if (hostname.includes('figma.com')) return 'figma'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be'))
      return 'youtube'
    if (hostname.includes('vimeo.com')) return 'vimeo'
    if (hostname.includes('loom.com')) return 'loom'
    if (hostname.includes('drive.google.com')) return 'gdrive'
    if (hostname.includes('dropbox.com')) return 'dropbox'
    return 'link'
  } catch {
    return 'link'
  }
}

export function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXT.includes(ext)
}

export function groupFilesByCategory(
  files: TaskFile[],
): Map<FileCategory, TaskFile[]> {
  const map = new Map<FileCategory, TaskFile[]>()
  for (const file of files) {
    const cat = categorizeFile(file)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(file)
  }
  return map
}
