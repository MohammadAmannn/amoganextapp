'use client'

import React from 'react'
import { ProfileTab } from './components/profile-tab'
import { LinksTab } from './components/links-tab'
import { SocialsTab } from './components/socials-tab'
import { ThemesTab } from './components/themes-tab'
import { ShareTab } from './components/share-tab'
import { PhonePreview } from './components/phone-preview'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LinkBuilderFeature() {
  return (
    <div className='flex h-full flex-col w-full overflow-hidden bg-background text-foreground'>
      
      {/* Page Header */}
      <AppHeader title='Link Builder' />

      {/* Main Workspace Frame */}
      <Main fixed className='flex flex-grow flex-1 min-h-0 overflow-hidden p-4 md:p-6'>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-full overflow-hidden">
          
          {/* Left Panel: Tabs Control Panel (Columns 7) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="profile" className="flex flex-col h-full overflow-hidden">
              
              <div className='w-full overflow-x-auto pb-2 mb-4 shrink-0'>
                <TabsList className='h-auto gap-6 border-b border-border bg-transparent p-0 shadow-none justify-start flex w-full rounded-none'>
                  <TabsTrigger
                    value="profile"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs"
                  >
                    Links
                  </TabsTrigger>
                  <TabsTrigger
                    value="socials"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs"
                  >
                    Socials
                  </TabsTrigger>
                  <TabsTrigger
                    value="themes"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs"
                  >
                    Themes
                  </TabsTrigger>
                  <TabsTrigger
                    value="share"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-indigo-400 data-[state=active]:text-indigo-400"
                  >
                    Publish
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-6 space-y-4">
                <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                  <ProfileTab />
                </TabsContent>
                <TabsContent value="links" className="mt-0 focus-visible:outline-none">
                  <LinksTab />
                </TabsContent>
                <TabsContent value="socials" className="mt-0 focus-visible:outline-none">
                  <SocialsTab />
                </TabsContent>
                <TabsContent value="themes" className="mt-0 focus-visible:outline-none">
                  <ThemesTab />
                </TabsContent>
                <TabsContent value="share" className="mt-0 focus-visible:outline-none">
                  <ShareTab />
                </TabsContent>
              </div>

            </Tabs>
          </div>

          {/* Right Panel: iPhone Live Mockup Simulator (Columns 5) */}
          <div className="lg:col-span-5 h-full overflow-hidden bg-muted/10 border rounded-2xl flex items-center justify-center p-4 shadow-inner">
            <PhonePreview />
          </div>

        </div>

      </Main>

    </div>
  )
}
