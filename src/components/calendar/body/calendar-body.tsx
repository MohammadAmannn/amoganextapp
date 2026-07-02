import { useCalendarContext } from '../calendar-context'
import CalendarBodyDay from './day/calendar-body-day'
import CalendarBodyWeek from './week/calendar-body-week'
import CalendarBodyMonth from './month/calendar-body-month'
import CalendarBodyAgenda from './agenda/calendar-body-agenda'

export default function CalendarBody() {
  const { mode } = useCalendarContext()

  return (
    <>
      {mode === 'agenda' && <CalendarBodyAgenda />}
      {mode === 'day' && <CalendarBodyDay />}
      {mode === 'week' && <CalendarBodyWeek />}
      {mode === 'month' && <CalendarBodyMonth />}
    </>
  )
}
