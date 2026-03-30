import { describe, it, expect } from 'vitest'
import { categorizeFile, detectUrlSource, isImageFile, groupFilesByCategory } from '../file-utils'

describe('categorizeFile', () => {
  it('categorizes image files as media', () => {
    expect(categorizeFile({ fileType: 'png', name: 'logo.png' })).toBe('media')
  })
  it('categorizes video files as media', () => {
    expect(categorizeFile({ fileType: 'mp4', name: 'demo.mp4' })).toBe('media')
  })
  it('categorizes figma source as design', () => {
    expect(categorizeFile({ source: 'figma', name: 'mockup', fileType: 'fig' })).toBe('design')
  })
  it('categorizes design file extensions as design', () => {
    expect(categorizeFile({ fileType: 'psd', name: 'hero.psd' })).toBe('design')
    expect(categorizeFile({ fileType: 'ai', name: 'logo.ai' })).toBe('design')
    expect(categorizeFile({ fileType: 'sketch', name: 'app.sketch' })).toBe('design')
  })
  it('categorizes pdf as documents', () => {
    expect(categorizeFile({ fileType: 'pdf', name: 'brief.pdf' })).toBe('documents')
  })
  it('categorizes docx/pptx as documents', () => {
    expect(categorizeFile({ fileType: 'docx', name: 'spec.docx' })).toBe('documents')
    expect(categorizeFile({ fileType: 'pptx', name: 'deck.pptx' })).toBe('documents')
  })
  it('categorizes generic links as links', () => {
    expect(categorizeFile({ source: 'link', name: 'ref', fileType: '' })).toBe('links')
    expect(categorizeFile({ source: 'gdrive', name: 'doc', fileType: '' })).toBe('links')
    expect(categorizeFile({ source: 'dropbox', name: 'file', fileType: '' })).toBe('links')
  })
  it('categorizes loom/youtube/vimeo as media', () => {
    expect(categorizeFile({ source: 'loom', name: 'rec', fileType: '' })).toBe('media')
    expect(categorizeFile({ source: 'youtube', name: 'vid', fileType: '' })).toBe('media')
    expect(categorizeFile({ source: 'vimeo', name: 'vid', fileType: '' })).toBe('media')
  })
  it('defaults unknown types to documents', () => {
    expect(categorizeFile({ fileType: 'xyz', name: 'unknown.xyz' })).toBe('documents')
  })
})

describe('detectUrlSource', () => {
  it('detects figma URLs', () => {
    expect(detectUrlSource('https://www.figma.com/file/abc')).toBe('figma')
  })
  it('detects youtube URLs', () => {
    expect(detectUrlSource('https://youtube.com/watch?v=abc')).toBe('youtube')
    expect(detectUrlSource('https://youtu.be/abc')).toBe('youtube')
  })
  it('detects vimeo URLs', () => {
    expect(detectUrlSource('https://vimeo.com/123')).toBe('vimeo')
  })
  it('detects loom URLs', () => {
    expect(detectUrlSource('https://www.loom.com/share/abc')).toBe('loom')
  })
  it('detects google drive URLs', () => {
    expect(detectUrlSource('https://drive.google.com/file/d/abc')).toBe('gdrive')
  })
  it('detects dropbox URLs', () => {
    expect(detectUrlSource('https://www.dropbox.com/s/abc/file.pdf')).toBe('dropbox')
  })
  it('returns link for unknown URLs', () => {
    expect(detectUrlSource('https://example.com/file')).toBe('link')
  })
  it('returns link for invalid URLs', () => {
    expect(detectUrlSource('not a url')).toBe('link')
  })
})

describe('isImageFile', () => {
  it('recognizes common image extensions', () => {
    expect(isImageFile('photo.png')).toBe(true)
    expect(isImageFile('photo.JPG')).toBe(true)
    expect(isImageFile('icon.svg')).toBe(true)
    expect(isImageFile('hero.webp')).toBe(true)
  })
  it('rejects non-image files', () => {
    expect(isImageFile('doc.pdf')).toBe(false)
    expect(isImageFile('video.mp4')).toBe(false)
  })
})

describe('groupFilesByCategory', () => {
  it('groups files by category', () => {
    const files = [
      { id: '1', name: 'logo.png', fileType: 'png' },
      { id: '2', name: 'brief.pdf', fileType: 'pdf' },
      { id: '3', name: 'hero.jpg', fileType: 'jpg' },
    ] as any[]
    const groups = groupFilesByCategory(files)
    expect(groups.get('media')).toHaveLength(2)
    expect(groups.get('documents')).toHaveLength(1)
  })
  it('returns empty map for no files', () => {
    const groups = groupFilesByCategory([])
    expect(groups.size).toBe(0)
  })
})
