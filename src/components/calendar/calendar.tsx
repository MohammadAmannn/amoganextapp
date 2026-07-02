import type { CalendarProps } from './calendar-types'
import CalendarBody from './body/calendar-body'
import CalendarHeaderActions from './header/actions/calendar-header-actions'
import CalendarHeaderDate from './header/date/calendar-header-date'
import CalendarHeaderActionsAdd from './header/actions/calendar-header-actions-add'
import CalendarProvider from './calendar-provider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Calendar({
  events,
  setEvents,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
}: CalendarProps) {
  return (
    <CalendarProvider
      events={events}
      setEvents={setEvents}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
      calendarIconIsToday={calendarIconIsToday}
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Customized Premium Header combining dashboard tabs, navigation chevrons, and add event actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4 flex-shrink-0">
          <Tabs
            value={mode}
            onValueChange={(val) => setMode(val as any)}
            className="w-full md:w-auto overflow-x-auto no-scrollbar"
          >
            <TabsList className="h-auto gap-6 border-0 bg-transparent p-0 shadow-none">
              <TabsTrigger
                value="agenda"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs cursor-pointer"
              >
                Agenda
              </TabsTrigger>
              <TabsTrigger
                value="day"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs cursor-pointer"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs cursor-pointer"
              >
                Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs cursor-pointer"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between md:justify-end gap-4 flex-wrap flex-shrink-0">
            <CalendarHeaderDate />
            <CalendarHeaderActions>
              <CalendarHeaderActionsAdd />
            </CalendarHeaderActions>
          </div>
        </div>

        {/* Calendar Grid View Body */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <CalendarBody />
        </div>
      </div>
    </CalendarProvider>
  )
}
