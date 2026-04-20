import '@testing-library/jest-dom/vitest'

// Mock MutationObserver for jsdom (used by DevalokLogo/KarmLogo for dark-mode watch).
if (typeof globalThis.MutationObserver === 'undefined') {
  globalThis.MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof globalThis.MutationObserver
}
