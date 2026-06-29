'use client'

import React, { useState } from 'react'
import { ProfileTab } from './components/profile-tab'
import { LinksTab } from './components/links-tab'
import { SocialsTab } from './components/socials-tab'
import { ThemesTab } from './components/themes-tab'
import { ShareTab } from './components/share-tab'
import { PhonePreview } from './components/phone-preview'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Smartphone } from 'lucide-react'

export default function LinkBuilderFeature() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className='flex h-full flex-col w-full overflow-hidden bg-background text-foreground'>
      <AppHeader title='Link Builder' />

      <Main fixed className='flex flex-grow flex-1 min-h-0 overflow-hidden p-3 sm:p-4 md:p-6'>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full h-full overflow-hidden">

          {/* Left Panel: Tabs Control Panel */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
            <Tabs defaultValue="profile" className="flex flex-col h-full min-h-0 overflow-hidden">

              <div className='w-full overflow-x-auto pb-2 mb-2 lg:mb-4 shrink-0 no-scrollbar'>
                <TabsList className='h-auto gap-4 sm:gap-6 border-b border-border bg-transparent p-0 shadow-none justify-start flex w-max min-w-full rounded-none'>
                  <TabsTrigger
                    value="profile"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs whitespace-nowrap"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs whitespace-nowrap"
                  >
                    Links
                  </TabsTrigger>
                  <TabsTrigger
                    value="socials"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs whitespace-nowrap"
                  >
                    Socials
                  </TabsTrigger>
                  <TabsTrigger
                    value="themes"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs whitespace-nowrap"
                  >
                    Themes
                  </TabsTrigger>
                  <TabsTrigger
                    value="share"
                    className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-indigo-400 data-[state=active]:text-indigo-400 whitespace-nowrap"
                  >
                    Publish
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pr-0 sm:pr-1 pb-20 lg:pb-6 space-y-4">
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

          {/* Right Panel: iPhone Live Mockup — desktop only */}
          <div className="hidden lg:flex lg:col-span-5 min-h-0 overflow-y-auto overflow-x-hidden bg-muted/10 border rounded-2xl flex-col items-center px-4 py-10 shadow-inner">
            <PhonePreview />
          </div>
        </div>
      </Main>

      {/* Mobile floating preview button */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <Button
          onClick={() => setPreviewOpen(true)}
          className="h-12 px-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2"
        >
          <Smartphone className="h-4 w-4" />
          Preview
        </Button>
      </div>

      {/* Mobile preview sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl px-4 pt-6 pb-8">
          <SheetHeader className="mb-2">
            <SheetTitle>Live Preview</SheetTitle>
            <SheetDescription>
              See how your link tree looks on a mobile device.
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-start justify-center h-full overflow-y-auto pt-4 pb-4">
            <PhonePreview compact />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
