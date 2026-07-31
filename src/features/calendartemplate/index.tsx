'use client'

import { useState } from 'react'
import Calendar from '@/components/calendar/calendar'
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { ArrowLeft, Calendar as CalendarIcon, X } from 'lucide-react'
import initialEventsData from './data/events.json'

import { HeaderActions } from '@/features/Message/components/chat/header-actions'

// Parse JSON ISO date strings to javascript Date objects
const parsedInitialEvents: CalendarEvent[] = initialEventsData.map((event) => ({
  ...event,
  start: new Date(event.start),
  end: new Date(event.end)
}))

export default function CalendarTemplate({
  embedded = false,
  onBack,
}: {
  embedded?: boolean
  onBack?: () => void
}) {
  const [events, setEvents] = useState<CalendarEvent[]>(parsedInitialEvents)
  const [mode, setMode] = useState<Mode>('month')
  const [date, setDate] = useState<Date>(new Date())

  if (embedded) {
    return (
      <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background text-foreground overflow-hidden animate-fade-in md:relative md:z-auto'>
        {/* Header */}
        <div className='flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3 select-none'>
          <button
            onClick={onBack}
            className='-ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
            title='Close'
          >
            <X className='h-5 w-5' />
          </button>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/45 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:border-amber-800/40 dark:text-amber-400'>
            <CalendarIcon className='h-4.5 w-4.5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-foreground'>Calendar</p>
            <p className='truncate text-xs text-muted-foreground'>Manage meetings and agendas</p>
          </div>
          <HeaderActions onDelete={onBack} />
        </div>

        <div className='flex-grow min-h-0 overflow-y-auto p-4'>
          <div className="bg-card rounded-xl p-4 shadow-sm flex flex-col h-full overflow-hidden border border-border/60">
            <Calendar
              events={events}
              setEvents={setEvents}
              mode={mode}
              setMode={setMode}
              date={date}
              setDate={setDate}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-56px)] flex-col w-full overflow-hidden bg-background text-foreground animate-fade-in'>
      <AppHeader title='Calendar Template' />
      
      <Main fixed className='flex flex-col h-full p-4 md:p-6 overflow-hidden'>
        <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm flex flex-col h-full overflow-hidden">
          <Calendar
            events={events}
            setEvents={setEvents}
            mode={mode}
            setMode={setMode}
            date={date}
            setDate={setDate}
          />
        </div>
      </Main>
    </div>
  )
}
