import React from 'react'
import { useNavigation } from '../hooks/use-navigation'

export default function Link({ href, children, className, onClick, ...props }: any) {
  const { setView } = useNavigation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) onClick(e)
    setView(href)
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
