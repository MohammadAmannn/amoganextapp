import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: {
    title: string
    href?: string
    isActive: boolean
    disabled?: boolean
    onClick?: () => void
  }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  const renderLink = ({
    title,
    href,
    isActive,
    disabled,
    onClick,
  }: TopNavProps['links'][number]) => {
    const className = `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`

    if (onClick) {
      return (
        <button
          type='button'
          key={title}
          onClick={onClick}
          disabled={disabled}
          className={className}
        >
          {title}
        </button>
      )
    }

    return (
      <Link
        key={title}
        to={href!}
        disabled={disabled}
        className={className}
      >
        {title}
      </Link>
    )
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            className={cn(
              'hidden size-8 shrink-0 md:inline-flex lg:hidden',
              className
            )}
          >
            <Menu />
            <span className='sr-only'>Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='start'>
          {links.map((link) => (
            <DropdownMenuItem
              key={link.title}
              disabled={link.disabled}
              onClick={link.onClick}
              asChild={!link.onClick}
            >
              {link.onClick ? (
                <span className={!link.isActive ? 'text-muted-foreground' : ''}>
                  {link.title}
                </span>
              ) : (
                <Link
                  to={link.href!}
                  className={!link.isActive ? 'text-muted-foreground' : ''}
                  disabled={link.disabled}
                >
                  {link.title}
                </Link>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <nav
        className={cn(
          'hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6',
          className
        )}
        {...props}
      >
        {links.map((link) => renderLink(link))}
      </nav>
    </>
  )
}
