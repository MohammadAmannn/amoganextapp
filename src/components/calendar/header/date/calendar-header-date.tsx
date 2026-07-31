import { useCalendarContext } from '../../calendar-context'
import { format } from 'date-fns'
import CalendarHeaderDateIcon from './calendar-header-date-icon'
import CalendarHeaderDateChevrons from './calendar-header-date-chevrons'
import CalendarHeaderDateBadge from './calendar-header-date-badge'

export default function CalendarHeaderDate() {
  const { date } = useCalendarContext()
  return (
    <div className="flex items-center gap-2 font-sans">
      <CalendarHeaderDateIcon />
      <div className="font-sans">
        <div className="flex items-center gap-1.5 font-sans">
          <p className="text-lg font-semibold font-sans tracking-tight text-foreground">{format(date, 'MMMM yyyy')}</p>
          <CalendarHeaderDateBadge />
        </div>
        <CalendarHeaderDateChevrons />
      </div>
    </div>
  )
}
