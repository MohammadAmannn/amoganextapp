import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative min-h-svh w-full overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary'>
      {/* Dynamic ambient background glow */}
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30' />
        <div className='absolute -top-32 -right-32 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-32 -left-32 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl' />
      </div>

      <div className='flex min-h-svh w-full items-center justify-center px-3 py-6 sm:px-6 sm:py-10'>
        <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-4 sm:space-y-6'>
          <div className='flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.01]'>
            <Logo className='h-7 w-7 sm:h-8 sm:w-8 shrink-0' />
            <h1 className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
              AmogaApp
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
