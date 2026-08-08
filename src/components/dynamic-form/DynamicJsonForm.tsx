'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import { FormField } from './FormField'
import { FormSection } from './FormSection'
import { getValueByPath, setValueByPath, formatKeyToLabel, isDateString } from './utils'
import { FormErrors } from './types'
import { Button } from '@/components/ui/button'
import { Save, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DynamicJsonFormProps {
  jsonData: any
  editedJson: any
  onChange: (newJson: any) => void
  onSave: (finalJson: any) => void
  isSaving?: boolean
  className?: string
}

export const DynamicJsonForm: React.FC<DynamicJsonFormProps> = memo(({
  jsonData,
  editedJson,
  onChange,
  onSave,
  isSaving = false,
  className,
}) => {
  const [errors, setErrors] = useState<FormErrors>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Live Field Change Handler (Two-way binding)
  const handleFieldChange = useCallback((path: string, newValue: any) => {
    const updated = setValueByPath(editedJson, path, newValue)
    onChange(updated)

    // Clear validation error on change
    if (errors[path]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[path]
        return next
      })
    }
  }, [editedJson, onChange, errors])

  // Validate all fields in editedJson
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    const validateRecursive = (obj: any, path: string) => {
      if (obj === null || obj === undefined) return

      if (typeof obj !== 'object') {
        if (typeof obj === 'number' && isNaN(obj)) {
          newErrors[path] = 'Must be a valid number'
        }
        return
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          validateRecursive(item, `${path}.${index}`)
        })
        return
      }

      Object.keys(obj).forEach((key) => {
        const fieldPath = path ? `${path}.${key}` : key
        const val = obj[key]
        validateRecursive(val, fieldPath)
      })
    }

    validateRecursive(editedJson, '')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [editedJson])

  const handleSaveClick = () => {
    if (!validateForm()) return
    setSaveSuccess(true)
    onSave(editedJson)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  // Recursive JSON Traversal Renderer
  const renderNode = useCallback((data: any, path: string = '', isNested: boolean = false): React.ReactNode => {
    if (data === null || data === undefined) return null

    // Primitive Value -> FormField
    if (typeof data !== 'object') {
      const fieldKey = path.split('.').pop() || 'field'
      const currentValue = getValueByPath(editedJson, path) ?? data
      return (
        <FormField
          key={path}
          path={path}
          fieldKey={fieldKey}
          value={currentValue}
          onChange={handleFieldChange}
          error={errors[path]}
        />
      )
    }

    // Array Handling
    if (Array.isArray(data)) {
      const arrayKey = path.split('.').pop() || 'items'
      return (
        <FormSection
          key={path}
          title={arrayKey}
          path={path}
          itemCount={data.length}
          isNested={isNested}
        >
          {data.map((item, idx) => {
            const itemPath = `${path}.${idx}`
            const itemTitle = `${formatKeyToLabel(arrayKey)} ${idx + 1}`

            if (typeof item !== 'object' || item === null) {
              const itemVal = getValueByPath(editedJson, itemPath) ?? item
              return (
                <FormField
                  key={itemPath}
                  path={itemPath}
                  fieldKey={`Item ${idx + 1}`}
                  value={itemVal}
                  onChange={handleFieldChange}
                  error={errors[itemPath]}
                />
              )
            }

            return (
              <FormSection
                key={itemPath}
                title={itemTitle}
                path={itemPath}
                isNested
              >
                {Object.keys(item).map((childKey) => {
                  const childPath = `${itemPath}.${childKey}`
                  return renderNode(item[childKey], childPath, true)
                })}
              </FormSection>
            )
          })}
        </FormSection>
      )
    }

    // Object Handling
    const keys = Object.keys(data)
    
    // If root object or section object
    const fields: React.ReactNode[] = []
    const sections: React.ReactNode[] = []

    keys.forEach((key) => {
      const childPath = path ? `${path}.${key}` : key
      const val = data[key]

      if (val !== null && typeof val === 'object') {
        sections.push(renderNode(val, childPath, true))
      } else {
        const currentValue = getValueByPath(editedJson, childPath) ?? val
        fields.push(
          <FormField
            key={childPath}
            path={childPath}
            fieldKey={key}
            value={currentValue}
            onChange={handleFieldChange}
            error={errors[childPath]}
          />
        )
      }
    })

    if (!path) {
      // Root Object
      return (
        <div className="flex flex-col gap-4">
          {fields.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {fields}
            </div>
          )}
          {sections}
        </div>
      )
    }

    const sectionTitle = path.split('.').pop() || 'Section'
    return (
      <FormSection
        key={path}
        title={sectionTitle}
        path={path}
        isNested={isNested}
      >
        {fields.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {fields}
          </div>
        )}
        {sections}
      </FormSection>
    )
  }, [editedJson, handleFieldChange, errors])

  const content = useMemo(() => {
    return renderNode(jsonData)
  }, [jsonData, renderNode])

  return (
    <div className={cn('relative flex flex-col flex-1 min-h-0 w-full', className)}>
      {/* Form Fields Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
        {content}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="flex items-center gap-2">
          {Object.keys(errors).length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <AlertCircle className="size-4" />
              <span>{Object.keys(errors).length} validation error(s) found</span>
            </div>
          ) : saveSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              <span>Form changes saved to JSON!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Live two-way binding active</span>
            </div>
          )}
        </div>

        <Button
          type="button"
          size="default"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="gap-2 font-bold px-6 shadow-sm"
        >
          <Save className="size-4" />
          <span>{isSaving ? 'Saving...' : 'Save to JSON'}</span>
        </Button>
      </div>
    </div>
  )
})

DynamicJsonForm.displayName = 'DynamicJsonForm'
