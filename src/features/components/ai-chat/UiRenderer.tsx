/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface UiRendererProps {
  schema: any
}

export function UiRenderer({ schema }: UiRendererProps) {
  if (!schema || schema.type !== 'Form') {
    return null
  }

  return (
    <div className='mx-auto max-w-2xl rounded-lg border bg-background p-6 shadow-sm'>
      <div className='space-y-4'>
        {schema.fields?.map((field: any, index: number) => {
          switch (field.type) {
            case 'Input':
              return (
                <div key={index} className='space-y-2'>
                  <label className='text-sm font-medium'>
                    {field.label}
                  </label>
                  <Input
                    placeholder={field.placeholder || ''}
                  />
                </div>
              )

            case 'Textarea':
              return (
                <div key={index} className='space-y-2'>
                  <label className='text-sm font-medium'>
                    {field.label}
                  </label>
                  <Textarea
                    placeholder={field.placeholder || ''}
                  />
                </div>
              )

            case 'Button':
              return (
                <Button
                  key={index}
                  className='w-full'
                >
                  {field.label}
                </Button>
              )

            default:
              return (
                <div
                  key={index}
                  className='text-sm text-red-500'
                >
                  Unsupported component: {field.type}
                </div>
              )
          }
        })}
      </div>
    </div>
  )
}