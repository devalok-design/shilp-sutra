/**
 * Tailwind classes that style an in-content `@mention` token (`<span class="mention">`).
 *
 * Shared by the rich-text editor, the chat input, AND the read-only Message
 * display so a mention looks identical whether it's being typed or rendered in a
 * timeline. Keep this the single source — three copies drifted before (see #99,
 * where Message never styled the token and `highlight="mention"` went invisible).
 */
export const MENTION_TOKEN_CLASS =
  '[&_.mention]:rounded-control-inner [&_.mention]:bg-accent-2 [&_.mention]:px-ds-02 [&_.mention]:py-[1px] [&_.mention]:font-medium [&_.mention]:text-accent-11'
