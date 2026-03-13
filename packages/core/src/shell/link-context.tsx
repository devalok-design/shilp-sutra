'use client'

import * as React from 'react'

type LinkComponent = React.ForwardRefExoticComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string } & React.RefAttributes<HTMLAnchorElement>
>

const DefaultLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>// eslint-disable-next-line jsx-a11y/anchor-has-content -- content passed via children spread
(({ href, ...props }, ref) => <a ref={ref} href={href} {...props} />)
DefaultLink.displayName = 'DefaultLink'

const LinkContext = React.createContext<LinkComponent>(DefaultLink)

export interface LinkProviderProps {
  component: LinkComponent
  children: React.ReactNode
}

export function LinkProvider({
  component,
  children,
}: LinkProviderProps) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

export function useLink() {
  return React.useContext(LinkContext)
}
