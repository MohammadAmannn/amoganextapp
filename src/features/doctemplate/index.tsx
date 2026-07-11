import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export default function DocTemplate() {
  return (
    <>
      <AppHeader title='Document Template ' />
      <Main fixed className='p-0 flex flex-col h-[calc(100vh-56px)]'>
        <SimpleEditor />
      </Main>
    </>
  )
}