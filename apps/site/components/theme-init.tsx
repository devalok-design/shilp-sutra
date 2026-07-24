/**
 * Inline script that sets the `.dark` class on <html> before React hydrates,
 * preventing the flash of light theme when the user prefers dark.
 *
 * Must be rendered in <head> or at the very top of <body>.
 *
 * SAFETY: The HTML payload is a hard-coded string literal with no template
 * interpolation or user input. This is the standard Next.js / next-themes
 * pattern for preventing theme-flash; there is no XSS surface here.
 */
const SCRIPT = `(function(){try{var s=localStorage.getItem('theme');if(s==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`

export function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
