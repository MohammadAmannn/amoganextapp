'use client'

import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import HomeView from './views/home-view'

export default function StoreTemplate() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full">
      <AppHeader title='Store Template' />
      <Main fixed fluid className="p-0 flex-1 overflow-y-auto">
        <HomeView />
      </Main>
    </div>
  )
}