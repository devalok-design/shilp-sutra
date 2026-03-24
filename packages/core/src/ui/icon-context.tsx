'use client'

import * as React from 'react'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type IconStroke = 'light' | 'regular' | 'bold'

export interface IconContextValue {
  size?: IconSize
  stroke?: IconStroke
}

const IconContext = React.createContext<IconContextValue>({})

export function IconProvider({
  size,
  stroke,
  children,
}: IconContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ size, stroke }), [size, stroke])
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

export function useIconContext(): IconContextValue {
  return React.useContext(IconContext)
}

export { IconContext }
