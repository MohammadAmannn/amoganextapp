'use client'

import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { formatKeyToLabel, inferInputType } from './utils'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  path: string
  fieldKey: string
  value: any
  onChange: (path: string, newValue: any) => void
  error?: string
  disabled?: boolean
}

export const FormField: React.FC<FormFieldProps> = memo(({
  path,
  fieldKey,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const label = formatKeyToLabel(fieldKey)
  const inputType = inferInputType(fieldKey, value)

  if (inputType === 'boolean') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="flex items-center space-x-2.5">
          <Checkbox
            id={`field-${path}`}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(path, Boolean(checked))}
            disabled={disabled}
            className="h-4 w-4 rounded border-input data-[state=checked]:bg-primary"
          />
          <label
            htmlFor={`field-${path}`}
            className="text-xs font-semibold tracking-wide text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        </div>
        {error && <span className="text-[11px] font-medium text-destructive">{error}</span>}
      </div>
    )
  }

  if (inputType === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`field-${path}`} className="text-xs font-semibold tracking-wide text-muted-foreground">
          {label}
        </label>
        <Textarea
          id={`field-${path}`}
          value={value ?? ''}
          onChange={(e) => onChange(path, e.target.value)}
          rows={3}
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className={cn(
            'resize-none rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/30',
            error && 'border-destructive focus-visible:ring-destructive/30'
          )}
        />
        {error && <span className="text-[11px] font-medium text-destructive">{error}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`field-${path}`} className="text-xs font-semibold tracking-wide text-muted-foreground">
        {label}
      </label>
      <Input
        id={`field-${path}`}
        type={inputType === 'number' ? 'number' : inputType === 'date' ? 'date' : 'text'}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          if (inputType === 'number') {
            onChange(path, raw === '' ? '' : Number(raw))
          } else {
            onChange(path, raw)
          }
        }}
        disabled={disabled}
        placeholder={`Enter ${label.toLowerCase()}...`}
        className={cn(
          'h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/30',
          error && 'border-destructive focus-visible:ring-destructive/30'
        )}
      />
      {error && <span className="text-[11px] font-medium text-destructive">{error}</span>}
    </div>
  )
})

FormField.displayName = 'FormField'
