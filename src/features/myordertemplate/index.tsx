'use client'

import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { POSSystem } from './components/pos/pos-system'

export default function MyOrderTemplate() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full">
      <AppHeader title="My Order Template" />
      <Main fixed fluid className="pt-0 px-4 pb-4 flex-1 flex flex-col overflow-hidden bg-background text-foreground">
        <Tabs defaultValue="new" className="flex-1 flex flex-col space-y-2 overflow-hidden">
          <div className="w-full overflow-x-auto pb-1 flex-shrink-0">
            <TabsList className="h-auto gap-6 border-b border-border bg-transparent p-0 shadow-none">
              <TabsTrigger
                value="new"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none"
              >
                New
              </TabsTrigger>
              <TabsTrigger
                value="my-orders"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none"
              >
                My Orders
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="new" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden flex flex-col min-h-0">
            <POSSystem />
          </TabsContent>
          <TabsContent value="my-orders" className="flex-1 p-6 flex items-center justify-center border border-dashed rounded-lg bg-muted/10 text-muted-foreground m-0">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">My Orders</h3>
              <p className="text-sm">Coming Soon</p>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="flex-1 p-6 flex items-center justify-center border border-dashed rounded-lg bg-muted/10 text-muted-foreground m-0">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">Analytics</h3>
              <p className="text-sm">Coming Soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </div>
  )
}
