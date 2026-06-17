import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

export function AiChat() {
  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed>
        <div className='flex h-full items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold'>🤖 AI Chat</h1>
            <p className='mt-4 text-lg text-muted-foreground'>
              Coming Soon...
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}