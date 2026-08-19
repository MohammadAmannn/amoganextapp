'use client'

import * as React from 'react'
import { format, addDays } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

// ─── QUESTIONNAIRE WIZARD PREVIEW ────────────────────────────────────────────

interface QuestionnaireState {
  step: number
  role: string
  name: string
  date: Date | undefined
  timeSlot: string
  features: string[]
  completed: boolean
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
]

const FEATURE_OPTIONS = [
  { id: 'ai', label: 'AI Assistance & Summarization', desc: 'Automatic email drafting & chat summaries' },
  { id: 'analytics', label: 'Advanced Analytics', desc: 'Real-time response rate and task completion metrics' },
  { id: 'automation', label: 'Workflow Automations', desc: 'Custom triggers and automated notifications' },
  { id: 'custom', label: 'Custom Integrations', desc: 'Connect with existing CRM and calendar tools' },
]

export function QuestionnaireWizardPreview({ stateIndex }: { stateIndex: number }) {
  // stateIndex 0: Interactive step wizard, 1: Step 2 prefilled, 2: Completed summary state
  const initialStep = stateIndex === 2 ? 4 : stateIndex === 1 ? 2 : 1
  const initialCompleted = stateIndex === 2

  const [wizardState, setWizardState] = React.useState<QuestionnaireState>({
    step: initialStep,
    role: stateIndex >= 1 ? 'Product Manager' : '',
    name: stateIndex >= 1 ? 'Alex Morgan' : '',
    date: stateIndex >= 1 ? addDays(new Date(), 2) : undefined,
    timeSlot: stateIndex >= 1 ? '11:00 AM - 12:00 PM' : '',
    features: stateIndex === 2 ? ['ai', 'analytics', 'automation'] : [],
    completed: initialCompleted,
  })

  // Sync state index changes
  React.useEffect(() => {
    if (stateIndex === 0) {
      setWizardState({
        step: 1,
        role: '',
        name: '',
        date: undefined,
        timeSlot: '',
        features: [],
        completed: false,
      })
    } else if (stateIndex === 1) {
      setWizardState({
        step: 2,
        role: 'Product Manager',
        name: 'Alex Morgan',
        date: addDays(new Date(), 2),
        timeSlot: '11:00 AM - 12:00 PM',
        features: ['ai'],
        completed: false,
      })
    } else if (stateIndex === 2) {
      setWizardState({
        step: 4,
        role: 'Engineering Lead',
        name: 'Jordan Rivera',
        date: addDays(new Date(), 3),
        timeSlot: '02:00 PM - 03:00 PM',
        features: ['ai', 'analytics', 'automation'],
        completed: true,
      })
    }
  }, [stateIndex])

  const totalSteps = 3
  const progressPercent = wizardState.completed
    ? 100
    : Math.round(((wizardState.step - 1) / totalSteps) * 100)

  const handleNext = () => {
    if (wizardState.step < 3) {
      setWizardState((prev) => ({ ...prev, step: prev.step + 1 }))
    } else {
      setWizardState((prev) => ({ ...prev, completed: true }))
    }
  }

  const handleBack = () => {
    if (wizardState.completed) {
      setWizardState((prev) => ({ ...prev, completed: false, step: 3 }))
    } else if (wizardState.step > 1) {
      setWizardState((prev) => ({ ...prev, step: prev.step - 1 }))
    }
  }

  const toggleFeature = (id: string) => {
    setWizardState((prev) => {
      const exists = prev.features.includes(id)
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== id)
          : [...prev.features, id],
      }
    })
  }

  const handleReset = () => {
    setWizardState({
      step: 1,
      role: '',
      name: '',
      date: undefined,
      timeSlot: '',
      features: [],
      completed: false,
    })
  }

  return (
    <div className='flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-xl mx-auto select-none'>
      <div className='w-full rounded-2xl border border-border/80 bg-card shadow-md overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col gap-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <div className='h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/50 dark:border-violet-900/40'>
                <Wand2 className='h-4 w-4' />
              </div>
              <div className='min-w-0'>
                <h3 className='text-sm font-semibold text-foreground truncate'>
                  Onboarding Questionnaire
                </h3>
                <p className='text-xs text-muted-foreground truncate'>
                  Tailor your workspace preferences & schedule setup
                </p>
              </div>
            </div>
            <Badge
              variant='outline'
              className='text-[10px] bg-violet-500/10 text-violet-600 border-violet-300/60 dark:border-violet-900/40 dark:text-violet-400 shrink-0 font-medium'
            >
              {wizardState.completed ? 'Completed' : `Step ${wizardState.step} of ${totalSteps}`}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className='space-y-1.5'>
            <div className='flex justify-between text-[11px] font-medium text-muted-foreground'>
              <span>Overall Progress</span>
              <span className='font-mono text-foreground'>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className='h-2 bg-muted' />
          </div>
        </div>

        {/* Form Body */}
        <div className='p-4 sm:p-6 flex-1 min-h-[300px] flex flex-col justify-between gap-6 bg-card'>
          {wizardState.completed ? (
            /* Completed Summary View */
            <div className='flex flex-col items-center justify-center text-center py-6 space-y-4 my-auto'>
              <div className='h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300/60 dark:border-emerald-800/40 animate-in zoom-in-95'>
                <CheckCircle2 className='h-6 w-6' />
              </div>
              <div className='space-y-1 max-w-sm'>
                <h4 className='text-base font-semibold text-foreground'>
                  Questionnaire Completed!
                </h4>
                <p className='text-xs text-muted-foreground'>
                  Your setup preferences have been recorded. Here is a quick summary of your selections:
                </p>
              </div>

              <div className='w-full max-w-md rounded-xl border border-border bg-muted/20 p-3.5 text-left text-xs space-y-2.5'>
                <div className='flex justify-between border-b border-border/50 pb-2'>
                  <span className='text-muted-foreground'>Name & Role:</span>
                  <span className='font-medium text-foreground'>
                    {wizardState.name || 'Not provided'} ({wizardState.role || 'Member'})
                  </span>
                </div>
                <div className='flex justify-between border-b border-border/50 pb-2'>
                  <span className='text-muted-foreground'>Scheduled Session:</span>
                  <span className='font-medium text-foreground'>
                    {wizardState.date ? format(wizardState.date, 'MMM d, yyyy') : 'No date'}
                    {wizardState.timeSlot ? ` at ${wizardState.timeSlot}` : ''}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground'>Selected Features ({wizardState.features.length}):</span>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {wizardState.features.length > 0 ? (
                      wizardState.features.map((f) => (
                        <Badge key={f} variant='secondary' className='text-[10px] capitalize'>
                          {f}
                        </Badge>
                      ))
                    ) : (
                      <span className='text-muted-foreground italic text-[11px]'>None selected</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={handleReset}
                className='mt-2 gap-1.5 text-xs cursor-pointer'
              >
                <RotateCcw className='h-3.5 w-3.5' />
                <span>Restart Questionnaire</span>
              </Button>
            </div>
          ) : wizardState.step === 1 ? (
            /* Step 1: User Profile & Role */
            <div className='space-y-4 my-auto animate-in fade-in-50 duration-200'>
              <div className='space-y-1'>
                <div className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                  <User className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  <span>Step 1: Personal Details & Role</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Please tell us your name and primary function in your organization.
                </p>
              </div>

              <div className='space-y-3 pt-1'>
                <div className='space-y-1.5'>
                  <Label htmlFor='wizard-name' className='text-xs font-medium'>
                    Full Name
                  </Label>
                  <Input
                    id='wizard-name'
                    value={wizardState.name}
                    onChange={(e) => setWizardState((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder='e.g. Alex Morgan'
                    className='h-9 text-xs bg-background'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Select Your Role</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {['Product Manager', 'Engineering Lead', 'UX Designer', 'Operations'].map((r) => {
                      const isSel = wizardState.role === r
                      return (
                        <button
                          key={r}
                          type='button'
                          onClick={() => setWizardState((prev) => ({ ...prev, role: r }))}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all cursor-pointer select-none',
                            isSel
                              ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold shadow-2xs'
                              : 'border-border bg-background hover:bg-muted/50 text-foreground'
                          )}
                        >
                          <span>{r}</span>
                          {isSel && <Check className='h-3.5 w-3.5 text-violet-600 dark:text-violet-400' />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : wizardState.step === 2 ? (
            /* Step 2: Calendar & Time Picker */
            <div className='space-y-4 my-auto animate-in fade-in-50 duration-200'>
              <div className='space-y-1'>
                <div className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                  <CalendarIcon className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  <span>Step 2: Schedule Onboarding Session</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Pick a preferred date and time slot for your walkthrough.
                </p>
              </div>

              <div className='space-y-3 pt-1'>
                {/* Date Picker Component */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Onboarding Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 text-xs border-border bg-background cursor-pointer',
                          !wizardState.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0' />
                        {wizardState.date ? (
                          format(wizardState.date, 'PPP')
                        ) : (
                          <span>Select session date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0 border border-border bg-background shadow-lg rounded-xl' align='start'>
                      <Calendar
                        mode='single'
                        selected={wizardState.date}
                        onSelect={(d) => setWizardState((prev) => ({ ...prev, date: d }))}
                        className='p-3'
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time slot picker */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Available Time Slots</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {TIME_SLOTS.map((slot) => {
                      const isSel = wizardState.timeSlot === slot
                      return (
                        <button
                          key={slot}
                          type='button'
                          onClick={() => setWizardState((prev) => ({ ...prev, timeSlot: slot }))}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-2 text-left text-xs transition-all cursor-pointer select-none',
                            isSel
                              ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold'
                              : 'border-border bg-background hover:bg-muted/50 text-foreground'
                          )}
                        >
                          <span className='flex items-center gap-1.5'>
                            <Clock className='h-3 w-3 text-muted-foreground' />
                            <span className='text-[11px]'>{slot}</span>
                          </span>
                          {isSel && <Check className='h-3.5 w-3.5 text-violet-600 dark:text-violet-400' />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 3: Feature Preferences */
            <div className='space-y-4 my-auto animate-in fade-in-50 duration-200'>
              <div className='space-y-1'>
                <div className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                  <Sliders className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  <span>Step 3: Module & Feature Preferences</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Select the capabilities you plan to use most.
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                {FEATURE_OPTIONS.map((feat) => {
                  const isChecked = wizardState.features.includes(feat.id)
                  return (
                    <button
                      key={feat.id}
                      type='button'
                      onClick={() => toggleFeature(feat.id)}
                      className={cn(
                        'flex items-start gap-3 w-full rounded-xl border p-3 text-left transition-all cursor-pointer select-none',
                        isChecked
                          ? 'border-violet-500/70 bg-violet-500/10 text-foreground shadow-2xs'
                          : 'border-border bg-background hover:bg-muted/40 text-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                          isChecked
                            ? 'border-violet-600 bg-violet-600 text-white'
                            : 'border-border bg-background'
                        )}
                      >
                        {isChecked && <Check className='h-3 w-3 stroke-[3]' />}
                      </div>
                      <div className='space-y-0.5 min-w-0'>
                        <p className='text-xs font-semibold text-foreground leading-none'>
                          {feat.label}
                        </p>
                        <p className='text-[11px] text-muted-foreground leading-tight'>
                          {feat.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          {!wizardState.completed && (
            <div className='flex items-center justify-between pt-4 border-t border-border/60 gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBack}
                disabled={wizardState.step === 1}
                className='h-8 px-3 text-xs gap-1 cursor-pointer'
              >
                <ChevronLeft className='h-3.5 w-3.5' />
                <span>Back</span>
              </Button>

              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={handleNext}
                  className='h-8 px-4 text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-xs'
                >
                  <span>{wizardState.step === totalSteps ? 'Complete Setup' : 'Next Step'}</span>
                  {wizardState.step === totalSteps ? (
                    <Sparkles className='h-3.5 w-3.5' />
                  ) : (
                    <ChevronRight className='h-3.5 w-3.5' />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
