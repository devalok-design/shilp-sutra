/**
 * Re-export from canonical location in ui/lib so both ui/ and shell/ can use it
 * without violating module boundary rules (ui/ must not import from shell/).
 */
export { LinkProvider, useLink } from '../ui/lib/link-context'
export type { LinkProviderProps } from '../ui/lib/link-context'
