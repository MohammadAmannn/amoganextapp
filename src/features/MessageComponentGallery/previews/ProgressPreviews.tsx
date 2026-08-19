'use client'

import * as React from 'react'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  UploadCloud,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// ─── PROGRESS PREVIEWS ───────────────────────────────────────────────────────

/** 1. Standard Linear Progress Bar & Interactive Controls Preview */
export function ProgressLinearPreview({ stateIndex }: { stateIndex: number }) {
  // stateIndex 0: 45%, 1: 75% completed, 2: Indeterminate / animated loading state
  const initialValue = stateIndex === 1 ? 75 : stateIndex === 2 ? 30 : 45
  const [value, setValue] = React.useState(initialValue)
  const [isRunning, setIsRunning] = React.useState(stateIndex === 2)

  React.useEffect(() => {
    setValue(initialValue)
    setIsRunning(stateIndex === 2)
  }, [initialValue, stateIndex])

  // Simulated progress timer if running
  React.useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 5))
    }, 400)
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className='flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto bg-card rounded-2xl border border-border/80 shadow-xs gap-5 select-none'>
      <div className='w-full flex items-center justify-between'>
        <div className='space-y-0.5'>
          <h4 className='text-xs font-semibold text-foreground'>
            Progress Indicator
          </h4>
          <p className='text-[11px] text-muted-foreground'>
            Linear progress bar with real-time value updates.
          </p>
        </div>
        <Badge variant='outline' className='font-mono text-xs h-5 px-2 bg-muted/40'>
          {value}%
        </Badge>
      </div>

      {/* Progress Component */}
      <div className='w-full space-y-2'>
        <Progress value={value} className='h-2.5 bg-muted rounded-full' />
        <div className='flex justify-between text-[10px] font-mono text-muted-foreground'>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Color Variants Showcase */}
      <div className='w-full space-y-2 pt-2 border-t border-border/50'>
        <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
          Status Color Variants
        </p>
        
        {/* Success */}
        <div className='space-y-1'>
          <div className='flex justify-between text-[11px]'>
            <span className='text-emerald-600 dark:text-emerald-400 font-medium'>Success</span>
            <span className='font-mono text-muted-foreground'>100%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-emerald-500/20 overflow-hidden'>
            <div className='h-full bg-emerald-500 rounded-full w-full transition-all duration-300' />
          </div>
        </div>

        {/* Processing / Indigo */}
        <div className='space-y-1'>
          <div className='flex justify-between text-[11px]'>
            <span className='text-indigo-600 dark:text-indigo-400 font-medium'>Processing</span>
            <span className='font-mono text-muted-foreground'>{value}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-indigo-500/20 overflow-hidden'>
            <div
              className='h-full bg-indigo-500 rounded-full transition-all duration-300'
              style={{ width: `${value}%` }}
            />
          </div>
        </div>

        {/* Warning / Amber */}
        <div className='space-y-1'>
          <div className='flex justify-between text-[11px]'>
            <span className='text-amber-600 dark:text-amber-400 font-medium'>Attention Needed</span>
            <span className='font-mono text-muted-foreground'>60%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-amber-500/20 overflow-hidden'>
            <div className='h-full bg-amber-500 rounded-full w-[60%] transition-all duration-300' />
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className='flex items-center justify-between w-full pt-3 border-t border-border/50 gap-2 flex-wrap'>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setValue((p) => Math.max(0, p - 10))}
            className='h-7 w-7 text-xs cursor-pointer'
            title='Decrease 10%'
          >
            <Minus className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setValue((p) => Math.min(100, p + 10))}
            className='h-7 w-7 text-xs cursor-pointer'
            title='Increase 10%'
          >
            <Plus className='h-3.5 w-3.5' />
          </Button>
        </div>

        <div className='flex items-center gap-1.5'>
          <Button
            variant={isRunning ? 'secondary' : 'outline'}
            size='sm'
            onClick={() => setIsRunning(!isRunning)}
            className='h-7 px-2.5 text-xs gap-1 cursor-pointer'
          >
            {isRunning ? (
              <>
                <Pause className='h-3 w-3 text-amber-500' />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className='h-3 w-3 text-emerald-500' />
                <span>Simulate</span>
              </>
            )}
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setValue(45)
              setIsRunning(false)
            }}
            className='h-7 w-7 text-xs cursor-pointer'
            title='Reset'
          >
            <RotateCcw className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 2. Segmented / Multi-Step Progress Indicator Preview */
export function ProgressStepIndicatorPreview({ stateIndex }: { stateIndex: number }) {
  const currentStep = stateIndex === 0 ? 2 : stateIndex === 1 ? 3 : 4
  const steps = [
    { label: 'Account', desc: 'Personal details' },
    { label: 'Verification', desc: 'Identity confirmation' },
    { label: 'Billing', desc: 'Payment method' },
    { label: 'Completion', desc: 'Confirmation' },
  ]

  return (
    <div className='flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto bg-card rounded-2xl border border-border/80 shadow-xs gap-6 select-none'>
      <div className='w-full text-left space-y-1'>
        <h4 className='text-xs font-semibold text-foreground'>
          Segmented Step Progress
        </h4>
        <p className='text-[11px] text-muted-foreground'>
          Visual step-by-step progress tracking across multi-stage workflows.
        </p>
      </div>

      {/* Stepper visualization */}
      <div className='w-full relative flex items-center justify-between px-2'>
        {/* Connecting line */}
        <div className='absolute left-6 right-6 top-4 h-0.5 bg-muted -z-0' />
        <div
          className='absolute left-6 top-4 h-0.5 bg-primary transition-all duration-300 -z-0'
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 88}%`,
          }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1
          const isDone = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={step.label} className='flex flex-col items-center gap-1.5 relative z-10'>
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 border',
                  isDone
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isCurrent
                    ? 'bg-background border-2 border-primary text-primary shadow-xs'
                    : 'bg-muted/60 border-border text-muted-foreground'
                )}
              >
                {isDone ? <CheckCircle2 className='h-4 w-4' /> : stepNum}
              </div>
              <div className='text-center space-y-0.5'>
                <p
                  className={cn(
                    'text-[11px] font-medium leading-none',
                    isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className='text-[9px] text-muted-foreground/70 hidden sm:block'>
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className='w-full flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground'>
        <span>Current Active Stage: <strong className='text-foreground font-medium'>Step {currentStep} of 4</strong></span>
        <Badge variant='secondary' className='text-[10px] font-mono'>
          {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete
        </Badge>
      </div>
    </div>
  )
}

/** 3. Radial Circular Progress Ring Preview */
export function ProgressCircularPreview({ stateIndex }: { stateIndex: number }) {
  const percentage = stateIndex === 0 ? 68 : stateIndex === 1 ? 100 : 25
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className='flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-sm mx-auto bg-card rounded-2xl border border-border/80 shadow-xs gap-4 select-none text-center'>
      <div className='space-y-1'>
        <h4 className='text-xs font-semibold text-foreground'>
          Circular Progress Ring
        </h4>
        <p className='text-[11px] text-muted-foreground'>
          Radial percentage readout for dashboard metrics & sync state.
        </p>
      </div>

      <div className='relative flex items-center justify-center my-2'>
        <svg className='h-32 w-32 -rotate-90 transform'>
          {/* Background Ring */}
          <circle
            cx='64'
            cy='64'
            r={radius}
            className='stroke-muted'
            strokeWidth='8'
            fill='transparent'
          />
          {/* Foreground Progress Ring */}
          <circle
            cx='64'
            cy='64'
            r={radius}
            className={cn(
              'transition-all duration-500 ease-out',
              percentage === 100
                ? 'stroke-emerald-500'
                : percentage < 30
                ? 'stroke-amber-500'
                : 'stroke-primary'
            )}
            strokeWidth='8'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            fill='transparent'
          />
        </svg>
        <div className='absolute flex flex-col items-center justify-center text-center'>
          <span className='text-xl font-bold font-mono text-foreground tracking-tight'>
            {percentage}%
          </span>
          <span className='text-[10px] text-muted-foreground font-medium'>
            {percentage === 100 ? 'Synced' : 'Uploading'}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        {percentage === 100 ? (
          <span className='inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]'>
            <CheckCircle2 className='h-3.5 w-3.5' /> Sync Complete
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 text-[11px]'>
            <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' /> Syncing assets to cloud...
          </span>
        )}
      </div>
    </div>
  )
}
