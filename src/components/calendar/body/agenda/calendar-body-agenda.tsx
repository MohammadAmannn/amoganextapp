'use client'

import { useCalendarContext } from '../../calendar-context'
import { format, isSameDay, isAfter, startOfDay } from 'date-fns'
import { CalendarDays, Clock, Edit } from 'lucide-react'
import { colorOptions } from '../../calendar-tailwind-classes'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CalendarBodyAgenda() {
  const { events, date, setSelectedEvent, setManageEventDialogOpen } = useCalendarContext()

  // Filter events starting today or in the future relative to active calendar date
  const agendaDateStart = startOfDay(date)
  const upcomingEvents = events
    .filter((event) => {
      const eventStart = new Date(event.start)
      return isSameDay(eventStart, agendaDateStart) || isAfter(eventStart, agendaDateStart)
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  // Group events by date string
  const groupedEvents: { [dateStr: string]: typeof events } = {}
  upcomingEvents.forEach((event) => {
    const dateStr = format(new Date(event.start), 'EEEE, MMMM d, yyyy')
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = []
    }
    groupedEvents[dateStr].push(event)
  })

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setManageEventDialogOpen(true)
  }

  const getEventColorClasses = (colorValue: string) => {
    const option = colorOptions.find((o) => o.value === colorValue)
    return option ? option.class : {
      base: 'bg-slate-500 border-slate-500 bg-slate-500/10 hover:bg-slate-500/20 text-slate-500',
      light: 'bg-slate-300 text-slate-300',
      dark: 'dark:bg-slate-700 text-slate-700'
    }
  }

  return (
    <ScrollArea className="flex-1 h-full max-h-[calc(100vh-225px)] rounded-xl bg-card">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Agenda View</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            Upcoming events from {format(date, 'MMM d, yyyy')}
          </span>
        </div>

        {Object.keys(groupedEvents).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-muted-foreground">No upcoming events scheduled</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Try creating a new event from the top right button.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([dateStr, dateEvents]) => (
              <div key={dateStr} className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase bg-muted/60 px-3 py-1.5 rounded-md w-fit">
                  {dateStr}
                </h4>
                <div className="grid gap-3">
                  {dateEvents.map((event) => {
                    const colorClass = getEventColorClasses(event.color)
                    const startTimeStr = format(new Date(event.start), 'hh:mm a')
                    const endTimeStr = format(new Date(event.end), 'hh:mm a')
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`group border rounded-lg p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-all duration-200 ${colorClass.base}`}
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              {startTimeStr} - {endTimeStr}
                            </span>
                          </div>
                        </div>
                        <button
                          className="h-8 w-8 rounded-full bg-white/80 border border-border/40 hover:bg-white shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Manage Event"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
