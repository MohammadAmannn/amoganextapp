import React, { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComingSoon } from '@/components/coming-soon'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ROUTES_DATA, RouteInfo } from './data/routes-data'
import { RouteExplorer } from './components/route-explorer'
import { RoutesDocument } from './components/routes-document'

export default function RouteDoc() {
  const [activeTab, setActiveTab] = useState('routes')
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(ROUTES_DATA[0] || null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter routes based on search query
  const filteredRoutes = ROUTES_DATA.filter((route) => {
    const query = searchQuery.toLowerCase()
    return (
      route.name.toLowerCase().includes(query) ||
      route.path.toLowerCase().includes(query) ||
      route.folder.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query)
    )
  })

  // Synchronize sidebar selection with right-side scroll position
  useEffect(() => {
    if (selectedRoute && activeTab === 'routes') {
      const elementId = `route-block-${selectedRoute.path.replace(/\//g, '_')}`
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [selectedRoute, activeTab])

  return (
    <div className='flex h-[calc(100vh-56px)] flex-col w-full overflow-hidden bg-background text-foreground'>
      <AppHeader title='Route Doc' />

      <Main fixed className='flex flex-col h-full p-4 md:p-6 overflow-hidden'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden space-y-4">
          
          {/* Header Sub-tabs */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between pb-2 shrink-0 border-b border-border gap-4'>
            <div className='overflow-x-auto pb-2 flex-1 no-scrollbar'>
              <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none'>
                <TabsTrigger
                  value='routes'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Routes
                </TabsTrigger>
                <TabsTrigger
                  value='list'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  List
                </TabsTrigger>
                <TabsTrigger
                  value='analytics'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value='history'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            {activeTab === 'routes' && (
              <div className='relative w-full sm:w-60 md:w-72 pb-2 shrink-0'>
                <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search route path...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9 h-9 bg-background/50 border-border/80 focus-visible:ring-primary/20'
                />
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <TabsContent value="routes" className="flex-1 overflow-hidden flex flex-col sm:flex-row gap-6 mt-0 focus-visible:outline-none h-[calc(100vh-175px)]">
            <div className='w-full sm:w-64 md:w-72 shrink-0 h-full overflow-hidden'>
              <RouteExplorer
                routes={filteredRoutes}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
                searchQuery={searchQuery}
              />
            </div>
            <div className='flex-1 h-full overflow-hidden'>
              <RoutesDocument
                routes={filteredRoutes}
                selectedRoute={selectedRoute}
              />
            </div>
          </TabsContent>

          <TabsContent value="list" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>

        </Tabs>
      </Main>
    </div>
  )
}