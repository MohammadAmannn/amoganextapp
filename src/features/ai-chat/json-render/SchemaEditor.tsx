/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Code, Eye, X } from 'lucide-react'
import { JsonRenderer } from './JsonRenderer'

interface SchemaEditorProps {
  schema: any
  onSchemaChange?: (schema: any) => void
  onAction?: (action: string, params?: any) => void
  onClose?: () => void
}

export function SchemaEditor({ schema, onSchemaChange, onAction, onClose }: SchemaEditorProps) {
  const [view, setView] = useState<'edit' | 'preview'>('preview')
  const [editorContent, setEditorContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [localSchema, setLocalSchema] = useState<any>(schema)

  useEffect(() => {
    setLocalSchema(schema)
    setEditorContent(JSON.stringify(schema, null, 2))
    setError(null)
  }, [schema])

  const handleEditorChange = (value: string) => {
    setEditorContent(value)
    setError(null)

    try {
      const parsed = JSON.parse(value)
      setLocalSchema(parsed)
      if (onSchemaChange) {
        onSchemaChange(parsed)
      }
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">UI Schema Preview</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as 'edit' | 'preview')}>
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              JSON Editor
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {view === 'edit' ? (
          <div className="relative h-full flex flex-col">
            <Textarea
              value={editorContent}
              onChange={(e) => handleEditorChange(e.target.value)}
              className="flex-1 font-mono text-sm min-h-[400px]"
              placeholder="Enter JSON schema..."
            />
            {error && (
              <div className="mt-2 text-sm text-red-500">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full border rounded-lg p-4 overflow-y-auto bg-background">
            {localSchema ? (
              <JsonRenderer schema={localSchema} onAction={onAction} />
            ) : (
              <div className="text-muted-foreground text-center py-8">
                No schema to preview.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
