'use client'

import { useState } from 'react'
import Calendar from '@/components/calendar/calendar'
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types'
import { generateMockEvents } from '@/lib/mock-calendar-events'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

export default function CalendarTemplate() {
  const [events, setEvents] = useState<CalendarEvent[]>(generateMockEvents())
  const [mode, setMode] = useState<Mode>('month')
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className='flex h-[calc(100vh-56px)] flex-col w-full overflow-hidden bg-background text-foreground animate-fade-in'>
      <AppHeader title='Calendar Template' />
      
      <Main fixed className='flex flex-col h-full p-4 md:p-6 overflow-hidden'>
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm flex flex-col h-full overflow-hidden">
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
