import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type NotFoundErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  embedded?: boolean
  onDismiss?: () => void
}

export function NotFoundError({
  className,
  embedded = false,
  onDismiss,
}: NotFoundErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()

  const handleGoBack = () => {
    if (onDismiss) {
      onDismiss()
      return
    }
    history.go(-1)
  }

  const handleGoHome = () => {
    if (onDismiss) onDismiss()
    navigate({ to: '/' })
  }
  return (
    <div className={cn(embedded ? 'min-h-96 w-full py-8' : 'h-svh', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1
          className={cn(
            'leading-tight font-bold',
            embedded ? 'text-6xl' : 'text-[7rem]'
          )}
        >
          404
        </h1>
        <span className='font-medium'>Oops! Page Not Found :-(!</span>
        <p className='text-center text-muted-foreground'>
          It seems like the page you're looking for <br />
          does not exist or might have been removed.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={handleGoBack}>
            Go Back
          </Button>
          <Button onClick={handleGoHome}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
