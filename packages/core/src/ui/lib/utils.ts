import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['ds-01', 'ds-02', 'ds-02b', 'ds-03', 'ds-04', 'ds-05', 'ds-05b', 'ds-06', 'ds-06b', 'ds-07', 'ds-08', 'ds-09', 'ds-10', 'ds-11', 'ds-12', 'ds-13'],
    },
    classGroups: {
      'font-size': [{ 'text-ds': ['xs', 'sm', 'md'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
