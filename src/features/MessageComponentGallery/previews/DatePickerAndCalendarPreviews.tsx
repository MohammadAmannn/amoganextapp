'use client'

import * as React from 'react'
import { format, addDays, subDays } from 'date-fns'
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Check,
  Plus,
  AlertCircle,
  Tag,
  Users,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

// ─── 1. DATE PICKER PREVIEWS ─────────────────────────────────────────────────

/** Simple Date Picker Preview */
export function DatePickerSimplePreview({ stateIndex }: { stateIndex: number }) {
  const [date, setDate] = React.useState<Date | undefined>(
    stateIndex === 1 ? new Date(2026, 7, 19) : undefined
  )

  return (
    <div className='flex flex-col items-center justify-center p-6 w-full max-w-sm mx-auto bg-card rounded-xl border border-border/70 shadow-xs gap-4 select-none'>
      <div className='w-full text-left space-y-1'>
        <Label className='text-xs font-semibold text-foreground'>
          Select Date
        </Label>
        <p className='text-[11px] text-muted-foreground'>
          Choose a single date for your appointment or task.
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal h-10 border-border/80 bg-background hover:bg-accent/50 cursor-pointer',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2.5 h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0' />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 border border-border bg-background shadow-lg rounded-xl' align='start'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            className='p-3'
          />
        </PopoverContent>
      </Popover>

      {date && (
        <div className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-200/50 dark:border-teal-900/40 text-teal-700 dark:text-teal-300 text-xs'>
          <span className='font-medium'>Selected: {format(date, 'MMMM d, yyyy')}</span>
          <button
            type='button'
            onClick={() => setDate(undefined)}
            className='text-[10px] underline cursor-pointer hover:opacity-80'
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

/** Date Range Picker Preview */
export function DatePickerRangePreview({ stateIndex }: { stateIndex: number }) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    stateIndex === 1
      ? {
          from: new Date(2026, 7, 10),
          to: new Date(2026, 7, 24),
        }
      : {
          from: new Date(),
          to: addDays(new Date(), 7),
        }
  )

  return (
    <div className='flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto bg-card rounded-xl border border-border/70 shadow-xs gap-4 select-none'>
      <div className='w-full text-left space-y-1'>
        <Label className='text-xs font-semibold text-foreground'>
          Date Range Selection
        </Label>
        <p className='text-[11px] text-muted-foreground'>
          Select start and end dates for your project sprint or vacation.
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date-range-trigger'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal h-10 border-border/80 bg-background hover:bg-accent/50 cursor-pointer',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarDays className='mr-2.5 h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0' />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, yyyy')} -{' '}
                  {format(dateRange.to, 'LLL dd, yyyy')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, yyyy')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 border border-border bg-background shadow-lg rounded-xl' align='start'>
          <Calendar
            mode='range'
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className='p-3 hidden sm:block'
          />
          <Calendar
            mode='range'
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
            className='p-3 sm:hidden'
          />
        </PopoverContent>
      </Popover>

      {dateRange?.from && dateRange?.to && (
        <div className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-200/50 dark:border-teal-900/40 text-teal-700 dark:text-teal-300 text-xs'>
          <span className='font-medium'>
            Duration: {Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24))} days
          </span>
          <Badge variant='outline' className='text-[10px] bg-background border-teal-300 dark:border-teal-800'>
            Active Range
          </Badge>
        </div>
      )}
    </div>
  )
}

/** Date Picker With Presets Preview */
export function DatePickerPresetsPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const presets = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
    { label: 'In 3 days', getValue: () => addDays(new Date(), 3) },
    { label: 'In 1 week', getValue: () => addDays(new Date(), 7) },
    { label: 'In 1 month', getValue: () => addDays(new Date(), 30) },
  ]

  return (
    <div className='flex flex-col items-center justify-center p-6 w-full max-w-sm mx-auto bg-card rounded-xl border border-border/70 shadow-xs gap-4 select-none'>
      <div className='w-full text-left space-y-1'>
        <Label className='text-xs font-semibold text-foreground'>
          Quick Presets Date Picker
        </Label>
        <p className='text-[11px] text-muted-foreground'>
          Select a date quickly using predefined shortcuts.
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal h-10 border-border/80 bg-background hover:bg-accent/50 cursor-pointer',
              !date && 'text-muted-foreground'
            )}
          >
            <Clock className='mr-2.5 h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0' />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='flex flex-col sm:flex-row w-auto p-0 border border-border bg-background shadow-lg rounded-xl overflow-hidden' align='start'>
          <div className='flex sm:flex-col border-b sm:border-b-0 sm:border-r border-border p-2 gap-1 bg-muted/20 overflow-x-auto sm:overflow-x-visible'>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant='ghost'
                size='sm'
                onClick={() => setDate(preset.getValue())}
                className='justify-start text-xs font-medium h-8 cursor-pointer hover:bg-teal-500/10 hover:text-teal-600'
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            className='p-3'
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/** Date Picker Form Field Preview */
export function DatePickerFormPreview({ stateIndex }: { stateIndex: number }) {
  const [date, setDate] = React.useState<Date | undefined>(
    stateIndex === 0 ? new Date(1995, 4, 15) : undefined
  )
  const isError = stateIndex === 1 && !date

  return (
    <div className='flex flex-col p-6 w-full max-w-sm mx-auto bg-card rounded-xl border border-border/70 shadow-xs gap-4 select-none'>
      <div className='space-y-1.5 text-left'>
        <Label className='text-xs font-semibold text-foreground flex items-center justify-between'>
          <span>Date of Birth *</span>
          <span className='text-[10px] text-muted-foreground font-normal'>Required</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal h-10 border-border/80 bg-background cursor-pointer',
                !date && 'text-muted-foreground',
                isError && 'border-rose-500 ring-1 ring-rose-500/30'
              )}
            >
              <CalendarIcon className='mr-2.5 h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0' />
              {date ? format(date, 'PPP') : <span>Pick your date of birth</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0 border border-border bg-background shadow-lg rounded-xl' align='start'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={setDate}
              captionLayout='dropdown'
              startMonth={new Date(1960, 0)}
              endMonth={new Date(2026, 11)}
              className='p-3'
            />
          </PopoverContent>
        </Popover>

        {isError ? (
          <p className='text-[11px] text-rose-500 flex items-center gap-1 font-medium pt-0.5'>
            <AlertCircle className='h-3.5 w-3.5 shrink-0' />
            Please select your date of birth.
          </p>
        ) : (
          <p className='text-[11px] text-muted-foreground pt-0.5'>
            Your date of birth is used to verify account eligibility.
          </p>
        )}
      </div>

      <Button
        className='w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs h-9 cursor-pointer'
        onClick={() => {
          if (date) alert(`Form Submitted with DOB: ${format(date, 'yyyy-MM-dd')}`)
        }}
      >
        Submit Profile
      </Button>
    </div>
  )
}


// ─── 2. CALENDAR PREVIEWS ──────────────────────────────────────────────────

/** Calendar Single Selection Preview */
export function CalendarSinglePreview({ stateIndex }: { stateIndex: number }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className='flex flex-col items-center justify-center p-6 w-full max-w-full bg-card rounded-2xl border border-border/80 shadow-sm gap-4 select-none'>
      <div className='w-full flex items-center justify-between border-b border-border/60 pb-3 px-1'>
        <div>
          <h4 className='text-sm font-semibold text-foreground'>Calendar</h4>
          <p className='text-[11px] text-muted-foreground'>Interactive date picker grid</p>
        </div>
        {date && (
          <Badge className='bg-blue-500/10 text-blue-600 border-blue-200/50 dark:text-blue-400 text-[10px] font-semibold'>
            {format(date, 'MMM d, yyyy')}
          </Badge>
        )}
      </div>

      <div className='w-full flex justify-center bg-background rounded-xl border border-border/50 p-4 shadow-2xs'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          className='w-full max-w-md flex justify-center'
        />
      </div>
    </div>
  )
}

/** Calendar Range Selection Preview */
export function CalendarRangePreview({ stateIndex }: { stateIndex: number }) {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  })

  return (
    <div className='flex flex-col items-center justify-center p-6 w-full max-w-full bg-card rounded-2xl border border-border/80 shadow-sm gap-4 select-none'>
      <div className='w-full flex items-center justify-between border-b border-border/60 pb-3 px-1'>
        <div>
          <h4 className='text-sm font-semibold text-foreground'>Date Range Grid</h4>
          <p className='text-[11px] text-muted-foreground'>Select start and end dates directly</p>
        </div>
      </div>

      <div className='w-full flex justify-center bg-background rounded-xl border border-border/50 p-4 shadow-2xs'>
        <Calendar
          mode='range'
          selected={range}
          onSelect={setRange}
          className='w-full max-w-md flex justify-center'
        />
      </div>

      {range?.from && range?.to && (
        <div className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-200/50 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs'>
          <span className='font-medium'>
            {format(range.from, 'MMM d')} – {format(range.to, 'MMM d, yyyy')}
          </span>
          <span className='font-bold text-[11px]'>
            {Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 3600 * 24)) + 1} Days Selected
          </span>
        </div>
      )}
    </div>
  )
}

/** Calendar Event & Agenda Schedule Preview */
export function CalendarEventsPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // Sample schedule events
  const events = [
    { time: '10:00 AM', title: 'Design Review & Sync', type: 'Design', team: 'UI Team' },
    { time: '02:30 PM', title: 'Sprint Board Planning', type: 'Dev', team: 'Frontend' },
    { time: '05:00 PM', title: 'Client Release Demo', type: 'Release', team: 'Product' },
  ]

  return (
    <div className='flex flex-col lg:flex-row w-full max-w-full bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden select-none'>
      {/* Left: Interactive Calendar */}
      <div className='p-6 border-b lg:border-b-0 lg:border-r border-border/80 bg-background flex flex-col items-center justify-center shrink-0 lg:w-80'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          className='p-1'
        />
      </div>

      {/* Right: Agenda List */}
      <div className='flex-1 p-6 flex flex-col justify-between gap-4 bg-card'>
        <div>
          <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4'>
            <div>
              <h4 className='text-sm font-semibold text-foreground flex items-center gap-1.5'>
                <CalendarDays className='h-4 w-4 text-blue-500' />
                <span>{date ? format(date, 'EEEE, MMMM d') : 'Today'}</span>
              </h4>
              <p className='text-[11px] text-muted-foreground'>3 scheduled events</p>
            </div>
            <Button size='sm' className='h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'>
              <Plus className='h-3.5 w-3.5 mr-1' /> Add Event
            </Button>
          </div>

          <div className='space-y-3'>
            {events.map((ev, i) => (
              <div
                key={i}
                className='flex items-start justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors'
              >
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]'>
                    <Clock className='h-4 w-4' />
                  </div>
                  <div>
                    <h5 className='text-xs font-semibold text-foreground'>{ev.title}</h5>
                    <div className='flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground'>
                      <span>{ev.time}</span>
                      <span>•</span>
                      <span className='flex items-center gap-0.5'>
                        <Users className='h-3 w-3' /> {ev.team}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant='outline' className='text-[9px] h-4.5 bg-background border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-400'>
                  {ev.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className='pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground'>
          <span>Google Calendar Sync</span>
          <span className='text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1'>
            <Check className='h-3.5 w-3.5' /> Synced
          </span>
        </div>
      </div>
    </div>
  )
}
