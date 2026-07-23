// @server-safe
import { type ClassValue,clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['ds-01', 'ds-02', 'ds-02b', 'ds-03', 'ds-04', 'ds-05', 'ds-05b', 'ds-06', 'ds-06b', 'ds-07', 'ds-08', 'ds-09', 'ds-10', 'ds-11', 'ds-12', 'ds-13'],
    },
    classGroups: {
      // All size ramps live in the font-size group so they're mutually exclusive
      // with EACH OTHER but NOT confused with text-COLOR utilities (text-error-11,
      // text-surface-fg, …). Without registering these, tw-merge classifies
      // `text-body-md` as a colour and silently strips a real colour on the same element.
      'font-size': [
        { 'text-ds': ['xs', 'sm', 'md', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] },
        { 'text-heading': ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] },
        { 'text-body': ['lg', 'md', 'sm', 'xs'] },
        { 'text-label': ['lg', 'md', 'sm', 'xs'] },
        { 'text-label-plain': ['lg', 'md', 'sm'] },
        'text-caption',
        'text-code',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
