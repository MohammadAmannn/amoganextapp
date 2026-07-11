import { ReactNode } from 'react'

interface StackProps {
  children?: ReactNode
  direction?: 'vertical' | 'horizontal'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
}

export function Stack({
  children,
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify,
  className = '',
}: StackProps) {
  const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyMap: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }

  const directionClass = direction === 'horizontal' ? 'flex-row' : 'flex-col'
  const gapClass = gapMap[gap] || 'gap-4'
  const alignClass = alignMap[align] || 'items-stretch'
  const justifyClass = justify ? justifyMap[justify] || '' : ''

  return (
    <div className={`flex ${directionClass} ${gapClass} ${alignClass} ${justifyClass} ${className}`.trim()}>
      {children}
    </div>
  )
}
