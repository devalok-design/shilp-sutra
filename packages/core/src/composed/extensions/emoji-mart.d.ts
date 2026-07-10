// `@emoji-mart/data` is a pure-JSON dataset (no bundled types). We bundle it
// (dependency, lazy chunk) for the editors' `:shortcode:` emoji search — it has
// no React peer, so it is unaffected by the React-19 issue that moved the
// picker to frimousse. Only the default dataset export is used (native-only).
declare module '@emoji-mart/data' {
  const data: {
    emojis: Record<string, {
      id: string
      name: string
      keywords?: string[]
      skins: Array<{ native: string }>
    }>
  }
  export default data
}
