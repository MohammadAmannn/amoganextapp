import React, { useState } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link,
  Undo2,
  Redo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface EmailEditorProps {
  recipientName: string
  recipientEmail: string
  onSend: (content: string) => void
}

export function EmailEditor({
  recipientName,
  recipientEmail,
  onSend,
}: EmailEditorProps) {
  const [content, setContent] = useState('')

  const handleSend = () => {
    if (!content.trim()) return
    onSend(content)
    setContent('')
  }

  return (
    <div className='flex flex-col border-t border-border shrink-0 bg-background'>
      {/* Editor Toolbar */}
      <div className='flex flex-wrap items-center gap-1 p-2 border-b border-border/60 bg-muted/10'>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Bold'>
          <Bold className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Italic'>
          <Italic className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Strikethrough'>
          <Strikethrough className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Code'>
          <Code className='h-4 w-4' />
        </Button>
        <div className='h-4 w-px bg-border mx-1' />

        {/* Heading sizes */}
        {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map((h) => (
          <Button
            key={h}
            variant='ghost'
            size='sm'
            className='h-8 px-1.5 text-xs text-muted-foreground font-bold hover:bg-muted'
          >
            {h}
          </Button>
        ))}

        <div className='h-4 w-px bg-border mx-1' />
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Bullet List'>
          <List className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Numbered List'>
          <ListOrdered className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Insert Link'>
          <Link className='h-4 w-4' />
        </Button>
        
        <div className='h-4 w-px bg-border mx-1' />
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Undo'>
          <Undo2 className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground' title='Redo'>
          <Redo2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Recipient Details & Reply textarea */}
      <div className='p-4 space-y-3'>
        <div className='text-xs text-muted-foreground'>
          <span className='text-emerald-600 font-bold dark:text-emerald-500'>Draft</span> to{' '}
          <span className='font-medium text-foreground'>{recipientEmail}</span>
        </div>

        <Textarea
          placeholder={`Reply to ${recipientName}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='min-h-[100px] w-full resize-none border-0 p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground/60'
        />

        {/* Action Info & Send button */}
        <div className='flex items-center justify-between pt-2 border-t border-border/40'>
          <span className='text-[11px] text-muted-foreground/80'>
            Tip: Press <kbd className='px-1 py-0.5 rounded bg-muted border font-sans text-[10px]'>Cmd</kbd> +{' '}
            <kbd className='px-1 py-0.5 rounded bg-muted border font-sans text-[10px]'>J</kbd> for AI autocomplete
          </span>
          <Button
            onClick={handleSend}
            disabled={!content.trim()}
            size='sm'
            className='bg-foreground text-background hover:bg-foreground/90 font-semibold px-4'
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}