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
        <div className='flex shrink-0 items-center gap-2.5 sm:gap-3 border-b border-border bg-background px-3 sm:px-4 py-2.5 select-none'>
          {onBack && (
            <button
              type='button'
              onClick={onBack}
              className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
              title='Close'
              aria-label='Close'
            >
              <X className='h-4.5 w-4.5' />
            </button>
          )}

          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200/45 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:border-amber-800/40 dark:text-amber-400'>
            <CalendarIcon className='h-4 w-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-foreground leading-tight'>Calendar</p>
          </div>
          <div className='flex items-center gap-1 shrink-0'>
            <HeaderActions onDelete={onBack} />
          </div>
        </div>

        <div className='flex-grow min-h-0 overflow-y-auto px-2 pt-1 pb-2 sm:px-3 sm:pt-1.5 sm:pb-3 md:px-4 md:pt-2 md:pb-4'>
          <div className="bg-card rounded-xl p-2 sm:p-3 md:p-3.5 shadow-sm flex flex-col h-full overflow-hidden border border-border/60">
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
      
      <Main fixed className='flex flex-col h-full px-3 pt-2 pb-4 md:px-6 md:pt-2.5 md:pb-6 overflow-hidden'>
        <div className="bg-card rounded-xl p-3 sm:p-4 md:p-5 shadow-sm flex flex-col h-full overflow-hidden">
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
