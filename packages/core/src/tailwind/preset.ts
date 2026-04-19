import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const preset: Partial<Config> = {
  // TW4: darkMode is now configured via @variant in CSS, not here.
  // TW4: safelist removed — use @source inline() in CSS if needed.
  theme: {
    extend: {
      // Breakpoints must be static values — CSS custom properties cannot be used
      // in @media queries (compiled at build time). These mirror the tokens in
      // semantic.css (--breakpoint-sm … --breakpoint-2xl).
      // Placed inside `extend` so deployer breakpoints are merged, not replaced.
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        accent: ['var(--font-accent)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontWeight: {
        light: 'var(--font-weight-light)',
        regular: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      letterSpacing: {
        'ds-tighter': 'var(--tracking-ds-tighter)',
        'ds-tight': 'var(--tracking-ds-tight)',
        'ds-normal': 'var(--tracking-ds-normal)',
        'ds-wide': 'var(--tracking-ds-wide)',
        'ds-wider': 'var(--tracking-ds-wider)',
        'ds-widest': 'var(--tracking-ds-widest)',
      },
      lineHeight: {
        'ds-none': 'var(--leading-ds-none)',
        'ds-tight': 'var(--leading-ds-tight)',
        'ds-snug': 'var(--leading-ds-snug)',
        'ds-normal': 'var(--leading-ds-normal)',
        'ds-relaxed': 'var(--leading-ds-relaxed)',
        'ds-loose': 'var(--leading-ds-loose)',
      },
      fontSize: {
        'ds-xs':   ['var(--text-ds-xs)',   { lineHeight: 'var(--leading-ds-relaxed)' }],
        'ds-sm':   ['var(--text-ds-sm)',   { lineHeight: 'var(--leading-ds-relaxed)' }],
        'ds-md':   ['var(--text-ds-md)',   { lineHeight: 'var(--leading-ds-relaxed)' }],
        'ds-base': ['var(--text-ds-base)', { lineHeight: 'var(--leading-ds-relaxed)' }],
        'ds-lg':   ['var(--text-ds-lg)',   { lineHeight: 'var(--leading-ds-normal)' }],
        'ds-xl':   ['var(--text-ds-xl)',   { lineHeight: 'var(--leading-ds-snug)' }],
        'ds-2xl':  ['var(--text-ds-2xl)',  { lineHeight: 'var(--leading-ds-snug)' }],
        'ds-3xl':  ['var(--text-ds-3xl)',  { lineHeight: 'var(--leading-ds-tight)' }],
        'ds-4xl':  ['var(--text-ds-4xl)',  { lineHeight: 'var(--leading-ds-tight)' }],
        'ds-5xl':  ['var(--text-ds-5xl)',  { lineHeight: 'var(--leading-ds-tight)' }],
        'ds-6xl':  ['var(--text-ds-6xl)',  { lineHeight: 'var(--leading-ds-tight)' }],
      },
      borderWidth: {
        'ds-sm': 'var(--border-width-sm)',
        'ds-md': 'var(--border-width-md)',
        'ds-lg': 'var(--border-width-lg)',
        'focus': 'var(--border-focus-width)',
      },
      borderRadius: {
        'ds-none': '0',
        'ds-sm': 'var(--radius-ds-sm)',
        'ds-default': 'var(--radius)',
        'ds-md': 'var(--radius-ds-md)',
        'ds-lg': 'var(--radius-ds-lg)',
        'ds-xl': 'var(--radius-ds-xl)',
        'ds-2xl': 'var(--radius-ds-2xl)',
        'ds-full': 'var(--radius-ds-full)',
      },
      spacing: {
        'ds-01': 'var(--spacing-ds-01)',
        'ds-02': 'var(--spacing-ds-02)',
        'ds-02b': 'var(--spacing-ds-02b)',
        'ds-03': 'var(--spacing-ds-03)',
        'ds-04': 'var(--spacing-ds-04)',
        'ds-05': 'var(--spacing-ds-05)',
        'ds-05b': 'var(--spacing-ds-05b)',
        'ds-06': 'var(--spacing-ds-06)',
        'ds-06b': 'var(--spacing-ds-06b)',
        'ds-07': 'var(--spacing-ds-07)',
        'ds-08': 'var(--spacing-ds-08)',
        'ds-09': 'var(--spacing-ds-09)',
        'ds-10': 'var(--spacing-ds-10)',
        'ds-11': 'var(--spacing-ds-11)',
        'ds-12': 'var(--spacing-ds-12)',
        'ds-13': 'var(--spacing-ds-13)',
        // ── Layout spacing (responsive via @media in semantic.css) ──
        'page-x': 'var(--spacing-ds-page-x)',
        'page-y': 'var(--spacing-ds-page-y)',
        'section-gap': 'var(--spacing-ds-section-gap)',
        'card-gap': 'var(--spacing-ds-card-gap)',
        'stack-gap': 'var(--spacing-ds-stack-gap)',
      },
      width: {
        'ds-xs': 'var(--size-xs)',
        'ds-xs-plus': 'var(--size-xs-plus)',
        'ds-sm': 'var(--size-sm)',
        'ds-sm-plus': 'var(--size-sm-plus)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
        'ico-sm': 'var(--icon-sm)',
        'ico-md': 'var(--icon-md)',
        'ico-lg': 'var(--icon-lg)',
        'ico-xl': 'var(--icon-xl)',
      },
      height: {
        'ds-xs': 'var(--size-xs)',
        'ds-xs-plus': 'var(--size-xs-plus)',
        'ds-sm': 'var(--size-sm)',
        'ds-sm-plus': 'var(--size-sm-plus)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
        'ico-sm': 'var(--icon-sm)',
        'ico-md': 'var(--icon-md)',
        'ico-lg': 'var(--icon-lg)',
        'ico-xl': 'var(--icon-xl)',
      },
      minHeight: {
        'ds-xs': 'var(--size-xs)',
        'ds-xs-plus': 'var(--size-xs-plus)',
        'ds-sm': 'var(--size-sm)',
        'ds-sm-plus': 'var(--size-sm-plus)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
      },
      maxWidth: {
        layout: 'var(--max-width)',
        'layout-body': 'var(--max-width-body)',
      },
      minWidth: {
        'ds-xs': 'var(--size-xs)',
        'ds-sm': 'var(--size-sm)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
      },
      opacity: {
        'action-hover': 'var(--action-hover-opacity)',
        'action-selected': 'var(--action-selected-opacity)',
        'action-disabled': 'var(--action-disabled-opacity)',
        'action-focus': 'var(--action-focus-opacity)',
        'action-active': 'var(--action-active-opacity)',
      },
      colors: {
        // ═══ NEW: 12-step accent scale ═══
        'accent-1': 'var(--color-accent-1)',
        'accent-2': 'var(--color-accent-2)',
        'accent-3': 'var(--color-accent-3)',
        'accent-4': 'var(--color-accent-4)',
        'accent-5': 'var(--color-accent-5)',
        'accent-6': 'var(--color-accent-6)',
        'accent-7': 'var(--color-accent-7)',
        'accent-8': 'var(--color-accent-8)',
        'accent-9': 'var(--color-accent-9)',
        'accent-10': 'var(--color-accent-10)',
        'accent-11': 'var(--color-accent-11)',
        'accent-12': 'var(--color-accent-12)',
        'accent-fg': 'var(--color-accent-fg)',

        // ═══ NEW: 12-step secondary scale ═══
        'secondary-1': 'var(--color-secondary-1)',
        'secondary-2': 'var(--color-secondary-2)',
        'secondary-3': 'var(--color-secondary-3)',
        'secondary-4': 'var(--color-secondary-4)',
        'secondary-5': 'var(--color-secondary-5)',
        'secondary-6': 'var(--color-secondary-6)',
        'secondary-7': 'var(--color-secondary-7)',
        'secondary-8': 'var(--color-secondary-8)',
        'secondary-9': 'var(--color-secondary-9)',
        'secondary-10': 'var(--color-secondary-10)',
        'secondary-11': 'var(--color-secondary-11)',
        'secondary-12': 'var(--color-secondary-12)',
        'secondary-fg': 'var(--color-secondary-fg)',

        // ═══ NEW: Surface ═══
        'surface-base': 'var(--color-surface-base)',
        'surface-sunken': 'var(--color-surface-sunken)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-overlay': 'var(--color-surface-overlay)',
        'surface-raised-hover': 'var(--color-surface-raised-hover)',
        'surface-raised-active': 'var(--color-surface-raised-active)',
        'surface-inverted': 'var(--color-surface-inverted)',
        'surface-inverted-fg': 'var(--color-surface-inverted-fg)',
        'surface-disabled': 'var(--color-surface-disabled)',
        'surface-fg-disabled': 'var(--color-surface-fg-disabled)',
        'surface-fg': 'var(--color-surface-fg)',
        'surface-fg-muted': 'var(--color-surface-fg-muted)',
        'surface-fg-subtle': 'var(--color-surface-fg-subtle)',
        'surface-border': 'var(--color-surface-border)',
        'surface-border-strong': 'var(--color-surface-border-strong)',
        'surface-border-subtle': 'var(--color-surface-border-subtle)',
        backdrop: 'var(--color-backdrop)',

        // ═══ Link ═══
        link: 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        'link-visited': 'var(--color-link-visited)',

        // ═══ NEW: Status (step subsets) ═══
        'error-2': 'var(--color-error-2)',
        'error-3': 'var(--color-error-3)',
        'error-4': 'var(--color-error-4)',
        'error-5': 'var(--color-error-5)',
        'error-7': 'var(--color-error-7)',
        'error-9': 'var(--color-error-9)',
        'error-10': 'var(--color-error-10)',
        'error-11': 'var(--color-error-11)',
        'error-fg': 'var(--color-error-fg)',
        'success-2': 'var(--color-success-2)',
        'success-3': 'var(--color-success-3)',
        'success-4': 'var(--color-success-4)',
        'success-5': 'var(--color-success-5)',
        'success-7': 'var(--color-success-7)',
        'success-9': 'var(--color-success-9)',
        'success-10': 'var(--color-success-10)',
        'success-11': 'var(--color-success-11)',
        'success-fg': 'var(--color-success-fg)',
        'warning-2': 'var(--color-warning-2)',
        'warning-3': 'var(--color-warning-3)',
        'warning-4': 'var(--color-warning-4)',
        'warning-5': 'var(--color-warning-5)',
        'warning-7': 'var(--color-warning-7)',
        'warning-9': 'var(--color-warning-9)',
        'warning-10': 'var(--color-warning-10)',
        'warning-11': 'var(--color-warning-11)',
        'warning-fg': 'var(--color-warning-fg)',
        'info-2': 'var(--color-info-2)',
        'info-3': 'var(--color-info-3)',
        'info-4': 'var(--color-info-4)',
        'info-5': 'var(--color-info-5)',
        'info-7': 'var(--color-info-7)',
        'info-9': 'var(--color-info-9)',
        'info-10': 'var(--color-info-10)',
        'info-11': 'var(--color-info-11)',
        'info-fg': 'var(--color-info-fg)',

        // ═══ NEW: Category (step subsets) ═══
        'category-teal-3': 'var(--color-category-teal-3)',
        'category-teal-7': 'var(--color-category-teal-7)',
        'category-teal-9': 'var(--color-category-teal-9)',
        'category-teal-11': 'var(--color-category-teal-11)',
        'category-amber-3': 'var(--color-category-amber-3)',
        'category-amber-7': 'var(--color-category-amber-7)',
        'category-amber-9': 'var(--color-category-amber-9)',
        'category-amber-11': 'var(--color-category-amber-11)',
        'category-slate-3': 'var(--color-category-slate-3)',
        'category-slate-7': 'var(--color-category-slate-7)',
        'category-slate-9': 'var(--color-category-slate-9)',
        'category-slate-11': 'var(--color-category-slate-11)',
        'category-indigo-3': 'var(--color-category-indigo-3)',
        'category-indigo-7': 'var(--color-category-indigo-7)',
        'category-indigo-9': 'var(--color-category-indigo-9)',
        'category-indigo-11': 'var(--color-category-indigo-11)',
        'category-cyan-3': 'var(--color-category-cyan-3)',
        'category-cyan-7': 'var(--color-category-cyan-7)',
        'category-cyan-9': 'var(--color-category-cyan-9)',
        'category-cyan-11': 'var(--color-category-cyan-11)',
        'category-orange-3': 'var(--color-category-orange-3)',
        'category-orange-7': 'var(--color-category-orange-7)',
        'category-orange-9': 'var(--color-category-orange-9)',
        'category-orange-11': 'var(--color-category-orange-11)',
        'category-emerald-3': 'var(--color-category-emerald-3)',
        'category-emerald-7': 'var(--color-category-emerald-7)',
        'category-emerald-9': 'var(--color-category-emerald-9)',
        'category-emerald-11': 'var(--color-category-emerald-11)',

        // ═══ Utility tokens (not step-based) ═══
        overlay: 'var(--color-overlay)',
        disabled: 'var(--color-disabled)',
        'skeleton-base': 'var(--color-skeleton-base)',
        'skeleton-shimmer': 'var(--color-skeleton-shimmer)',
        'inset-glow': 'var(--color-inset-glow)',
        'inset-glow-strong': 'var(--color-inset-glow-strong)',
        'inset-glow-subtle': 'var(--color-inset-glow-subtle)',
        'surface-overlay-light': 'var(--color-surface-overlay-light)',
        'surface-overlay-dark': 'var(--color-surface-overlay-dark)',
        'text-shadow': 'var(--color-text-shadow)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'chart-6': 'var(--chart-6)',
        'chart-7': 'var(--chart-7)',
        'chart-8': 'var(--chart-8)',
      },
      keyframes: {
        // ── Radix-coupled: height animation using Radix CSS variables ──
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        // ── Kept: CSS-only animations not yet migrated to Framer Motion ──
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'timer-bar': {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
        'popover-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'popover-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'processing-ants': {
          to: { '--border-angle': '360deg' },
        },
      },
      animation: {
        // ── Radix-coupled height animations ──
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
        'collapsible-down': 'collapsible-down 200ms ease-out',
        'collapsible-up': 'collapsible-up 200ms ease-out',
        // ── CSS-only animations ──
        'progress-indeterminate':
          'progress-indeterminate var(--duration-slow-02) var(--ease-productive-standard) infinite',
        'skeleton-shimmer':
          'skeleton-shimmer var(--duration-slow-02) var(--ease-linear) infinite',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'timer-bar': 'timer-bar linear forwards',
        'popover-in': 'popover-in 150ms var(--ease-productive-entrance)',
        'popover-out': 'popover-out 100ms var(--ease-productive-exit)',
        'processing-ants-ambient': 'processing-ants 3s linear infinite',
        'processing-ants-working': 'processing-ants 2s linear infinite',
        'processing-ants-urgent': 'processing-ants 1s linear infinite',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand-light)',
        'gradient-brand-dark': 'var(--gradient-brand-dark)',
      },
      boxShadow: {
        raised: 'var(--shadow-raised)',
        'raised-hover': 'var(--shadow-raised-hover)',
        'raised-inner': 'var(--shadow-raised-inner)',
        floating: 'var(--shadow-floating)',
        overlay: 'var(--shadow-overlay)',
        brand: 'var(--shadow-brand)',
        glow: 'var(--shadow-glow)',
        inset: 'var(--shadow-inset)',
        pressed: 'var(--shadow-pressed)',
        success: 'var(--shadow-success)',
        error: 'var(--shadow-error)',
        warning: 'var(--shadow-warning)',
        'ring-sm': 'var(--shadow-ring-sm)',
        ring: 'var(--shadow-ring)',
        kbd: 'var(--shadow-kbd)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        'fast-01': 'var(--duration-fast-01)',
        'fast-02': 'var(--duration-fast-02)',
        'moderate-01': 'var(--duration-moderate-01)',
        'moderate-01b': 'var(--duration-moderate-01b)',
        'moderate-02': 'var(--duration-moderate-02)',
        'slow-01': 'var(--duration-slow-01)',
        'slow-02': 'var(--duration-slow-02)',
      },
      transitionTimingFunction: {
        'productive-standard': 'var(--ease-productive-standard)',
        'productive-entrance': 'var(--ease-productive-entrance)',
        'productive-exit': 'var(--ease-productive-exit)',
        'expressive-standard': 'var(--ease-expressive-standard)',
        'expressive-entrance': 'var(--ease-expressive-entrance)',
        'expressive-exit': 'var(--ease-expressive-exit)',
        bounce: 'var(--ease-bounce)',
        linear: 'var(--ease-linear)',
      },
      zIndex: {
        base: 'var(--z-base)',
        raised: 'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [
    plugin(({ addBase, addUtilities }) => {
      // ── Typography composite utilities ──────────────────────────────
      // Maps each semantic variant to a single class that sets all four
      // typographic properties (size, weight, leading, tracking).
      const typoVariants = [
        'heading-2xl', 'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
        'body-lg', 'body-md', 'body-sm', 'body-xs',
        'label-lg', 'label-md', 'label-sm', 'label-xs',
        'label-plain-lg', 'label-plain-md', 'label-plain-sm',
        'caption', 'overline', 'code',
      ] as const
      const uppercaseVariants = new Set([
        'label-lg', 'label-md', 'label-sm', 'label-xs', 'overline',
      ])
      const monoVariants = new Set(['code'])
      const typoUtilities: Record<string, Record<string, string>> = {}
      for (const v of typoVariants) {
        const base: Record<string, string> = {
          'font-size': `var(--typo-${v}-size)`,
          'font-weight': `var(--typo-${v}-weight)`,
          'line-height': `var(--typo-${v}-leading)`,
          'letter-spacing': `var(--typo-${v}-tracking)`,
        }
        if (uppercaseVariants.has(v)) {
          base['text-transform'] = 'uppercase'
        }
        if (monoVariants.has(v)) {
          base['font-family'] = 'var(--typo-code-font)'
        }
        typoUtilities[`.text-${v}`] = base
      }
      addBase({
        '@property --border-angle': {
          syntax: '"<angle>"',
          'initial-value': '0deg',
          inherits: 'false',
        },
        // Prevent iOS Safari auto-zoom on inputs with font-size < 16px
        '@media screen and (max-width: 767px)': {
          'input:not([type="checkbox"]):not([type="radio"]), textarea, select': {
            'font-size': 'max(16px, 1em) !important',
          },
        },
      })
      addUtilities({
        ...typoUtilities,
        '.tabular-nums': { 'font-variant-numeric': 'tabular-nums' },
        '.touch-target': {
          position: 'relative',
        },
        '.touch-target::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          'min-width': '44px',
          'min-height': '44px',
        },
        '.focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            'box-shadow':
              '0 0 0 var(--border-focus-width) var(--color-surface-base), 0 0 0 calc(var(--border-focus-width) + var(--border-focus-offset)) var(--color-accent-9)',
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: 'none',
            'box-shadow': 'inset 0 0 0 var(--border-focus-width) var(--color-accent-9)',
          },
        },
        '.focus-ring-sm': {
          '&:focus-visible': {
            outline: 'none',
            'box-shadow': '0 0 0 var(--border-focus-width) var(--color-accent-7)',
          },
        },
        // Safe area inset utilities for notched/island devices
        '.pt-safe': { 'padding-top': 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { 'padding-bottom': 'env(safe-area-inset-bottom, 0px)' },
        '.pl-safe': { 'padding-left': 'env(safe-area-inset-left, 0px)' },
        '.pr-safe': { 'padding-right': 'env(safe-area-inset-right, 0px)' },
        '.p-safe': {
          'padding-top': 'env(safe-area-inset-top, 0px)',
          'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
          'padding-left': 'env(safe-area-inset-left, 0px)',
          'padding-right': 'env(safe-area-inset-right, 0px)',
        },
      })
    }),
  ],
}

export default preset
